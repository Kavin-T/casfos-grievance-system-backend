const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const Complaint = require("../models/complaintModel");

const raisedToJeAcknowledged = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const username = req.user.username;

  if (!username) {
    res.status(400);
    throw new Error("Username required.");
  }

  if (!id) {
    res.status(400);
    throw new Error("ID required.");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  if (
    complaint.status === "JE_ACKNOWLEDGED" ||
    complaint.status === "RESOURCE_REQUIRED"
  ) {
    return res.status(200).json({
      message: "Complaint already acknowledged.",
    });
  }

  complaint.status = "JE_ACKNOWLEDGED";
  complaint.acknowledgeAt = new Date();
  complaint.resolvedName = username;

  await complaint.save();

  res.status(200).json({
    message: "Complaint acknowledged successfully.",
    complaint,
  });
});

const jeAcknowledgedToJeWorkdone = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Complaint ID is required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (complaint.status === "JE_WORKDONE") {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  const complaintID = complaint.complaintID;

  const uploadsDir = path.resolve(__dirname, "../uploads");
  const complaintDir = path.join(uploadsDir, `${complaintID}`);
  fs.mkdirSync(complaintDir, { recursive: true });

  let imgAfterPaths = [];
  let vidAfterPaths = [];

  Object.keys(req.files).forEach((key) => {
    if (key.startsWith("imgAfter")) {
      const file = req.files[key][0];
      const imgAfterFileName = `${key}_${complaintID}.jpg`;
      const imgAfterFullPath = path.join(complaintDir, imgAfterFileName);
      fs.renameSync(file.path, imgAfterFullPath);
      imgAfterPaths.push(`uploads/${complaintID}/${imgAfterFileName}`);
    }
  });

  Object.keys(req.files).forEach((key) => {
    if (key.startsWith("vidAfter")) {
      const file = req.files[key][0];
      const vidAfterFileName = `${key}_${complaintID}.mp4`;
      const vidAfterFullPath = path.join(complaintDir, vidAfterFileName);
      fs.renameSync(file.path, vidAfterFullPath);
      vidAfterPaths.push(`uploads/${complaintID}/${vidAfterFileName}`);
    }
  });

  complaint.imgAfter = imgAfterPaths;
  complaint.vidAfter = vidAfterPaths;

  complaint.status = "JE_WORKDONE";

  await complaint.save();

  res.status(200).json({
    message: "Media files uploaded and status updated successfully.",
    complaint,
  });
});

const jeWorkDoneToAeAcknowledged = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Complaint ID is required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (
    complaint.status === "AE_ACKNOWLEDGED" ||
    complaint.status === "AE_NOT_SATISFIED"
  ) {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "AE_ACKNOWLEDGED";
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to AE ACKNOWLEDGED successfully.",
    complaint,
  });
});

const aeAcknowledgedToEeAcknowledged = asyncHandler(async (req, res) => {
  const { id, price } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Complaint ID is required.");
  }

  if (price === undefined || !price) {
    res.status(400);
    throw new Error("Price is required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (
    complaint.status === "EE_ACKNOWLEDGED" ||
    complaint.status === "EE_NOT_SATISFIED"
  ) {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "EE_ACKNOWLEDGED";
  complaint.price = price;
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to EE ACKNOWLEDGED successfully.",
    complaint,
  });
});

const eeAcknowledgedToResolved = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Complaint ID is required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (complaint.status === "RESOLVED") {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "RESOLVED";
  complaint.resolvedAt = new Date();
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to RESOLVED successfully.",
    complaint,
  });
});

const jeWorkdoneToAeNotSatisfied = asyncHandler(async (req, res) => {
  const { id, remark_AE } = req.body;

  if (!id || !remark_AE) {
    res.status(400);
    throw new Error("Complaint ID and AE remark are required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (
    complaint.status === "AE_NOT_SATISFIED" ||
    complaint.status === "AE_ACKNOWLEDGED"
  ) {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "AE_NOT_SATISFIED";
  complaint.remark_AE = remark_AE;
  complaint.reRaised = true;
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to AE NOT SATISFIED successfully.",
    complaint,
  });
});

const aeAcknowledgedToEeNotSatisfied = asyncHandler(async (req, res) => {
  const { id, remark_EE } = req.body;

  if (!id || !remark_EE) {
    res.status(400);
    throw new Error("Complaint ID and EE remark are required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (
    complaint.status === "EE_NOT_SATISFIED" ||
    complaint.status === "EE_ACKNOWLEDGED"
  ) {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "EE_NOT_SATISFIED";
  complaint.remark_EE = remark_EE;
  complaint.reRaised = true;
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to EE NOT SATISFIED successfully.",
    complaint,
  });
});

const raisedToResourceRequired = asyncHandler(async (req, res) => {
  const { id, remark_JE } = req.body;

  if (!id || !remark_JE) {
    res.status(400);
    throw new Error("Complaint ID and JE remark are required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (
    complaint.status === "RESOURCE_REQUIRED" ||
    complaint.status === "JE_ACKNOWLEDGED"
  ) {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "RESOURCE_REQUIRED";
  complaint.remark_JE = remark_JE;
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to RESOURCE REQUIRED successfully.",
    complaint,
  });
});

const resourceRequiredToClosed = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Complaint ID is required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (complaint.status === "CLOSED" || complaint.status === "RAISED") {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "CLOSED";
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to CLOSED successfully.",
    complaint,
  });
});

const resourceRequiredToRaised = asyncHandler(async (req, res) => {
  const { id, remark_CR } = req.body;

  if (!id || !remark_CR) {
    res.status(400);
    throw new Error("Complaint ID and CR remark are required.");
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  if (complaint.status === "RAISED" || complaint.status === "CLOSED") {
    return res.status(200).json({
      message: "Complaint already updated.",
    });
  }

  complaint.status = "RAISED";
  complaint.remark_CR = remark_CR;
  await complaint.save();

  res.status(200).json({
    message: "Complaint status updated to RAISED successfully.",
    complaint,
  });
});

const changeComplaintDepartment = asyncHandler(async (req, res) => {
  const { id, newDepartment } = req.body;

  if (!id || !newDepartment) {
    res.status(400);
    throw new Error("Complaint ID and new department are required.");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found.");
  }

  complaint.department = newDepartment;
  await complaint.save();

  res.status(200).json({
    message: "Complaint department updated successfully.",
    complaint,
  });
});

module.exports = {
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
  changeComplaintDepartment,
};
