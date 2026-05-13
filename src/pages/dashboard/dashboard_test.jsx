import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { CircleUser, CheckCircle2, Clock, Banknote, ArrowRight, Pencil, GraduationCap, ShieldCheck, IndianRupee, ChevronRight, ArrowUpRight, MoreHorizontal } from 'lucide-react';
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

    // ========== SEARCH STATE ==========
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!searchQuery.trim()) return;
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

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

    // Check if the user is a Teacher
    const isTeacher = loggedInUser?.roles ? Object.hasOwnProperty.call(loggedInUser.roles, 'Teacher') : false;

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

        feesPaid: 0,
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

    // Extract dynamic logo URL
    const adminLogoUrl = data.school_setting?.admin_logo && data.school_setting?.base_url
        ? `${data.school_setting.base_url}uploads/school_content/admin_logo/${data.school_setting.admin_logo}`
        : "";


    const pendingTasks = [
        { id: 1, title: 'Review student applications' },
        { id: 2, title: 'Prepare monthly report' },
        { id: 3, title: 'Update fee structure' }
    ];

    // Sidebar Menu Items - only SIS and Settings have working pages


    // Mobile Bottom Nav Items
    const mobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '/studentfee' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 4, icon: 'settings.png', label: 'More', url: '#', isMore: true },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    // ========== EVENT HANDLERS ==========
    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search submitted');
    };

    // ========== SUB-COMPONENTS ==========

    // Progress Card Component - Updated to Option 4 (Progress Circle)
    const ProgressCard = ({ title, progress, current, total, colorClass, icon: Icon, expandLink = '#', linkState = {} }) => {
        const themeColor = '#9055e8'; // Use consistent purple from reference
        
        return (
            <div className="col-lg-4 col-md-4 col-sm-12">
                <div className="progress-card-v4">
                    <div className="v4-header">
                        <div className="v4-date">May 13, 2026</div>
                    </div>
                    <div className="v4-body">
                        <div className="v4-circle-container">
                            <svg className="v4-circle-svg" viewBox="0 0 100 100">
                                <circle className="v4-circle-bg" cx="50" cy="50" r="40" />
                                <circle 
                                    className="v4-circle-bar" 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    strokeDasharray="251.3" 
                                    strokeDashoffset={251.3 - (251.3 * (progress || 0) / 100)} 
                                />
                            </svg>
                            <div className="v4-circle-text">
                                <span className="v4-percent">{progress.toFixed(2)}%</span>
                                <span className="v4-label">Progress</span>
                            </div>
                        </div>
                        <div className="v4-info">
                            <div className="v4-title">{title}</div>
                            <div className="v4-subtitle">Today</div>
                        </div>
                    </div>
                    <div className="v4-footer">
                        <Link to={expandLink} state={linkState} className="v4-action-btn">
                            <ArrowRight size={18} />
                        </Link>
                        <div className={`v4-badge ${colorClass === 'orange' ? 'orange' : ''}`}>
                            {current}/{total}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Info Box Component
    const InfoBox = ({ icon, label, value, colorClass = 'orange', onClick, borderColor = 'transparent' }) => (
        <div 
            className="info-box-premium" 
            onClick={onClick}
            style={{ 
                cursor: onClick ? 'pointer' : 'default',
                borderLeft: `4px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
            }}
        >
            <div className="info-icon-wrapper">
                {icon}
            </div>
            <div className="info-content-wrapper" style={{ flex: 1 }}>
                <span className="info-label">{label}</span>
                <span className="info-value">Rs. {value}</span>
            </div>
            {onClick && (
                <div style={{ color: '#94a3b8', marginLeft: '10px' }}>
                    <ChevronRight size={18} />
                </div>
            )}
        </div>
    );

    // ========== MAIN RENDER ==========
    return (
        <>
            {/* Custom Styles */}
            <style>{`
                .profile-card-v2 {
                    background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%) !important;
                    padding: 0 !important;
                    border-radius: 20px !important;
                    border: none !important;
                    box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3) !important;
                    color: #fff !important;
                }
                .profile-card-v2 .avatar-white-bg {
                    background: #fff !important;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
                }
                .profile-card-v2 .edit-btn-v2 {
                    background: #fff !important;
                    color: #7c3aed !important;
                    border: none !important;
                }
                .profile-card-v2 .divider-v2 {
                    border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                .profile-card-v2 .role-text {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .profile-card-v2 .name-text {
                    color: #fff !important;
                }
                .profile-card-v2 .footer-link-v2 {
                    color: #fff !important;
                }

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
                    headerLogoUrl={adminLogoUrl}
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
                    <section className="content" style={{ paddingTop: '0' }}>
                        {loading ? (
                            <Loader type="dashboard" />
                        ) : (
                            /* Main Content Row */
                            <div className="row hello-div">
                                {/* Right Section - Fee Summary (Moved first for Mobile Flow) */}
                                <div className="mt-10 col-lg-3 col-md-3 col-sm-12 col-lg-push-9 col-md-push-9">
                                    {/* User Profile Card */}
                                    <div className="card-premium hide-on-mobile profile-card-v2" style={{ marginTop: '7px' }}>
                                        {/* Top Section */}
                                        <div style={{ padding: '38px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {/* Avatar Container - Circular */}
                                            <div className="avatar-white-bg" style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <CircleUser size={45} color="#7c3aed" strokeWidth={1.5} />
                                            </div>

                                            {/* Text Section */}
                                            <div style={{ flex: 1 }}>
                                                <h5 className="role-text" style={{ margin: 0, fontSize: '13px', fontWeight: '400', fontFamily: 'Inter, sans-serif' }}>{userData.role}</h5>
                                                <h3 className="name-text" style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: '700' }}>{userData.name}</h3>
                                            </div>

                                            {/* Edit Button - Top Right rounded square */}
                                            <Link to={`/admin/staff/edit/${userData.id}`} className="edit-btn-v2" style={{ 
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}>
                                                <Pencil size={16} />
                                            </Link>
                                        </div>

                                        {/* Divider Line */}
                                        <div className="divider-v2" style={{ width: '100%' }}></div>

                                        {/* Footer Section */}
                                        <div style={{ padding: '14px 20px' }}>
                                            <Link to={`/admin/staff/profile/${userData.id}`} className="footer-link-v2" style={{ 
                                                fontSize: '14px', 
                                                fontWeight: '600', 
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                View Profile <ArrowUpRight size={16} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Fee Summary Card - Hidden for Teachers */}
                                    {!isTeacher && (
                                        <div className="card-premium" style={{ padding: '20px' }}>
                                            <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>Fee Summary</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <InfoBox 
                                                    icon={<div className="info-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={22} /></div>} 
                                                    label="Total Students Fees" 
                                                    value={feeSummary.totalFees} 
                                                    borderColor="#3b82f6"
                                                    onClick={() => navigate('/admin/reports/finance', { state: { activeReport: 'Daily Collection Report' } })}
                                                />
                                                <InfoBox 
                                                    icon={<div className="info-icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={22} /></div>} 
                                                    label="Total Paid Fees" 
                                                    value={feeSummary.paidFees} 
                                                    borderColor="#22c55e"
                                                    onClick={() => navigate('/admin/reports/finance', { state: { activeReport: 'Daily Collection Report' } })}
                                                />
                                                <InfoBox 
                                                    icon={<div className="info-icon-box" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IndianRupee size={22} /></div>} 
                                                    label="Total Balance Fees" 
                                                    value={feeSummary.balanceFees} 
                                                    borderColor="#f43f5e"
                                                    onClick={() => navigate('/admin/reports/finance', { state: { activeReport: 'Balance Fees Report' } })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Main Content Section (Pulled left on desktop) */}
                                <div className="col-lg-9 col-md-9 col-sm-12 col-lg-pull-3 col-md-pull-3">


                                    {/* Welcome Card */}
                                    <div className="row" style={{ marginBottom: '0' }}>
                                        <div className="col-lg-12">
                                            <div className="card-premium welcome-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%)', border: '1px solid rgba(144, 85, 232, 0.1)' }}>
                                                <div className="welcome-text" style={{ marginLeft: 0, padding: '10px' }}>
                                                    <h3 style={{ marginLeft: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>Welcome back, {userData.name}! 👋</h3>
                                                    <p style={{ marginLeft: 0, fontSize: '16px', color: '#64748b', margin: '10px 0 25px 0' }}>
                                                        Check your daily fee statements
                                                    </p>
                                                    <Link to="/admin/reports/finance" state={{ activeReport: 'Daily Collection Report' }} className="btn-check-now" style={{ marginLeft: 0, padding: '12px 24px', borderRadius: '10px' }}>
                                                        View Daily Collection
                                                    </Link>
                                                </div>
                                                <div className="welcome-image">
                                                    <img
                                                        className="welcome-illustration"
                                                        src="/images/dash_illustration.png"
                                                        alt="Welcome illustration"
                                                        style={{ height: '200px', marginBottom: '0' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Progress Cards */}
                                    <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: 0, marginTop: '0px' }}>
                                        <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            <ProgressCard
                                                title="Student Attendance"
                                                icon={CircleUser}
                                                progress={attendanceData.studentProgress}
                                                current={attendanceData.studentPresent}
                                                total={attendanceData.totalStudents}
                                                colorClass="blue"
                                                expandLink="/admin/reports/attendance"
                                                linkState={{ activeReport: 'class_attendance' }}
                                            />
                                            {!isTeacher && (
                                                <>
                                                    <ProgressCard
                                                        title="Staff Attendance"
                                                        icon={CheckCircle2}
                                                        progress={attendanceData.staffProgress}
                                                        current={attendanceData.staffPresent}
                                                        total={attendanceData.totalStaff}
                                                        colorClass="maroon"
                                                        expandLink="/admin/reports/attendance"
                                                        linkState={{ activeReport: 'staff_report' }}
                                                    />
                                                    <ProgressCard
                                                        title="Fee Collection"
                                                        icon={Banknote}
                                                        progress={attendanceData.feesProgress}
                                                        current={attendanceData.feesPaid}
                                                        total={attendanceData.totalFees}
                                                        colorClass="orange"
                                                        expandLink="/studentfee"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Admission Intake Table - Hidden for Teachers */}
                                    {!isTeacher && (
                                        <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: 0, marginTop: '5px' }}>
                                            <div className="card-premium">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Admission Intake</h4>
                                                    <span className="badge-vacancies badge-neutral">Session {sessionYear}</span>
                                                </div>
                                                <div className="modern-table-container">
                                                    <table className="modern-table">
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
                                                                    <td style={{ fontWeight: '500' }}>{item.class}</td>
                                                                    <td>{item.section}</td>
                                                                    <td>{item.intake}</td>
                                                                    <td>{item.admitted}</td>
                                                                    <td>
                                                                        <span className={`badge-vacancies ${item.vacancies > 0 ? 'badge-positive' : 'badge-neutral'}`}>
                                                                            {item.vacancies}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div >

                <Footer />
             
            </div >
        </>
    );
};

export default DashboardTest;
