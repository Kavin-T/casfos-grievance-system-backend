const express = require("express");
const app = express();
const path = require("path");

const cors = require("cors");
app.use(cors());

const dbConnect = require("./config/dbConnect");

require("dotenv").config();

const port = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorHandler");

app.use(express.json());

app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use("/api/v1/complaint", require("./routes/complaintRoute"));
app.use("/api/v1/login", require("./routes/loginRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/file", require("./routes/fileRoute"));
app.use("/api/v1/report", require("./routes/reportRoute"));
app.use("/api/v1/status", require("./routes/statusRoute"));
app.use("/api/v1/your-activity", require("./routes/yourActivityRoute"));

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
