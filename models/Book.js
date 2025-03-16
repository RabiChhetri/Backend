// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const SignSchema = new Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     phone: {
//         type: Number,
//         required: true,
//         unique: true,
//         // validate: {
//         //     validator: function (v) {
//         //         return /^[0-9]{10}$/.test(v.toString()); // Ensure exactly 10 digits
//         //     },
//         //     message: props => `${props.value} is not a valid 10-digit phone number!`
//         // }
//     },
//     date: {
//         type: Date,
//         default: Date.now
//     },
//     time: {
//         type: String, // Storing time as a string in HH:MM format
//         default: function () {
//             return new Date().toLocaleTimeString('en-US', { hour12: false });
//         }
//     }
// });

// const BookUser = mongoose.model('Book', SignSchema);
// module.exports = BookUser;
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const appointmentSchema = new Schema({
//     fullName: { // Fixed field name
//         type: String,
//         required: true,
//         trim: true
//     },
//     phoneNumber: { // Fixed field name
//         type: String,
//         required: true,
//         trim: true
//     },
//     date: {
//         type: Date,
//         required: true
//     },
//     service: {
//         type: String,
//         required: true,
//         enum: ['Haircut', 'CleanShave', 'Service3'] // Ensure correct spelling
//     },
//     time: {
//         type: String,
//         required: true
//     },
//     userId: { // Added userId for authentication purposes
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     }
// }, { timestamps: true });

// const Book = mongoose.model('Appointment', appointmentSchema);
// module.exports = Book;
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const appointmentSchema = new Schema({
//     fullName: { 
//         type: String,
//         required: true,
//         trim: true
//     },
//     phoneNumber: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         validate: {
//           validator: function(value) {
//             return /^[0-9]{10}$/.test(value);  // Ensures phone number is exactly 10 digits
//           },
//           message: 'Phone number must be exactly 10 digits.'
//         }
//       },
//     date: {
//         type: Date,
//         required: true
//     },
//     service: {
//         type: String,
//         required: true,
//         enum: ['Haircut', 'CleanShave', 'Service3']
//     },
//     time: {
//         type: String,
//         required: true
//     },
//     userId: { 
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: false // ✅ Make userId OPTIONAL
//     }
// }, { timestamps: true });

// const Book = mongoose.model('Appointment', appointmentSchema);
// module.exports = Book;
const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema({
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
            validator: function(value) {
                return /^[0-9]{10}$/.test(value);  // Ensures phone number is exactly 10 digits
            },
            message: 'Phone number must be exactly 10 digits.'
        }
    },
    date: {
        type: Date,
        required: true
    },
    service: {
        type: String,
        required: true,
        enum: ['Haircut', 'CleanShave', 'Service3']
    },
    time: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i.test(v); // Validates HH:MM AM/PM format
            },
            message: "Time must be in the format HH:MM AM/PM."
        }
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // ✅ Make userId OPTIONAL
    }
}, { timestamps: true });

const Book = mongoose.model('Appointment', appointmentSchema);
module.exports = Book;
