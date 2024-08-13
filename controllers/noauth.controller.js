const User = require("../model/User");
const OTP = require("../model/Otp");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
require("dotenv").config();

const logIn = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Check if the user exists by username or email
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token in the response
    res.status(200).json({ message: "Log in successful", token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const register = async (req, res) => {
  const { username, password, email } = req.body;

  const user = await User.findOne({ email: email });

  if (user) {
    return res
      .status(400)
      .send({ error: "Error creating user: Email already exists!" });
  }
  try {
    const newUser = new User({ username, password, email });

    // Generate a JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser, token });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Error registering user", details: error });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Verify if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if there are existing OTP attempts
    const existingOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    // If the user has exceeded the max attempts (e.g., 3), lock the session for 10 minutes
    if (existingOtp && existingOtp.count >= 3) {
      const currentTime = new Date();
      const lockUntil = new Date(existingOtp.createdAt.getTime() + 10 * 60000); // 10 minutes
      if (currentTime < lockUntil) {
        return res
          .status(429)
          .send("Too many attempts. Please try again later.");
      }
    }

    // Generate a 6-digit OTP
    const otpValue = crypto.randomInt(100000, 999999).toString();

    // Create an OTP record
    const otpRecord = new OTP({
      email,
      otp: otpValue,
      expireAt: new Date(Date.now() + 10 * 60000), // OTP expires in 10 minutes
      count: existingOtp ? existingOtp.count + 1 : 1,
      used: false,
    });

    await otpRecord.save();

    // Send the OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abolajiadeajayi@gmail.com",
        pass: "your-email-password",
      },
    });

    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otpValue}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("OTP sent to your email");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing forgot password request");
  }
};

module.exports = { logIn, register, forgotPassword };
