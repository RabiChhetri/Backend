const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const fetchadmin = require('../middleware/fetchadmin');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new service (admin only)
router.post('/', fetchadmin, async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newService = new Service({ name, price, duration });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a service (admin only)
router.put('/:id', fetchadmin, async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { name, price, duration },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Service not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a service (admin only)
router.delete('/:id', fetchadmin, async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 