const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String, // Removed required: true as it's not needed for Google auth users
    googleId: {
        type: String,
        unique: true
    },
    subscription: {
        type: String,
        enum: ['free', 'gold', 'premium'],
        default: 'free',
    },
    stripeCustomerId: {
        type: String, // Store the Stripe customer ID here (using it to integrate payment gateway)
        unique: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
