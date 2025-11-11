const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const File = require('../models/File');

router.get('/overview', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const postsCount = await Post.countDocuments();
    const filesCount = await File.countDocuments();

    res.json({
      users: usersCount,
      posts: postsCount,
      files: filesCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
