import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api_users } from '../../../services/api_users';
import { LogOut } from 'lucide-react';

const Sidebar = ({
    sidebarMenus = [],
    mobileNavItems = [],
    handleSearch,
    sessionYear,
    currentUrl, // To determine active state
    loading = false,
    isSidebarOpen = false,
    toggleSidebar
}) => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Function to check if a menu item is active
    const isMenuActive = (menuUrl) => {
        if (menuUrl === '#') return false;

        // Exact match
        if (currentPath === menuUrl) return true;

        // Special case to prevent /user/syllabus from incorrectly highlighting on /user/syllabus/status
        if (menuUrl === '/user/syllabus' && currentPath.startsWith('/user/syllabus/status')) {
            return false;
        }

        // Exact match for any other routes or startsWith
        return currentPath.startsWith(menuUrl + '/');
    };

    // Available routes in the app - only these will have working links
    const availableRoutes = [
        '/dashboard',
        '/settings',
        '/settings/logo',
        '/settings/login-page-background',
        '/settings/mobile-app',
        '/settings/front-cms',
        '/sessions',
        '/sms-settings',
        '/email-settings',
        '/print-header-footer',
        '/student/search',
        '/student/create',
        '/admin/onlinestudent',
        '/cbseexam/exam',
        '/admin/rank',
        '/admin/staff/search',
        '/admin/source',
        '/admin/reference',
        '/homework',
        '/admin/mail',
        '/admin/mail/email_sms_log',
        '/admin/mail/email_template',
        '/admin/notification',
        '/admin/mail/sms_template',
        '/admin/mail/schedule_log',
        '/admin/mail/send_reminders',
        '/admin/notification_class/add',
        '/admin/notification_class/edit',
        '/admin/mailsms/edit_schedule',
        '/admin/income',
        '/admin/incomehead',
        '/admin/expense',
        '/admin/expensehead',
        '/admin/onlinecourse',
        '/admin/hostelroom',
        '/admin/studenthostelreport',
        '/admin/roomtype',
        '/admin/roomtype/edit',
        '/admin/hostel',
        '/admin/hostel/edit',
        '/admin/hostel/edit',
        '/admin/content/assignment',
        '/admin/content/studymaterial',
        '/admin/content/syllabus',
        '/admin/content/other',
        '/admin/content/worksheets',
        '/admin/content/createcontent',
        '/admin/content/edit',
        '/admin/content/editpost',
        '/admin/content/search',
        '/admin/video_tutorial',
        '/admin/reports/student_information'
    ];


    // --- Permission-based filtering ---
    const [studentPermissions, setStudentPermissions] = useState([]);
    const [parentPermissions, setParentPermissions] = useState([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    // Determine user type from localStorage
    const userType = useMemo(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                return parsed.role || parsed.usertype || 'student';
            }
        } catch (e) { /* ignore */ }
        return 'student';
    }, []);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await api_users.getModulePermissions();
                setStudentPermissions(data.studentpermissionList || []);
                setParentPermissions(data.parentpermissionList || []);
            } catch (err) {
                console.error('Failed to fetch module permissions:', err);
            } finally {
                setPermissionsLoaded(true);
            }
        };
        fetchPermissions();
    }, []);

    const defaultSidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Dashboard', url: '/user/dashboard', alwaysVisible: true },
        { id: 3, icon: 'student.png', label: 'My Profile', url: '/user/profile', alwaysVisible: true },
        { id: 15, icon: 'attendance.png', label: 'Attendance', url: '/user/attendance', permissionShortCode: 'attendance' },
        { id: 4, icon: 'Fees.png', label: 'Fees', url: '/user/getfees', permissionShortCode: 'fees' },
        { id: 5, icon: 'noticeboard.png', label: 'Circular', url: '/user/notification', permissionShortCode: 'notice_board' },
        { id: 6, icon: 'homework.png', label: 'Student Assessment', url: '/user/studentassessment', permissionShortCode: 'examinations' },
        { id: 7, icon: 'timetable.png', label: 'Class Timetable', url: '/user/timetable', alwaysVisible: true },
        { id: 8, icon: 'homework.png', label: 'Lesson Plan', url: '/user/syllabus', permissionShortCode: 'lesson_plan' },
        { id: 9, icon: 'syllabus.png', label: 'Syllabus Status', url: '/user/syllabus/status', permissionShortCode: 'syllabus_status' },
        { id: 10, icon: 'homework.png', label: 'Homework', url: '/user/homework', permissionShortCode: 'homework' },
        { id: 18, icon: 'homework.png', label: 'Daily Assignment', url: '/user/daily_assignment', permissionShortCode: 'homework' },
        { id: 11, icon: 'courses.png', label: 'Courses', url: '/user/onlinecourse', permissionShortCode: 'online_course' },
        { id: 12, icon: 'applyleave.png', label: 'Apply Leave', url: '/user/apply_leave', permissionShortCode: 'apply_leave' },
        { id: 13, icon: 'visitorbook.png', label: 'Visitor Book', url: '/user/visitors', permissionShortCode: 'visitor_book' },
        { id: 14, icon: 'download_resouces.png', label: 'Download Center', url: '/user/content/list', permissionShortCode: 'download_center' },
        { id: 16, icon: 'helpdesk.png', label: 'State Examination', url: '/user/examresult', permissionShortCode: 'cbseexam' },
        { id: 17, icon: 'noticeboard.png', label: 'Notice Board', url: '/user/notice_board', permissionShortCode: 'notice_board' },
        { id: 19, icon: 'transport.png', label: 'Transport Route', url: '/user/route', permissionShortCode: 'transport_routes' },
        { id: 21, icon: 'hostle.png', label: 'Hostel Rooms', url: '/user/hostelroom', permissionShortCode: 'hostel_rooms' }
    ];

    // Build a Set of active short_codes based on user type
    const activePermissions = useMemo(() => {
        const set = new Set();
        const isParent = userType.toLowerCase() === 'parent';
        const list = isParent ? parentPermissions : studentPermissions;
        list.forEach(p => {
            const field = isParent ? p.parent : p.student;
            if (field === '1') set.add(p.short_code);
        });
        return set;
    }, [studentPermissions, parentPermissions, userType]);

    const allMenus = sidebarMenus.length > 0 ? sidebarMenus : defaultSidebarMenus;

    // Filter menus based on permissions
    const menus = useMemo(() => {
        return allMenus.filter(menu => {
            if (menu.alwaysVisible) return true;
            if (!menu.permissionShortCode) return true;
            return activePermissions.has(menu.permissionShortCode);
        });
    }, [allMenus, activePermissions]);

    // Mobile Menu State
    const [showMobileMore, setShowMobileMore] = React.useState(false);

    // Default mobile nav items
    const defaultMobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '#' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '/user/getfees' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/user/attendance' },
        { id: 4, icon: 'settings.png', label: 'More', url: '#', isMore: true },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const mobileItems = mobileNavItems.length > 0 ? mobileNavItems : defaultMobileNavItems;

    const navigate = useNavigate();

    const handleMobileLogout = async (e) => {
        e.preventDefault();
        // Just clear local state and navigate for user
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    // Handle click for disabled links
    const handleDisabledClick = (e, url) => {
        if (url === '#') {
            e.preventDefault();
        }
    };

    // Logout specific icon
    const logoutIconUrl = "https://newlayout.wisibles.com/backend/images/sidebar/logout.png";

    return (
        <>
            {/* Sidebar Overlay - Close sidebar when clicking outside on mobile */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay hide-desktop"
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 805,
                        display: 'block'
                    }}
                ></div>
            )}

            {/* Desktop Sidebar - Hidden on Mobile via CSS transform, slides in via .sidebar-open */}
            <aside className={`main-sidebar ${isSidebarOpen ? 'open' : ''}`} id="alert2" style={{ overflowX: 'hidden' }}>
                {/* Sidebar Search Form */}
                <form className="navbar-form navbar-left search-form2" role="search" onSubmit={(e) => {
                    e.preventDefault();
                    if (handleSearch) handleSearch(e);
                }}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="search_text"
                            className="form-control search-form"
                            placeholder="Search by student name"
                        />
                        <span className="input-group-btn">
                            <button
                                type="submit"
                                className="btn btn-flat"
                                style={{
                                    padding: '3px 12px',
                                    borderRadius: '0px 30px 30px 0px',
                                    background: '#fff'
                                }}
                            >
                                <i className="fa fa-search"></i>
                            </button>
                        </span>
                    </div>
                </form>

                <section className="sidebar" id="sibe-box">
                    <ul className="sidebar-menu verttop" style={{ paddingLeft: '0px' }}>
                        {menus.map((menu) => {
                            const active = isMenuActive(menu.url);
                            return (
                                <li
                                    key={menu.id}
                                    className={`treeview ${active ? 'active' : ''}`}
                                    style={{
                                        position: 'relative',
                                        minHeight: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {/* Active indicator - white bar on right */}
                                    {active && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                width: '2px',
                                                height: '100%',
                                                backgroundColor: '#fff',
                                                borderRadius: '0 1px 1px 0'
                                            }}
                                        />
                                    )}
                                    {menu.url === '#' ? (
                                        <a
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '6px 0'
                                            }}
                                        >
                                            <img
                                                width="28px"
                                                src={`/images/${menu.icon}`}
                                                alt={menu.label}
                                                className="img-fluid"
                                                style={{ marginBottom: '5px' }}
                                            />
                                            <span
                                                className="sidebar-small-text"
                                                style={{
                                                    display: 'block',
                                                    whiteSpace: 'normal',
                                                    wordWrap: 'break-word',
                                                    textAlign: 'center',
                                                    maxWidth: '70px',
                                                    overflow: 'hidden',
                                                    lineHeight: '1.2',
                                                    color: '#fff',
                                                    fontWeight: '700',
                                                    fontSize: '11pt'
                                                }}>
                                                {menu.label}
                                            </span>
                                        </a>
                                    ) : (
                                        <Link
                                            to={menu.url}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '6px 0'
                                            }}
                                        >
                                            <img
                                                width="28px"
                                                src={`/images/${menu.icon}`}
                                                alt={menu.label}
                                                className="img-fluid"
                                                style={{ marginBottom: '5px' }}
                                            />
                                            <span
                                                className="sidebar-small-text"
                                                style={{
                                                    display: 'block',
                                                    whiteSpace: 'normal',
                                                    wordWrap: 'break-word',
                                                    textAlign: 'center',
                                                    maxWidth: '70px',
                                                    overflow: 'hidden',
                                                    lineHeight: '1.2',
                                                    color: '#fff',
                                                    fontWeight: '700',
                                                    fontSize: '11px'
                                                }}>
                                                {menu.label}
                                            </span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </aside >

            {/* Mobile Bottom Navigation - Visible on Mobile Only */}
            < nav className="mobile-bottom-nav hide-desktop shadow-sm" id="bottom-menu" >
                <ul className="bottom-menu-list" style={{ background: '#9854cb' }}>
                    {mobileItems.map((item) => (
                        <li key={item.id} className="mobile-nav-item">
                            {item.isMore ? (
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setShowMobileMore(!showMobileMore); }}
                                    className={showMobileMore ? 'active' : ''}
                                >
                                    <div className="mobile-icon-container">
                                        <img src="https://newlayout.wisibles.com/backend/images/sidebar/dots.png" alt="More" style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>More</span>
                                </a>
                            ) : item.isLogout ? (
                                <a href="#" onClick={handleMobileLogout}>
                                    <div className="mobile-icon-container">
                                        <img src={logoutIconUrl} alt="Logout" style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>Logout</span>
                                </a>
                            ) : (
                                <Link to={item.url}>
                                    <div className="mobile-icon-container">
                                        <img src={`/images/${item.icon}`} alt={item.label} style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav >

            {/* Mobile More Menu Overlay */}
            {
                showMobileMore && (
                    <div className="mobile-more-overlay hide-desktop">
                        <div className="mobile-more-content">
                            <div className="mobile-more-header">
                                <h4>Menu</h4>
                                <button onClick={() => setShowMobileMore(false)} className="close-btn">&times;</button>
                            </div>
                            <div className="mobile-more-grid">
                                {menus.map((menu) => (
                                    <Link
                                        key={menu.id}
                                        to={menu.url !== '#' ? menu.url : '#'}
                                        className="mobile-more-item"
                                        onClick={(e) => {
                                            if (menu.url === '#') e.preventDefault();
                                            else setShowMobileMore(false);
                                        }}
                                    >
                                        <div className="more-icon" style={{ backgroundColor: '#9854cb', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px' }}>
                                            <img src={`/images/${menu.icon}`} alt={menu.label} style={{ width: '22px', height: 'auto' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', marginTop: '5px', display: 'block', color: '#333' }}>{menu.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Sidebar;
