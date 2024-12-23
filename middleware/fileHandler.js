const asyncHandler = require("express-async-handler");
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const tempUploadDir = path.resolve(__dirname, '../uploads/temp');

const ensureTempDirectory = asyncHandler(async (req, res, next) => {
  if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  }
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports ={
  ensureTempDirectory,
  upload
}