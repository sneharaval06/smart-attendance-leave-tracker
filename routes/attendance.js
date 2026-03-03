const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getAttendanceByDateRange,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(authorize('teacher', 'principal'), markAttendance)
  .get(getAttendance);

router.get('/date-range', getAttendanceByDateRange);
router.get('/stats', getAttendanceStats);

router
  .route('/:id')
  .put(authorize('teacher', 'principal'), updateAttendance)
  .delete(authorize('principal'), deleteAttendance);

module.exports = router;








