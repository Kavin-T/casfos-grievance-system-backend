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
    default: 'RAISED',
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
    ],
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acknowledgeAt: {
    type: Date,
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  remark_AE: {
    type: String,
    trim: true,
    default: null,
  },
  remark_EE: {
    type: String,
    trim: true,
    default: null,
  },
  remark_JE: {
    type: String,
    trim: true,
    default: null,
  },
  remark_CR: {
    type: String,
    trim: true,
    default: null,
  },
  resolvedName: {
    type: String,
    trim: true,
    default: null,
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;