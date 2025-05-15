const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        // Remove the unique constraint to allow duplicate emails
    },
    message: {
        type: String,
        required: [true, "Message body is required"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    replied: {
        type: Boolean,
        default: false
    },
    replyMessage: {
        type: String
    },
    replyDate: {
        type: Date
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
