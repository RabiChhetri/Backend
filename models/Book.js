const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: 'Phone number must be exactly 10 digits.'
        }
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i.test(v);
            },
            message: "Time must be in the format HH:MM AM/PM."
        }
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    formattedEndTime: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignUser",
        required: true
    },
    seatNumber: {
        type: Number,
        required: true,
        min: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    // Add payment screenshot field
    paymentScreenshot: {
        type: String,  // Will store the base64 encoded image
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
