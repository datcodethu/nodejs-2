// src/config/db.js
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "cloud_storage",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL: ", err);
  } else {
    console.log("✅ MySQL connected successfully!");
  }
});

module.exports = db;
