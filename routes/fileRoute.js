const express = require("express");
const {
  getFile
} = require("../controllers/fileController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

//router.use(validateToken);

router.get("/", getFile);

module.exports = router;