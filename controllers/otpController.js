const nodemailer = require('nodemailer');
const User = require('../models/user');

// Create a Nodemailer transporter for Hotmail (Outlook)


// Function to send OTP via email
// exports.sendOtp = async (req, res , userEmail) => {
//   // Generate and send OTP logic here
//   const otp = generateOTP();
//   const email = userEmail; 

//   const update = {
//     $set: {
//       otp: otp,
//       otpExpiresIn: new Date(Date.now() + 20 * 60 * 1000),
//     },
//   };



//   try {
//     await otpDoc.save();
//   } catch (error) {
//     return res.status(500).send('Failed to save OTP to the database');
//   }

//   // Send the OTP to the email address using Nodemailer
//   const mailOptions = {
//     from: process.env.HOTMAIL_EMAIL, // Replace with your email
//     to: email,
//     subject: 'Your OTP for Authentication',
//     text: `Your OTP is: ${otp}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return res.status(500).send('Failed to send OTP');
//     } else {
//       return res.status(200).send('OTP sent to your email');
//     }
//   });
// };

// Define the verify function
const verify = async (email, userOTP) => {
  try {
    const otpDoc = await User.findOne({ email: email, otp: userOTP });
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

// Function to resend OTP via email
exports.resendOtp = async (req, res) => {
  // Resend OTP logic here (similar to sendOtp)
  const otp = generateOTP();
  const email = req.query.email; // Get the email address from the request

  // Update the OTP document in the database with the new OTP and expiry time
  try {
    await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          otp: otp,
          otpExpiresIn: new Date(Date.now() + 10 * 60 * 1000),
        },
      }
    );
  } catch (error) {
    return res.status(500).send('Failed to update OTP in the database');
  }

  // Send the OTP to the email address using Nodemailer
  const mailOptions = {
    from: process.env.HOTMAIL_EMAIL, // Replace with your email
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

