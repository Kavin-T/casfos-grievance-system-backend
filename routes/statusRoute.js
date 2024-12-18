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
  resourceRequiredToRaised
} = require("../controllers/statusController");
const {upload,ensureTempDirectory} = require("../middleware/fileHandler");
const validateDesignation = require("../middleware/validateDesignationHandler");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

// router.use(validateToken);

router.put('/raised/je-acknowledged',raisedToJeAcknowledged);
router.post(
    '/je-acknowledged/je-workdone',
    ensureTempDirectory,
    upload.fields([
      { name: 'imgAfter', maxCount: 1 },
      { name: 'vidAfter', maxCount: 1 },
    ]),
    jeAcknowledgedToJeWorkdone
  );
router.put('/je-workdone/ae-acknowledged', jeWorkDoneToAeAcknowledged);
router.put('/ae-acknowledged/ee-acknowledged', aeAcknowledgedToEeAcknowledged);
router.put('/ee-acknowledged/resolved', eeAcknowledgedToResolved);
router.put('/je-workdone/ae-not-satisfied', jeWorkdoneToAeNotSatisfied);
router.put('/ae-acknowledged/ee-not-satisfied', aeAcknowledgedToEeNotSatisfied);
router.put('/raised/resource-required', raisedToResourceRequired);
router.put('/resource-required/closed', resourceRequiredToClosed);
router.put('/resource-required/raised', resourceRequiredToRaised);

module.exports = router;