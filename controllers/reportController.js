const asyncHandler = require("express-async-handler");
const Complaint = require("../models/complaintModel");
const getQuery = require("../helper/queryHelper");
const { generateReport } = require("../helper/reportHelper");
const pdf = require("html-pdf-node");

const generateComplaintReport = asyncHandler(async (req, res) => {
  const filters = req.query;
  const query = getQuery(filters);
  const complaints = await Complaint.find(query).exec();

  if (complaints.length === 0) {
    res.status(404);
    throw new Error("No complaints found for the given filters.");
  }

  const file = await generateReport(complaints);
  const pdfBuffer = await pdf.generatePdf(file, { format: "A2" });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=complaints_report.pdf"
  );
  res.setHeader("Content-Type", "application/pdf");
  res.send(pdfBuffer);
});

module.exports = { generateComplaintReport };
