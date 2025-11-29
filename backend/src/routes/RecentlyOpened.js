const express = require('express');
const router = express.Router();
const recentlyController = require('../controllers/recentlyOpenedController');

router.get('/', recentlyController.getRecentOpened);
router.post('/', recentlyController.saveRecentlyOpened);

module.exports = router;
