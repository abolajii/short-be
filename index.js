const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.routes");
const noauthRoutes = require("./routes/noauth.routes");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();
const PORT = 4010;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", noauthRoutes);

// Database connection
mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
