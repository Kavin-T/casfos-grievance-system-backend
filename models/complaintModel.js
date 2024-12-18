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
      default: null,
    },
    vidAfter: {
      type: String,
      default: null,
    },
  },
  emergency: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'RAISED', // Default value
    enum: [
      'RAISED',
      'JE_ACKNOWLEDGED',
      'JE_WORKDONE',
      'AE_ACKNOWLEDGED',
      'EE_ACKNOWLEDGED',
      'RESOLVED',
      'CLOSED',
      'RESOURCE_REQUIRED',
      'AE_NOT_SATISFIED',
      'EE_NOT_SATISFIED',
    ], // Allowable statuses
  },
  price: {
    type: mongoose.Schema.Types.Decimal128, // Use Decimal128 for large values
    default: 0, // Default value is 0
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation time
  },
  acknowledgeAt: {
    type: Date,
    default: null, // Default value is null
  },
  resolvedAt: {
    type: Date,
    default: null, // Default value is null
  },
  remark_AE: {
    type: String,
    trim: true,
    default: null, // Default value is null
  },
  remark_EE: {
    type: String,
    trim: true,
    default: null, // Default value is null
  },
  remark_JE: {
    type: String,
    trim: true,
    default: null, // Default value is null
  },
  remark_CR: {
    type: String,
    trim: true,
    default: null, // Default value is null
  },
  resolvedName: {
    type: String,
    default: null,
    trim: true,
  },
});

// Create and export the model
const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;