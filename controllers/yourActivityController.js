const asyncHandler = require("express-async-handler");
const Complaint = require("../models/complaintModel");

const yourActivityController = asyncHandler(async (req, res) => {
  try {
    // Get the 'designation' from query parameters
    const designation = req.user.designation;

    console.log("Received request with designation:", designation);

    if (!designation) {
      console.log("No designation provided");
      return res.status(400).json({ message: "Designation is required" });
    }

    let statuses = [];
    console.log("Determining statuses based on designation...");

    switch (designation) {
      case "ESTATE_OFFICER":
      case "COMPLAINT_RAISER":
        statuses = ["EE_ACKNOWLEDGED", "RESOURCE_REQUIRED"];
        break;
      case "EXECUTIVE_ENGINEER":
        statuses = ["AE_ACKNOWLEDGED"];
        break;
      case "ASSISTANT_ENGINEER":
        statuses = ["JE_WORKDONE", "EE_NOT_SATISFIED"];
        break;
      case "JUNIOR_ENGINEER":
        statuses = ["RAISED", "JE_ACKNOWLEDGED", "AE_NOT_SATISFIED"];
        break;
      default:
        console.log("Invalid designation provided:", designation);
        return res.status(400).json({ message: "Invalid designation" });
    }

    console.log("Statuses to filter complaints:", statuses);

    // Fetch complaints based on the determined statuses
    const complaints = await Complaint.find({ status: { $in: statuses } }).sort(
      { emergency: -1, createdAt: -1 }
    );
    console.log("Complaints fetched from database:", complaints);

    // Return the complaints
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { yourActivityController };
