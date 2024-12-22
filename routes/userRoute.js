const express = require("express");
const {
  addUser,
  updateUser,
  deleteUser,
  getAllUsers,
  updatePassword,
} = require("../controllers/userController");
const validateDesignation = require("../middleware/validateDesignationHandler");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

//router.use(validateToken);

router.post("/add", addUser);
router.put("/update", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/all", getAllUsers);

module.exports = router;
