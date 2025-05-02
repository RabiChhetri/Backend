const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const JWT_SECRET = "ivarisgood$oy";

const fetchadmin = async (req, res, next) => {
    // Get the admin from JWT token and add id to req object 
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        
        // Check if the user has admin role
        if (!data.user || data.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }

        // Verify admin exists in database
        const admin = await Admin.findById(data.user.id);
        if (!admin) {
            return res.status(401).json({ error: "Admin not found. Please authenticate again." });
        }

        req.admin = data.user;  // Attach admin data to request object
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token. Please authenticate again." });
    }
};

module.exports = fetchadmin; 