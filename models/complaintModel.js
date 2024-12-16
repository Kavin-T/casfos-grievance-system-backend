const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  raiserName: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  details: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    enum: ['CIVIL', 'ELECTRICAL'],
    required: true,
  },
  premises: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  media: {
    imgBefore: {
      type: String,
    },
    vidBefore: {
      type: String,
    },
    imgAfter: {
      type: String,
    },
    vidAfter: {
      type: String,
    },
  },
  emergency: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'RAISED',
    enum: ['RAISED', 'JE_ACKNOWLEDGED', 'WORKDONE', 'AE_ACKNOWLEDGED','EE_ACKNOWLEDGED','RESOLVED','CLOSED','RESOURCE_REQUIRED','AE_NOT_SATISFIED','EE_NOT_SATISFIED'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acknowledgeAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  remark_AE: {
    type: String,
    trim: true,
  },
  remark_EE: {
    type: String,
    trim: true,
  },
  remark_JE: {
    type: String,
    trim: true,
  },
  remark_CR: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model('Complaint', complaintSchema);