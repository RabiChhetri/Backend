const jwt = require("jsonwebtoken");
const JWT_SECRET = "ivarisgood$oy";

const fetchuser = (req, res, next) => {
    // Get the user from JWT token and add id to req object 
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;  // Attach user data to request object
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token. Please authenticate again." });
    }
};

module.exports = fetchuser;

