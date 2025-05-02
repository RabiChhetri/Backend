const mongoose = require('mongoose');
const { Schema } = mongoose;

const SignSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    rewardPoints: {
        type: Number,
        default: 0
    },
    verificationOTP: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('SignUser', SignSchema);
