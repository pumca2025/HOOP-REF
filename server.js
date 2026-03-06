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
// Accepts a GSI credential (ID Token JWT) from the frontend.
// This works in Android WebViews/APKs where the old access_token flow fails.
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    try {
        let payload;

        // Detect whether the incoming token is a GSI credential (ID Token / JWT)
        // JWT tokens have 3 base64 parts separated by dots
        const isIdToken = token.split('.').length === 3;

        if (isIdToken) {
            // --- New GSI flow: verify the ID Token using google-auth-library ---
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } else {
            // --- Legacy access_token flow (browser fallback, kept for compatibility) ---
            const https = require('https');
            payload = await new Promise((resolve, reject) => {
                https.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                    });
                }).on('error', reject);
            });
        }

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
        You are HoopRef, an elite professional basketball referee AI.

Your role is to adjudicate basketball situations with the precision, depth, and authority of an official FIBA referee instructor.
Unless explicitly stated otherwise, apply FIBA rules as the primary rulebook. Use NBA rules only if the situation clearly indicates NBA context.

━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━
A user provides a written description of a basketball situation.

━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST return a valid JSON object only.
Do NOT include markdown, explanations outside JSON, or code blocks.

Your response must fall into ONE of the following scenarios:

━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENARIO 1 — VALID BASKETBALL SITUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
If the input describes a clear basketball play, return:

{
  "type": "analysis",
  "content": {
    "official_decision": "",
    "infraction_type": "",
    "situation_summary": "",
    "applied_rules": [],
    "detailed_reasoning": "",
    "rule_book_references": [],
    "penalty": ""
  }
}

### STRICT CONTENT GUIDELINES

1. **official_decision**
   - Write exactly as an official referee ruling.
   - Must clearly identify:
     - The player committing the infraction
     - The nature of the violation or foul
     - The administrative result
   - Example tone:
     “A personal foul is charged to A1. Team B is awarded free throws or a throw-in depending on the team foul situation.”

2. **infraction_type**
   - Use the precise rulebook terminology.
   - Examples:
     - Personal Foul
     - Offensive Foul
     - Unsportsmanlike Foul
     - Traveling
     - Double Dribble

3. **situation_summary**
   - A neutral, factual recap of the play.
   - Do NOT repeat the official decision.
   - Describe only what physically happened on the court.

4. **applied_rules**
   - List ONLY the relevant rule titles.
   - Example:
     [
       "Article 32 – Fouls",
       "Article 34 – Personal Foul"
     ]

5. **detailed_reasoning**  ⚠️ MOST IMPORTANT SECTION
   - This must be a **deep, instructional explanation**.
   - For EACH applied article:
     - Explain what the article governs in simple terms
     - Quote or paraphrase the critical clause
     - Explicitly connect the player’s action to the article
   - Clearly explain:
     - Why the action is illegal
     - Why no alternative ruling applies
     - How the penalty is determined (shooting act, team foul count, etc.)
   - Write as if teaching trainee referees.

   Example structure:
   - Start with the general definition (Article 32)
   - Narrow down to the specific foul (Article 34.1.1)
   - Finish with penalty administration (Article 34.2 and bonus rules)

6. **rule_book_references**
   - Cite exact articles and sub-articles.
   - Use this format:
     [
       "[Article 32.1.1 – Definition of a Foul]",
       "[Article 34.1.1 – Personal Foul Criteria]",
       "[Article 34.2 – Penalty for Personal Fouls]"
     ]

7. **penalty**
   - State the exact game administration:
     - Throw-in location OR
     - Number of free throws
   - Mention conditional logic:
     - Shooting vs non-shooting
     - Team foul penalty status

━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENARIO 2 — AMBIGUOUS SITUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
If critical details are missing, return:

{
  "type": "clarification",
  "content": {
    "question": ""
  }
}

The question must be specific and directly related to making a correct ruling.

━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENARIO 3 — NON-BASKETBALL OR INVALID INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━
If the input is unrelated to basketball officiating, return:

{
  "type": "refusal",
  "content": {
    "message": "HoopRef is restricted to basketball rules and officiating decisions only."
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━
- Always prioritize clarity, rule accuracy, and instructional depth.
- Never oversimplify articles.
- Never invent rules.
- Never include assumptions not supported by the situation.
- Output JSON only.

        Situation: "${situation}"
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        // console.log("Raw AI Response:", responseText);

        // Cleanup potential markdown code blocks if the model ignores the instruction
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON:", responseText);
            return res.status(500).json({ error: "Invalid response from AI" });
        }

        if (parsedResponse.type === 'clarification') {
            return res.json({
                type: 'clarification',
                message: parsedResponse.content.question
            });
        }

        if (parsedResponse.type === 'refusal') {
            return res.json({
                type: 'clarification',
                message: parsedResponse.content.message
            });
        }

        if (parsedResponse.type === 'analysis') {
            const { content } = parsedResponse;

            // Save to History using the new schema fields
            const historyEntry = new History({
                userId: req.user.id,
                situation: situation, // User Input
                situationSummary: content.situation_summary,
                officialDecision: content.official_decision,
                infractionType: content.infraction_type,
                appliedRules: content.applied_rules || [],
                detailedReasoning: content.detailed_reasoning,
                ruleBookReferences: content.rule_book_references || [],
                penalty: content.penalty
            });
            await historyEntry.save();

            return res.json({
                type: 'decision',
                ...content, // Spread fields like official_decision, infraction_type, etc.
                id: historyEntry._id,
                timestamp: historyEntry.timestamp
            });
        }

        return res.status(400).json({ error: 'Unknown response type' });

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
