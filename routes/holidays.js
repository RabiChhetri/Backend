const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');

// Get all holidays
router.get('/', async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new holiday (No authentication required)
router.post('/', async (req, res) => {
  try {
    const { date, reason } = req.body;
    
    // Create new holiday
    const holiday = new Holiday({
      date: new Date(date),
      reason
    });

    const savedHoliday = await holiday.save();
    res.json(savedHoliday);
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ message: 'Error adding holiday' });
  }
});

// Delete a holiday (No authentication required)
router.delete('/:id', async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Error deleting holiday' });
  }
});

module.exports = router; 