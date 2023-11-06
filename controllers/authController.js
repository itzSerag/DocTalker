const User = require('../models/user');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


// initialize nodemailer
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: process.env.HOTMAIL_EMAIL, // Replace with your email
      pass: process.env.HOTMAIL_PASSWORD, // Replace with your password
    },
  });
  //





exports.googleAuth = (req, res, next) => {
  // Implementation for Google OAuth (handled by Passport) can remain unchanged.
};

exports.googleRedirect = async (req, res) => {
  const { id, displayName, emails } = req.user; // Assuming email is an array in req.user

  let user = await User.findOne({ googleId: id });

  if (!user) {
    user = new User({
      googleId: id,
      Fname: displayName,
      email: emails[0].value, // Assuming you want to use the first email from the array
      isVerified: true,
    });

    await user.save();
  }

  // Redirect to home after login (customize this as needed).
  res.redirect('/');
};




exports.signup = async (req, res) => {
    const { Fname, Lname, email, password } = req.body;
    

    // check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "Email already registered." });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create (Add) a new user
    user = new User({
      Fname,
      Lname,
      email,
      password: hashedPassword,
    });
  
    await user.save();
  
    // Generate and store OTP
    const otp = generateOTP();
    const otpExpiresIn = new Date(Date.now() + 20 * 60 * 1000);
  
    const otpDocument = new OTP({
      email,
      otp,
      otpExpiresIn,
    });
  
    await otpDocument.save();
  
    // Send the OTP to the user's email
    const mailOptions = {
      from: process.env.HOTMAIL_EMAIL,
      to: email,
      subject: 'Your OTP for Verification',
      text: `Your OTP is: ${otp}`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to send OTP' });
      } else {
        return res.status(200).json({ message: "Signup successful. Please verify the OTP sent to your email." });
      }
    });
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

  // Implement OTP logic using nodemailer and store the OTP for later verification

  if (!user.isVerified) {
    return res.status(400).json({ error: "Please verify your email first." });
  }

  res.status(200).json({ message: "Login successful. Please verify the OTP sent to your email." });
};



exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    // Find the OTP document in the database
    const otpDocument = await OTP.findOne({ email });
  
    if (!otpDocument) {
      return res.status(400).json({ error: 'No OTP found for the provided email.' });
    }
  
    // Check if the OTP is correct and hasn't expired
    if (otpDocument.otp !== otp || otpDocument.otpExpiresIn < new Date(Date.now())) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
  
    // Mark the user as verified
    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();
    
    // Delete the OTP document
    await OTP.deleteOne({ _id: otpDocument._id });

    // Return a JWT token or a success message
    const payload = {
      user: {
        id: user.id,
      }
    };
  
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  };

  exports.resendOtp = async (req, res) => {
    const { email } = req.body;
  
    // Generate a new OTP
    const otp = generateOTP();
    const otpExpiresIn = new Date(Date.now() + 20 * 60 * 1000);
  
    // Update the OTP in the database
    try {
      await OTP.findOneAndUpdate(
        { email },
        { otp, otpExpiresIn }
      );
  
      // Send the new OTP to the user's email
      const mailOptions = {
        from: process.env.HOTMAIL_EMAIL,
        to: email,
        subject: 'Your New OTP for Verification',
        text: `Your new OTP is: ${otp}`,
      };
      

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to send OTP' });
        } else {
          return res.status(200).json({ message: "New OTP sent to your email." });
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update OTP in the database' });
    }
  };
  

  
exports.logout = (req, res) => {
  // Logout implementation depends on your session management method.
  // Adjust this part accordingly.
  // If using JWT, clients discard the token, no server-side logout required.
  // TODO delete the JWT token from the client-side

  req.logout(); // Example: Logout using Passport session management
  res.redirect('/'); // Redirect to home or the desired page
};







// helpers
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }