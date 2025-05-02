const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const fetchadmin = require('../middleware/fetchadmin');
const Book = require("../models/Book");
const SignUser = require("../models/SignUser");

const router = express.Router();
const JWT_SECRET = "ivarisgood$oy"; // Store in environment variables in production

// Route: POST "/api/admin/register" - Create a new admin account
router.post(
  "/register",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if admin with this email already exists
      let admin = await Admin.findOne({ email: req.body.email.toLowerCase() });
      if (admin) {
        return res.status(400).json({ error: "An admin with this email already exists" });
      }

      // Create new admin
      admin = new Admin({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        password: req.body.password,
      });

      // Save admin to database
      await admin.save();

      // Generate JWT token
      const payload = {
        user: {
          id: admin.id,
          role: admin.role
        }
      };
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.json({
        success: true,
        authToken,
        admin: {
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error", message: error.message });
    }
  }
);

// Route: POST "/api/admin/login" - Admin Login
router.post(
  "/login",
  [
    body("name", "Enter a valid name").exists(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    console.log("Login attempt:", req.body); // Debug log

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password } = req.body;

    try {
      // Check if admin exists in the database
      const admin = await Admin.findOne({ name: name });
      console.log("Found admin:", admin ? "Yes" : "No"); // Debug log
      
      if (!admin) {
        return res.status(400).json({ error: "Invalid name or password" });
      }

      // Compare the entered password with the stored hashed password
      const passwordCompare = await admin.comparePassword(password);
      console.log("Password match:", passwordCompare ? "Yes" : "No"); // Debug log

      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid name or password" });
      }

      // Generate JWT token
      const payload = { 
        user: { 
          id: admin.id,
          role: admin.role 
        } 
      };
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.json({ 
        success: true,
        authToken, 
        admin: { 
          name: admin.name, 
          email: admin.email,
          role: admin.role 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error", message: error.message });
    }
  }
);

// Route: POST "/api/admin/getadmin" - Get Logged-in Admin Details
router.post("/getadmin", fetchadmin, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Mark appointment as complete and reward user
router.post('/admin/complete/:id', fetchadmin, async (req, res) => {
  try {
    const booking = await Book.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.completed) return res.status(400).json({ message: "Already completed" });

    booking.completed = true;
    await booking.save();

    // Reward user
    if (booking.userId) {
      const user = await SignUser.findById(booking.userId);
      if (user) {
        user.points = (user.points || 0) + 50;
        await user.save();
      }
    }

    res.json({ message: "Appointment marked as complete and user rewarded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Claim reward and reset rewardPoints to 0
router.post('/admin/claim-reward/:id', fetchadmin, async (req, res) => {
  try {
    const user = await SignUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.rewardPoints = 0;
    await user.save();

    res.json({ message: "Reward claimed and points reset to 0." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 