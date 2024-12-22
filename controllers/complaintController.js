const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const Complaint = require("../models/complaintModel");
const getQuery = require("../helper/queryHelper");

// Controller Function for Adding a Complaint
const addComplaint = asyncHandler(async (req, res) => {
  const {
    raiserName,
    subject,
    date,
    details,
    department,
    premises,
    location,
    emergency,
  } = req.body;

  // Validate mandatory fields
  if (
    !raiserName ||
    !subject ||
    !date ||
    !details ||
    !department ||
    !premises ||
    !location
  ) {
    res.status(400);
    throw new Error("All fields are required.");
  }

  // Convert emergency field to boolean
  const isEmergency = emergency === "true";

  // Check file sizes
  if (req.files?.imgBefore) {
    const imgBeforeSize = req.files.imgBefore[0].size;
    if (imgBeforeSize > 5 * 1024 * 1024) {
      res.status(400);
      throw new Error("File size of Image exceeds 5MB.");
    }
  }

  if (req.files?.vidBefore) {
    const vidBeforeSize = req.files.vidBefore[0].size;
    if (vidBeforeSize > 100 * 1024 * 1024) {
      res.status(400);
      throw new Error("File size of Video exceeds 100MB.");
    }
  }

  // Create a new complaint document
  const newComplaint = new Complaint({
    raiserName,
    subject,
    date: new Date(date),
    details,
    department,
    premises,
    location,
    emergency: isEmergency,
    media: {
      imgAfter: null,
      vidAfter: null,
    },
  });

  const savedComplaint = await newComplaint.save();

  // Create a dedicated directory for the complaint
  const complaintDir = path.join("uploads", savedComplaint._id.toString());
  const absoluteComplaintDir = path.resolve(__dirname, "../", complaintDir);
  fs.mkdirSync(absoluteComplaintDir, { recursive: true });

  // Move files from temp to permanent location (store relative paths)
  let imgBeforePath = null;
  let vidBeforePath = null;

  if (req.files?.imgBefore) {
    const imgBeforeTempPath = req.files.imgBefore[0].path;
    const imgBeforeFileName = `imgBefore_${savedComplaint._id}.jpg`;
    const imgBeforeFinalPath = path.join(
      absoluteComplaintDir,
      imgBeforeFileName
    );

    // Move file
    fs.renameSync(imgBeforeTempPath, imgBeforeFinalPath);

    // Store relative path including 'uploads'
    imgBeforePath = path
      .join(complaintDir, imgBeforeFileName)
      .replace(/\\/g, "/");
  }

  if (req.files?.vidBefore) {
    const vidBeforeTempPath = req.files.vidBefore[0].path;
    const vidBeforeFileName = `vidBefore_${savedComplaint._id}.mp4`;
    const vidBeforeFinalPath = path
      .join(absoluteComplaintDir, vidBeforeFileName)
      .replace(/\\/g, "/");

    // Move file
    fs.renameSync(vidBeforeTempPath, vidBeforeFinalPath);

    // Store relative path including 'uploads'
    vidBeforePath = path.join(complaintDir, vidBeforeFileName);
  }

  // Update complaint media paths with relative paths
  savedComplaint.media = {
    imgBefore: imgBeforePath,
    vidBefore: vidBeforePath,
    imgAfter: null,
    vidAfter: null,
  };
  await savedComplaint.save();

  res.status(200).json({
    message: "Complaint added successfully.",
    complaint: savedComplaint,
  });
});

// Controller Function to Fetch Complaints with Pagination and Filters
const fetchComplaints = asyncHandler(async (req, res) => {
  const query = getQuery(req.query);
  const { page = 1, limit = 10 } = req.query;

  // Pagination calculations
  const skip = (page - 1) * limit;

  try {
    // Fetch complaints with query, pagination, and sorting by creation date
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 }) // Sort by most recent first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count of complaints matching the query
    const totalCount = await Complaint.countDocuments(query);

    res.status(200).json({
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit),
      complaints,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Failed to fetch complaints");
  }
});

module.exports = {
  addComplaint,
  fetchComplaints,
};
