import express from 'express';
import cors from 'cors';
import db from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// API tìm kiếm & bộ lọc cơ bản
app.get('/api/search', async (req, res) => {
  const { keyword = '', type } = req.query;

  try {
    let query = 'SELECT * FROM files WHERE name LIKE ?';
    const values = [`%${keyword}%`];

    if (type) {
      query += ' AND type = ?';
      values.push(type);
    }

    const [rows] = await db.execute(query, values);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi truy vấn CSDL' });
  }
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get('/', (req, res) => {
    res.send('Server is running successfully!');
  });
  