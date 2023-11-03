const mongoose = require('mongoose');
const {isEmail} =require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        lowercase: true, 
        required: true,
        unique: true ,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6 , 'Minimum password length is 6 characters']
    }, // Removed required: true as it's not needed for Google auth users
    googleId: {
        type: String,
        unique: true , 
        default: null
        
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
