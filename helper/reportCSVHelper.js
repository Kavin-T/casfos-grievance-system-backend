const { Parser } = require("json2csv");
const {
  statusFormat,
  departmentFormat,
  dateFormat,
  priceFormat,
  calculateDuration,
} = require("./formatting");

const generateCSVReport = (complaints) => {
  const fields = [
    { label: "ID", value: "complaintID" },
    { label: "Complainant Name", value: "complainantName" },
    { label: "Subject", value: "subject" },
    {
      label: "Date Raised",
      value: (row) => (row.date ? dateFormat(row.date) : "N/A"),
    },
    { label: "Department", value: (row) => departmentFormat(row.department) },
    { label: "Premises", value: "premises" },
    { label: "Location", value: "location" },
    { label: "Specific Location", value: "specificLocation" },
    { label: "Emergency", value: (row) => (row.emergency ? "Yes" : "No") },
    { label: "Re-Raised", value: (row) => (row.reRaised ? "Yes" : "No") },
    { label: "Status", value: (row) => statusFormat(row.status) },
    {
      label: "Created On",
      value: (row) => (row.createdAt ? dateFormat(row.createdAt) : "N/A"),
    },
    {
      label: "Acknowledged On",
      value: (row) =>
        row.acknowledgeAt ? dateFormat(row.acknowledgeAt) : "N/A",
    },
    {
      label: "Resolved On",
      value: (row) => (row.resolvedAt ? dateFormat(row.resolvedAt) : "N/A"),
    },
    {
      label: "Time elapsed for Acknowledgement",
      value: (row) =>
        row.createdAt && row.acknowledgeAt
          ? calculateDuration(row.createdAt, row.acknowledgeAt)
          : "N/A",
    },
    {
      label: "Time elapsed for Resolution",
      value: (row) =>
        row.createdAt && row.resolvedAt
          ? calculateDuration(row.createdAt, row.resolvedAt)
          : "N/A",
    },
    {
      label: "Expenditure",
      value: (row) => priceFormat(row.price || 0),
    },
    { label: "Remark by JE", value: "remark_JE" },
    { label: "Remark by AE", value: "remark_AE" },
    { label: "Remark by EE", value: "remark_EE" },
    { label: "Remark by CR", value: "remark_CR" },
    { label: "Resolved By", value: "resolvedName" },
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(complaints);
  return csv;
};

module.exports = { generateCSVReport };
