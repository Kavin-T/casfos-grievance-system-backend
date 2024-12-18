const asyncHandler = require('express-async-handler'); // Import asyncHandler
const { generateReport } = require('../helper/reportHelper'); // Import the report generation function
const getQuery = require('../helper/queryHelper'); // Assuming getQuery is in complaintController.js
const Complaint = require('../models/complaintModel'); // Assuming Complaint model is here

// Controller function to generate and download the report
const generateComplaintReport = asyncHandler(async (req, res) => {
    try {
    // Existing logic...

    const query = getQuery(req.query);

    // Fetch all filtered complaints (without pagination)
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });


    if (!complaints || complaints.length === 0) {
        console.error('No complaints found for the given filters.');
        return res.status(404).json({ message: 'No complaints found.' });
    }
  
    // Generate the DOCX report
    const reportBuffer = await generateReport(complaints, query);
  
    console.log(reportBuffer);
  
    // Set the response headers for downloading the DOCX file
    res.setHeader('Content-Disposition', 'attachment; filename=complaint_report.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    // Send the generated DOCX file as the response
    res.send(reportBuffer);
    } catch (error) {
        console.error('Error in generateReport:', error.message);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
});

module.exports = {
    generateComplaintReport
};
