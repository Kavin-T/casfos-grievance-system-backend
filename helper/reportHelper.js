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
                  padding: 12px 15px; /* Increased padding for better readability */
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
                  padding-right: 20px; /* Right padding for footer */
                  font-size: 24px;
                  font-weight: bold;
              }
              .date {
                  position: absolute;
                  top: 20px;
                  right: 20px;
                  font-size: 20px; /* Reduced font size */
                  font-weight: normal;
              }

          </style>
      </head>
      <body>
          <!-- Logo and Heading -->
          <img src="http://localhost:${
            process.env.PORT
          }/assets/images/casfos_logo.jpg" class="logo" alt="Logo">
          <div class="heading">CENTRAL ACADEMY FOR STATE FOREST SERVICE</div>
          <div class="heading">COMPLAINT REPORT</div>
          <div class="date">Date: ${new Date().toLocaleDateString()}</div>
          <!-- Complaints Table -->
          <table>
              <thead>
                  <tr>
                      <th>S.No</th>
                      <th>Complaint ID</th>
                      <th>Raiser Name</th>
                      <th>Subject</th>
                      <th>Department</th>
                      <th>Created On</th>
                      <th>Resolved On</th>
                      <th>Status</th>
                      <th>Duration (Days)</th>
                      <th>Price</th>
                  </tr>
              </thead>
              <tbody>
  `;

  let totalAmount = 0;

  complaints.forEach((complaint, index) => {
    const formattedCreatedAt = complaint.createdAt
      ? new Date(complaint.createdAt).toISOString().split("T")[0]
      : "N/A";
    const formattedResolvedAt = complaint.resolvedAt
      ? new Date(complaint.resolvedAt).toISOString().split("T")[0]
      : "N/A";

    const status = complaint.status;

    let duration = "N/A";
    if (complaint.createdAt && complaint.resolvedAt) {
      const createdAtDate = new Date(complaint.createdAt);
      const resolvedAtDate = new Date(complaint.resolvedAt);
      const diffTime = Math.abs(resolvedAtDate - createdAtDate);
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const price = parseFloat(complaint.price.toString()) || 0;
    totalAmount += price;

    htmlContent += `
        <tr>
            <td>${index + 1}</td>
            <td>${complaint._id}</td>
            <td>${complaint.raiserName || "N/A"}</td>
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

          <!-- Total Amount -->
          <div class="footer">
              Total Amount: ₹${totalAmount.toFixed(2)}
          </div>
      </body>
  </html>
  `;

  const file = { content: htmlContent };

  return file;
};

module.exports = { generateReport };
