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

    const MobileIcons = {
        Homework: () => <i className="fa fa-pencil-square-o" style={{ fontSize: '30px', color: '#000' }}></i>,
        Attendance: () => <i className="fa fa-calendar-check-o" style={{ fontSize: '30px', color: '#000' }}></i>,
        Fees: () => <i className="fa fa-laptop" style={{ fontSize: '30px', color: '#000' }}></i>,
        Leave: () => <i className="fa fa-id-badge" style={{ fontSize: '30px', color: '#000' }}></i>,
        Timetable: () => <i className="fa fa-calendar" style={{ fontSize: '30px', color: '#000' }}></i>,
        Lesson: () => <i className="fa fa-clipboard" style={{ fontSize: '30px', color: '#000' }}></i>,
        Download: () => <i className="fa fa-download" style={{ fontSize: '30px', color: '#000' }}></i>,
        Notice: () => <i className="fa fa-envelope-o" style={{ fontSize: '30px', color: '#000' }}></i>,
        Transport: () => <i className="fa fa-map-marker" style={{ fontSize: '30px', color: '#000' }}></i>,
        Examination: () => <i className="fa fa-file-text-o" style={{ fontSize: '30px', color: '#000' }}></i>
    };

    // Get Today's classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayClasses = dashboardData.timetable[todayName] || [];

    return (
        <div className="wrapper">
            <style>{`
                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper {
                    background-color: #f4f4f4 !important;
                    background-image: none !important;
                    margin-left: 80px !important;
                    padding: 5px !important;
                    min-height: calc(100vh - 50px) !important;
                }
                .main-footer {
                    margin-left: 80px !important;
                    padding-left: 5px !important;
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
                    background-color: #f7f7f7 !important;
                    padding-top: 60px !important;
                }
                
                .welcome-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 30px 45px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid #ddd;
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
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid #ddd;
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
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 8px 10px;
                    border-radius: 6px;
                }

                .notice-item:hover {
                    background-color: #f8f9fa;
                    color: #72afd2 !important;
                    padding-left: 15px;
                }

                .notice-item:hover small {
                    color: #72afd2 !important;
                }

                .notice-item i.fa-envelope-o {
                    color: #e74c3c;
                    margin-right: 12px;
                    font-size: 17px;
                }

                .dashboard-card {
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid #ddd;
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

                /* Subject Progress - Image-Based UI */
                .subject-progress-header {
                    background-color: #f5f5f5;
                    padding: 10px 10px;
                    margin: 0 15px;
                    display: flex;
                    justify-content: space-between;
                    font-weight: 600;
                    color: #444;
                    font-size: 13px;
                    border-radius: 4px;
                }
                .subject-progress-row {
                    padding: 8px 8px;
                    margin: 0 15px;
                    border-bottom: 1px solid #f1f1f1;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    transition: all 0.2s ease;
                }
                .subject-progress-row:hover {
                    background-color: #f9f9f9;
                }
                .subject-name-text {
                    font-size: 14px;
                    color: #333;
                    margin: 0;
                    font-weight: 500;
                }
                .progress-detail-col {
                    width: 150px;
                    text-align: right;
                }
                .progress-percent-val {
                    display: block;
                    font-size: 13px;
                    color: #333;
                    margin-bottom: 5px;
                    text-align: left;
                }
                .progress-bar-container {
                    height: 8px;
                    background-color: #f2f2f2;
                    border-radius: 10px;
                    overflow: hidden;
                    width: 100%;
                }
                .progress-bar-fill {
                    height: 100%;
                    border-radius: 10px;
                }

                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }
                     @media (max-width: 770px) {
                 
                    .content-wrapper { padding-top: 0px !important; } 
                }

                /* MOBILE DASHBOARD UI */
                @media (min-width: 50px) and (max-width: 766px) {
                    .main-header, .main-sidebar, .content-wrapper, .main-footer, .mobile-bottom-nav, #bottom-menu {
                        display: none !important;
                    }
                    body, html {
                        margin: 0; padding: 0;
                        background-color: #f7f7f7;
                    }
                    .mobile-dashboard-ui {
                        display: flex !important;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: #fcfcfc;
                        font-family: 'Inter', 'Roboto', sans-serif;
                    }
                    .mob-header {
                        height: 60px;
                        background: #ffffff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                        z-index: 10;
                    }
                    .mob-logo {
                        height: 40px;
                        object-fit: contain;
                    }
                    .mob-header-icon {
                        position: absolute;
                        right: 20px;
                        font-size: 20px;
                        color: #555;
                    }
                    .mob-profile-section {
                        position: relative;
                        min-height: 110px;
                        padding-top: 20px;
                        margin-bottom: 5px;
                        z-index: 5;
                    }
                    .mob-profile-bar {
                        background: #cfcfcf;
                        height: 60px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        padding-left: 110px;
                        padding-right: 20px;
                        margin-top: 25px;
                    }
                    .mob-avatar-wrapper {
                        position: absolute;
                        top: 15px;
                        left: 25px;
                        width: 70px;
                        height: 70px;
                        background-color: #ffefba; 
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10;
                    }
                    .mob-avatar-wrapper i {
                        font-size: 40px;
                        color: #fbbc04;
                    }
                    .mob-profile-content {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                    }
                    .mob-name {
                        text-align: left;
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 2px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .mob-details {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        color: #444;
                    }
                    .mob-details span {
                        white-space: nowrap;
                    }
                    .mob-grid-container {
                        padding: 15px 10px;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 8px;
                        flex-grow: 1;
                        align-content: start;
                        padding-bottom: 80px;
                    }
                    .mob-grid-card {
                        background: #ffffff;
                        border-radius: 4px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 10px 4px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                        text-decoration: none !important;
                        min-height: 75px;
                        transition: transform 0.2s, background 0.2s;
                        text-align: center;
                    }
                    .mob-grid-card:active {
                        transform: scale(0.98);
                        background: #f9f9f9;
                    }
                    .mob-icon {
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 6px;
                    }
                    .mob-icon i {
                        font-size: 24px !important;
                    }
                    .mob-grid-card span {
                        font-size: 11px;
                        font-weight: 600;
                        color: #111;
                        line-height: 1.2;
                    }
                    .mob-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 60px;
                        background: #ffffff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-top: 1px solid #e2e2e2;
                        color: #1e3a5f;
                        font-size: 19px;
                        font-weight: 500;
                        gap: 8px;
                        z-index: 10;
                        text-decoration: none !important;
                    }
                    .mob-footer-icon-wrapper {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background-color: #ffefba; 
                        border: 1px solid #333; 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .mob-footer-icon-wrapper i {
                        font-size: 16px;
                        color: #fbbc04;
                    }
                }
                @media (min-width: 767px) {
                    .mobile-dashboard-ui {
                        display: none !important;
                    }
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

            <div className="content-wrapper" style={{ marginTop: '40px' }}>
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
                                                <div
                                                    className="notice-item"
                                                    key={idx}
                                                    style={{ borderBottom: idx !== dashboardData.notifications.length - 1 ? '1px solid #f1f1f1' : 'none' }}
                                                    onClick={() => navigate('/user/notice_board')}
                                                >
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
                                <div className="card-body" style={{ flex: 1, padding: 0 }}>
                                    {dashboardData.subjects_progress.length > 0 && (
                                        <div className="subject-progress-header">
                                            <span>Subject</span>
                                            <span style={{ marginRight: '85px' }}>Progress</span>
                                        </div>
                                    )}
                                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                        {dashboardData.subjects_progress.length === 0 ? (
                                            <div className="empty-state">
                                                <img src="/images/addnewitem.svg" alt="No data" />
                                            </div>
                                        ) : (
                                            dashboardData.subjects_progress.map((sub, idx) => {
                                                const complete = parseFloat(sub.complete || 0);
                                                if (!sub.subject_name && complete === 0 && dashboardData.subjects_progress.length > 1) return null;

                                                return (
                                                    <div key={idx} className="subject-progress-row">
                                                        <div className="subject-name-text">
                                                            {sub.subject_name} ({sub.code || ''})
                                                        </div>
                                                        <div className="progress-detail-col">
                                                            <span className="progress-percent-val">{complete}%</span>
                                                            <div className="progress-bar-container">
                                                                <div
                                                                    className="progress-bar-fill"
                                                                    style={{
                                                                        width: `${complete}%`,
                                                                        backgroundColor: complete >= 75 ? '#4CAF50' : complete >= 40 ? '#FFC107' : '#72afd2'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
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
                                                        <div key={idx} className="timetable-card d-flex align-items-center" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f1f1', padding: '7px 12px', marginBottom: '10px' }}>

                                                            {/* Teacher Avatar */}
                                                            <div style={{ flexShrink: 0, marginRight: '12px' }}>
                                                                <img
                                                                    src={cls.image && userData.baseUrl ? `${userData.baseUrl}uploads/staff_images/${cls.image}` : "/images/default_image.jpg"}
                                                                    alt="Teacher"
                                                                    style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f8f9fa' }}
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

            {/* MOBILE DASHBOARD UI */}
            <div className="mobile-dashboard-ui">
                <div className="mob-header">
                    <img src={userData.adminLogoUrl || "/images/wisibles_logo.png"} alt="Wisibles" className="mob-logo" />
                    <i className="fa fa-exchange mob-header-icon"></i>
                </div>

                <div className="mob-profile-section">
                    <div className="mob-profile-bar">
                        <div className="mob-profile-content">
                            <div className="mob-name">{userData.name}</div>
                            <div className="mob-details">
                                <span>Adm No: {userData.admission_no || '1005'}</span>
                                <span>Class: {dashboardData.class_name || 'Nursery (A)'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mob-avatar-wrapper">
                        <i className="fa fa-user"></i>
                    </div>
                </div>

                <div className="mob-grid-container">
                    <Link to="/user/homework" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Homework /> </div>
                        <span>Homework</span>
                    </Link>
                    <Link to="/user/attendance" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Attendance /> </div>
                        <span>Attendance</span>
                    </Link>
                    <Link to="/user/getfees" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Fees /> </div>
                        <span>Fees</span>
                    </Link>
                    <Link to="/user/apply_leave" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Leave /> </div>
                        <span>Leave</span>
                    </Link>
                    <Link to="/user/timetable" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Timetable /> </div>
                        <span>Timetable</span>
                    </Link>
                    <Link to="/user/syllabus" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Lesson /> </div>
                        <span>Lesson</span>
                    </Link>
                    <Link to="/user/content/list" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Download /> </div>
                        <span>Download</span>
                    </Link>
                    <Link to="/user/notice_board" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Notice /> </div>
                        <span>Notice</span>
                    </Link>
                    <Link to="/user/route" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Transport /> </div>
                        <span>Transport</span>
                    </Link>
                    <Link to="/user/examresult" className="mob-grid-card">
                        <div className="mob-icon"> <MobileIcons.Examination /> </div>
                        <span>Examination</span>
                    </Link>
                </div>

                <Link to="/user/profile" className="mob-footer">
                    <div className="mob-footer-icon-wrapper">
                        <i className="fa fa-user"></i>
                    </div>
                    <span>My Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default UserDashboard;