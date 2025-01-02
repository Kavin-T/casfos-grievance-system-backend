const nodemailer = require("nodemailer");
const cron = require("node-cron");
const axios = require("axios");
const User = require("../models/userModel");
require("dotenv").config();

console.log("Initializing the automated mail job...");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const fetchPDF = async (filters) => {
  try {
    const response = await axios.get(
      `http://localhost:${process.env.PORT}/api/v1/report/automate`,
      {
        params: { ...filters },
        responseType: "arraybuffer",
      }
    );
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error("Failed to fetch PDF from API");
  }
};

const fetchExecutiveEngineerEmails = async () => {
  try {
    const users = await User.find(
      { designation: "EXECUTIVE_ENGINEER" },
      "email"
    );
    return users.map((user) => user.email);
  } catch (error) {
    throw new Error("Failed to fetch Executive Engineer emails");
  }
};

const sendEmail = async (pdfBuffer, emailAddresses) => {
  const previousMonthName = new Date().toLocaleString("default", {
    month: "long",
  });

  const subject = `${previousMonthName} Monthly Complaint Report for Executive Engineer`;

  const text = `
        Dear Recipient,

        Please find attached your monthly statement for the month of ${previousMonthName}, 
        which contains the list of complaints received during that period.

        Please do not reply to this email as it is a computer-generated email.
        You can view them online whenever required. For your convenience, please find attached 
        your latest monthly statement.

        Regards,
        CASFOS Team
    `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: emailAddresses.join(","),
    subject: subject,
    text: text,
    attachments: [
      {
        filename: "Monthly_Report.pdf",
        content: pdfBuffer,
        encoding: "base64",
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

const getFiltersForPreviousMonth = () => {
  const currentDate = new Date();
  const firstDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const lastDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );

  return {
    raiserName: "",
    subject: "",
    department: "",
    premises: "",
    location: "",
    details: "",
    emergency: "",
    status: "",
    startDate: "",
    endDate: "",
    createdStartDate: firstDayOfPreviousMonth,
    createdEndDate: lastDayOfPreviousMonth,
    acknowledgedStartDate: "",
    acknowledgedEndDate: "",
    resolvedStartDate: "",
    resolvedEndDate: "",
  };
};

cron.schedule("*/30 * * * * *", async () => {
  const filters = getFiltersForPreviousMonth();

  try {
    const pdfBuffer = await fetchPDF(filters);
    const emailAddresses = await fetchExecutiveEngineerEmails();

    if (emailAddresses.length === 0) {
      console.log("No Executive Engineer emails found. Skipping email job.");
      return;
    }

    await sendEmail(pdfBuffer, emailAddresses);
  } catch (error) {
    console.error("Error in email job:", error.message);
  }
});

console.log("Email automation script with PDF attachment is running...");
