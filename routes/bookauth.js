const express = require("express");
const Book = require("../models/Book");
const Service = require("../models/Service");
const router = express.Router();
const bcrypt = require("bcryptjs");
const SignUser = require("../models/SignUser");
const fetchuser = require('../middleware/fetchuser');
const Settings = require('../models/Settings');
const Revenue = require('../models/Revenue');

function validateAndFormatTime(timeString) {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
  if (!timeRegex.test(timeString)) {
    throw new Error("Time must be in the format HH:MM AM/PM.");
  }
  return timeString;
}

function isTimeWithinAllowedHours(timeString, duration) {
  const [time, meridian] = timeString.split(" ");
  let [hour, minute] = time.split(":").map(Number);
  if (meridian.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridian.toUpperCase() === "AM" && hour === 12) hour = 0;

  // Check if start time is within allowed hours (8 AM to 8 PM)
  if (hour < 8 || hour >= 20) {
    return false;
  }

  // Calculate end time based on service duration
  const endTimeMinutes = hour * 60 + minute + duration;
  const endHour = Math.floor(endTimeMinutes / 60);

  // Check if end time exceeds 8 PM (20:00)
  if (endHour >= 20) {
    return false;
  }

  return true;
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

function calculateEndTime(startTime, duration) {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  return endTime;
}

function checkOverlappingAppointments(startTime, endTime, seatNumber, excludeId = null) {
  const query = {
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    seatNumber
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Book.findOne(query);
}

// POST booking
router.post("/", fetchuser, async (req, res) => {
  try {
    const { fullName, phoneNumber, date, service, time, seatNumber } = req.body;
    if (!fullName || !phoneNumber || !date || !service || !time || !seatNumber) {
      return res.status(400).json({ message: "All fields are required, including seat selection" });
    }
    // Fetch availableSeats from settings
    const settings = await Settings.findOne();
    const availableSeats = settings?.availableSeats || 2;
    if (Number(seatNumber) < 1 || Number(seatNumber) > availableSeats) {
      return res.status(400).json({ message: `Invalid seat selected. Choose between 1 and ${availableSeats}.` });
    }
    if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }
    // Fetch service from DB
    const serviceDoc = await Service.findOne({ _id: service }).lean();
    if (!serviceDoc) {
      return res.status(400).json({ message: "Invalid service selected" });
    }
    // Parse duration (e.g., "30 min" or "1 hrs")
    let duration = 30;
    if (serviceDoc.duration.includes('min')) {
      duration = parseInt(serviceDoc.duration);
    } else if (serviceDoc.duration.includes('hr')) {
      duration = parseInt(serviceDoc.duration) * 60;
    }
    let formattedTime;
    try {
      formattedTime = validateAndFormatTime(time);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
    if (!isTimeWithinAllowedHours(formattedTime, duration)) {
      return res.status(400).json({ 
        message: "Appointments can only be booked between 8:00 AM and 8:00 PM, choose the next day appointment from 8:00 AM and 8:00 PM." 
      });
    }
    const now = new Date();
    now.setSeconds(0, 0);
    const startTime = timeStringToDate(date, formattedTime);
    if (startTime < now) {
      return res.status(400).json({ message: "You cannot book an appointment in the past." });
    }
    const endTime = calculateEndTime(startTime, duration);
    const formattedEndTime = endTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const overlapping = await checkOverlappingAppointments(startTime, endTime, seatNumber);
    if (overlapping) {
      const formattedOverlapTime = overlapping.endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return res.status(400).json({
        message: `An appointment for this seat is already booked at this time. Please choose a different time after ${formattedOverlapTime}.`
      });
    }
    const newBook = new Book({
      fullName,
      phoneNumber,
      date: startTime,
      time: formattedTime,
      service: serviceDoc._id,
      startTime,
      endTime,
      formattedEndTime,
      userId: req.user.id,
      seatNumber
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
    const bookings = await Book.find({}).select('fullName phoneNumber service time date startTime endTime seatNumber completed');
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user-specific appointments
router.get("/user-appointments", fetchuser, async (req, res) => {
  try {
    const bookings = await Book.find({ userId: req.user.id })
      .select('service time date startTime _id')
      .sort({ startTime: 1 }); // Sort by startTime which is already in 24-hour format
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user appointments" });
  }
});

// Cancel booking by password
router.delete("/cancel", fetchuser, async (req, res) => {
  try {
    const { password, appointmentId } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        message: "Password is required",
        error: "MISSING_PASSWORD"
      });
    }

    if (!appointmentId) {
      return res.status(400).json({ 
        message: "Appointment ID is required",
        error: "MISSING_APPOINTMENT_ID"
      });
    }

    // Get the user and verify password
    const user = await SignUser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    // Compare the entered password with the stored hashed password
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ 
        message: "Invalid password",
        error: "INVALID_PASSWORD"
      });
    }

    // Find the specific appointment
    const booking = await Book.findById(appointmentId);
    if (!booking) {
      return res.status(404).json({ 
        message: "Appointment not found",
        error: "APPOINTMENT_NOT_FOUND"
      });
    }

    // Verify that the appointment belongs to the user
    if (booking.userId && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "You are not authorized to cancel this appointment",
        error: "UNAUTHORIZED"
      });
    }

    // Delete the booking
    await Book.findByIdAndDelete(appointmentId);

    res.status(200).json({ 
      message: "Appointment cancelled successfully",
      success: true
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      message: "Failed to cancel appointment",
      error: "SERVER_ERROR"
    });
  }
});

// Cancel booking by ID (for regular users)
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    const booking = await Book.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify that the booking belongs to the user
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to cancel this appointment" });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin delete appointment (no authentication required)
router.delete("/admin/:id", async (req, res) => {
  try {
    const booking = await Book.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark appointment as complete and reward user
router.post('/admin/complete/:id', async (req, res) => {
  try {
    const booking = await Book.findById(req.params.id).populate('service');
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.completed) return res.status(400).json({ message: "Already completed" });

    // Mark as completed
    booking.completed = true;
    await booking.save();

    // Add revenue entry
    const revenue = new Revenue({
      amount: booking.service.price,
      appointmentId: booking._id,
      serviceName: booking.service.name,
      serviceId: booking.service._id,
      date: new Date()
    });
    await revenue.save();

    // Reward user
    if (booking.userId) {
      const user = await SignUser.findById(booking.userId);
      if (user) {
        user.rewardPoints = Math.min((user.rewardPoints || 0) + 100, 500);
        await user.save();
        return res.json({ 
          message: `Appointment marked as complete. User now has ${user.rewardPoints} points.`,
          revenue: booking.service.price
        });
      }
    }
    res.json({ 
      message: "Appointment marked as complete, but user not found for rewarding.",
      revenue: booking.service.price
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reset reward points for a user (admin only)
router.post('/admin/reward/claim/:id', async (req, res) => {
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
