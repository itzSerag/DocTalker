const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chatID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    
    feedbackMessage: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
