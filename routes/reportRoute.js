const express = require("express");
const {
    generateComplaintReport
  } = require("../controllers/reportController");
const validateDesignation = require("../middleware/validateDesignationHandler");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

//router.use(validateToken);

router.get("/", generateComplaintReport);

module.exports = router;