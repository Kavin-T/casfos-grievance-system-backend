const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter an username"],
      trim: true,
      maxlength: 100,
    },
    designation: {
      type: String,
      required: [true, "Please enter designation"],
      trim: true,
      enum: ['ESTATE_OFFICER','COMPLAINT_RAISER','EXECUTIVE_ENGINEER', 'ASSISTANT_ENGINEER', 'JUNIOR_ENGINEER'],
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter phone number"],
      unique: [true, "Phone Number already exists"],
      trim: true,
      match: [/^\d{10}$/, "Please enter a 10 digit phone number"],
    },
    passwordHash: {
      type: String,
      required: [true, "Please enter password"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
