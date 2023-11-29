const mongoose = require('mongoose');

exports.connectDB = async () => {

    await mongoose.connect(process.env.MONGO_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    console.log('MongoDB connected');

};