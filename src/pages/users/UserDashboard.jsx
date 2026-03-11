
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';
import { api_users } from '../../services/api_users';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "student",
        id: "",
        admission_no: "",
        avatar: "/uploads/student_images/1.jpg",
        adminLogoUrl: "",
        baseUrl: ""
    });

    // Comprehensive Dashboard Data State
    const [dashboardData, setDashboardData] = useState({
        notifications: [],
        subjects_progress: [],
        timetable: {},
        homework: [],
        attendance_percentage: 0
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // First try to load initial username from localStorage
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                let isParent = false;
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    isParent = userObj.role === 'parent';
                    initialName = userObj.username || "User";
                    setUserData(prev => ({ ...prev, name: initialName, role: userObj.role || 'student', avatar: userObj.image || "/uploads/student_images/1.jpg" }));
                }

                // Then fetch real data from dashboard API
                const res = await api_users.getUserDashboard();
                if (res && res.status && res.data) {
                    const d = res.data;
                    if (d.student) {
                        const studentFullName = `${d.student.firstname || ''} ${d.student.lastname || ''}`.trim();
                        setUserData(prev => ({
                            ...prev,
                            // For parents, keep login_username — don't overwrite with student name
                            name: isParent ? initialName : (studentFullName || initialName),
                            id: d.student.id || prev.id,
                            admission_no: d.student.admission_no || "",
                            adminLogoUrl: d.sch_setting?.admin_logo && d.sch_setting?.base_url
                                ? `${d.sch_setting.base_url}uploads/school_content/admin_logo/${d.sch_setting.admin_logo}`
                                : prev.adminLogoUrl,
                            baseUrl: d.sch_setting?.base_url || prev.baseUrl
                        }));
                    }

                    // Set all dashboard metrics
                    setDashboardData({
                        notifications: Array.isArray(d.notifications) ? d.notifications : [],
                        subjects_progress: Array.isArray(d.subjects_progress) ? d.subjects_progress : [],
                        timetable: d.timetable || {},
                        homework: Array.isArray(d.homework) ? d.homework : [],
                        attendance_percentage: d.attendance_percentage || 0
                    });
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = async () => {
        try {
            await api_users.userLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearSession();
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            navigate('/user/login');
        }
    };



    const themeColor = "#9c68e4";

    // Get Today's classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayClasses = dashboardData.timetable[todayName] || [];

    return (
        <div className="wrapper">
            <style>{`
                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }

                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }

                .sidebar::-webkit-scrollbar {
                    width: 5px;
                }
                .sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }

                .sidebar-menu > li > a {
                    padding: 12px 5px !important;
                    text-align: center !important;
                }
                
                .sidebar-menu li img {
                    filter: brightness(0) invert(1) !important;
                    width: 24px !important;
                    margin: 0 auto !important;
                }

                .sidebar-menu > li > a span {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                    margin-top: 5px !important;
                    display: block !important;
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                }

                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                


                /* NAVBAR USER MENU DROPDOWN FIX */
                .navbar-custom-menu {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav > li:not(.user-menu) {
                    display: none !important;
                }
                .navbar-custom-menu .nav > li.user-menu {
                    display: block !important;
                    overflow: visible !important;
                }
                
                /* Ensure dropdown menu is on top of everything */
                .dropdown-user {
                    display: none;
                    z-index: 9999 !important;
                    position: absolute !important;
                    right: 0 !important;
                    top: 100% !important;
                }
                .user-menu.open .dropdown-user {
                    display: block !important;
                }



                /* Layout adjustments */
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 25px !important;
                }
                
                .welcome-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 30px 45px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                    min-height: 230px;
                }
                
                .welcome-text h3 {
                    font-size: 26px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 10px 0;
                }
                
                .welcome-text p {
                    font-size: 16px;
                    color: #777;
                    margin-bottom: 30px;
                }
                
                .btn-check-now {
                    background-color: ${themeColor} !important;
                    color: #fff !important;
                    padding: 10px 32px;
                    border-radius: 10px;
                    font-weight: 500;
                    font-size: 15px;
                    text-decoration: none;
                    display: inline-block;
                }
                
                .welcome-image img {
                    max-width: 320px;
                    height: auto;
                }

                .notice-board-container {
                    margin-top: 47px; 
                }
                
                .notice-board-card {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    min-height: 200px;
                    width: 100%;
                }

                .notice-header {
                    padding: 18px 25px;
                    border-bottom: 1px solid #f9f9f9;
                }
                
                .notice-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                }

                .notice-body {
                    padding: 18px 25px;
                }

                .notice-item {
                    display: flex;
                    align-items: center;
                    color: #666;
                    font-size: 14px;
                }

                .notice-item i.fa-envelope-o {
                    color: #e74c3c;
                    margin-right: 12px;
                    font-size: 17px;
                }

                .dashboard-card {
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                    min-height: 290px;
                }

                .card-title-bar {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f9f9f9;
                }

                .card-title-bar h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                    margin: 0;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                }

                .empty-state img {
                    width: 130px;
                    height: auto;
                    opacity: 0.8;
                }

                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }
            `}</style>



            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/dashboard"
            />

            <div className="content-wrapper" style={{ marginTop: '50px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-lg-8 col-md-8">
                            <div className="welcome-card">
                                <div className="welcome-text">
                                    <h3 style={{ marginLeft: '25px' }}>Hello {userData.name}</h3>
                                    <p>Check your personalized profile</p>
                                    <Link to="/user/profile" className="btn-check-now">Check Now</Link>
                                </div>
                                <div className="welcome-image">
                                    <img src="/images/dash_illustration.png" alt="Welcome" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="notice-board-container">
                                <div className="notice-board-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="notice-header" style={{ flexShrink: 0 }}>
                                        <h3>Notice Board</h3>
                                    </div>
                                    <div className="notice-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '180px' }}>
                                        {dashboardData.notifications.length === 0 ? (
                                            <p className="text-muted text-center" style={{ marginTop: '20px' }}>No new notifications</p>
                                        ) : (
                                            dashboardData.notifications.map((note, idx) => (
                                                <div className="notice-item" key={idx} style={{ padding: '8px 0', borderBottom: idx !== dashboardData.notifications.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                                                    <i className="fa fa-envelope-o"></i>
                                                    <span style={{ flex: 1 }}>{note.title} <br /><small className="text-muted">{note.date}</small></span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card-title-bar" style={{ flexShrink: 0 }}>
                                    <h3>Subject Progress</h3>
                                </div>
                                <div className="card-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', padding: '15px 20px' }}>
                                    {dashboardData.subjects_progress.length === 0 ? (
                                        <div className="empty-state">
                                            <img src="/images/addnewitem.svg" alt="No data" />
                                        </div>
                                    ) : (
                                        dashboardData.subjects_progress.map((sub, idx) => {
                                            const complete = parseFloat(sub.complete || 0);
                                            // Handle "no subject" or missing names gracefully
                                            if (!sub.subject_name && complete === 0 && dashboardData.subjects_progress.length > 1) return null;

                                            return (
                                                <div key={idx} className="progress-group mb-4">
                                                    <div className="d-flex justify-content-between align-items-end mb-1">
                                                        <span className="progress-text font-weight-bold" style={{ fontSize: '13px', color: '#555' }}>
                                                            {sub.subject_name || 'Subject'} {sub.code ? `(${sub.code})` : ''}
                                                        </span>
                                                        <span className="progress-number" style={{ fontSize: '12px', color: '#888' }}>
                                                            <b>{complete}%</b> Complete
                                                        </span>
                                                    </div>
                                                    <div className="progress progress-sm" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f1f1f1' }}>
                                                        <div className="progress-bar" style={{ width: `${complete}%`, backgroundColor: complete >= 75 ? '#4CAF50' : complete >= 40 ? '#FFC107' : '#F44336' }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card-title-bar" style={{ flexShrink: 0 }}>
                                    <h3>Upcoming Classes</h3>
                                </div>
                                <div className="card-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', padding: '15px 20px' }}>
                                    {Object.keys(dashboardData.timetable).length === 0 ? (
                                        <div className="empty-state">
                                            <p className="text-muted">No classes scheduled.</p>
                                        </div>
                                    ) : (
                                        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                            const dayClasses = dashboardData.timetable[day] || [];
                                            if (dayClasses.length === 0) return null;
                                            return (
                                                <div key={day} className="mb-4">
                                                    <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: themeColor, borderLeft: `3px solid ${themeColor}`, paddingLeft: '8px', marginBottom: '12px' }}>{day}</h5>
                                                    {dayClasses.map((cls, idx) => (
                                                        <div key={idx} className="timetable-card d-flex align-items-center mb-3 p-2" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f1f1' }}>
                                                            {/* Teacher Avatar */}
                                                            <div style={{ flexShrink: 0, marginRight: '12px' }}>
                                                                <img
                                                                    src={cls.image && userData.baseUrl ? `${userData.baseUrl}uploads/staff_images/${cls.image}` : "/images/default_image.jpg"}
                                                                    alt="Teacher"
                                                                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f8f9fa' }}
                                                                    onError={(e) => { e.target.src = "/images/default_image.jpg"; }}
                                                                />
                                                            </div>

                                                            {/* Left Info: Subject & Teacher */}
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <h6 className="m-0 font-weight-bold" style={{ color: '#333', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.subject_name}</h6>
                                                                <small className="text-muted" style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{cls.name} {cls.surname}</small>
                                                            </div>

                                                            {/* Right Info: Room & Time */}
                                                            <div style={{ flexShrink: 0, textAlign: 'right', marginLeft: '10px' }}>
                                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: themeColor }}>{cls.room_no ? `Room: ${cls.room_no}` : '--'}</div>
                                                                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{cls.time_from} - {cls.time_to}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card-title-bar" style={{ flexShrink: 0 }}>
                                    <h3>Pending Homework</h3>
                                </div>
                                <div className="card-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', padding: '15px 20px' }}>
                                    {dashboardData.homework.length === 0 ? (
                                        <div className="empty-state">
                                            <img src="/images/addnewitem.svg" alt="No data" />
                                            <p className="text-muted mt-2">No pending homework.</p>
                                        </div>
                                    ) : (
                                        dashboardData.homework.map((hw, idx) => (
                                            <div key={idx} className="mb-3 border-bottom pb-2">
                                                <h6 className="font-weight-bold mb-1" style={{ color: '#333' }}>{hw.subject_name}</h6>
                                                <small className="text-muted d-block"><i className="fa fa-calendar"></i> Due: {hw.homework_date}</small>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default UserDashboard;
