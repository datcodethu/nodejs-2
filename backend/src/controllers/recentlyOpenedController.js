const RecentlyOpened = require('../models/RecentlyOpenedModel');

// ==============================
// Lấy 4 file mở gần đây
// ==============================
exports.getRecentOpened = async (req, res) => {
  try {
    const recent = await RecentlyOpened.find()
      .sort({ lastOpened: -1 })
      .limit(4);

    res.json(recent);
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu:", err);
    res.status(500).json({ error: 'LỖI' });
  }
};

// ==============================
// Lưu file khi người dùng mở
// ==============================
exports.saveRecentlyOpened = async (req, res) => {
  try {
    const { userId, NameId, name, fileType } = req.body;

    const path = `/uploads/${name}`;

    // Kiểm tra dữ liệu có tồn tại chưa
    let existing = await RecentlyOpened.findOne({ userId, NameId });

    if (existing) {
      existing.lastOpened = new Date();
      existing.path = path;
      existing.fileType = fileType;
      await existing.save();
      return res.json(existing);
    }

    // Nếu chưa có → tạo mới
    const newRecord = new RecentlyOpened({
      userId,
      NameId,
      name,
      fileType,
      path,
      lastOpened: new Date(),
    });

    await newRecord.save();
    res.json(newRecord);

  } catch (err) {
    console.error("Lỗi khi lưu dữ liệu:", err);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu' });
  }
};
