import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../App.css';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [markForm, setMarkForm] = useState({
    studentId: '',
    subject: '',
    status: 'present',
    remarks: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchStats();
    fetchLeaves();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/attendance');
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/users/students');
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/attendance/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkFormChange = (e) => {
    setMarkForm({
      ...markForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/attendance', markForm);
      toast.success('Attendance marked successfully!');
      setShowMarkForm(false);
      setMarkForm({
        studentId: '',
        subject: '',
        status: 'present',
        remarks: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchAttendance();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error marking attendance');
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleUpdateAttendance = async (id, status) => {
    try {
      await axios.put(`/attendance/${id}`, { status });
      toast.success('Attendance updated successfully!');
      fetchAttendance();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating attendance');
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await axios.put(`/leaves/${leaveId}`, { status: 'approved' });
      toast.success('Leave approved successfully!');
      fetchLeaves();
      setSelectedLeave(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await axios.put(`/leaves/${leaveId}`, { status: 'rejected', rejectionReason: rejectReason });
      toast.success('Leave rejected successfully!');
      fetchLeaves();
      setSelectedLeave(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting leave');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h1>Smart Attendance System - Teacher Panel</h1>
        <div className="navbar-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Teacher Dashboard</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowMarkForm(!showMarkForm)}
            style={{ marginTop: '10px' }}
          >
            {showMarkForm ? 'Cancel' : 'Mark Attendance'}
          </button>
        </div>

        {showMarkForm && (
          <div className="card">
            <h3>Mark Attendance</h3>
            <form onSubmit={handleMarkAttendance}>
              <div className="form-group">
                <label>Student</label>
                <select
                  name="studentId"
                  value={markForm.studentId}
                  onChange={handleMarkFormChange}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.studentId || student.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={markForm.subject}
                  onChange={handleMarkFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={markForm.status}
                  onChange={handleMarkFormChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={markForm.date}
                  onChange={handleMarkFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={markForm.remarks}
                  onChange={handleMarkFormChange}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Mark Attendance
              </button>
            </form>
          </div>
        )}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Records</h3>
              <div className="stat-value">{stats.totalRecords}</div>
            </div>
            <div className="stat-card">
              <h3>Present</h3>
              <div className="stat-value" style={{ color: '#28a745' }}>
                {stats.presentCount}
              </div>
            </div>
            <div className="stat-card">
              <h3>Absent</h3>
              <div className="stat-value" style={{ color: '#dc3545' }}>
                {stats.absentCount}
              </div>
            </div>
            <div className="stat-card">
              <h3>Late</h3>
              <div className="stat-value" style={{ color: '#ffc107' }}>
                {stats.lateCount}
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h3>Attendance Records</h3>
          {attendance.length === 0 ? (
            <p>No attendance records found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.studentName}</td>
                    <td>{record.studentId}</td>
                    <td>{record.class}</td>
                    <td>{record.subject}</td>
                    <td>
                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: '5px',
                          backgroundColor:
                            record.status === 'present'
                              ? '#d4edda'
                              : record.status === 'absent'
                              ? '#f8d7da'
                              : '#fff3cd',
                          color:
                            record.status === 'present'
                              ? '#155724'
                              : record.status === 'absent'
                              ? '#721c24'
                              : '#856404',
                        }}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{record.remarks || '-'}</td>
                    <td>
                      <select
                        value={record.status}
                        onChange={(e) => handleUpdateAttendance(record._id, e.target.value)}
                        style={{ padding: '5px' }}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Pending Leave Applications</h3>
          {leaves.length === 0 ? (
            <p>No pending leave applications found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Class</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.studentName}</td>
                    <td>{leave.studentId}</td>
                    <td>{leave.class}</td>
                    <td>{leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: '5px',
                          backgroundColor:
                            leave.status === 'approved'
                              ? '#d4edda'
                              : leave.status === 'rejected'
                              ? '#f8d7da'
                              : '#fff3cd',
                          color:
                            leave.status === 'approved'
                              ? '#155724'
                              : leave.status === 'rejected'
                              ? '#721c24'
                              : '#856404',
                        }}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '5px 10px', fontSize: '14px' }}
                            onClick={() => handleApproveLeave(leave._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: '14px' }}
                            onClick={() => {
                              setSelectedLeave(leave._id);
                              setRejectReason('');
                            }}
                          >
                            Reject
                          </button>
                          {selectedLeave === leave._id && (
                            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                              <textarea
                                placeholder="Enter rejection reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows="3"
                                style={{ width: '100%', marginBottom: '5px' }}
                              />
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '5px 10px', fontSize: '12px' }}
                                  onClick={() => handleRejectLeave(leave._id)}
                                >
                                  Confirm Reject
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '5px 10px', fontSize: '12px' }}
                                  onClick={() => {
                                    setSelectedLeave(null);
                                    setRejectReason('');
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#666' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

