const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const SignUser = require('../models/SignUser');

// Route to register a new user
router.post('/', [
  body('name', 'Enter a valid username').isLength({ min: 3 }),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Enter at least 8 characters for password').isLength({ min: 8 }),
], async (req, res) => {
  // Validate request input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    let user = await SignUser.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance
    user = new SignUser({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user in the database
    await user.save();

    // Send success message
    res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
