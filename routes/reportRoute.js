const express = require("express");
const {
  generateComplaintReport
} = require("../controllers/reportController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.get("/automate",generateComplaintReport);
router.get("/", validateToken, generateComplaintReport);

module.exports = router;