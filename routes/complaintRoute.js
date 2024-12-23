const express = require("express");
const {
  addComplaint,
  fetchComplaints,
  yourActivity
} = require("../controllers/complaintController");
const {
  ensureTempDirectory,
  upload
} =require("../middleware/fileHandler");
const validateDesignation = require("../middleware/validateDesignationHandler");
const router = express.Router();

router.get('/your-activity',yourActivity);
router.post('/add',ensureTempDirectory,upload.fields([{ name: 'imgBefore' }, { name: 'vidBefore' }]),addComplaint);
router.get('/',fetchComplaints);

module.exports = router;