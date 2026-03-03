import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/student/*"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher/*"
            element={
              <PrivateRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/principal/*"
            element={
              <PrivateRoute allowedRoles={['principal']}>
                <PrincipalDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </AuthProvider>
  );
}

export default App;



