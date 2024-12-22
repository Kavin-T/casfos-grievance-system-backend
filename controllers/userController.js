const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Add New User
const addUser = asyncHandler(async (req, res) => {
  const { username, designation, email, phoneNumber, password } = req.body;

  if(!password){
    res.status(400);
    throw new Error("Password is required");
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Hash the password
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

// Update User Details
const updateUser = asyncHandler(async (req, res) => {
  const { id, password, ...updates } = req.body;

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Handle password update if password is provided
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
  }

  // Update other user details
  Object.assign(user, updates); // Merge updates into the user object
  await user.save();

  res.status(200).json({ message: "User updated successfully", user });
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User deleted successfully" });
});

// Retrieve All Users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ users });
});

module.exports = {
  addUser,
  updateUser,
  deleteUser,
  getAllUsers,
};
