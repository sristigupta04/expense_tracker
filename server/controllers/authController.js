"use strict";
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// Generate JWT
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Safe user response
const sendUserResponse = (user) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  number: user.number || "",
});

// Register
const register = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      number: typeof number === "string" ? number.trim() : "",
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token: generateToken(user),
      user: sendUserResponse(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message:
        error.code === 11000
          ? "An account with this email already exists."
          : "Registration failed.",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: generateToken(user),
      user: sendUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Check the User model and server logs.",
    });
  }
};

// Request password reset


const forgotPassword = async (req, res) => {
  let user;

  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    user = await User.findOne({ email });

    // Keep the response generic to protect account privacy.
    const message =
      "If an account matches that email, password reset instructions will be sent.";

    if (!user) {
      return res.status(200).json({ success: true, message });
    }

    if (
      !process.env.EMAIL_USER ||
      !(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD) ||
      !process.env.CLIENT_URL
    ) {
      console.error(
        "Password reset email configuration is incomplete."
      );

      return res.status(500).json({
        success: false,
        message: "Email service is not configured on the server.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    const resetUrl =
      `${clientUrl}/reset-password?token=${resetToken}` +
      `&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Expense Tracker password",
        text: `You requested a password reset. Open this link within 15 minutes: ${resetUrl}\n\nIf you did not request this, ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#111827">
            <h2 style="color:#1729A8">Reset your password</h2>
            <p>We received a request to reset your Expense Tracker password.</p>
            <p>
              <a href="${resetUrl}"
                 style="display:inline-block;background:#1729A8;color:#fff;padding:13px 22px;border-radius:8px;text-decoration:none">
                Reset Password
              </a>
            </p>
            <p>This link expires in 15 minutes and can only be used once.</p>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw emailError;
    }

    console.log("Password reset email sent successfully.");

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Forgot password email error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send the reset email. Please try again later.",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
};
