const express = require("express");
const router = express.Router();
const Revenue = require("../models/Revenue");

// Get revenue statistics
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get total revenue
    const totalRevenue = await Revenue.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Get current month's revenue
    const currentMonthRevenue = await Revenue.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayThisMonth,
            $lt: firstDayNextMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Get last month's revenue
    const lastMonthRevenue = await Revenue.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayLastMonth,
            $lt: firstDayThisMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const total = totalRevenue[0]?.total || 0;
    const currentMonth = currentMonthRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;

    // Calculate percentage change
    let percentageChange = 0;
    if (lastMonth > 0) {
      percentageChange = ((currentMonth - lastMonth) / lastMonth) * 100;
    } else if (currentMonth > 0) {
      percentageChange = 100;
    }

    console.log('Revenue stats:', { total, currentMonth, lastMonth, percentageChange }); // Add debugging log

    res.json({
      total,
      currentMonth,
      lastMonth,
      percentageChange: Math.round(percentageChange),
      trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change'
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new revenue entry
router.post("/add", async (req, res) => {
  try {
    const { amount, appointmentId, serviceId, serviceName } = req.body;
    
    const newRevenue = new Revenue({
      amount,
      appointmentId,
      serviceId,
      serviceName,
      date: new Date()
    });

    await newRevenue.save();
    res.status(201).json({ message: "Revenue entry added successfully" });
  } catch (error) {
    console.error('Error adding revenue:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get monthly revenue for the last 6 months
router.get("/monthly", async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyRevenue = await Revenue.aggregate([
      {
        $match: {
          date: {
            $gte: sixMonthsAgo,
            $lte: now
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          revenue: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" }
                }
              }
            ]
          },
          revenue: 1
        }
      }
    ]);

    res.json(monthlyRevenue);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
