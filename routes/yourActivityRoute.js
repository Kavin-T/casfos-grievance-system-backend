const express = require("express");
const {
  yourActivityController,
} = require("../controllers/yourActivityController");
const asyncHandler = require("express-async-handler");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.get("/", validateToken,asyncHandler(yourActivityController));

module.exports = router;
