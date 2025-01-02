const express = require("express");
const {
  raisedToJeAcknowledged,
  jeAcknowledgedToJeWorkdone,
  jeWorkDoneToAeAcknowledged,
  aeAcknowledgedToEeAcknowledged,
  eeAcknowledgedToResolved,
  jeWorkdoneToAeNotSatisfied,
  aeAcknowledgedToEeNotSatisfied,
  raisedToResourceRequired,
  resourceRequiredToClosed,
  resourceRequiredToRaised,
} = require("../controllers/statusController");
const { upload, ensureTempDirectory } = require("../middleware/fileHandler");
const validateDesignation = require("../middleware/validateDesignationHandler");
const router = express.Router();

router.put(
  "/raised/je-acknowledged",
  validateDesignation(["JUNIOR_ENGINEER"]),
  raisedToJeAcknowledged
);
router.post(
  "/je-acknowledged/je-workdone",
  validateDesignation(["JUNIOR_ENGINEER"]),
  ensureTempDirectory,
  upload.fields([
    { name: "imgAfter", maxCount: 1 },
    { name: "vidAfter", maxCount: 1 },
  ]),
  jeAcknowledgedToJeWorkdone
);
router.put(
  "/je-workdone/ae-acknowledged",
  validateDesignation(["ASSISTANT_ENGINEER"]),
  jeWorkDoneToAeAcknowledged
);
router.put(
  "/ae-acknowledged/ee-acknowledged",
  validateDesignation(["EXECUTIVE_ENGINEER"]),
  aeAcknowledgedToEeAcknowledged
);
router.put(
  "/ee-acknowledged/resolved",
  validateDesignation(["COMPLAINT_RAISER", "ESTATE_OFFICER"]),
  eeAcknowledgedToResolved
);
router.put(
  "/je-workdone/ae-not-satisfied",
  validateDesignation(["ASSISTANT_ENGINEER"]),
  jeWorkdoneToAeNotSatisfied
);
router.put(
  "/ae-acknowledged/ee-not-satisfied",
  validateDesignation(["EXECUTIVE_ENGINEER"]),
  aeAcknowledgedToEeNotSatisfied
);
router.put(
  "/raised/resource-required",
  validateDesignation(["JUNIOR_ENGINEER"]),
  raisedToResourceRequired
);
router.put(
  "/resource-required/closed",
  validateDesignation(["COMPLAINT_RAISER", "ESTATE_OFFICER"]),
  resourceRequiredToClosed
);
router.put(
  "/resource-required/raised",
  validateDesignation(["COMPLAINT_RAISER", "ESTATE_OFFICER"]),
  resourceRequiredToRaised
);

module.exports = router;
