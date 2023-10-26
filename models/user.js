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
    googleId: {       // Add this field to store the Google ID for users who sign up with Google
        type: String,
        unique: true,
        sparse: true   // This makes sure the unique constraint applies only to documents where googleId is set
    }
}, {
    timestamps: true  // This will automatically create createdAt and updatedAt fields
});

userSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', userSchema);
