const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Teacher, Principal)
exports.getUsers = async (req, res) => {
  try {
    let query = {};

    // Teachers can see students
    if (req.user.role === 'teacher') {
      query.role = 'student';
    }
    // Principals can see all users

    const users = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Students can only see their own profile
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get students
// @route   GET /api/users/students
// @access  Private (Teacher, Principal)
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






