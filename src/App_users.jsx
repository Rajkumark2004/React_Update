import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLoginPage from './pages/users/auth_user/LoginPage';
import UserDashboard from './pages/users/UserDashboard';
import UserProfile from './pages/users/UserProfile';
import ForgotPassword from './pages/users/auth_user/ForgotPassword';
import GetFees from './pages/users/GetFees';
import AttendanceUser from './pages/users/attendance_user';
import Notification from './pages/users/Notification';
import NoticeBoard_User from './pages/users/NoticeBoard_User';
import Homework from './pages/users/Homework';
import DailyAssignment from './pages/users/DailyAssignment';
import TransportRoute from './pages/users/TransportRoute';
import UserHostelRoom from './pages/users/UserHostelRoom';
import StudentAssessment from './pages/users/StudentAssessment';
import Timetable from './pages/users/Timetable';
import Syllabus from './pages/users/Syllabus';
import SyllabusStatus from './pages/users/SyllabusStatus';
import Visitors from './pages/users/Visitors';
import StateExamResult from './pages/users/StateExamResult';
import OnlineCourseList from './pages/users/OnlineCourseList';
import OnlineCourse from './pages/users/OnlineCourse';
import ContentList from './pages/users/ContentList';
import ContentView from './pages/users/ContentView';
import ApplyLeave from './pages/users/ApplyLeave';
import CCAvenuePayment from './pages/users/gateway/CCAvenuePayment';
import PaymentSuccess from './pages/users/gateway/PaymentSuccess';
import PaymentFailed from './pages/users/gateway/PaymentFailed';

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

            {/* User Circular/Notification: /user/notification */}
            <Route
                path="notification"
                element={
                    <UserProtectedRoute>
                        <Notification />
                    </UserProtectedRoute>
                }
            />

            {/* New Premium Notice Board: /user/notice_board */}
            <Route
                path="notice_board"
                element={
                    <UserProtectedRoute>
                        <NoticeBoard_User />
                    </UserProtectedRoute>
                }
            />

            {/* User Homework: /user/homework */}
            <Route
                path="homework"
                element={
                    <UserProtectedRoute>
                        <Homework />
                    </UserProtectedRoute>
                }
            />

            {/* Daily Assignment: /user/daily_assignment */}
            <Route
                path="daily_assignment"
                element={
                    <UserProtectedRoute>
                        <DailyAssignment />
                    </UserProtectedRoute>
                }
            />

            {/* User Transport: /user/route */}
            <Route
                path="route"
                element={
                    <UserProtectedRoute>
                        <TransportRoute />
                    </UserProtectedRoute>
                }
            />

            {/* User Hostel: /user/hostelroom */}
            <Route
                path="hostelroom"
                element={
                    <UserProtectedRoute>
                        <UserHostelRoom />
                    </UserProtectedRoute>
                }
            />

            {/* Student Assessment: /user/studentassessment */}
            <Route
                path="studentassessment"
                element={
                    <UserProtectedRoute>
                        <StudentAssessment />
                    </UserProtectedRoute>
                }
            />

            {/* Timetable: /user/timetable */}
            <Route
                path="timetable"
                element={
                    <UserProtectedRoute>
                        <Timetable />
                    </UserProtectedRoute>
                }
            />

            {/* Syllabus (Lesson Plan): /user/syllabus */}
            <Route
                path="syllabus"
                element={
                    <UserProtectedRoute>
                        <Syllabus />
                    </UserProtectedRoute>
                }
            />

            {/* Syllabus Status: /user/syllabus/status */}
            <Route
                path="syllabus/status"
                element={
                    <UserProtectedRoute>
                        <SyllabusStatus />
                    </UserProtectedRoute>
                }
            />

            {/* Visitors: /user/visitors */}
            <Route
                path="visitors"
                element={
                    <UserProtectedRoute>
                        <Visitors />
                    </UserProtectedRoute>
                }
            />

            {/* State Exam Result: /user/examresult */}
            <Route
                path="examresult"
                element={
                    <UserProtectedRoute>
                        <StateExamResult />
                    </UserProtectedRoute>
                }
            />

            {/* Online Course Category: /user/onlinecourse */}
            <Route
                path="onlinecourse"
                element={
                    <UserProtectedRoute>
                        <OnlineCourse />
                    </UserProtectedRoute>
                }
            />

            {/* Online Course Video List: /user/onlinecourse/list/:id */}
            <Route
                path="onlinecourse/list/:id"
                element={
                    <UserProtectedRoute>
                        <OnlineCourseList />
                    </UserProtectedRoute>
                }
            />

            {/* Content List & Download Center / Gallery: /user/content/list */}
            <Route
                path="content/list"
                element={
                    <UserProtectedRoute>
                        <ContentList />
                    </UserProtectedRoute>
                }
            />

            {/* Content View: /user/content/view/:id */}
            <Route
                path="content/view/:id"
                element={
                    <UserProtectedRoute>
                        <ContentView />
                    </UserProtectedRoute>
                }
            />

            {/* Apply Leave: /user/apply_leave */}
            <Route
                path="apply_leave"
                element={
                    <UserProtectedRoute>
                        <ApplyLeave />
                    </UserProtectedRoute>
                }
            />

            {/* CCAvenue Payment Gateway: /user/gateway/ccavenue */}
            <Route
                path="gateway/ccavenue"
                element={
                    <UserProtectedRoute>
                        <CCAvenuePayment />
                    </UserProtectedRoute>
                }
            />

            {/* Payment Success: /user/gateway/payment/success */}
            <Route
                path="gateway/payment/success"
                element={
                    <UserProtectedRoute>
                        <PaymentSuccess />
                    </UserProtectedRoute>
                }
            />

            {/* Payment Failed: /user/gateway/payment/failed */}
            <Route
                path="gateway/payment/failed"
                element={
                    <UserProtectedRoute>
                        <PaymentFailed />
                    </UserProtectedRoute>
                }
            />

            {/* Add more user routes here as needed (e.g., profile, settings) */}
        </Routes>
    );
}
