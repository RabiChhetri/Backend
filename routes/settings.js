const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const fetchadmin = require('../middleware/fetchadmin');

// Get available seats
router.get('/seats', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ availableSeats: 0 });
            await settings.save();
        }
        res.json({ seats: settings.availableSeats });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update available seats (admin only)
router.put('/seats', fetchadmin, async (req, res) => {
    try {
        const { seats } = req.body;
        // Validate input
        if (typeof seats !== 'number' || seats < 0) {
            return res.status(400).json({ message: 'Invalid seats value' });
        }
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ availableSeats: seats });
        } else {
            settings.availableSeats = seats;
        }
        await settings.save();
        res.json({ 
            message: 'Seats updated successfully', 
            seats: settings.availableSeats 
        });
    } catch (error) {
        console.error('Error updating seats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 