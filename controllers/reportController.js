const asyncHandler = require("express-async-handler");
const Complaint = require("../models/complaintModel");
const getQuery = require("../helper/queryHelper");
const { generateReport } = require("../helper/reportPDFHelper");
const { generateCSVReport } = require("../helper/reportCSVHelper");
const pdf = require("html-pdf-node");

const generateComplaintReport = asyncHandler(async (req, res) => {
  const filters = req.query;
  const query = getQuery(filters);
  const complaints = await Complaint.find(query).exec();

  if (req.query.type === "pdf") {
    const file = await generateReport(complaints);
    const pdfBuffer = await pdf.generatePdf(file, { format: "A2" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=complaints_report.pdf"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } else if (req.query.type === "csv") {
    const csvData = generateCSVReport(complaints);

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=complaints_report.csv"
    );
    res.setHeader("Content-Type", "text/csv");
    res.send(csvData);
  } else {
    res.status(400);
    throw new Error("Invalid report type. Please specify 'pdf' or 'csv'.");
  }
});

module.exports = { generateComplaintReport };
