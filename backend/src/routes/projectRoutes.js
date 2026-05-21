const express = require('express');
const projectController = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(protect);

router
  .route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router
  .route('/:id')
  .get(projectController.getProjectById);

router.patch('/:id/complete', projectController.completeProject);

module.exports = router;
