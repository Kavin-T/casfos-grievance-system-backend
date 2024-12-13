const express = require("express");
const router = express.Router();
const validateLogin = require("../controllers/loginController");

router.route("/").post(validateLogin);

module.exports = router;