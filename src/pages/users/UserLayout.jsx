import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { api_users } from '../../services/api_users';

const UserLayout = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

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

    return (
        <div className="wrapper">
            <style>{`
                /* ===== SHARED USER LAYOUT STYLES ===== */

                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
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

                /* SIDEBAR STYLES */
                .content-wrapper {
                    margin-left: 80px !important;
                    padding: 0px 0px 0px 5px;
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

                /* Sidebar mega menu cards logic override */
                .fixedmenu { display: none !important; }

                /* MOBILE RESPONSIVE */
                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    
                    /* Global Spacing Reductions for All Pages on Mobile */
                    .content { padding-bottom: 5px !important; }
                    .box, .box-info, .dashboard-card, .notice-board-card, .oc-box {
                        margin-bottom: 5px !important;
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                    }
                }

                /* Mobile back button (used by child pages) */
                @media (max-width: 769px) {
                    .mobile-box-back-btn {
                        display: flex !important;
                        align-items: center;
                        gap: 5px;
                        background-color: #9c68e4 !important;
                        color: #fff !important;
                        border: none;
                        padding: 6px 15px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                        position: absolute !important;
                        top: 8px !important;
                        right: 10px !important;
                        z-index: 100 !important;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }
            `}</style>

            <Header
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
            />
            <Sidebar
                sessionYear={sessionYear}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Child page content rendered here via React Router */}
            <Outlet />

            <Footer />
        </div>
    );
};

export default UserLayout;
