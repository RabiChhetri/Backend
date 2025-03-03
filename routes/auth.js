const express = require("express");
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JWT tokens
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const SignUser = require("../models/SignUser");
const fetchuser= require('../middleware/fetchuser')

const JWT_SECRET = "ivarisgood$oy"; // Secret key for JWT (Use environment variables in production)

// Route: POST "/api/login-auth" - User Login (No Auth Required)
router.post(
  "/",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists in the database
      let user = await SignUser.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email" }); // Unified error message
      }

      // Compare the entered password with the stored hashed password
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid password" }); // Unified error message
      }

      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(payload, JWT_SECRET,);

      res.json({ authToken });
    } catch (error) {
      console.error(err);
      res.status(500).json({ error: "Server error", message: err.message });
    }
  }
);
// Get Logged-in User Details using: "api/auth/getuser". Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;  // FIXED: req.user.id instead of res.user.id
    const user = await SignUser.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});
module.exports = router;



// const express = require("express");

// const bcrypt = require("bcryptjs"); // For password hashing

// const jwt = require("jsonwebtoken"); // For generating JWT tokens

// const User = require("../models/User");

// const router = express.Router();

// const { body, validationResult } = require("express-validator");

// const SignUser = require("../models/SignUser");

// const fetchuser= require('../middleware/fetchuser')







// const JWT_SECRET = "ivarisgood$oy"; // Secret key for JWT (Use environment variables in production)



// // Route: POST "/api/login-auth" - User Login (No Auth Required)

// router.post(

//   "/login-auth",  // Updated route path

//   [

//     body("email", "Enter a valid Email").isEmail(),

//     body("password", "Password cannot be blank").exists(),

//   ],

//   async (req, res) => {

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {

//       return res.status(400).json({ errors: errors.array() });

//     }



//     const { email, password } = req.body;



//     try {

//       // Check if user exists in the database

//       let user = await SignUser.findOne({ email });

//       if (!user) {

//         return res.status(400).json({ error: "Invalid credentials" });

//       }



//       // Compare the entered password with the stored hashed password

//       const passwordCompare = await bcrypt.compare(password, user.password);

//       if (!passwordCompare) {

//         return res.status(400).json({ error: "Invalid credentials" });

//       }



//       // Generate JWT token

//       const payload = {

//         user: {

//           id: user.id,

//         },

//       };



//       const authToken = jwt.sign(payload, JWT_SECRET);

//       // Send user data along with token

//       res.json({ 

//         authToken,

//         user: {

//           name: user.name,

//           email: user.email,

//           id: user.id

//         }

//       });

//     } catch (error) {

//       console.error(error);

//       res.status(500).json({ error: "Server error", message: error.message });

//     }

//   }

// );

// // Get Logged-in User Details using: "api/auth/getuser". Login required

// router.post("/getuser", fetchuser, async (req, res) => {

//   try {

//     const userId = req.user.id;  // FIXED: req.user.id instead of res.user.id

//     const user = await SignUser.findById(userId).select("-password");

//     res.json(user);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({ error: "Server error", message: error.message });

//   }

// });

// module.exports = router;