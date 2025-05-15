const express = require("express");
const Contact = require("../models/Contact");
const router = express.Router();
const fetchadmin = require('../middleware/fetchadmin');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'rabikc139@gmail.com',
        pass: "wrfy frrv xmkz uobl", // This should be your App Password
    }
});

// Submit a contact message (public route)
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const contact = new Contact({ name, email, message });
        await contact.save();

        res.json({ success: true, message: "Contact saved successfully", user: contact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Get all contact messages (admin only)
router.get("/all", fetchadmin, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ date: -1 }); // Sort by date, newest first
        res.json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Send reply to contact message (admin only)
router.post("/reply/:id", fetchadmin, async (req, res) => {
    try {
        const { replyMessage } = req.body;
        const contactId = req.params.id;
        
        if (!replyMessage) {
            return res.status(400).json({ message: "Reply message is required" });
        }
        
        // Find the contact message
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({ message: "Contact message not found" });
        }
        
        // Send email reply
        const mailOptions = {
            from: {
                name: 'Astar Unisex Salon',
                address: 'rabikc139@gmail.com'
            },
            to: contact.email,
            subject: 'Response to Your Inquiry - Astar Unisex Salon',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Thank you for contacting us!</h2>
                    <p>Dear ${contact.name},</p>
                    <p>We received your message regarding:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p><em>"${contact.message}"</em></p>
                    </div>
                    <p>Our response:</p>
                    <div style="background-color: #e6f7ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p>${replyMessage}</p>
                    </div>
                    <p>Thank you for choosing Astar Unisex Salon!</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        
        // Update contact with reply information
        contact.replied = true;
        contact.replyDate = Date.now();
        contact.replyMessage = replyMessage;
        await contact.save();
        
        res.json({ success: true, message: "Reply sent successfully" });
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ message: "Failed to send reply" });
    }
});

module.exports = router;
