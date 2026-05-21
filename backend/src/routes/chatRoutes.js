const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware.protect);

router.get('/', chatController.getChats);
router.get('/:id', chatController.getChatDetails);
router.get('/:id/messages', chatController.getChatMessages);

module.exports = router;
