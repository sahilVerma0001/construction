const express = require('express');
const bidController = require('../controllers/bidController');
const { protect } = require('../middlewares/authMiddleware');
const { requireApprovedContractor } = require('../middlewares/authMiddleware');

const router = express.Router();

// All bid routes require authentication
router.use(protect);

// Contractor fetching their own bids
router.get('/my-bids', bidController.getMyBids);

// Customer fetching bids for a specific project
router.get('/project/:projectId', bidController.getBidsForProject);

// Customer accepting a bid
router.patch('/:bidId/accept', bidController.acceptBid);

// Only approved contractors can submit bids
router.post('/submit', requireApprovedContractor, bidController.submitBid);

module.exports = router;
