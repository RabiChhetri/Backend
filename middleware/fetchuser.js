const jwt = require("jsonwebtoken");
const JWT_SECRET = "ivarisgood$oy";
const SignUser = require("../models/SignUser");

const fetchuser = async (req, res, next) => {
    try {
        const token = req.header("auth-token");
        if (!token) {
            return res.status(401).json({ error: "Please authenticate using a valid token" });
        }

        const data = jwt.verify(token, JWT_SECRET);
        const user = await SignUser.findById(data.user.id);
        
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: "Please verify your email first" });
        }

        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token. Please authenticate again." });
    }
};

module.exports = fetchuser;

