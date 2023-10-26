const User = require('../models/User');

exports.googleAuth = (req, res, next) => {
    // handle with passport
};

exports.googleRedirect = (req, res) => {
    // Redirect or handle user data after Google auth
};

exports.signup = (req, res) => {
    // Signup logic, send OTP
};

exports.login = (req, res) => {
    // Login logic, send OTP
};

exports.verifyOtp = (req, res) => {
    // Verify OTP logic
};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};
