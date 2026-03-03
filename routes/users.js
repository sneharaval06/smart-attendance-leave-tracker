const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  getStudents,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('teacher', 'principal'), getUsers);
router.get('/students', authorize('teacher', 'principal'), getStudents);
router.get('/:id', getUser);

module.exports = router;






