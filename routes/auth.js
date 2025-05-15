const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const SignUser = require("../models/SignUser");
const fetchuser = require('../middleware/fetchuser');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../middleware/emailVerification');

const router = express.Router();
const JWT_SECRET = "ivarisgood$oy"; // Store in environment variables in production

// Route: POST "/api/auth/register" - Create a new user
router.post(
  "/register",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({ min: 5 }),
    body("phoneNumber", "Enter a valid phone number").isLength({ min: 10, max: 10 }),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user already exists
      let user = await SignUser.findOne({ email: new RegExp(`^${req.body.email}$`, 'i') });
      if (user) {
        return res.status(400).json({ error: "A user with this email already exists" });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create new user with OTP
      user = await SignUser.create({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: req.body.phoneNumber,
        rewardPoints: 0,
        verificationOTP: otp,
        otpExpiry: otpExpiry,
        isVerified: false
      });

      // Generate JWT token
      const payload = { user: { id: user.id } };
      const authToken = jwt.sign(payload, JWT_SECRET);

      // Send verification email (assuming you have the email service set up)
      // Change this line from:
      // await sendVerificationEmail(user.email, otp);
      
      // To:
      const emailSent = await sendVerificationEmail(user.email, otp);
      if (!emailSent) {
          // If email fails to send, delete the created user
          await SignUser.findByIdAndDelete(user.id);
          return res.status(500).json({ error: "Failed to send verification email" });
      }

      res.status(201).json({ 
        authToken,
        user: { 
          name: user.name, 
          email: user.email,
          phoneNumber: user.phoneNumber
        },
        message: "Please check your email for verification OTP"
      });
    } catch (error) {
      console.error("Error:", error);
      if (error.code === 11000) {
          // Handle duplicate key error
          const field = Object.keys(error.keyPattern)[0];
          return res.status(400).json({
              error: `This ${field} is already registered. Please use a different ${field}.`
          });
      }
      res.status(500).json({ error: "Registration failed. Please try again later." });
    }
  }
);

// Route: POST "/api/auth/login" - User Login
router.post(
  "/login",
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
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.isVerified) {
        // Generate new OTP for unverified users
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        user.verificationOTP = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send new verification email
        const emailSent = await sendVerificationEmail(user.email, otp);
        if (!emailSent) {
          return res.status(500).json({ error: "Failed to send verification email" });
        }

        return res.status(403).json({ 
          error: "Please verify your email first",
          message: "A new verification code has been sent to your email"
        });
      }

      // Compare the entered password with the stored hashed password
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const payload = { user: { id: user.id } };
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.json({ 
        authToken, 
        user: { 
          _id: user.id,
          name: user.name, 
          email: user.email,
          isVerified: user.isVerified
        } 
      });
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

// Route: GET "/api/auth/users" - Get all registered users (admin only or for dashboard)
router.get("/users", async (req, res) => {
  try {
    const users = await SignUser.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Route: DELETE "/api/auth/users/:id" - Delete a user by ID (admin only)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await SignUser.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Route: PUT "/api/auth/users/:id" - Update a user by ID (admin only)
router.put("/users/:id", async (req, res) => {
  try {
    const { name, email, phoneNumber, rewardPoints } = req.body;
    
    // Create an object with the fields to be updated
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.toLowerCase();
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (rewardPoints !== undefined) updateFields.rewardPoints = rewardPoints;
    
    // Find and update the user
    const user = await SignUser.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `This ${field} is already registered. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Route: POST "/api/auth/verify-email" - Verify email with OTP
router.post("/verify-email", async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await SignUser.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        if (user.verificationOTP !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Route: POST "/api/auth/resend-otp" - Resend verification OTP
router.post("/resend-otp", async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await SignUser.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        user.verificationOTP = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        const emailSent = await sendVerificationEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ error: "Failed to send verification email" });
        }

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Route: POST "/api/auth/forgot-password" - Request password reset
router.post("/forgot-password", [
    body("email", "Enter a valid Email").isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const user = await SignUser.findOne({ email: new RegExp(`^${email}$`, 'i') });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Save OTP to user
        user.verificationOTP = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send password reset email
        const emailSent = await sendPasswordResetEmail(user.email, otp);
        if (!emailSent) {
            return res.status(500).json({ error: "Failed to send password reset email" });
        }

        res.json({ message: "Password reset instructions sent to your email" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Route: POST "/api/auth/reset-password" - Reset password with OTP
router.post("/reset-password", [
    body("email", "Enter a valid Email").isEmail(),
    body("otp", "Enter the OTP received in email").isLength({ min: 6, max: 6 }),
    body("newPassword", "Password must be at least 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, otp, newPassword } = req.body;
        const user = await SignUser.findOne({ email: new RegExp(`^${email}$`, 'i') });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.verificationOTP !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.verificationOTP = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
