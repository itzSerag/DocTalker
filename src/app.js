const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/database');
const PORT = process.env.PORT || 3000;

const app = express();

// Database connection
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
