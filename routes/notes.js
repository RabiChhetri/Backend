// const express = require("express");
// const router = express.Router();
// const { body, validationResult } = require("express-validator");
// const bcrypt = require("bcryptjs");
// const SignUser = require("../models/SignUser");
// var jwt = require("jsonwebtoken");

// const JWT_SECRET = "ivarisgood$oy";

// // Route to register a new user
// router.post(
//   "/",
//   [
//     body("name", "Enter a valid username").isLength({ min: 3 }),
//     body("email", "Enter a valid Email").isEmail(),
//     body("password", "Enter at least 8 characters for password").isLength({
//       min: 8,
//     }),
//   ],
//   async (req, res) => {
//     // Validate request input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { name, email, password } = req.body;

//       // Check if the user already exists
//       let user = await SignUser.findOne({ email });
//       if (user) {
//         return res.status(400).json({ error: "Email already registered" });
//       }

//       // Hash password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       // Create new user instance
//       user = new SignUser({
//         name,
//         email,
//         password: hashedPassword,
//       });

//       // Save the user in the database
//       await user.save();

//       // Generate auth token
//       const data = {
//         user: {
//           id: user.id,
//         },
//       };
//       const authtoken = jwt.sign(data, JWT_SECRET);

//       // Send only one response
//       res.status(201).json({
//         message: "User registered successfully",
//         authtoken,
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Server error", message: err.message });
//     }
//   }
// );

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { body, validationResult } = require("express-validator");
// const bcrypt = require("bcryptjs");
// const SignUser = require("../models/SignUser");
// var jwt = require("jsonwebtoken");

// const JWT_SECRET = "ivarisgood$oy";

// // Route to register a new user
// router.post(
//   "/",
//   [
//     body("name", "Enter a valid username").isLength({ min: 3 }),
//     body("email", "Enter a valid Email").isEmail(),
//     body("phoneNumber", "Phone number must be exactly 10 digits").isLength({ min: 10, max: 10 }).matches(/^\d+$/),
//     body("password", "Enter at least 8 characters for password").isLength({
//       min: 8,
//     }),
//   ],
//   async (req, res) => {
//     // Validate request input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const { name, email, password, phoneNumber } = req.body;

//       // Check if the user already exists with email
//       let user = await SignUser.findOne({ email });
//       if (user) {
//         return res.status(400).json({ error: "Email already registered" });
//       }

//       // Check if the phone number already exists
//       user = await SignUser.findOne({ phoneNumber });
//       if (user) {
//         return res.status(400).json({ error: "Phone number already registered" });
//       }

//       // Hash password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       // Create new user instance
//       user = new SignUser({
//         name,
//         email,
//         phoneNumber,
//         password: hashedPassword,
//       });

//       // Save the user in the database
//       await user.save();

//       // Generate auth token
//       const data = {
//         user: {
//           id: user.id,
//         },
//       };
//       const authtoken = jwt.sign(data, JWT_SECRET);

//       // Send only one response
//       res.status(201).json({
//         message: "User registered successfully",
//         authtoken,
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Server error", message: err.message });
//     }
//   }
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const SignUser = require("../models/SignUser");
var jwt = require("jsonwebtoken");

const JWT_SECRET = "ivarisgood$oy";

// Route to register a new user
router.post(
  "/",
  [
    body("name", "Enter a valid username").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("phoneNumber", "Phone number must be exactly 10 digits").isLength({ min: 10, max: 10 }).matches(/^\d+$/),
    body("password", "Password must be at least 8 characters long. Please enter a stronger password.").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    // Validate request input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, phoneNumber } = req.body;

      // Check if the user already exists with email
      let user = await SignUser.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Check if the phone number already exists
      user = await SignUser.findOne({ phoneNumber });
      if (user) {
        return res.status(400).json({ error: "Phone number already registered" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user instance
      user = new SignUser({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      });

      // Save the user in the database
      await user.save();

      // Generate auth token
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Send only one response
      res.status(201).json({
        message: "User registered successfully",
        authtoken,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error", message: err.message });
    }
  }
);

module.exports = router;
