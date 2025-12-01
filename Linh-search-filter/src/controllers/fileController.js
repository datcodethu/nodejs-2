const db = require("../config/db");
const fs = require("fs");

module.exports = {
  // Upload nhiều file
  uploadFiles: (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filenames = req.files.map(f => f.filename);
    // Prepare values for bulk insert: [ [filename1], [filename2], ... ]
    const values = filenames.map(fn => [fn]);

    const sql = "INSERT INTO uploaded_files (filename) VALUES ?";
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: err.message || err });
      }

      res.json({
        message: "Upload thành công",
        filenames: filenames
      });
    });
  },

  // Lấy danh sách file
  getFiles: (req, res) => {
    db.query("SELECT * FROM uploaded_files ORDER BY id DESC", (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  // Xoá file
  deleteFile: (req, res) => {
    const id = req.params.id;

    // Lấy tên file trước
    db.query("SELECT filename FROM uploaded_files WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (!result || result.length === 0) return res.status(404).json({ message: "File không tồn tại" });

      const filename = result[0].filename;

      // Xoá file vật lý
      fs.unlink(`upload/${filename}`, (fsErr) => {
        if (fsErr) console.log("Không xoá được file vật lý:", fsErr);

        // Xoá DB
        db.query("DELETE FROM uploaded_files WHERE id = ?", [id], (delErr) => {
          if (delErr) return res.status(500).json({ error: delErr });

          res.json({ message: "Đã xoá thành công" });
        });
      });
    });
  },

  // Tìm kiếm file
  searchFiles: (req, res) => {
    const { name, type, date } = req.query;

    let sql = "SELECT * FROM uploaded_files WHERE 1=1";
    const params = [];

    if (name) {
      sql += " AND filename LIKE ?";
      params.push("%" + name + "%");
    }

    if (type) {
      sql += " AND filename LIKE ?";
      params.push("%." + type + "%");
    }

    if (date) {
      sql += " AND DATE(created_at) = ?";
      params.push(date);
    }

    sql += " ORDER BY id DESC";

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },
};
