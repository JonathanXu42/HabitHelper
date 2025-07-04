//utils/send_email.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point dotenv to the correct .env path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const oauth2Client = new google.auth.OAuth2(
    process.env.VITE_GOOGLE_CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
)

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

const { token: accessToken } = await oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
        clientId: process.env.VITE_GOOGLE_CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
    }
});

export async function emailVerificationCode(recipientEmail) {
    const code = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: recipientEmail,
        subject: "Your HabitHelper Verification Code",
        text: `Your verification code is ${code}`
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipientEmail}:`, info.response);
        return code; // return the code so you can store or compare it later
    } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        throw error;
    }
}

export async function emailNotification(recipientEmail, habit, streak) {
    const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: recipientEmail,
        subject: `Day ${streak} of your ${habit} streak – let's keep it going!`,
        text: `You've been doing ${habit} everyday for ${streak} days – don't break the streak now!`
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipientEmail}:`, info.response);
    } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        throw error;
    }
}