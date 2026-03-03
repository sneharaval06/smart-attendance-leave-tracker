const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Student)
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can apply for leave',
      });
    }

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const leave = await Leave.create({
      student: req.user.id,
      studentName: student.name,
      studentId: student.studentId || student._id.toString(),
      class: student.class,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res) => {
  try {
    let query = {};

    // Students can only see their own leaves
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    // Teachers can see leaves from their students
    else if (req.user.role === 'teacher') {
      query.status = 'pending'; // Teachers see pending leaves to approve/reject
    }
    // Principals can see all leaves

    const leaves = await Leave.find(query)
      .populate('student', 'name email studentId class')
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('student', 'name email studentId class')
      .populate('teacher', 'name email');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found',
      });
    }

    // Students can only see their own leaves
    if (req.user.role === 'student' && leave.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update leave status (approve/reject)
// @route   PUT /api/leaves/:id
// @access  Private (Teacher, Principal)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected',
      });
    }

    if (req.user.role !== 'teacher' && req.user.role !== 'principal') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update leave status',
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave has already been processed',
      });
    }

    leave.status = status;
    leave.teacher = req.user.id;
    leave.teacherName = req.user.name;
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }
    leave.updatedAt = new Date();

    await leave.save();

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete leave
// @route   DELETE /api/leaves/:id
// @access  Private (Student - own leaves only)
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found',
      });
    }

    // Only students can delete their own pending leaves
    if (req.user.role === 'student' && leave.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (leave.status !== 'pending' && req.user.role === 'student') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete processed leave',
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Leave deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

