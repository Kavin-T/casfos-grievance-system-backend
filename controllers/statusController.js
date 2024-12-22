const asyncHandler = require("express-async-handler");
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/complaintModel');

// Acknowledge JE API
const raisedToJeAcknowledged = asyncHandler(async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { id } = req.body; 
        console.log("Complaint ID:", id);
        const username = req.user.username;

        if (!username) {
          res.status(400); // Not found status
          throw new Error('Username required.');
        }

        if (!id) {
          res.status(400); // Not found status
          throw new Error('ID required.');
        }

      // Find the complaint by ID
      const complaint = await Complaint.findById(id);
  
      if (!complaint) {
        res.status(404); // Not found status
        throw new Error('Complaint not found');
      }
  
      // Update status to 'ACKNOWLEDGED'
      complaint.status = 'JE_ACKNOWLEDGED';
      complaint.acknowledgeAt = new Date();
      complaint.resolvedName = username;
  
      // Save the updated complaint
      await complaint.save();
  
      // Return success response
      res.status(200).json({
        message: 'Complaint acknowledged successfully',
        complaint,
      });
    } catch (error) {
      console.error('Error acknowledging complaint:', error.message);
  
      res.status(500); // Internal Server Error status
      throw new Error('Failed to Acknowledge complaint');
    }
  });
 
 
