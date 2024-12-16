const express = require("express");
const {
  addComplaint,
  upload,
  fetchComplaints
} = require("../controllers/complaintController");
const validateDesignation = require("../middleware/validateDesignationHandler");
const validateToken = require("../middleware/validateTokenHandler");
const multer=require('multer');

const router = express.Router();

//router.use(validateToken);

router.post(
  '/add',
  (req, res, next) => {
    upload.fields([{ name: 'imgBefore', maxCount: 1 }, { name: 'vidBefore', maxCount: 1 }])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'Multer error: ' + err.message });
      } else if (err) {
        console.error('Unknown error:', err);
        return res.status(500).json({ message: 'Unknown error: ' + err.message });
      }
      next();
    });
  },
  addComplaint
);

router.get('/',fetchComplaints);

module.exports = router;