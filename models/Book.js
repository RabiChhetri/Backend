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
        required: true,
        unique: true,
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
        type: String,
        required: true,
        enum: ['haircut', 'shaving', 'haircut_shaving', 'hair_color', 'haircut_wash']
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    }
}, { timestamps: true });

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
