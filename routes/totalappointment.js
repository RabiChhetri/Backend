const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// Get total appointments and monthly stats
router.get("/stats", async (req, res) => {
  try {
    // Get current date and last month's date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Count total appointments
    const totalAppointments = await Book.countDocuments();

    // Count last month's appointments
    const lastMonthAppointments = await Book.countDocuments({
      startTime: { 
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: new Date(now.getFullYear(), now.getMonth(), 1)
      }
    });

    // Count current month's appointments
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthAppointments = await Book.countDocuments({
      startTime: { $gte: currentMonthStart, $lt: now }
    });

    // Calculate percentage change with improved handling
    let percentageChange = 0;
    let trend = 'no change';

    if (lastMonthAppointments === 0 && currentMonthAppointments === 0) {
      percentageChange = 0;
    } else if (lastMonthAppointments === 0) {
      percentageChange = 100;
      trend = 'increase';
    } else {
      percentageChange = Math.round(((currentMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100);
      trend = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change';
    }

    res.json({
      total: totalAppointments,
      currentMonth: currentMonthAppointments,
      lastMonth: lastMonthAppointments,
      percentageChange: percentageChange,
      trend: trend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get service booking statistics
router.get("/service-stats", async (req, res) => {
  try {
    const serviceStats = await Book.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      {
        $unwind: '$serviceDetails'
      },
      {
        $group: {
          _id: '$serviceDetails.name',
          count: { $sum: 1 },
          price: { $first: '$serviceDetails.price' }
        }
      },
      {
        $project: {
          serviceName: '$_id',
          count: 1,
          price: 1,
          totalRevenue: { $multiply: ['$count', '$price'] },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(serviceStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
