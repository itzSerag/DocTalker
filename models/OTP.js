const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiresIn: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const OTP = mongoose.model('OTP', otpSchema);
exports.OTP = OTP;

