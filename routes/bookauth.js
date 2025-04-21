// const express = require("express");
// const Book = require("../models/Book");
// const router = express.Router();

// const validServices = {
//   haircut: { name: 'HairCut (Rs.200)', duration: 30 },
//   shaving: { name: 'Shaving (Rs.150)', duration: 15 },
//   haircut_shaving: { name: 'HairCut and Shaving (Rs.250)', duration: 45 },
//   hair_color: { name: 'Hair Color (Rs.500)', duration: 60 },
//   haircut_wash: { name: 'HairCut and Wash (Rs.350)', duration: 60 }
// };

// function validateAndFormatTime(timeString) {
//   const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
//   if (!timeRegex.test(timeString)) {
//     throw new Error("Time must be in the format HH:MM AM/PM.");
//   }
//   return timeString;
// }

// function isTimeWithinAllowedHours(timeString) {
//   const [time, meridian] = timeString.split(" ");
//   let [hour, minute] = time.split(":").map(Number);
//   if (meridian.toUpperCase() === "PM" && hour !== 12) hour += 12;
//   if (meridian.toUpperCase() === "AM" && hour === 12) hour = 0;
//   return hour >= 8 && hour < 20;
// }

// function timeStringToDate(dateStr, timeStr) {
//   const [time, meridian] = timeStr.split(" ");
//   let [hours, minutes] = time.split(":").map(Number);
//   if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
//   if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
//   const date = new Date(dateStr);
//   date.setHours(hours, minutes, 0, 0);
//   return date;
// }

// function calculateEndTime(startTime, serviceName) {
//   const duration = validServices[serviceName].duration;
//   const endTime = new Date(startTime);
//   endTime.setMinutes(endTime.getMinutes() + duration);
//   return endTime;
// }

// async function checkOverlappingAppointments(startTime, endTime, excludeId = null) {
//   const query = {
//     startTime: { $lt: endTime },
//     endTime: { $gt: startTime }
//   };
//   if (excludeId) query._id = { $ne: excludeId };
//   return await Book.findOne(query);
// }

// // POST booking
// router.post("/", async (req, res) => {
//   try {
//     const { fullName, phoneNumber, date, service, time } = req.body;

//     if (!fullName || !phoneNumber || !date || !service || !time) {
//       return res.status(400).json({ 
//         message: "All fields are required",
//         error: "MISSING_FIELDS"
//       });
//     }

//     if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
//       return res.status(400).json({ 
//         message: "Phone number must be exactly 10 digits",
//         error: "INVALID_PHONE"
//       });
//     }

//     if (!validServices[service]) {
//       return res.status(400).json({ 
//         message: "Invalid service selected",
//         error: "INVALID_SERVICE"
//       });
//     }

//     let formattedTime;
//     try {
//       formattedTime = validateAndFormatTime(time);
//     } catch (error) {
//       return res.status(400).json({ 
//         message: error.message,
//         error: "INVALID_TIME_FORMAT"
//       });
//     }

//     if (!isTimeWithinAllowedHours(formattedTime)) {
//       return res.status(400).json({ 
//         message: "Appointments can only be booked between 8:00 AM and 8:00 PM.",
//         error: "OUTSIDE_BUSINESS_HOURS"
//       });
//     }

//     const now = new Date();
//     now.setSeconds(0, 0);
//     const startTime = timeStringToDate(date, formattedTime);
//     if (startTime < now) {
//       return res.status(400).json({ 
//         message: "You cannot book an appointment in the past.",
//         error: "PAST_DATE"
//       });
//     }

//     const endTime = calculateEndTime(startTime, service);
//     const overlapping = await checkOverlappingAppointments(startTime, endTime);
//     if (overlapping) {
//       return res.status(400).json({
//         message: `An appointment for ${validServices[overlapping.service]?.name || overlapping.service} is already booked at this time. Please choose a different time after ${overlapping.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
//         error: "OVERLAPPING_APPOINTMENT"
//       });
//     }

//     const newBook = new Book({
//       fullName,
//       phoneNumber,
//       date: startTime,
//       time: formattedTime,
//       service,
//       startTime,
//       endTime
//     });

//     await newBook.save();

//     res.status(201).json({
//       message: "Appointment booked successfully",
//       appointment: newBook,
//       success: true
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "An error occurred while booking the appointment",
//       error: "SERVER_ERROR"
//     });
//   }
// });

