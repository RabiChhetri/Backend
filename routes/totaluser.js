const express = require("express");
const router = express.Router();
const SignUser = require("../models/SignUser");

// Store active user sessions
let activeSessions = new Map();
let lastMonthActiveSessions = new Set(); // Track last month's active users

// Function to get the first day of current and last month
const getMonthBoundaries = () => {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { firstDayThisMonth, firstDayLastMonth, firstDayNextMonth };
};

// Add user session
router.post("/active", async (req, res) => {
  try {
    const { userId, timestamp } = req.body;
    const currentTime = Date.now();
    // Consider a user active if they've interacted within the last 30 minutes
    const thirtyMinutesAgo = currentTime - 30 * 60 * 1000;
    
    if (timestamp >= thirtyMinutesAgo) {
      activeSessions.set(userId, timestamp);
      
      // Track monthly active users
      const { firstDayThisMonth, firstDayLastMonth } = getMonthBoundaries();
      if (timestamp >= firstDayLastMonth.getTime() && timestamp < firstDayThisMonth.getTime()) {
        lastMonthActiveSessions.add(userId);
      }
    }

    // Clean up old sessions
    for (const [id, time] of activeSessions) {
      if (time < thirtyMinutesAgo) {
        activeSessions.delete(id);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove user session on logout
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;
    activeSessions.delete(userId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get count of active users with monthly comparison
router.get("/active", async (req, res) => {
  try {
    // Clean up old sessions
    const currentTime = Date.now();
    const thirtyMinutesAgo = currentTime - 30 * 60 * 1000;
    
    for (const [id, time] of activeSessions) {
      if (time < thirtyMinutesAgo) {
        activeSessions.delete(id);
      }
    }

    const currentActiveCount = activeSessions.size;
    const lastMonthActiveCount = lastMonthActiveSessions.size;

    // Calculate percentage change
    let percentageChange = 0;
    if (lastMonthActiveCount === 0) {
      percentageChange = currentActiveCount > 0 ? 100 : 0;
    } else {
      percentageChange = Math.round(((currentActiveCount - lastMonthActiveCount) / lastMonthActiveCount) * 100);
    }

    // Reset last month's data if we're in a new month
    const { firstDayThisMonth } = getMonthBoundaries();
    if (currentTime >= firstDayThisMonth.getTime()) {
      lastMonthActiveSessions = new Set([...activeSessions.keys()]);
    }

    res.json({
      count: currentActiveCount,
      lastMonthCount: lastMonthActiveCount,
      percentageChange,
      trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get total number of registered users with monthly comparison
router.get("/count", async (req, res) => {
  try {
    const { firstDayThisMonth, firstDayLastMonth, firstDayNextMonth } = getMonthBoundaries();

    const totalUsers = await SignUser.countDocuments();
    
    // Count users registered last month
    const lastMonthUsers = await SignUser.countDocuments({
      createdAt: {
        $gte: firstDayLastMonth,
        $lt: firstDayThisMonth
      }
    });

    // Count users registered this month
    const thisMonthUsers = await SignUser.countDocuments({
      createdAt: {
        $gte: firstDayThisMonth,
        $lt: firstDayNextMonth
      }
    });

    // Calculate percentage change
    let percentageChange = 0;
    if (lastMonthUsers === 0) {
      percentageChange = thisMonthUsers > 0 ? 100 : 0;
    } else {
      percentageChange = Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100);
    }

    res.json({
      count: totalUsers,
      thisMonthCount: thisMonthUsers,
      lastMonthCount: lastMonthUsers,
      percentageChange,
      trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
