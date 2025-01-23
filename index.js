const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/dbConnect");
const errorHandler = require("./middleware/errorHandler");
const validateToken = require("./middleware/validateTokenHandler");
require("dotenv").config();

const port = process.env.PORT || 5000;

//require("./automatedJob/reportMail");

const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use(limiter);

app.use(express.json());

app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/api/v1/report", require("./routes/reportRoute"));

app.use(validateToken);

app.use("/api/v1/complaint", require("./routes/complaintRoute"));
app.use("/api/v1/status", require("./routes/statusRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));

app.use(errorHandler);

const start = async () => {
  try {
    await dbConnect();
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
