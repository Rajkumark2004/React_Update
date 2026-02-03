import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { CircleUser, CheckCircle2, Clock, Banknote, ArrowRight } from 'lucide-react';
import '../../utils/include_files.js';
import api from '../../services/api';
import './dashboard_test.css';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

// ============================================================================
// DASHBOARD TEST COMPONENT
// Complete page with Header, Dashboard Content, and Footer
// Converted from wisibles PHP templates - UI Only
// ============================================================================

const DashboardTest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Basic loading simulation is replaced by actual fetch
            try {
                setLoading(true);
                const response = await api.getDashboardData();
                console.log("Dashboard API Response:", response);

                if (response && (response.status === true || response.status === 'success' || response.result)) {
                    setDashboardStats(response);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // ========== SESSION CONTEXT ==========
    const { currentSession, clearSession } = useSession();

    // ========== SIDEBAR STATE ==========
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // ========== DROPDOWN STATE ==========
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);

    // Handle logout
    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (e) {
            console.error('Logout API failed', e);
        }
        // Clear session from context and localStorage
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    // ========== STATIC MOCK DATA ==========
    const currentYear = new Date().getFullYear();
    const appName = 'School Management System';
    // Use session from context or fallback
    const sessionYear = currentSession?.session || '2024-25';

    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Get logged-in user from localStorage (set by login API)
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    // Fallback to static data if not logged in
    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    // Helper to calculate percentage safely
    const calcPercentage = (present, total) => {
        if (!total || total === 0) return 0;
        return (present / total) * 100;
    };

    // Map API data to UI structure
    const data = dashboardStats?.data || {};

    // Calculate Total Staff from Roles
    const totalStaffCount = data.roles ? Object.values(data.roles).reduce((a, b) => a + parseInt(b), 0) : 0;

    const feeData = data.fee_summary || {};

    const attendanceData = {
        studentPresent: parseFloat(data.attendance?.students?.total_present || 0),
        totalStudents: parseFloat(data.total_students || 0),
        studentProgress: parseFloat(data.attendance?.students?.present || 0),

        staffPresent: parseInt(data.attendance?.staff || 0),
        totalStaff: totalStaffCount,
        staffProgress: parseFloat(data.attendance?.staff_percent || 0),

        feesPaid: parseFloat(data.month_collection || 0),
        totalFees: 0,
        feesProgress: 0
    };

    const feeSummary = {
        totalFees: feeData.totalfee ? parseFloat(feeData.totalfee).toLocaleString() : '0',
        paidFees: feeData.deposit ? parseFloat(feeData.deposit).toLocaleString() : '0',
        balanceFees: feeData.balance ? parseFloat(feeData.balance).toLocaleString() : '0'
    };

    const vacancies = (data.admission_intake || []).map(item => ({
        class: item.class,
        section: item.section,
        intake: item.vacancies,
        admitted: item.intakes,
        vacancies: parseInt(item.vacancies || 0) - parseInt(item.intakes || 0)
    }));


    const pendingTasks = [
        { id: 1, title: 'Review student applications' },
        { id: 2, title: 'Prepare monthly report' },
        { id: 3, title: 'Update fee structure' }
    ];

    // Sidebar Menu Items - only SIS and Settings have working pages


    // Mobile Bottom Nav Items
    const mobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 4, icon: 'settings.png', label: 'More', url: '/settings' },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    // ========== EVENT HANDLERS ==========
    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search submitted');
    };

    // ========== SUB-COMPONENTS ==========

    // Progress Card Component
    const ProgressCard = ({ title, date, progress, current, total, colorClass, expandLink = '#' }) => (
        <div className="col-lg-4 col-md-4 col-sm-12">
            <div className="topprograssstart">
                <p className="text-blur">{date}</p>
                <p className="font-16">
                    {title}<br />
                    <span className="font12">Today</span>
                </p>
                <div className="box-header with-border" style={{ padding: '10px 0' }}>
                    <div className="progress-group">
                        <div className="progress progress-minibar">
                            <div
                                className={`progress-bar progress-bar-${colorClass}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt5 clearfix">
                            Progress
                            <span className="pull-right">{progress.toFixed(2)}%</span>
                        </p>
                    </div>
                </div>
                <Link style={{
                    color: '#9854cb',
                    border: '1px solid #9854cb',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '5px'
                }} to={expandLink} title="View Details">
                    <ArrowRight size={14} />
                </Link>
                <div className="mt8">
                    <span className={`pull-right text-${colorClass}-bg`}>
                        {current}/{total}
                    </span>
                </div>
            </div>
        </div>
    );

    // Info Box Component
    const InfoBox = ({ icon, label, value }) => (
        <div className="info-box">
            <a href="#">
                <span className="back-none info-box-icon">{icon}</span>
                <div className="info-box-content">
                    <span className="info-box-text">{label}</span>
                    <span className="info-box-number">Rs. {value}</span>
                </div>
            </a>
        </div>
    );

    // ========== MAIN RENDER ==========
    return (
        <>
            {/* Custom Styles */}
            <style>{`
                .footer-menu {
                    background-color: #fff;
                    position: fixed;
                    bottom: 0;
                }
                .profile-text {
                    font-size: 18px;
                    color: #444;
                }
                #loading {
                    position: fixed;
                    width: 100%;
                    height: 100vh;
                    background: #fff url('/backend/images/load2.gif') no-repeat center center;
                    z-index: 99999;
                    display: none;
                }
            `}</style>

            {/* Loading Overlay (hidden by default) */}
            <div id="loading"></div>

            <div className={`wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                {/* ==================== HEADER & SIDEBAR ==================== */}
                <Header
                    userData={userData}
                    pendingTasks={userData.pendingTasks}
                    handleLogout={handleLogout}
                    loading={loading}
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                />

                <Sidebar
                    mobileNavItems={mobileNavItems}
                    handleSearch={handleSearch}
                    sessionYear={currentSession}
                    loading={loading}
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />

                {/* ==================== MAIN CONTENT ==================== */}
                <div className="content-wrapper">
                    <section className="content">
                        {loading ? (
                            <Loader type="dashboard" />
                        ) : (
                            /* Main Content Row */
                            <div className="row hello-div">
                                {/* Right Section - Fee Summary (Moved first for Mobile Flow) */}
                                <div className="mt-10 col-lg-3 col-md-3 col-sm-12 col-lg-push-9 col-md-push-9">
                                    {/* User Profile Card */}
                                    <div className="hide-on-mobile border-radius-20 div-user-infomain mt-15 box box-primary">
                                        <div className="widget-user-2 mb0">
                                            <div className="text-right admin-edit">
                                                <a href="#" className="btn">
                                                    <span>✏️</span>
                                                </a>
                                            </div>
                                            <div className="widget-user-header overflow-hidden">
                                                <div className="div-user-info">
                                                    <h5 className="ml-0 widget-user-desc mb5">{userData.role}</h5>
                                                    <h3 className="ml-0 widget-user-username">{userData.name}</h3>
                                                    <h5 className="ml-0 mt-20 view-profile widget-user-desc">
                                                        <Link to="/admin/staff/profile/1">View Profile ✓</Link>
                                                    </h5>
                                                </div>
                                                <div className="widget-user-image">
                                                    <CircleUser size={80} color="#FFD700" strokeWidth={1} style={{ background: '#fff', borderRadius: '50%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fee Summary Card */}
                                    <div className="border-radius-20 box box-primary ptb-20">
                                        <h4 className="fee-summary-title">Fee Summary</h4>
                                        <InfoBox icon={<img src="/images/total_fee.png" alt="Total Fees" style={{ width: '45px' }} />} label="Total Students Fees" value={feeSummary.totalFees} />
                                        <InfoBox icon={<img src="/images/total_paid_fees.png" alt="Paid Fees" style={{ width: '45px' }} />} label="Total Paid Fees" value={feeSummary.paidFees} />
                                        <InfoBox icon={<img src="/images/total_balance_fee.png" alt="Balance Fees" style={{ width: '45px' }} />} label="Total Balance Fees" value={feeSummary.balanceFees} />
                                    </div>
                                </div>

                                {/* Main Content Section (Pulled left on desktop) */}
                                <div className="col-lg-9 col-md-9 col-sm-12 col-lg-pull-3 col-md-pull-3">


                                    {/* Search Bar (Desktop) - Added as requested */}
                                    <div className="content-search-bar hide-mobile">
                                        <input
                                            type="text"
                                            className="search-input-large"
                                            placeholder="Search..."
                                        />
                                        <i className="fa fa-search search-icon-large"></i>
                                    </div>

                                    {/* Welcome Card */}
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="welcome-card">
                                                <div className="welcome-text">
                                                    <h3>Hello {userData.name} <small style={{ color: '#9055e8', fontSize: '16px' }}>({userData.role})</small></h3>
                                                    <p>
                                                        Check your daily fee statements
                                                    </p>
                                                    <a href="#" className="btn-check-now">Check Now</a>
                                                </div>
                                                <div className="welcome-image">
                                                    <img
                                                        className="welcome-illustration"
                                                        src="/images/dash_illustration.png"
                                                        alt="Welcome illustration"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Progress Cards */}
                                    <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: 0, marginTop: 20 }}>
                                        <div className="row">
                                            <ProgressCard
                                                title="Student Attendance"
                                                date={currentDate}
                                                progress={attendanceData.studentProgress}
                                                current={attendanceData.studentPresent}
                                                total={attendanceData.totalStudents}
                                                colorClass="blue"
                                                expandLink="/daily-attendance-report"
                                            />
                                            <ProgressCard
                                                title="Staff Attendance"
                                                date={currentDate}
                                                progress={attendanceData.staffProgress}
                                                current={attendanceData.staffPresent}
                                                total={attendanceData.totalStaff}
                                                colorClass="maroon"
                                                expandLink="/attendance/staff_attendance_report"
                                            />
                                            <ProgressCard
                                                title="Fee Collection"
                                                date={currentDate}
                                                progress={attendanceData.feesProgress}
                                                current={attendanceData.feesPaid}
                                                total={attendanceData.totalFees}
                                                colorClass="orange"
                                                expandLink="/daily-attendance-report"
                                            />
                                        </div>
                                    </div>

                                    {/* Admission Intake Table */}
                                    <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: 0, marginTop: 20 }}>
                                        <div className="border-radius-20 box box-primary" style={{ padding: 20 }}>
                                            <h4 className="fee-summary-title">Admission Intake</h4>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Class</th>
                                                        <th>Section</th>
                                                        <th>Intake</th>
                                                        <th>Admitted</th>
                                                        <th>Vacancies</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vacancies.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="mailbox-name">{item.class}</td>
                                                            <td className="mailbox-name">{item.section}</td>
                                                            <td className="mailbox-name">{item.intake}</td>
                                                            <td className="mailbox-name">{item.admitted}</td>
                                                            <td className="mailbox-name">{item.vacancies}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div >

                <Footer />
                <div className="control-sidebar-bg"></div>
            </div >
        </>
    );
};

export default DashboardTest;
