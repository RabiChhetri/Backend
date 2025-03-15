const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const SignUser = require("../models/SignUser");
const fetchuser = require('../middleware/fetchuser');

const router = express.Router();
const JWT_SECRET = "ivarisgood$oy"; // Store in environment variables in production

// Route: POST "/api/auth" - User Login
router.post(
  "/",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists in the database
      let user = await SignUser.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" }); // Avoid exposing which one is incorrect
      }

      // Compare the entered password with the stored hashed password
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const payload = { user: { id: user.id } };
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.json({ authToken, user: { name: user.name, email: user.email } }); // Send user data with token
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error", message: error.message });
    }
  }
);

// Route: POST "/api/auth/getuser" - Get Logged-in User Details
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await SignUser.findById(userId).select("-password"); // Exclude password
    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

module.exports = router;
