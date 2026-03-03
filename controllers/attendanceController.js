const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher, Principal)
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, subject, status, remarks, date } = req.body;

    // Find student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const attendance = await Attendance.create({
      student: studentId,
      studentName: student.name,
      studentId: student.studentId || student._id.toString(),
      class: student.class,
      subject,
      teacher: req.user.id,
      teacherName: req.user.name,
      status: status || 'present',
      remarks,
      date: date || new Date(),
      markedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    let query = {};

    // Students can only see their own attendance
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    // Teachers can see attendance they marked
    else if (req.user.role === 'teacher') {
      query.teacher = req.user.id;
    }
    // Principals can see all attendance

    const attendance = await Attendance.find(query)
      .populate('student', 'name email studentId class')
      .populate('teacher', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get attendance by date range
// @route   GET /api/attendance/date-range
// @access  Private
exports.getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, studentId, subject } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user.id;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (studentId) {
      query.student = studentId;
    }

    if (subject) {
      query.subject = subject;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name email studentId class')
      .populate('teacher', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user.id;
    }

    const totalRecords = await Attendance.countDocuments(query);
    const presentCount = await Attendance.countDocuments({ ...query, status: 'present' });
    const absentCount = await Attendance.countDocuments({ ...query, status: 'absent' });
    const lateCount = await Attendance.countDocuments({ ...query, status: 'late' });

    const attendancePercentage = totalRecords > 0 
      ? ((presentCount / totalRecords) * 100).toFixed(2) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        attendancePercentage: parseFloat(attendancePercentage),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Teacher, Principal)
exports.updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Check if user has permission
    if (req.user.role === 'teacher' && attendance.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this attendance',
      });
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Principal only)
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};








