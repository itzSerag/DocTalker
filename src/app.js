const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('../config/database');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000; 

dotenv.config();
const app = express();

// Middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret' ,
    resave: false,
    saveUninitialized: false
}));

// Passport initialization --> for google auth
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('../routes/auth');
const paymentRoutes = require('../routes/payment');


// Home route
app.get('/', (req, res) => {
    try{
    res.status(200).json({ status: "success" });
    }catch(err){
        res.status(500).json({ status: "error" });
    }
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes) ;
// app.use('/chat' , chatRoutes ) ;



// start the DB connection before starting the app
connectDB()
    .then(() => {
        console.log('Database connected');
        // Start the server after the database connection is established
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