// // Get all bookings
// router.get("/", async (req, res) => {
//   try {
//     const bookings = await Book.find({}).select('fullName service time date startTime endTime');
//     res.json(bookings);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ 
//       message: "Server error",
//       error: "SERVER_ERROR"
//     });
//   }
// });

// // Delete a booking
// router.delete("/:id", async (req, res) => {
//   try {
//     if (!req.params.id) {
//       return res.status(400).json({ 
//         message: "Booking ID is required",
//         error: "MISSING_ID"
//       });
//     }

//     const booking = await Book.findById(req.params.id);
    
//     if (!booking) {
//       return res.status(404).json({ 
//         message: "Booking not found",
//         error: "BOOKING_NOT_FOUND"
//       });
//     }

//     // Check if the appointment is in the past
//     const now = new Date();
//     const appointmentDate = new Date(booking.startTime);
//     if (appointmentDate < now) {
//       return res.status(400).json({ 
//         message: "Cannot cancel past appointments",
//         error: "PAST_APPOINTMENT"
//       });
//     }

//     await Book.findByIdAndDelete(req.params.id);
//     res.status(200).json({ 
//       message: "Appointment cancelled successfully",
//       success: true
//     });
//   } catch (error) {
//     console.error('Error cancelling appointment:', error);
//     res.status(500).json({ 
//       message: "Failed to cancel appointment",
//       error: "SERVER_ERROR"
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const Book = require("../models/Book");
const router = express.Router();

const validServices = {
  haircut: { name: 'HairCut (Rs.200)', duration: 30 },
  shaving: { name: 'Shaving (Rs.150)', duration: 15 },
  haircut_shaving: { name: 'HairCut and Shaving (Rs.250)', duration: 45 },
  hair_color: { name: 'Hair Color (Rs.500)', duration: 60 },
  haircut_wash: { name: 'HairCut and Wash (Rs.350)', duration: 60 }
};

function validateAndFormatTime(timeString) {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
  if (!timeRegex.test(timeString)) {
    throw new Error("Time must be in the format HH:MM AM/PM.");
  }
  return timeString;
}

function isTimeWithinAllowedHours(timeString) {
  const [time, meridian] = timeString.split(" ");
  let [hour, minute] = time.split(":").map(Number);
  if (meridian.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridian.toUpperCase() === "AM" && hour === 12) hour = 0;
  return hour >= 8 && hour < 20;
}

function timeStringToDate(dateStr, timeStr) {
  const [time, meridian] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function calculateEndTime(startTime, serviceName) {
  const duration = validServices[serviceName].duration;
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  return endTime;
}

async function checkOverlappingAppointments(startTime, endTime, excludeId = null) {
  const query = {
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };
  if (excludeId) query._id = { $ne: excludeId };
  return await Book.findOne(query);
}

// POST booking
router.post("/", async (req, res) => {
  try {
    const { fullName, phoneNumber, date, service, time } = req.body;
    if (!fullName || !phoneNumber || !date || !service || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }
    if (!validServices[service]) {
      return res.status(400).json({ message: "Invalid service selected" });
    }

    let formattedTime;
    try {
      formattedTime = validateAndFormatTime(time);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!isTimeWithinAllowedHours(formattedTime)) {
      return res.status(400).json({ message: "Appointments can only be booked between 8:00 AM and 8:00 PM." });
    }

    const now = new Date();
    now.setSeconds(0, 0);
    const startTime = timeStringToDate(date, formattedTime);
    if (startTime < now) {
      return res.status(400).json({ message: "You cannot book an appointment in the past." });
    }

    const endTime = calculateEndTime(startTime, service);
    const overlapping = await checkOverlappingAppointments(startTime, endTime);
    if (overlapping) {
      return res.status(400).json({
        message: `An appointment for ${validServices[overlapping.service]?.name || overlapping.service} is already booked at this time. Please choose a different time after ${overlapping.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      });
    }

    const existingBook = await Book.findOne({ phoneNumber });
    if (existingBook) {
      return res.status(400).json({ message: "This phone number is already used for a booking." });
    }

    const newBook = new Book({
      fullName,
      phoneNumber,
      date: startTime,
      time: formattedTime,
      service,
      startTime,
      endTime
    });

    await newBook.save();
    res.status(201).json({ message: "Appointment booked successfully", appointment: newBook });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Book.find({}).select('fullName service time date');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel booking by ID
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Book.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
