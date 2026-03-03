import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../App.css';

const PrincipalDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'leaves', 'students'
  const [filters, setFilters] = useState({
    studentId: '',
    subject: '',
    startDate: '',
    endDate: '',
  });
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all'); // 'all', 'approved', 'rejected', 'pending'

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchLeaves();
    fetchStats();
  }, []);

  const fetchAttendance = async () => {
    try {
      const params = {};
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.subject) params.subject = filters.subject;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await axios.get('/attendance/date-range', { params });
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

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchAttendance();
    fetchStats();
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await axios.delete(`/attendance/${id}`);
        toast.success('Attendance record deleted successfully!');
        fetchAttendance();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting attendance');
      }
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Filter leaves based on status
  const filteredLeaves = leaveStatusFilter === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === leaveStatusFilter);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h1>Smart Attendance System - Principal Panel</h1>
        <div className="navbar-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Principal Dashboard</h2>
        </div>

        <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              border: 'none',
              background: activeTab === 'attendance' ? '#007bff' : '#f0f0f0',
              color: activeTab === 'attendance' ? 'white' : 'black',
              cursor: 'pointer',
              borderRadius: '5px 5px 0 0',
            }}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              border: 'none',
              background: activeTab === 'leaves' ? '#007bff' : '#f0f0f0',
              color: activeTab === 'leaves' ? 'white' : 'black',
              cursor: 'pointer',
              borderRadius: '5px 5px 0 0',
            }}
          >
            Leaves
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              border: 'none',
              background: activeTab === 'students' ? '#007bff' : '#f0f0f0',
              color: activeTab === 'students' ? 'white' : 'black',
              cursor: 'pointer',
              borderRadius: '5px 5px 0 0',
            }}
          >
            Students
          </button>
        </div>

        {activeTab === 'attendance' && (
          <>
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
              <h3>Overall Attendance</h3>
              <div className="stat-value">{stats.attendancePercentage}%</div>
            </div>
          </div>
        )}

        <div className="card">
          <h3>Filters</h3>
          <form onSubmit={handleApplyFilters}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Student</label>
                <select
                  name="studentId"
                  value={filters.studentId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Students</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  placeholder="Filter by subject"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
              Apply Filters
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '15px', marginLeft: '10px' }}
              onClick={() => {
                setFilters({
                  studentId: '',
                  subject: '',
                  startDate: '',
                  endDate: '',
                });
                setTimeout(fetchAttendance, 100);
              }}
            >
              Clear Filters
            </button>
          </form>
        </div>

        <div className="card">
          <h3>All Attendance Records</h3>
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
                  <th>Teacher</th>
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
                    <td>{record.teacherName}</td>
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
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleDeleteAttendance(record._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
          </>
        )}

        {activeTab === 'leaves' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>All Leave Requests</h3>
              <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
                <label>Filter by Status</label>
                <select
                  value={leaveStatusFilter}
                  onChange={(e) => setLeaveStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="all">All Leaves</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            {filteredLeaves.length === 0 ? (
              <p>No leave requests found.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Class</th>
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
                  {filteredLeaves.map((leave) => (
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
                      <td>{leave.teacherName || '-'}</td>
                      <td>{leave.rejectionReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="card">
            <h3>All Students</h3>
            {students.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.studentId}</td>
                      <td>{student.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalDashboard;

