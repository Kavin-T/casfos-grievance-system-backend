const { dateFormat, calculateDuration, statusFormat } = require("./formatting");

const generateReport = async (complaints) => {
  let htmlContent = `
    <html>
        <head>
            <title>Complaints Report</title>
            <style>
                *, *::before, *::after {
                    box-sizing: border-box;
                }
                body {
                    padding-left: 20px;
                    padding-right: 20px;
                    font-family: Arial, sans-serif;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                th, td {
                    padding: 12px 15px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: rgb(255, 255, 255);
                    font-weight: bold;
                }
                .logo {
                    width: 100px;
                    height: auto;
                    margin-bottom: 20px;
                }
                .heading {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .footer {
                    margin-top: 20px;
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    padding-right: 20px;
                }
                .no-data {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #888;
                }
                .date {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    font-size: 20px;
                    font-weight: normal;
                }
            </style>
        </head>
        <body>
            <img src="http://localhost:${
              process.env.PORT
            }/assets/images/casfos_logo.jpg" class="logo" alt="Logo">
            <div class="heading">CENTRAL ACADEMY FOR STATE FOREST SERVICE</div>
            <div class="heading">COMPLAINT REPORT</div>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
    `;

  if (complaints.length === 0) {
    // Add message for no complaints
    htmlContent += `
            <div class="no-data">No complaints to display.</div>
        </body>
    </html>
      `;
  } else {
    // Generate table if complaints exist
    let totalAmount = 0;

    htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Complaint ID</th>
                        <th>Complainant Name</th>
                        <th>Subject</th>
                        <th>Department</th>
                        <th>Created On</th>
                        <th>Resolved On</th>
                        <th>Status</th>
                        <th>Time elapsed for Resolution</th>
                        <th>Expenditure</th>
                    </tr>
                </thead>
                <tbody>
      `;

    complaints.forEach((complaint, index) => {
      const formattedCreatedAt = complaint.createdAt
        ? dateFormat(complaint.createdAt)
        : "N/A";
      const formattedResolvedAt = complaint.resolvedAt
        ? dateFormat(complaint.resolvedAt)
        : "N/A";

      const status = statusFormat(complaint.status);

      let duration = "N/A";
      if (complaint.createdAt && complaint.resolvedAt) {
        duration = calculateDuration(complaint.createdAt, complaint.resolvedAt);
      }

      const price = parseFloat(complaint.price.toString()) || 0;
      totalAmount += price;

      htmlContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${complaint.complaintID}</td>
                <td>${complaint.complainantName || "N/A"}</td>
                <td>${complaint.subject || "N/A"}</td>
                <td>${complaint.department || "N/A"}</td>
                <td>${formattedCreatedAt}</td>
                <td>${formattedResolvedAt}</td>
                <td>${status}</td>
                <td>${duration}</td>
                <td>${price.toFixed(2)}</td>
            </tr>
        `;
    });

    htmlContent += `
                </tbody>
            </table>
            <div class="footer">
                Total Amount: ₹${totalAmount.toFixed(2)}
            </div>
        </body>
    </html>
      `;
  }

  const file = { content: htmlContent };
  return file;
};

module.exports = { generateReport };
