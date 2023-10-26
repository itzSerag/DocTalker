const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    embedding: {
        type: Array,
        required: true
    },
    ocrText: String
}, {
    timestamps: true
});



module.exports = mongoose.model('Document', documentSchema);
