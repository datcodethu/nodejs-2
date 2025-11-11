const express = require('express')
const router = express.Router()
const RecentlyOpened = require('../models/RecentlyOpenedModel')

//Lay 4 file mo gan day

router.get('/', async (req,res) => {
    try{
        const recent = await RecentlyOpened.find()
            .sort({lastOpened: -1})
            .limit(4)
        res.json(recent)
    } catch (err) {
        res.status(500).json({error: 'LỖI'})
    }   
})

//  Lưu file khi người dùng mở
router.post('/', async (req, res) => {
  try {
    const { userId, NameId, name,fileType } = req.body;
    const path  = `/uploads/${name}`;
    let existing = await RecentlyOpened.findOne({ userId, NameId });
    if (existing) {
      existing.lastOpened = new Date();
      existing.path = path;
      existing.fileType = fileType;
      await existing.save();
      return res.json(existing);
    }

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
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu' });
  }
});

module.exports = router