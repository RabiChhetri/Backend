// const express = require("express");
// const Book = require("../models/Book"); // Ensure correct model path
// const router = express.Router();

// // @route   POST /api/Books
// // @desc    Create a new Book (Public Access)
// // @access  Public
// router.post("/", async (req, res) => {
//     try {
//         const { fullName, phoneNumber, date, service, time } = req.body;

//         // Validate required fields
//         if (!fullName || !phoneNumber || !date || !service || !time) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Validate phone number length (ensure it's not more than 10 digits)
//         if (phoneNumber.length !== 10) {
//             return res.status(400).json({ message: "Phone number must be exactly 10 digits long" });
//         }

//         // Validate service selection
//         const validServices = ['Haircut', 'CleanShave', 'Service3'];
//         if (!validServices.includes(service)) {
//             return res.status(400).json({ message: "Invalid service selected" });
//         }

//         // Validate that the appointment date is not in the past
//         const currentDate = new Date();
//         const appointmentDate = new Date(date);

//         // Ensure the appointment date is today or in the future
//         if (appointmentDate < currentDate.setHours(0, 0, 0, 0)) {  // Set current time to 00:00:00 for comparison
//             return res.status(400).json({ message: "You cannot book an appointment in the past" });
//         }

//         // Validate that if the appointment is today, the time is not in the past
//         if (appointmentDate.toDateString() === currentDate.toDateString()) {
//             const appointmentTime = new Date(`${date}T${time}:00`); // Combining date and time into a full date string

//             // If the time is in the past compared to the current time, return an error
//             if (appointmentTime < currentDate) {
//                 return res.status(400).json({ message: "You cannot book an appointment in the past time of the present day" });
//             }
//         }

//         // Check if phone number already exists
//         const existingBook = await Book.findOne({ phoneNumber });
//         if (existingBook) {
//             return res.status(400).json({ message: "This phone number is already used for a booking. Please use a different number." });
//         }

//         // Create new Book
//         const newBook = new Book({
//             fullName,
//             phoneNumber,
//             date,
//             service,
//             time
//         });

//         // Save to database
//         await newBook.save();
//         res.status(201).json({ message: "Book booked successfully", book: newBook });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// module.exports = router;
// const express = require("express");
// const Book = require("../models/Book"); // Ensure correct model path
// const router = express.Router();

// // Function to validate and format time correctly
// function validateAndFormatTime(timeString) {
//     const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    
//     if (!timeRegex.test(timeString)) {
//         throw new Error("Time must be in the format HH:MM AM/PM.");
//     }
    
//     return timeString; // If it's already correct, return as is
// }

// // @route   POST /api/Books
// // @desc    Create a new Appointment (Public Access)
// // @access  Public
// router.post("/", async (req, res) => {
//     try {
//         const { fullName, phoneNumber, date, service, time } = req.body;

//         // Validate required fields
//         if (!fullName || !phoneNumber || !date || !service || !time) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Validate phone number length
//         if (phoneNumber.length !== 10) {
//             return res.status(400).json({ message: "Phone number must be exactly 10 digits long" });
//         }

//         // Validate service selection
//         const validServices = ['Haircut', 'CleanShave', 'Service3'];
//         if (!validServices.includes(service)) {
//             return res.status(400).json({ message: "Invalid service selected" });
//         }

//         // Validate and format time
//         let formattedTime;
//         try {
//             formattedTime = validateAndFormatTime(time);
//         } catch (error) {
//             return res.status(400).json({ message: error.message });
//         }

//         // Get current system date and time
//         const now = new Date();
//         now.setSeconds(0, 0); // Remove seconds and milliseconds

//         // Convert appointment date and time to a valid timestamp
//         const appointmentDateTime = new Date(`${date} ${formattedTime}`);

//         // Ensure the appointment date is not in the past
//         if (appointmentDateTime < now) {
//             return res.status(400).json({ message: "You cannot book an appointment before the current time." });
//         }

//         // Ensure the appointment is only allowed **after** the current time of the current day
//         if (appointmentDateTime.toDateString() === now.toDateString() && appointmentDateTime <= now) {
//             return res.status(400).json({ message: "You can only book after the actual current time." });
//         }

//         // Check if phone number already has a booking
//         const existingBook = await Book.findOne({ phoneNumber });
//         if (existingBook) {
//             return res.status(400).json({ message: "This phone number is already used for a booking. Please use a different number." });
//         }

//         // Create new Appointment with validated time
//         const newBook = new Book({
//             fullName,
//             phoneNumber,
//             date,
//             service,
//             time: formattedTime // Ensured to be in HH:MM AM/PM format
//         });

//         // Save to database
//         await newBook.save();
//         res.status(201).json({ message: "Appointment booked successfully", book: newBook });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// module.exports = router;




const express = require("express");
const Book = require("../models/Book"); // Ensure correct model path
const router = express.Router();

// Function to validate and format time correctly
function validateAndFormatTime(timeString) {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    
    if (!timeRegex.test(timeString)) {
        throw new Error("Time must be in the format HH:MM AM/PM.");
    }
    
    return timeString; // If it's already correct, return as is
}

// @route   POST /api/Books
// @desc    Create a new Appointment (Public Access)
// @access  Public
router.post("/", async (req, res) => {
    try {
        const { fullName, phoneNumber, date, service, time } = req.body;

        // Validate required fields
        if (!fullName || !phoneNumber || !date || !service || !time) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate phone number length
        if (phoneNumber.length !== 10) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits long" });
        }

        // Validate service selection
        const validServices = ['Haircut', 'CleanShave', 'Service3'];
        if (!validServices.includes(service)) {
            return res.status(400).json({ message: "Invalid service selected" });
        }

        // Validate and format time
        let formattedTime;
        try {
            formattedTime = validateAndFormatTime(time);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // Get current system date and time
        const now = new Date();
        now.setSeconds(0, 0); // Remove seconds and milliseconds

        // Convert appointment date and time to a valid timestamp
        const appointmentDateTime = new Date(`${date} ${formattedTime}`);

        // Ensure the appointment date is not in the past
        if (appointmentDateTime < now) {
            return res.status(400).json({ message: "You cannot book an appointment before the current time." });
        }

        // ✅ ALLOW APPOINTMENTS AT THE CURRENT TIME ✅
        // The previous check appointmentDateTime <= now has been removed.

        // Check if phone number already has a booking
        const existingBook = await Book.findOne({ phoneNumber });
        if (existingBook) {
            return res.status(400).json({ message: "This phone number is already used for a booking. Please use a different number." });
        }

        // Create new Appointment with validated time
        const newBook = new Book({
            fullName,
            phoneNumber,
            date,
            service,
            time: formattedTime // Ensured to be in HH:MM AM/PM format
        });

        // Save to database
        await newBook.save();
        res.status(201).json({ message: "Appointment booked successfully", book: newBook });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
