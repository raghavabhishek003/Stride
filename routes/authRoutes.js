const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

// Temporary test route to verify auth middleware end to end
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
