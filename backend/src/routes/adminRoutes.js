const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// ALL admin routes require authentication AND the 'admin' role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/contractors/pending', adminController.getPendingContractors);
router.patch('/contractors/:profileId/status', adminController.updateContractorStatus);

router.get('/projects', adminController.getAllProjects);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/chats', adminController.getAllChats);

module.exports = router;
