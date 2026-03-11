
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api_users } from '../../../services/api_users';
import '../../../utils/include_files.js';

const Gallery = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "T. Srinivasulu",
        role: "Student",
        id: "12345",
        avatar: "/uploads/student_images/1.jpg"
    });

    // Language Dropdown State
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);

    // Search and Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const categories = [
        { id: 1, name: "School Events", created_at: "2024-01-10 10:30:00" },
        { id: 2, name: "Science Exhibition", created_at: "2024-01-15 11:45:00" }
    ];

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.id.toString().includes(searchTerm) ||
        category.created_at.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                
                .custom-nav-item:hover {
                    background: transparent !important;
                }

                .custom-nav-item i {
                    font-size: 18px;
                }
                
                .flag-icon {
                    width: 22px;
                    height: 14px;
                    border: 1px solid #eee;
                }

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
                }

                /* TABLE BOX STYLING */
                .box-info {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 1px 1px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }

                .box-header {
                    padding: 10px 0;
                    border-bottom: 1px solid #f4f4f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .box-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                    padding-right: 1260px;
                }

                .box-body {
                    padding: 15px;
                    border-top: 1px solid #eee;
                }

                .table {
                    width: 100%;
                    margin-bottom: 5px;
                    border-collapse: collapse;
                }

                .table th {
                    border-bottom: 1px solid #eee;
                    padding: 10px 8px;
                    color: #333;
                    font-weight: 600;
                    font-size: 13px;
                    text-align: left;
                }

                .table td {
                    padding: 10px 8px;
                    border-bottom: 1px solid #eee;
                    color: #666;
                    font-size: 13px;
                }

                .table-hover tbody tr:hover {
                    background-color: #f9f9f9;
                }

                .table-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    align-items: flex-end;
                }

                .search-box input {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 4px 0;
                    font-size: 12px;
                    outline: none;
                    width: 150px;
                    background: transparent;
                }

                .export-icons {
                    display: flex;
                    gap: 4px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 4px;
                }

                .export-btn {
                    padding: 2px 4px;
                    color: #777;
                    cursor: pointer;
                    font-size: 14px;
                    transition: color 0.2s;
                }

                // .export-btn:hover {
                //     color: ${themeColor};
                // }

                .table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 5px 0;
                    color: #888;
                    font-size: 11px;
                }

                .pagination {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .page-item {
                    cursor: pointer;
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 11px;
                    padding: 0;
                }

                .page-item.active {
                    color: ${themeColor};
                    font-weight: bold;
                }

                .action-btn {
                    color: #777;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                // .action-btn:hover {
                //     color: ${themeColor};
                // }

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

            <div style={{
                position: 'fixed',
                top: 0,
                right: '48px',
                height: '50px',
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                background: 'transparent'
            }} className="hide-mobile">
                <div className="custom-nav-right">
                    <div
                        className="custom-nav-item"
                        data-tooltip="English"
                        ref={langDropdownRef}
                        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    >
                        <img src="https://flagcdn.com/w20/us.png" className="flag-icon" alt="English" />

                        {/* Language Dropdown */}
                        <div className={`lang-dropdown ${isLangDropdownOpen ? 'open' : ''}`}>
                            {languages.map((lang) => (
                                <div key={lang.code} className="lang-item" onClick={() => setIsLangDropdownOpen(false)}>
                                    <img src={lang.flag} alt={lang.name} />
                                    <span>{lang.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="custom-nav-item" data-tooltip="Currency" style={{ fontWeight: 'bold' }}>
                        INR
                    </div>
                    <div className="custom-nav-item" data-tooltip="Switch Class">
                        <i className="fa fa-exchange"></i>
                    </div>
                    <div className="custom-nav-item" data-tooltip="Calendar">
                        <i className="fa fa-calendar"></i>
                    </div>
                    <div className="custom-nav-item" data-tooltip="Task">
                        <i className="fa fa-check-square-o"></i>
                    </div>
                    <div className="custom-nav-item" data-tooltip="Chat">
                        <i className="fa fa-whatsapp"></i>
                    </div>
                </div>
            </div>

            <Header
                userData={userData}
                handleLogout={handleLogout}
            />

            <Sidebar
                sidebarMenus={sidebarMenus}
                mobileNavItems={mobileNavItems}
                sessionYear={sessionYear}
                currentUrl="/user/content/gallery"
            />

            <div className="content-wrapper" style={{ minHeight: "626px" }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-info">
                                <div className="box-header">
                                    <h3 className="box-title">Gallery Category</h3>
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

                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Category Name</th>
                                                    <th>Created At</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCategories.length > 0 ? (
                                                    filteredCategories.map((category) => (
                                                        <tr key={category.id}>
                                                            <td>{category.id}</td>
                                                            <td>{category.name}</td>
                                                            <td>{category.created_at}</td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <i
                                                                    className="fa fa-reorder action-btn"
                                                                    title="View List"
                                                                    onClick={() => navigate('/user/content/gallery_list')}
                                                                ></i>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No categories found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="table-footer">
                                        <div>Records: {filteredCategories.length > 0 ? `1 to ${filteredCategories.length} of ${filteredCategories.length}` : '0 of 0'}</div>
                                        <div className="pagination">
                                            <div className="page-item">&lt;</div>
                                            <div className="page-item active">1</div>
                                            <div className="page-item">&gt;</div>
                                        </div>
                                    </div>
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

export default Gallery;
