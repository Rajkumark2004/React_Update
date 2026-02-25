
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';

const Notification = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "KARTHIK",
        role: "Student",
        id: "1009",
        avatar: "https://avatar.iran.liara.run/public/boy?username=KARTHIK"
    });

    // Language Dropdown State
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Mock data - Empty per image
    const notifications = [];

    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Dashboard', url: '/user/user/dashboard' },
        { id: 2, icon: 'certificate.png', label: 'Gallery', url: '/user/content/gallery' },
        { id: 3, icon: 'student.png', label: 'My Profile', url: '/user/user/profile' },
        { id: 4, icon: 'Fees.png', label: 'Fees', url: '/user/user/getfees' },
        { id: 5, icon: 'messages.png', label: 'Circular', url: '/user/notification' },
        { id: 6, icon: 'homework.png', label: 'Student Assessment', url: '#' },
        { id: 7, icon: 'attendance.png', label: 'Class Timetable', url: '/user/timetable' },
        { id: 8, icon: 'homework.png', label: 'Lesson Plan', url: '/user/syllabus' },
        { id: 9, icon: 'reports.png', label: 'Syllabus Status', url: '#' },
        { id: 10, icon: 'addhomework.png', label: 'Homework', url: '#' },
        { id: 11, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 12, icon: 'applyleave.png', label: 'Apply Leave', url: '#' },
        { id: 13, icon: 'visitorbook.png', label: 'Visitor Book', url: '#' },
        { id: 14, icon: 'download_resouces.png', label: 'Download Center', url: '#' },
        { id: 15, icon: 'attendance.png', label: 'Attendance', url: '#' },
        { id: 16, icon: 'helpdesk.png', label: 'State Examination', url: '#' },
        { id: 17, icon: 'messages.png', label: 'Notice Board', url: '#' },
        { id: 18, icon: 'teachersrating.png', label: 'Teachers Reviews', url: '#' },
        { id: 19, icon: 'transport.png', label: 'Transport Route', url: '#' },
        { id: 20, icon: 'my_day_today.png', label: 'My Day Today', url: '#' },
        { id: 21, icon: 'hostle.png', label: 'Hostel Rooms', url: '#' }
    ];

    const mobileNavItems = [
        { id: 1, icon: 'helpdesk.png', label: 'SIS', url: '#' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '#' },
        { id: 4, icon: 'settings.png', label: 'More', url: '#' },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const languages = [
        { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/us.png' },
        { code: 'ta', name: 'Tamil', flag: 'https://flagcdn.com/w20/in.png' },
        { code: 'te', name: 'Telugu', flag: 'https://flagcdn.com/w20/in.png' }
    ];

    const themeColor = "#9c68e4";

    const handleNotificationClick = (notif) => {
        setSelectedNotification(notif);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    return (
        <div className="wrapper">
            <style>{`
                .main-sidebar {
                    background-color: ${themeColor} !important;
                    width: 80px !important;
                    transition: none !important;
                    padding-top: 50px !important;
                    z-index: 1000 !important;
                }
                
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
                
                header.main-header {
                   max-height: 50px !important;
                   z-index: 1010 !important;
                   overflow: visible !important;
                }

                .main-header .navbar {
                    background-color: #ffffff !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
                    margin-left: 80px !important;
                    height: 50px !important;
                    overflow: visible !important;
                }

                .main-header .logo {
                    background-color: #ffffff !important;
                    border-right: 1px solid #f0f0f0 !important;
                    width: 160px !important;
                    height: 50px !important;
                    padding: 0 10px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    z-index: 1015 !important;
                }
                .main-header .logo img {
                    width: 130px !important;
                    height: auto !important;
                    display: block !important;
                }

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

                .custom-nav-right {
                    display: flex;
                    align-items: center;
                }
                
                .custom-nav-item {
                    padding: 0 12px;
                    color: #555;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    height: 50px;
                    position: relative;
                }
                
                .custom-nav-item:hover { background: transparent !important; }
                .custom-nav-item i { font-size: 18px; }
                .flag-icon { width: 22px; height: 14px; border: 1px solid #eee; }

                /* Language Dropdown Styling */
                .lang-dropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #fff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-radius: 4px;
                    width: 130px;
                    z-index: 1060;
                    margin-top: 5px;
                }
                .lang-dropdown.open {
                    display: block;
                }
                .lang-item {
                    padding: 10px 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #555;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f9f9f9;
                }
                .lang-item:last-child {
                    border-bottom: none;
                }
                .lang-item:hover {
                    background: #eff1f3;
                }
                .lang-item img {
                    width: 18px;
                    height: auto;
                }

                .custom-nav-item[data-tooltip]::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: -35px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    white-space: nowrap;
                    visibility: hidden;
                    opacity: 0;
                    z-index: 1100;
                    pointer-events: none;
                }
                .custom-nav-item:hover::after {
                    visibility: visible;
                    opacity: 1;
                }

                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 0px !important;
                    margin-top: 50px !important;
                    min-height: calc(100vh - 50px);
                    position: relative;
                }

                /* Circular Page Styles */
                .box-solid {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }
                .box-header {
                    padding: 10px 15px;
                    border-bottom: 1px solid #f4f4f4;
                }
                .box-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                }
                .box-body {
                    padding: 15px;
                }

                .email-info {
                    padding: 15px;
                    border-bottom: 1px solid #f4f4f4;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .email-info:hover {
                    background: #f9f9f9;
                }
                .email-info i {
                    color: #555;
                    margin-right: 10px;
                }
                .h4-title {
                    margin: 0;
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                }
                
                /* Side Panel Styles */
                .side-panel {
                    position: absolute;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100%;
                    background: #fff;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                    z-index: 1050;
                    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 20px;
                    overflow-y: auto;
                }
                .side-panel.open {
                    right: 0;
                }
                .side-panel .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    cursor: pointer;
                    font-size: 20px;
                    color: #777;
                }
                .email-list-group {
                    list-style: none;
                    padding: 0;
                    margin: 15px 0;
                }
                .email-list-group li {
                    padding: 8px 0;
                    font-size: 13px;
                    color: #555;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .dividerhr {
                    border-top: 1px solid #f4f4f4;
                    margin: 10px 0;
                }
                
                .alert-info-custom {
                    background-color: #d9edf7;
                    border: 1px solid #bce8f1;
                    color: #31708f;
                    padding: 15px;
                    border-radius: 4px;
                    text-align: left;
                }

                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    .side-panel { width: 100%; right: -100%; }
                }
            `}</style>

            <div style={{ position: 'fixed', top: 0, right: '48px', height: '50px', zIndex: 1050, display: 'flex', alignItems: 'center', background: 'transparent' }} className="hide-mobile">
                <div className="custom-nav-right">
                    <div className="custom-nav-item" data-tooltip="English" ref={langDropdownRef} onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
                        <img src="https://flagcdn.com/w20/us.png" className="flag-icon" alt="English" />
                        <div className={`lang-dropdown ${isLangDropdownOpen ? 'open' : ''}`}>
                            {languages.map((lang) => (
                                <div key={lang.code} className="lang-item" onClick={() => setIsLangDropdownOpen(false)}>
                                    <img src={lang.flag} alt={lang.name} />
                                    <span>{lang.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="custom-nav-item" data-tooltip="Currency" style={{ fontWeight: 'bold' }}>INR</div>
                    <div className="custom-nav-item" data-tooltip="Switch Class"><i className="fa fa-exchange"></i></div>
                    <div className="custom-nav-item" data-tooltip="Calendar"><i className="fa fa-calendar"></i></div>
                    <div className="custom-nav-item" data-tooltip="Task"><i className="fa fa-check-square-o"></i></div>
                    <div className="custom-nav-item" data-tooltip="Chat"><i className="fa fa-whatsapp"></i></div>
                </div>
            </div>

            <Header userData={userData} handleLogout={handleLogout} />
            <Sidebar sidebarMenus={sidebarMenus} mobileNavItems={mobileNavItems} sessionYear={sessionYear} currentUrl="/user/notification" />

            <div className="content-wrapper" style={{ minHeight: "626px" }}>
                <section className="content" style={{ padding: '15px' }}>
                    <div className="box-solid">
                        <div className="box-header">
                            <h3 className="box-title">Circular</h3>
                        </div>

                        <div className="box-body">
                            {notifications.length === 0 ? (
                                <div className="alert-info-custom">
                                    No Record Found
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className="email-info" onClick={() => handleNotificationClick(notif)}>
                                        <h4 className="h4-title">
                                            <i className="fa fa-envelope-o"></i>
                                            {notif.title}
                                        </h4>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <div className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
                    <div className="close-btn" onClick={closePanel}>
                        <i className="fa fa-times"></i>
                    </div>
                    {selectedNotification && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa fa-arrow-left" style={{ cursor: 'pointer', fontSize: '16px' }} onClick={closePanel}></i>
                                <h4 className="box-title">{selectedNotification.title}</h4>
                            </div>
                            <div className="dividerhr"></div>
                            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{selectedNotification.message}</p>

                            {selectedNotification.attachment && (
                                <a href="#" className="attachment-link" style={{ color: '#3c8dbc', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                                    <i className="fa fa-download"></i>
                                    Download Attachment
                                </a>
                            )}

                            <ul className="email-list-group">
                                <li><i className="fa fa-calendar-check-o"></i>Publish Date: {selectedNotification.publish_date}</li>
                                <li><i className="fa fa-calendar"></i>Notice Date: {selectedNotification.date}</li>
                                {selectedNotification.created_by && (
                                    <li><i className="fa fa-user"></i>Created By: {selectedNotification.created_by}</li>
                                )}
                            </ul>
                            <div className="dividerhr"></div>
                        </>
                    )}
                </div>

                <div style={{ height: '40px' }}></div>
            </div>
            <Footer />
        </div>
    );
};

export default Notification;
