const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/User');



passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {

        // -- CREATE THE LOGIC HERE --
        // Check if user exists in our database
        // If not, create a new user
        // Return the user
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
