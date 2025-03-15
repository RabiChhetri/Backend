// const express = require("express");
// const Contact = require("../models/Contact"); // Ensure the correct path
// const router = express.Router();

// router.post("/", async (req, res) => {
//     try {
//         const { name, email, message } = req.body;

//         // Check if required fields exist
//         if (!name || !email || !message) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please fill all required fields",
//             });
//         }

//         const user = new Contact({ name, email, message });
//         await user.save();

//         res.json({
//             success: true,
//             message: "Contact saved successfully",
//             user,
//         });
//     } catch (error) {
//         console.error(error);

//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//             errors: error.errors || {},
//         });
//     }
// });

// module.exports = router;


const express = require("express");
const Contact = require("../models/Contact");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const user = new Contact({ name, email, message });
        await user.save();

        res.json({ success: true, message: "Contact saved successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
