const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },

    chatName: {
        type: String,
        required: true,
        default: 'New Chat'
    },

    documentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [
        {   
            messagesID : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Message'
            },
            query : String,
            response : String,
            
        }
    ],
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
