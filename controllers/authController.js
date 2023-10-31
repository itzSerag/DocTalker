const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// TODO: Setup nodemailer transport here for sending OTP

exports.googleAuth = (req, res, next) => {

    // This will be automatically handled by passport when the route is hit.
    // No need to implement anything here.
};

exports.googleRedirect = async (req, res) => {
    // After Google OAuth, we can either save user data or directly provide JWT.
    // This example assumes you want to save the user data.

    const { id, displayName, emails } = req.user;

    let user = await User.findOne({ googleId: id });
    
    if (!user) {
        user = new User({
            googleId: id,
            username: displayName,
            email: emails[0].value
        });

        await user.save();
    }

    // For this example, we'll just redirect to home after login.
    res.redirect('/');
};

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ error: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
        username,
        email,
        password: hashedPassword
    });

    await user.save();

    // TODO: Send OTP logic using nodemailer  // wait for it for now
    // Make sure to store the OTP for later verification

    res.status(200).json({ message: "Signup successful. Please verify the OTP sent to your email." });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: "Incorrect password." });
    }

    // TODO: Send OTP logic using nodemailer
    // Make sure to store the OTP for later verification

    res.status(200).json({ message: "Login successful. Please verify the OTP sent to your email." });
};

exports.verifyOtp = (req, res) => {
    const { otp } = req.body;

    // TODO: Check the OTP against stored value
    // If it matches, generate JWT and return to user

    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
    });
};

exports.logout = (req, res) => {
    // This would depend on how you're managing sessions.
    // For JWT, the client simply discards the token.
    // If using sessions, you can use req.logout() to destroy the session.
    
    req.logout();
    res.redirect('/');
};
