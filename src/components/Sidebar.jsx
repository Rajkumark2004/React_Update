import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import TopSidebar from './TopSidebar';

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

        // Help Desk - active for /admin/enquiry and related paths
        if (menuUrl === '/admin/enquiry' && currentPath.startsWith('/admin/enquiry')) return true;

        // SIS - active for /student paths but NOT /student-attendance
        if (menuUrl === '/student/search' && currentPath.startsWith('/student') && !currentPath.startsWith('/student-attendance') && !currentPath.startsWith('/studentfee')) return true;

        // Attendance - active for /student-attendance paths
        if (menuUrl === '/student-attendance' && currentPath.startsWith('/student-attendance')) return true;

        // Human Resource - active for /admin/staff paths
        if (menuUrl === '/admin/staff/search' && currentPath.startsWith('/admin/staff')) return true;

        // State Examination - active for /cbseexam and /admin/rank paths
        if (menuUrl === '/cbseexam/exam' && (currentPath.startsWith('/cbseexam') || currentPath.startsWith('/admin/rank') || currentPath.startsWith('/admin/cbseexam'))) return true;

        // Settings - active for /settings paths
        if (menuUrl === '/settings' && currentPath.startsWith('/settings')) return true;

        // Courses - active for /admin/onlinecourse
        if (menuUrl === '/admin/onlinecourse' && currentPath.startsWith('/admin/onlinecourse')) return true;

        // Messages - active for /admin/notification and related paths
        if (menuUrl === '/admin/notification' && (currentPath.startsWith('/admin/notification') || currentPath.startsWith('/admin/mail'))) return true;

        // Exact match for any other routes
        return currentPath === menuUrl;
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
        '/admin/onlinecourse'
    ];

    // Default menus - only SIS and System Settings have working pages
    const defaultSidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 4, icon: 'homework.png', label: 'Homework', url: '/homework' },
        { id: 5, icon: 'Fees.png', label: 'Fees Collection', url: '/studentfee' },
        { id: 6, icon: 'academics.png', label: 'Academics', url: '/admin/timetable/classreport' },
        { id: 7, icon: 'state_examination.png', label: 'State Examinations', url: '/cbseexam/exam' },
        { id: 8, icon: 'courses.png', label: 'Courses', url: '/admin/onlinecourse' },
        { id: 9, icon: 'transport.png', label: 'Transport', url: '/admin/route' },
        { id: 10, icon: 'messages.png', label: 'Messages', url: '/admin/notification' },
        { id: 11, icon: 'hr.png', label: 'Human Resource', url: '/admin/staff/search' },
        { id: 12, icon: 'download_resouces.png', label: 'Download Center', url: '#' },
        { id: 13, icon: 'certificate.png', label: 'Certificate', url: '#' },
        { id: 14, icon: 'income.png', label: 'Income', url: '/admin/income' },
        { id: 15, icon: 'expenses.png', label: 'Expenses', url: '/admin/expense' },
        { id: 16, icon: 'hostle.png', label: 'Hostel', url: '#' },
        { id: 17, icon: 'reports.png', label: 'Reports', url: '#' },
        { id: 18, icon: 'settings.png', label: 'System Settings', url: '/settings' }
    ];

    const menus = sidebarMenus.length > 0 ? sidebarMenus : defaultSidebarMenus;

    // Mobile Menu State
    const [showMobileMore, setShowMobileMore] = React.useState(false);

    // Default mobile nav items
    const defaultMobileNavItems = [
        { id: 1, icon: 'dashboard.png', label: 'Dashboard', url: '/dashboard' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/daily-attendance-report' }, // Updated to daily report as per recent work
        { id: 4, icon: 'more', label: 'More', url: '#', isMore: true },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const mobileItems = mobileNavItems.length > 0 ? mobileNavItems : defaultMobileNavItems;

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
                    <TopSidebar sessionYear={sessionYear} />

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
            </aside>

            {/* Mobile Bottom Navigation - Visible on Mobile Only */}
            <nav className="mobile-bottom-nav hide-desktop shadow-sm" id="bottom-menu">
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
                                        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center', height: '20px' }}>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#666' }}></div>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#666' }}></div>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#666' }}></div>
                                        </div>
                                    </div>
                                    <span>More</span>
                                </a>
                            ) : item.isLogout ? (
                                <a href="#" onClick={(e) => { e.preventDefault(); /* Trigger logout if passed prop */ }}>
                                    <div className="mobile-icon-container">
                                        <img src={logoutIconUrl} alt="Logout" style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>Logout</span>
                                </a>
                            ) : (
                                <Link to={item.url}>
                                    <div className="mobile-icon-container">
                                        {item.icon === 'dashboard.png' ? <i className="fa fa-dashboard" style={{ fontSize: '20px', color: '#666' }}></i> :
                                            <img src={`/images/${item.icon}`} alt={item.label} style={{ width: '20px', height: '20px' }} />
                                        }
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Mobile More Menu Overlay */}
            {showMobileMore && (
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
                                    to={menu.url}
                                    className="mobile-more-item"
                                    onClick={() => setShowMobileMore(false)}
                                >
                                    <div className="more-icon">
                                        <img src={`/images/${menu.icon}`} alt={menu.label} />
                                    </div>
                                    <span>{menu.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
