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
            messageID : {
                type : mongoose.Schema.Types.ObjectId,
                required : true
            },
            query : {
                type :String,
                required : true
            },
            response : {
                type : String,
                required : true
            },

            createdAt : {
                type : Date,
                default : Date.now()
            }   
            
        }
    ],
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
