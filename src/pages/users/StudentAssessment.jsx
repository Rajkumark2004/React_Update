
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';

const StudentAssessment = () => {
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

    const [searchTerm, setSearchTerm] = useState('');
    const [assessmentList, setAssessmentList] = useState([]); // Empty state per image

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
        { id: 6, icon: 'homework.png', label: 'Student Assessment', url: '/user/studentdairy' },
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
                }

                /* HIDE DUPLICATE NAVBAR ICONS */
                .navbar-custom-menu .nav > li:not(.user-menu) {
                    display: none !important;
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
                    min-height: calc(100vh - 70px);
                }

                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                /* Assessment Styles */
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

                .table-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    align-items: flex-end;
                    padding-bottom: 5px;
                }

                .search-box input {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 4px 0;
                    font-size: 13px;
                    outline: none;
                    width: 150px;
                    background: transparent;
                }

                .export-icons {
                    display: flex;
                    gap: 5px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 2px;
                }

                .export-btn {
                    padding: 2px 4px;
                    color: #888;
                    cursor: pointer;
                    font-size: 16px;
                    transition: color 0.2s;
                }
                
                .assessment-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .assessment-table th {
                    border-bottom: 1px solid #eee;
                    padding: 8px 10px;
                    text-align: left;
                    font-size: 12px;
                    color: #333;
                    font-weight: 600;
                }
                .assessment-table td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #eee;
                    font-size: 12px;
                    color: #555;
                }

                .empty-state {
                    text-align: center;
                    padding: 20px 0;
                }
                .empty-state-img {
                    width: 120px;
                    margin: 15px auto;
                    display: block;
                }
                .empty-text-red {
                    color: #f2a6a6;
                    font-size: 13px;
                    margin-bottom: 5px;
                }
                .empty-text-green {
                    color: #367c3d;
                    font-size: 13px;
                    cursor: pointer;
                    text-decoration: none;
                }
                .empty-text-green i {
                    margin-right: 5px;
                }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }

                .footer-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: #999;
                    margin-top: 10px;
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
            <Sidebar sidebarMenus={sidebarMenus} mobileNavItems={mobileNavItems} sessionYear={sessionYear} currentUrl="/user/studentdairy" />

            <div className="content-wrapper">
                <section className="content" style={{ padding: '15px' }}>
                    <div className="box-solid">
                        <div className="box-header">
                            <h3 className="box-title">Student Assessment</h3>
                        </div>

                        <div className="box-body">
                            <div className="table-controls">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="export-icons">
                                    <i className="fa fa-files-o export-btn" title="Copy"></i>
                                    <i className="fa fa-file-excel-o export-btn" title="Excel"></i>
                                    <i className="fa fa-file-text-o export-btn" title="CSV"></i>
                                    <i className="fa fa-file-pdf-o export-btn" title="PDF"></i>
                                    <i className="fa fa-print export-btn" title="Print"></i>
                                    <i className="fa fa-columns export-btn" title="Columns"></i>
                                </div>
                            </div>

                            <table className="assessment-table">
                                <thead>
                                    <tr>
                                        <th>Class</th>
                                        <th>Section</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assessmentList.length > 0 ? (
                                        assessmentList.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.class}</td>
                                                <td>{item.section}</td>
                                                <td>{item.date}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <i className="fa fa-reorder" style={{ cursor: 'pointer', color: '#777' }}></i>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">
                                                <div className="empty-state">
                                                    <div className="empty-text-red">No data available in table</div>
                                                    <img
                                                        src="../public/images/empty.svg"
                                                        alt="No data"
                                                        className="empty-state-img"
                                                    />
                                                    <div className="empty-text-green">
                                                        <i className="fa fa-arrow-left"></i> Add new record or search with different criteria.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="footer-stats">
                                <span>Records: 0 to 0 of 0</span>
                                <span>&lt; &gt;</span>
                            </div>
                        </div>
                    </div>
                </section>
                <div style={{ height: '40px' }}></div>
            </div>
            <Footer />
        </div>
    );
};

export default StudentAssessment;
