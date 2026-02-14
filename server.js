const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const History = require('./models/History');

const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Google Auth Route
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Fetch user info using access token
        const https = require('https');
        const payload = await new Promise((resolve, reject) => {
            https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        if (!payload || !payload.email) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { sub, email, name, picture } = payload;

        let user = await User.findOne({
            $or: [{ googleId: sub }, { email: email }]
        });

        if (!user) {
            user = new User({
                googleId: sub,
                email,
                name,
                picture
            });
            await user.save();
        } else {
            // Update existing user with Google info if missing or changed
            let updated = false;
            if (!user.googleId) {
                user.googleId = sub;
                updated = true;
            }
            if (picture && user.picture !== picture) {
                user.picture = picture;
                updated = true;
            }
            if (updated) await user.save();
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, picture: user.picture },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token: accessToken,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Google Auth error:', error);
        res.status(401).json({ error: 'Auth failed' });
    }
});

// Email/Password Registration
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0]
        });
        await user.save();

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, picture: user.picture },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token: accessToken,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Email/Password Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, name: user.name, picture: user.picture },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token: accessToken,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Analyze Play Route
app.post('/api/analyze', authenticateToken, async (req, res) => {
    const { situation } = req.body;

    if (!situation) return res.status(400).json({ error: 'Situation is required' });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
        You are HoopRef, a professional basketball referee assistant.
        
        STRICT RULES:
        1. ONLY answer basketball-related questions.
        2. If the input is unrelated to basketball rules/situations, respond EXACTLY with: "This assistant is restricted to basketball rules and game situations only. Please describe a valid basketball play for analysis."
        3. If the situation is ambiguous or missing key details (e.g. was there contact, did they have legal guarding position, etc.), ask 1-2 clarifying questions instead of making a decision.
        4. If the situation is clear, provide a decision in this EXACT format:
           Situation: [Brief summary]
           Rule Applied: [Rule name]
           Article: [Article number from FIBA/NBA rules]
           Decision: [Clear official decision]
           Penalty / Result: [Consequence]

        5. Use a neutral, strictly official, referee-like tone. No small talk.

        User Situation: "${situation}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Check if it's a warning or clarification
        if (responseText.includes("This assistant is restricted") || responseText.includes("?")) {
            return res.json({ type: 'clarification', message: responseText });
        }

        // Parse the structured response
        const lines = responseText.split('\n');
        const parsed = {};
        lines.forEach(line => {
            if (line.startsWith('Situation:')) parsed.situation = line.replace('Situation:', '').trim();
            if (line.startsWith('Rule Applied:')) parsed.ruleApplied = line.replace('Rule Applied:', '').trim();
            if (line.startsWith('Article:')) parsed.article = line.replace('Article:', '').trim();
            if (line.startsWith('Decision:')) parsed.decision = line.replace('Decision:', '').trim();
            if (line.startsWith('Penalty / Result:')) parsed.penalty = line.replace('Penalty / Result:', '').trim();
        });

        // Save to History
        const historyEntry = new History({
            userId: req.user.id,
            situation: situation,
            ruleApplied: parsed.ruleApplied || 'N/A',
            article: parsed.article || 'N/A',
            decision: parsed.decision || 'N/A',
            penalty: parsed.penalty || 'N/A'
        });
        await historyEntry.save();

        res.json({ type: 'decision', ...parsed, id: historyEntry._id, timestamp: historyEntry.timestamp });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze situation' });
    }
});

// Get History Route
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Delete History Entry
app.delete('/api/history/:id', authenticateToken, async (req, res) => {
    try {
        await History.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
