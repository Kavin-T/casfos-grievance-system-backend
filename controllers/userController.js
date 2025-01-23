const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const addUser = asyncHandler(async (req, res) => {
  const { username, designation, email, phoneNumber, password } = req.body;

  if(!password){
    res.status(400);
    throw new Error("Password is required");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    designation,
    email,
    phoneNumber,
    passwordHash,
  });

  res.status(200).json({ message: "User added successfully", user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id, password, ...updates } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
  }

  Object.assign(user, updates);
  await user.save();

  res.status(200).json({ message: "User updated successfully", user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User deleted successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.status(200).json({ users });
});

module.exports = {
  addUser,
  updateUser,
  deleteUser,
  getAllUsers,
};