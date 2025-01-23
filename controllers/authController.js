const asyncHandler = require("express-async-handler");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    res.status(404);
    throw new Error("Username not found");
  } else {
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordMatch) {
      const accessToken = jwt.sign(
        {
          id: user._id,
          username: user.username,
          designation: user.designation,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      res.cookie("token", accessToken, {
        withCredentials: true,
        httpOnly: false,
        maxAge: 3600000,
      });
      res.status(200).json({
        username: user.username,
        designation: user.designation,
        message: "Login successful!",
      });
    } else {
      res.status(400);
      throw new Error("Invalid password");
    }
  }
});

const check = asyncHandler(async (req, res) => {
  res.status(200).json({ authenticated: true });
});

module.exports = { login, check };