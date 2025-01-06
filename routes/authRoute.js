const express = require("express");
const router = express.Router();
const { login, check } = require("../controllers/authController");
const validateToken = require("../middleware/validateTokenHandler");

router.post("/login", login);
router.get("/check",validateToken, check);

module.exports = router;
