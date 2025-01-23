const express = require("express");
const {
  addUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/userController");
const validateDesignation = require("../middleware/validateDesignationHandler");
const router = express.Router();

router.use(validateDesignation(["ESTATE_OFFICER","PRINCIPAL"]));

router.post("/add", addUser);
router.put("/update", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/all", getAllUsers);

module.exports = router;
