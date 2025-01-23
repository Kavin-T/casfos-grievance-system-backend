const express = require("express");
const {
  addComplaint,
  fetchComplaints,
  yourActivity,
  getComplaintStatistics,
} = require("../controllers/complaintController");
const { ensureTempDirectory, upload } = require("../middleware/fileHandler");
const validateDesignation = require("../middleware/validateDesignationHandler");
const router = express.Router();

router.get("/your-activity", yourActivity);
router.post(
  "/add",
  validateDesignation([
    "ESTATE_OFFICER",
    "COMPLAINT_RAISER",
    "PRINCIPAL",
    "ASSISTANT_TO_ESTATE_OFFICER",
  ]),
  ensureTempDirectory,
  upload.fields([{ name: "imgBefore" }, { name: "vidBefore" }]),
  addComplaint
);
router.get("/statistics", getComplaintStatistics);
router.get("/", fetchComplaints);

module.exports = router;
