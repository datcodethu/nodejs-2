// src/app.js
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Public folder cho frontend
app.use(express.static("public"));

// Route upload
app.use("/api/files", fileRoutes);

app.use('/upload', express.static('upload'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
