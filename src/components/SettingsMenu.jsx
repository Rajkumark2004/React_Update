import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../utils/include_files.js'; // Updated path
import api from '../services/api'; // Updated path
import '../pages/dashboard/dashboard_test.css'; // Updated path
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

// Load settings icons dynamically
const settingsIcons = import.meta.glob('../backend/images/sidebar/submenu/system_settings/*.png', { eager: true, query: '?url', import: 'default' });

const getIconPath = (filename) => {
    // Construct the relative path expected by glob key
    const path = `../backend/images/sidebar/submenu/system_settings/${filename}`;
    return settingsIcons[path] || '';
};

const SettingsMenu = ({ children, hideSidebars = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determines if we should show the Category Sub-menu (Col 2)
    // Show if we are deeper than /settings, specifically in general settings or if children are present
    const showCategoryMenu = location.pathname.startsWith('/settings');

    // Mock Data for Header - Duplicated for now to keep standalone, or could import utils
    const pendingTasks = [
        { id: 1, title: 'Review student applications' },
        { id: 2, title: 'Prepare monthly report' },
        { id: 3, title: 'Update fee structure' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search submitted');
    };

    // Mock Data
    const appName = 'School Management System';
    const sessionYear = '2024-25';

    // Get logged-in user
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
        }
    }, []);

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

    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    // Sidebar items
    // Sidebar items



    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar

                handleSearch={handleSearch}
                sessionYear={sessionYear}
                currentUrl={location.pathname}
            />

            {/* Content Wrapper */}
            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        {/* FIRST COLUMN: Settings Main Categories */}
                        {showCategoryMenu && !hideSidebars && (
                            <div className="col-md-2">
                                <div className="box border0">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Settings</h3>
                                    </div>
                                    <ul className="tablists">
                                        <li>
                                            <Link to="/settings" className={location.pathname === '/settings' || location.pathname.startsWith('/settings/') ? "active" : ""}>
                                                <img src={getIconPath('1.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> General Setting
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/sessions" className={location.pathname.startsWith('/sessions') ? "active" : ""}>
                                                <img src={getIconPath('2.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Session Setting
                                            </Link>
                                        </li>
                                        <li>
                                            <a href="#" onClick={(e) => e.preventDefault()}>
                                                <img src={getIconPath('3.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Notification Setting
                                            </a>
                                        </li>
                                        <li>
                                            <Link to="/sms-settings" className={location.pathname.startsWith('/sms-settings') ? "active" : ""}>
                                                <img src={getIconPath('4.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> SMS Setting
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/email-settings" className={location.pathname.startsWith('/email-settings') ? "active" : ""}>
                                                <img src={getIconPath('5.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Email Setting
                                            </Link>
                                        </li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('6.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Payment Methods</a></li>
                                        <li>
                                            <Link to="/print-header-footer" className={location.pathname.startsWith('/print-header-footer') ? "active" : ""}>
                                                <img src={getIconPath('7.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Print Header Footer
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/settings/front-cms" className={location.pathname.startsWith('/settings/front-cms') ? "active" : ""}>
                                                <img src={getIconPath('8.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Front CMS Setting
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/settings/roles" className={location.pathname.startsWith('/settings/roles') ? "active" : ""}>
                                                <img src={getIconPath('10.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Roles Permissions
                                            </Link>
                                        </li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('11.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Backup Restore</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('12.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Languages</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('14.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Users</a></li>
                                        <li>
                                            <Link to="/settings/modules" className={location.pathname.startsWith('/settings/modules') ? "active" : ""}>
                                                <img src={getIconPath('15.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Modules
                                            </Link>
                                        </li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('16.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Custom Fields</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('17.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Captcha Setting</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('18.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> System Fields</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('19.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Student Profile Update</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('20.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Online Admission</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('22.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> File Types</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src={getIconPath('21.png')} alt="icon" className="img-fluid" style={{ width: '20px' }} /> Sidebar Menu</a></li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* SECOND COLUMN: Sub-menu (Conditional) */}
                        {showCategoryMenu && !hideSidebars && (
                            <div className="col-md-2">
                                <div className="box border0">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Settings</h3>
                                    </div>
                                    <ul className="tablists">
                                        {/* Dynamic sub-menu generation could go here, for now static for General */}
                                        <li><Link to="/settings" className={location.pathname === '/settings' ? "active" : ""}>General Setting</Link></li>
                                        <li><Link to="/settings/logo" className={location.pathname.includes('/settings/logo') ? "active" : ""}>Logo</Link></li>
                                        <li><Link to="/settings/login-page-background" className={location.pathname.includes('/settings/login-page-background') ? "active" : ""}>Login Page Background</Link></li>
                                        <li><Link to="/settings/mobile-app" className={location.pathname.includes('/settings/mobile-app') ? "active" : ""}>Mobile App</Link></li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* THIRD COLUMN: Content/Form */}
                        {children && (
                            <div className={hideSidebars ? "col-md-12" : (showCategoryMenu ? "col-md-8" : "col-md-12")}>
                                {children}
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
            <div className="control-sidebar-bg"></div>
        </div>
    );
};

export default SettingsMenu;
