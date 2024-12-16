const asyncHandler = require("express-async-handler");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/complaintModel');

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Complaint controller function to handle adding complaints
const addComplaint = async (req, res) => {
  console.log("Uploaded files:", req.files); // Debug uploaded files
  console.log('Request body:', req.body);  // Debug form fields

  try {
    const { raiserName, subject, date, details, department, premises, location } = req.body;

    // Validate mandatory fields
    if (!raiserName || !subject || !date || !details || !department || !premises || !location) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Get file paths from multer
    const imgBeforePath = req.files?.imgBefore ? req.files.imgBefore[0].path : null;
    const vidBeforePath = req.files?.vidBefore ? req.files.vidBefore[0].path : null;

    console.log("imgBeforePath:", imgBeforePath);
    console.log("vidBeforePath:", vidBeforePath);

    // Create a new complaint document
    const newComplaint = new Complaint({
      raiserName,
      subject,
      date: new Date(date),
      details,
      department,
      premises,
      location,
      media: {
        imgBefore: imgBeforePath,
        vidBefore: vidBeforePath,
      },
    });

    // Save to database
    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      message: 'Complaint added successfully.',
      complaint: savedComplaint,
    });
  } catch (error) {
    console.error('Error while adding complaint:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

// Controller Function to Fetch Complaints with Pagination and Filters

const fetchComplaints = asyncHandler(async (req, res) => {
  const {
    page = 1, 
    limit = 10, 
    startDate, 
    endDate,   
    createdStartDate, 
    createdEndDate,   
    acknowledgedStartDate, 
    acknowledgedEndDate,   
    resolvedStartDate, 
    resolvedEndDate,   
    ...filters 
  } = req.query;

  // Build query object dynamically
  const query = {};

  // Filter by date range (for `date` field)
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Filter by createdAt range
  if (createdStartDate || createdEndDate) {
    query.createdAt = {};
    if (createdStartDate) query.createdAt.$gte = new Date(createdStartDate);
    if (createdEndDate) query.createdAt.$lte = new Date(createdEndDate);
  }

  // Filter by acknowledgeAt range
  if (acknowledgedStartDate || acknowledgedEndDate) {
    query.acknowledgeAt = {};
    if (acknowledgedStartDate) query.acknowledgeAt.$gte = new Date(acknowledgedStartDate);
    if (acknowledgedEndDate) query.acknowledgeAt.$lte = new Date(acknowledgedEndDate);
  }

  // Filter by resolvedAt range
  if (resolvedStartDate || resolvedEndDate) {
    query.resolvedAt = {};
    if (resolvedStartDate) query.resolvedAt.$gte = new Date(resolvedStartDate);
    if (resolvedEndDate) query.resolvedAt.$lte = new Date(resolvedEndDate);
  }

  // Add filters for other attributes (including details but excluding remarks and media)
  const filterableFields = [
    'raiserName',
    'subject',
    'department',
    'premises',
    'location',
    'details',
    'emergency',
    'status',
  ];

  filterableFields.forEach((field) => {
    if (filters[field] !== undefined && filters[field] !== '') {
      // Special handling for boolean fields like `emergency`
      if (field === 'emergency') {
        query[field] = filters[field] === 'true' ? true : filters[field] === 'false' ? false : null;
      } else if (field === 'status' || field === 'department' || field === 'premises') {
        // Treat status as an exact match field, not regex
        query[field] = filters[field];
      } else {
        // For string fields (except 'status'), use regex for partial matching
        if (typeof filters[field] === 'string') {
          query[field] = { $regex: filters[field], $options: 'i' };  // 'i' for case-insensitive matching
        } else {
          query[field] = filters[field];
        }
      }
    }
  });

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
    throw new Error('Failed to fetch complaints');
  }
});

module.exports = {
  upload,
  addComplaint,
  fetchComplaints
};
