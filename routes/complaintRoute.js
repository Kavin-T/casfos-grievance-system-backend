const express = require("express");
const {
  addComplaint,
  fetchComplaints
} = require("../controllers/complaintController");
const {
  ensureTempDirectory,
  upload
} =require("../middleware/fileHandler");
const validateDesignation = require("../middleware/validateDesignationHandler");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

//router.use(validateToken);

router.post('/add',ensureTempDirectory,upload.fields([{ name: 'imgBefore' }, { name: 'vidBefore' }]),addComplaint);
router.get('/',fetchComplaints);

module.exports = router;