// POST /api/v1/complaint/je-acknowledged/je-workdone
const jeAcknowledgedToJeWorkdone = asyncHandler(async (req, res) => {
  try {
    console.log("Uploaded after files:", req.files);
    console.log('Request body:', req.body);

    const { id } = req.body;

    // Validate ID field
    if (!id) {
      return res.status(400).json({ message: 'Complaint ID is required.' });
    }

    // Fetch complaint document by ID
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Create folder path for the complaint ID
    const uploadsDir = path.resolve(__dirname, '../uploads');
    const complaintDir = path.join(uploadsDir, id);
    fs.mkdirSync(complaintDir, { recursive: true });

    let imgAfterPath = null;
    let vidAfterPath = null;

    // Process imgAfter
    if (req.files?.imgAfter) {
      const imgAfterTempPath = req.files.imgAfter[0].path;
      const imgAfterFullPath = path.join(complaintDir, `imgAfter_${id}.jpg`);
      fs.renameSync(imgAfterTempPath, imgAfterFullPath);

      // Store relative path
      imgAfterPath = path.relative(uploadsDir, imgAfterFullPath).replace(/\\/g, '/');
    }

    // Process vidAfter
    if (req.files?.vidAfter) {
      const vidAfterTempPath = req.files.vidAfter[0].path;
      const vidAfterFullPath = path.join(complaintDir, `vidAfter_${id}.mp4`);
      fs.renameSync(vidAfterTempPath, vidAfterFullPath);

      // Store relative path
      vidAfterPath = path.relative(uploadsDir, vidAfterFullPath).replace(/\\/g, '/');
    }

    // Update complaint document with media paths and status
    if (imgAfterPath) {
      complaint.media.imgAfter = `uploads/${imgAfterPath}`;
    } else {
      complaint.media.imgAfter = null; // Set to null if no image is uploaded
    }

    if (vidAfterPath) {
      complaint.media.vidAfter = `uploads/${vidAfterPath}`;
    } else {
      complaint.media.vidAfter = null; // Set to null if no video is uploaded
    }

    complaint.status = "JE_WORKDONE";

    await complaint.save();


    res.status(200).json({
      message: 'Media files uploaded and status updated successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error in jeAcknowledgedToJeWorkdone:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// JE_WORKDONE to AE_ACKNOWLEDGED
const jeWorkDoneToAeAcknowledged = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID field
    if (!id) {
      console.log('Validation failed: Complaint ID is missing.');
      return res.status(400).json({ message: 'Complaint ID is required.' });
    }

    console.log(`Received request to update complaint with ID: ${id}`);

    // Find the complaint
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    console.log(`Complaint found: ${JSON.stringify(complaint)}`);

    // Update status
    complaint.status = 'AE_ACKNOWLEDGED';
    await complaint.save();

    console.log(
      `Complaint with ID ${id} updated to status AE_ACKNOWLEDGED: ${JSON.stringify(complaint)}`
    );

    res.status(200).json({
      message: 'Complaint status updated to AE_ACKNOWLEDGED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to AE_ACKNOWLEDGED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

// AE_ACKNOWLEDGED to EE_ACKNOWLEDGED (updates price)
const aeAcknowledgedToEeAcknowledged = asyncHandler(async (req, res) => {
  try {
    const { id, price } = req.body;

    // Validate ID and price fields
    if (!id || price === undefined) {
      console.log('Validation failed: Missing ID or price.');
      return res
        .status(400)
        .json({ message: 'Complaint ID and price are required.' });
    }

    console.log(`Received request to update complaint with ID: ${id} and price: ${price}`);

    // Find the complaint
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    console.log(`Complaint found: ${JSON.stringify(complaint)}`);

    // Update status and price
    complaint.status = 'EE_ACKNOWLEDGED';
    complaint.price = price;
    await complaint.save();

    console.log(
      `Complaint with ID ${id} updated to status EE_ACKNOWLEDGED with price ${price}: ${JSON.stringify(complaint)}`
    );

    res.status(200).json({
      message: 'Complaint status updated to EE_ACKNOWLEDGED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to EE_ACKNOWLEDGED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

// EE_ACKNOWLEDGED to RESOLVED (updates resolvedAt)
const eeAcknowledgedToResolved = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID field
    if (!id) {
      console.log('Validation failed: Complaint ID is missing.');
      return res.status(400).json({ message: 'Complaint ID is required.' });
    }

    console.log(`Received request to update complaint with ID: ${id}`);

    // Find the complaint
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    console.log(`Complaint found: ${JSON.stringify(complaint)}`);

    // Update status and resolvedAt
    complaint.status = 'RESOLVED';
    complaint.resolvedAt = new Date();
    await complaint.save();

    console.log(
      `Complaint with ID ${id} updated to status RESOLVED with resolvedAt: ${complaint.resolvedAt}: ${JSON.stringify(complaint)}`
    );

    res.status(200).json({
      message: 'Complaint status updated to RESOLVED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to RESOLVED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

const jeWorkdoneToAeNotSatisfied = asyncHandler(async (req, res) => {
  try {
    const { id, remark_AE } = req.body;

    if (!id || !remark_AE) {
      console.log('Validation failed: Missing ID or remark_AE.');
      return res
        .status(400)
        .json({ message: 'Complaint ID and AE remark are required.' });
    }

    console.log(`Updating complaint with ID: ${id} to AE_NOT_SATISFIED with remark_AE: ${remark_AE}`);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = 'AE_NOT_SATISFIED';
    complaint.remark_AE = remark_AE;
    await complaint.save();

    console.log(`Complaint updated: ${JSON.stringify(complaint)}`);
    res.status(200).json({
      message: 'Complaint status updated to AE_NOT_SATISFIED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to AE_NOT_SATISFIED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

const aeAcknowledgedToEeNotSatisfied = asyncHandler(async (req, res) => {
  try {
    const { id, remark_EE } = req.body;

    if (!id || !remark_EE) {
      console.log('Validation failed: Missing ID or remark_EE.');
      return res
        .status(400)
        .json({ message: 'Complaint ID and EE remark are required.' });
    }

    console.log(`Updating complaint with ID: ${id} to EE_NOT_SATISFIED with remark_EE: ${remark_EE}`);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = 'EE_NOT_SATISFIED';
    complaint.remark_EE = remark_EE;
    await complaint.save();

    console.log(`Complaint updated: ${JSON.stringify(complaint)}`);
    res.status(200).json({
      message: 'Complaint status updated to EE_NOT_SATISFIED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to EE_NOT_SATISFIED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

const raisedToResourceRequired = asyncHandler(async (req, res) => {
  try {
    const { id, remark_JE } = req.body;

    if (!id || !remark_JE) {
      console.log('Validation failed: Missing ID or remark_JE.');
      return res
        .status(400)
        .json({ message: 'Complaint ID and JE remark are required.' });
    }

    console.log(`Updating complaint with ID: ${id} to RESOURCE_REQUIRED with remark_JE: ${remark_JE}`);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = 'RESOURCE_REQUIRED';
    complaint.remark_JE = remark_JE;
    await complaint.save();

    console.log(`Complaint updated: ${JSON.stringify(complaint)}`);
    res.status(200).json({
      message: 'Complaint status updated to RESOURCE_REQUIRED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to RESOURCE_REQUIRED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

const resourceRequiredToClosed = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      console.log('Validation failed: Complaint ID is missing.');
      return res.status(400).json({ message: 'Complaint ID is required.' });
    }

    console.log(`Updating complaint with ID: ${id} to CLOSED`);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = 'CLOSED';
    await complaint.save();

    console.log(`Complaint updated: ${JSON.stringify(complaint)}`);
    res.status(200).json({
      message: 'Complaint status updated to CLOSED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to CLOSED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
});

const resourceRequiredToRaised = asyncHandler(async (req, res) => {
  try {
    const { id, remark_CR } = req.body;

    if (!id || !remark_CR) {
      console.log('Validation failed: Missing ID or remark_CR.');
      return res
        .status(400)
        .json({ message: 'Complaint ID and CR remark are required.' });
    }

    console.log(`Updating complaint with ID: ${id} to RAISED with remark_CR: ${remark_CR}`);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      console.log(`Complaint with ID ${id} not found.`);
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = 'RAISED';
    complaint.remark_CR = remark_CR;
    await complaint.save();

    console.log(`Complaint updated: ${JSON.stringify(complaint)}`);
    res.status(200).json({
      message: 'Complaint status updated to RAISED successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error updating to RAISED:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status.' });
  }
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
  resourceRequiredToRaised
};