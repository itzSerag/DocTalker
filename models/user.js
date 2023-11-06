const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
    Fname: {
        type: String,
        required: true,
        minlength: [3, 'Minimum name length is 3 characters']
    },
    Lname: {
        type: String,
        required: true,
        minlength: [3, 'Minimum name length is 3 characters']
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Minimum password length is 6 characters']
    },
    googleId: {
        type: String,
        unique: true,  // idk if this is needed -- google already gives unique IDs
        default: null
    },
    subscription: {
        type: String,
        enum: ['free', 'gold', 'premium'],
        default: 'free',
    },
    stripeCustomerId: {
        type: String,
        unique: true,
    },
    isVerified: {
        type : Boolean,
        default : false 
    },
    
    User_Chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat' ,
            createdAt: {
                type : Date,
                default : Date.now()
            }
        }
    ]
    },
 {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
