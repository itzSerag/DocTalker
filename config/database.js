const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://serageldien:iamhere@cluster0.kelyj7l.mongodb.net/DocTalker?retryWrites=true&w=majority", { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    console.log('MongoDB connected');

};

module.exports = connectDB;
