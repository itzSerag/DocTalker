
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP').OTP;

// Create a Nodemailer transporter for Hotmail (Outlook)
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.HOTMAIL_EMAIL,
    pass: process.env.HOTMAIL_PASSWORD
  },
});

// Function to send OTP via email
exports.sendOtp = async (req, res) => {
  // Generate and send OTP logic here
  const otp = generateOTP(); // Implement your OTP generation logic
  const email = req.body.email; // Get the email address from the body

  // Create a new OTP document and save it to the database
  const otpDoc = new OTP({
    email: email,
    otp: otp,
    otpExpiresIn: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
  });
  try {
    await otpDoc.save();
  } catch (error) {
    return res.status(500).send('Failed to save OTP to the database');
  }

  // Send the OTP to the email address using Nodemailer
  const mailOptions = {
    from: process.env.HOTMAIL_EMAIL,
    to: email,
    subject: 'Your OTP for Authentication',
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Failed to send OTP');
    } else {
      return res.status(200).send('OTP sent to your email');
    }
  });
};





// Define the verify function
const verify = async (email, userOTP) => {
  try {
    const otpDoc = await OTP.findOne({ email: email, otp: userOTP });
    if (!otpDoc) {
      return 'Invalid OTP';
    }
    if (Date.now() > otpDoc.otpExpiresIn) {
      return 'OTP expired';
    }
    return 'OTP verified successfully';
  } catch (error) {
    return 'Failed to find OTP in the database';
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, userOTP } = req.body;

  const verificationResult = await verify(email, userOTP);

  if (verificationResult === 'OTP verified successfully') {
    return res.status(200).send('OTP verified successfully');
  } else if (verificationResult === 'Invalid OTP') {
    return res.status(400).send('Invalid OTP');
  } else if (verificationResult === 'OTP expired') {
    return res.status(400).send('OTP expired');
  } else {
    return res.status(500).send('Failed to find OTP in the database');
  }
};


/////

// Function to resend OTP via email
exports.resendOtp = async (req, res) => {
  // Resend OTP logic here (similar to sendOtp)
  const otp = generateOTP(); // Implement your OTP generation logic
  const email = req.query.email; // Get the email address from the request

  // Update the OTP document in the database with the new OTP and expiry time
  try {
    await OTP.findOneAndUpdate({ email: email }, { otp: otp, otpExpiresIn: Date.now() + 10 * 60 * 1000 });
  } catch (error) {
    return res.status(500).send('Failed to update OTP in the database');
  }

  // Send the OTP to the email address using Nodemailer
  const mailOptions = {
    from: 'your-hotmail-email@hotmail.com',
    to: email,
    subject: 'Your OTP for Authentication',
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Failed to resend OTP');
    } else {
      return res.status(200).send('OTP resent to your email');
    }
  });
};

// Helper function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
