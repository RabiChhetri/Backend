const bookingAuth = async (req, res, next) => {
    try {
        const { date, time } = req.body;
        
        // Get current date and time
        const currentDate = new Date();
        const bookingDateTime = new Date(`${date}T${time}`);

        // Compare booking time with current time
        if (bookingDateTime <= currentDate) {
            return res.status(400).json({
                success: false,
                message: "Cannot book appointment for past date or time. Please select a future date and time."
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in booking authentication",
            error: error.message
        });
    }
};

module.exports = bookingAuth;