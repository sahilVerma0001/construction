const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../utils/validations/authValidation');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.get('/me', authMiddleware.protect, authController.getMe);
router.patch('/me/profile', authMiddleware.protect, authController.updateProfile);

module.exports = router;
