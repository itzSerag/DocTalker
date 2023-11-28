const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    ocrText: {
        type: String,
        default: ' -- DIDNT RUN OCR YET -- '
    },
    vectorIndex: {
        type: String,
        required: true
    },
    isProcessed: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});


module.exports = mongoose.model('Document', documentSchema);
