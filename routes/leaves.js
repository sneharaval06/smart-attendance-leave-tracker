const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  getLeave,
  updateLeaveStatus,
  deleteLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(authorize('student'), applyLeave)
  .get(getLeaves);

router
  .route('/:id')
  .get(getLeave)
  .put(authorize('teacher', 'principal'), updateLeaveStatus)
  .delete(deleteLeave);

module.exports = router;






