import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../App.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    department: '',
    class: '',
  });
  const [message, setMessage] = useState('');

  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (isRegister) {
      const result = await register(registerData);
      if (result.success && result.user) {
        setMessage('Registration successful! Please login to continue.');
        setIsRegister(false);
        setRegisterData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          studentId: '',
          department: '',
          class: '',
        });
      } else {
        setMessage(result.message || 'Registration failed');
      }
    } else {
      const result = await login(formData.email, formData.password);
      if (result.success && result.user) {
        navigate(`/${result.user.role}`);
      } else {
        setMessage(result.message || 'Login failed');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {message && (
          <div className={message.includes('success') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                </select>
              </div>
              {registerData.role === 'student' && (
                <>
                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={registerData.studentId}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Class</label>
                    <input
                      type="text"
                      name="class"
                      value={registerData.class}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </>
              )}
              {(registerData.role === 'teacher' || registerData.role === 'principal') && (
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={registerData.department}
                    onChange={handleRegisterChange}
                  />
                </div>
              )}
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={isRegister ? registerData.email : formData.email}
              onChange={isRegister ? handleRegisterChange : handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={isRegister ? registerData.password : formData.password}
              onChange={isRegister ? handleRegisterChange : handleChange}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); }} style={{ color: '#007bff' }}>
                Login
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); }} style={{ color: '#007bff' }}>
                Register
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;

