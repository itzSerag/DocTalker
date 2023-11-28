const mongoose = require('mongoose');
require('dotenv').config();

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    console.log('MongoDB connected');

};