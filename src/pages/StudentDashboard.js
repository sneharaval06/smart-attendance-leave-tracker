import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../App.css';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAttendance();
    fetchStats();
    fetchLeaves();
  }, []);

  const fetchAttendance = async () => {
    try {
      const params = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;

      const response = await axios.get('/attendance/date-range', { params });
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
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

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    // If start date changes and is after end date, reset end date
    if (name === 'startDate' && leaveForm.endDate && value > leaveForm.endDate) {
      setLeaveForm({
        ...leaveForm,
        [name]: value,
        endDate: '',
      });
    } else {
      setLeaveForm({
        ...leaveForm,
        [name]: value,
      });
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/leaves', leaveForm);
      toast.success('Leave application submitted successfully!');
      setShowLeaveForm(false);
      setLeaveForm({
        leaveType: 'sick',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting leave application');
    }
  };

  const handleDateFilter = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Get tomorrow's date in YYYY-MM-DD format for min date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h1>Smart Attendance System - Student Panel</h1>
        <div className="navbar-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h2>My Attendance</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowLeaveForm(!showLeaveForm)}
            style={{ marginTop: '10px' }}
          >
            {showLeaveForm ? 'Cancel' : 'Apply for Leave'}
          </button>
        </div>

        {showLeaveForm && (
          <div className="card">
            <h3>Apply for Leave</h3>
            <form onSubmit={handleApplyLeave}>
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  name="leaveType"
                  value={leaveForm.leaveType}
                  onChange={handleLeaveFormChange}
                  required
                >
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="emergency">Emergency</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={leaveForm.startDate}
                  onChange={handleLeaveFormChange}
                  min={getTomorrowDate()}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={leaveForm.endDate}
                  onChange={handleLeaveFormChange}
                  min={leaveForm.startDate || getTomorrowDate()}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={leaveForm.reason}
                  onChange={handleLeaveFormChange}
                  rows="4"
                  required
                  placeholder="Please provide a reason for your leave"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Leave Application
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>My Leave Applications</h3>
          {leaves.length === 0 ? (
            <p>No leave applications found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Teacher</th>
                  <th>Rejection Reason</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
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
                    <td>{leave.teacherName || '-'}</td>
                    <td>{leave.rejectionReason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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
            <div className="stat-card">
              <h3>Attendance Percentage</h3>
              <div className="stat-value">{stats.attendancePercentage}%</div>
            </div>
          </div>
        )}

        <div className="card">
          <h3>Filter by Date</h3>
          <form onSubmit={handleDateFilter} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Start Date</label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>End Date</label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Filter</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Attendance Records</h3>
          {attendance.length === 0 ? (
            <p>No attendance records found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Teacher</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
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
                    <td>{record.teacherName}</td>
                    <td>{record.remarks || '-'}</td>
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

export default StudentDashboard;

