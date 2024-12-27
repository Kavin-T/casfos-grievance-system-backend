const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const Complaint = require("../models/complaintModel");
const getQuery = require("../helper/queryHelper");

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

  const isEmergency = emergency === "true";

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
  const id = savedComplaint._id.toString();

  const uploadsDir = path.resolve(__dirname, "../uploads");
  const complaintDir = path.join(uploadsDir, id);
  fs.mkdirSync(complaintDir, { recursive: true });

  let imgBeforePath = null;
  let vidBeforePath = null;

  if (req.files?.imgBefore) {
    const imgBeforeTempPath = req.files.imgBefore[0].path;
    const imgBeforeFullPath = path.join(complaintDir, `imgBefore_${id}.jpg`);
    fs.renameSync(imgBeforeTempPath, imgBeforeFullPath);

    imgBeforePath = path
      .relative(uploadsDir, imgBeforeFullPath)
      .replace(/\\/g, "/");
  }

  if (req.files?.vidBefore) {
    const vidBeforeTempPath = req.files.vidBefore[0].path;
    const vidBeforeFullPath = path.join(complaintDir, `vidBefore_${id}.mp4`);
    fs.renameSync(vidBeforeTempPath, vidBeforeFullPath);

    vidBeforePath = path
      .relative(uploadsDir, vidBeforeFullPath)
      .replace(/\\/g, "/");
  }

  savedComplaint.media = {
    imgBefore: imgBeforePath ? `uploads/${imgBeforePath}` : null,
    vidBefore: vidBeforePath ? `uploads/${vidBeforePath}` : null,
    imgAfter: null,
    vidAfter: null,
  };

  await savedComplaint.save();

  res.status(200).json({
    message: "Complaint added successfully.",
    complaint: savedComplaint,
  });
});

const fetchComplaints = asyncHandler(async (req, res) => {
  const query = getQuery(req.query);
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const complaints = await Complaint.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalCount = await Complaint.countDocuments(query);

  res.status(200).json({
    totalCount,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalCount / limit),
    complaints,
  });
});

const yourActivity = asyncHandler(async (req, res) => {
  const designation = req.user.designation;

  if (!designation) {
    res.status(400);
    throw new Error("Designation is required");
  }

  let statuses = [];

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
      res.status(403);
      throw new Error("Invalid designation");
  }

  const complaints = await Complaint.find({ status: { $in: statuses } }).sort({
    emergency: -1,
    createdAt: -1,
  });

  res.status(200).json(complaints);
});

const getComplaintStatistics = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  let match = {};

  if (year && year !== "All") {
    match.createdAt = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${Number(year) + 1}-01-01`),
    };
  }

  if (month && month !== "All") {
    const monthStart = new Date(
      `${year || new Date().getFullYear()}-${month}-01`
    );
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1);
    match.createdAt = {
      ...match.createdAt,
      $gte: monthStart,
      $lt: monthEnd,
    };
  }

  const statistics = await Complaint.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$department",
        totalComplaints: { $sum: 1 },
        pendingComplaints: {
          $sum: { $cond: [{ $ne: ["$status", "RESOLVED"] }, 1, 0] },
        },
        resolvedComplaints: {
          $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] },
        },
        totalPrice: { $sum: { $toDouble: "$price" } },
      },
    },
    {
      $group: {
        _id: null,
        totalComplaints: { $sum: "$totalComplaints" },
        pendingComplaints: { $sum: "$pendingComplaints" },
        resolvedComplaints: { $sum: "$resolvedComplaints" },
        departmentWise: {
          $push: {
            department: "$_id",
            pending: "$pendingComplaints",
            resolved: "$resolvedComplaints",
            price: "$totalPrice",
          },
        },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        totalComplaints: 1,
        pendingComplaints: 1,
        resolvedComplaints: 1,
        departmentWise: 1,
        totalPrice: 1,
      },
    },
  ]);

  res.json(
    statistics[0] || {
      totalComplaints: 0,
      pendingComplaints: 0,
      resolvedComplaints: 0,
      departmentWise: [],
      totalPrice: 0,
    }
  );
});

module.exports = {
  addComplaint,
  fetchComplaints,
  yourActivity,
  getComplaintStatistics,
};
