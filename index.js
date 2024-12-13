const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const dbConnect = require("./config/dbConnect");

require("dotenv").config();

const port = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorHandler");

app.use(express.json());

app.use("/api/v1/login", require("./routes/loginRoute"));
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