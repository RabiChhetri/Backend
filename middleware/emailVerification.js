const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'rabikc139@gmail.com',
        pass: "wrfy frrv xmkz uobl", // This should be your App Password, not your regular Gmail password
    }
});

const sendVerificationEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: {
                name: 'Astar Unisex Salon',
                address: 'rabikc139@gmail.com'
            },
            to: email,
            subject: 'Email Verification - Astar Unisex Salon',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
                    <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you didn't request this verification, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendPasswordResetEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: {
                name: 'Astar Unisex Salon',
                address: 'rabikc139@gmail.com'
            },
            to: email,
            subject: 'Password Reset - Astar Unisex Salon',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested to reset your password. Use the following OTP to reset your password:</p>
                    <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you didn't request this reset, please ignore this email and ensure your account is secure.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };