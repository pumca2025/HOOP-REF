const { BrevoClient } = require('@getbrevo/brevo');
const dotenv = require('dotenv');

dotenv.config();

const brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendOtpEmail = async (email, name, otp) => {
    try {
        const result = await brevoClient.transactionalEmails.sendTransacEmail({
            subject: "Your HoopRef Verification Code",
            sender: {
                name: process.env.BREVO_SENDER_NAME || "HoopRef",
                email: process.env.BREVO_SENDER_EMAIL
            },
            to: [{
                email: email,
                name: name
            }],
            htmlContent: `
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                            <div style="margin-bottom: 30px;">
                                <div style="background-color: #000; width: 80px; height: 80px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                                    <h1 style="color: #ea580c; font-size: 32px; margin: 0;">H</h1>
                                </div>
                            </div>
                            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -1px;">Verify Your Account</h2>
                            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                Hello ${name}, use the 6-digit verification code below to complete your registration. This code is valid for 10 minutes.
                            </p>
                            <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                                <h1 style="color: #ea580c; font-size: 48px; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace; font-weight: 900;">${otp}</h1>
                            </div>
                            <p style="color: #777; font-size: 14px; margin-bottom: 30px;">
                                If you did not sign up for this account, you can safely ignore this email.
                            </p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px;">
                                &copy; ${new Date().getFullYear()} HoopRef Official. All rights reserved.
                            </p>
                        </div>
                    </body>
                </html>
            `
        });

        console.log('OTP Email sent successfully. MessageId:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = { sendOtpEmail };
