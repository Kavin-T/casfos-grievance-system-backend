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
router.put("/update/password/:id", validateDesignation(["Estate Officer"]), updatePassword);
router.put("/update/:id", validateDesignation(["Estate Officer"]), updateUser);
router.delete("/delete/:id", validateDesignation(["Estate Officer"]), deleteUser);
router.get("/all", validateDesignation(["Estate Officer"]), getAllUsers);

module.exports = router;