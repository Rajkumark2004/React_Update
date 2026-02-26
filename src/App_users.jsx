import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLoginPage from './pages/users/auth_user/LoginPage';
import UserDashboard from './pages/users/UserDashboard';
import UserProfile from './pages/users/UserProfile';
import ForgotPassword from './pages/users/auth_user/ForgotPassword';
import GetFees from './pages/users/GetFees';
import AttendanceUser from './pages/users/attendance_user';

// A separate ProtectedRoute for users
function UserProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    // You might also want to check if the role is 'user' here later
    return isLoggedIn ? children : <Navigate to="/user/login" replace />;
}

export default function AppUsers() {
    return (
        <Routes>
            {/* Default redirect for /user */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            {/* User Login: /user/login */}
            <Route path="login" element={<UserLoginPage />} />

            {/* Forgot Password: /user/forgot-password */}
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* User Dashboard: /user/dashboard */}
            <Route
                path="dashboard"
                element={
                    <UserProtectedRoute>
                        <UserDashboard />
                    </UserProtectedRoute>
                }
            />

            {/* User Profile: /user/profile */}
            <Route
                path="profile"
                element={
                    <UserProtectedRoute>
                        <UserProfile />
                    </UserProtectedRoute>
                }
            />

            {/* User Fees: /user/getfees */}
            <Route
                path="getfees"
                element={
                    <UserProtectedRoute>
                        <GetFees />
                    </UserProtectedRoute>
                }
            />

            {/* User Attendance: /user/attendance */}
            <Route
                path="attendance"
                element={
                    <UserProtectedRoute>
                        <AttendanceUser />
                    </UserProtectedRoute>
                }
            />

            {/* Add more user routes here as needed (e.g., profile, settings) */}
        </Routes>
    );
}
