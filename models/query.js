const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    documentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Query', querySchema);
