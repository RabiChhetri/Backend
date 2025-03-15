const mongoose = require('mongoose');
const { Schema } = mongoose;

const SignSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
        // validate: {
        //     validator: function (v) {
        //         return /^[0-9]{10}$/.test(v.toString()); // Ensure exactly 10 digits
        //     },
        //     message: props => `${props.value} is not a valid 10-digit phone number!`
        // }
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String, // Storing time as a string in HH:MM format
        default: function () {
            return new Date().toLocaleTimeString('en-US', { hour12: false });
        }
    }
});

const BookUser = mongoose.model('Book', SignSchema);
module.exports = BookUser;
