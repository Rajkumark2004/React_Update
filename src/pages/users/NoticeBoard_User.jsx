import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const NoticeBoard_User = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "student",
        id: "",
        avatar: "/uploads/student_images/1.jpg",
        adminLogoUrl: ""
    });

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            setUserData(prev => ({
                ...prev,
                name: userObj.username || "User",
                role: userObj.role || 'student',
                avatar: userObj.image || "/uploads/student_images/1.jpg"
            }));
        }

        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api_users.getNotifications();
            if (response && response.status) {
                setNotifications(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleNotificationClick = (notif) => {
        setSelectedNotification(notif);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    const sessionYear = currentSession?.session || '2024-25';

    return (
        <>
            <style>{`
                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper, .main-footer {
                    margin-left: 77px !important;
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

                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 15px !important;
                    margin-top: 40px !important;
                    padding-right: 0px;
                    min-height: calc(100vh - 50px);
                    position: relative;
                }

                /* Circular Page Styles */
                .box-solid {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin: 10px 6px 180px 10px;
                }
                .box-header {
                    padding: 10px 15px;
                    border-bottom: 1px solid #f4f4f4;
                }
                .box-title {
                     margin: 0;
                    font-size: 20px;
                    font-weight: 400;
                    color: #333;
                    flex: 1;
                }
                .box-body {
                    padding: 0px;
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
                    color: #0084b4;
                    margin-right: 10px;
                }
                .h4-title {
                    margin: 0;
                    font-size: 14px;
                    color: #0084b4;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                }
                
                /* Side Panel Styles */
                .side-panel {
                    position: absolute;
                    top: 0;
                    margin-top: 20px;
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

                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    /* Padding balancing for mobile */
                    .content-wrapper { padding-left: 0px !important; padding-right: 0px !important; }
                    .content { padding-left: 10px !important; padding-right: 10px !important; }
                    .side-panel { width: 100%; right: -100%; }

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
                        top: 5px !important;
                        right: 10px !important;
                        z-index: 100 !important;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .content{
                        padding:5px 5px 0px 0px !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* NoticeBoard page specific */
                .nb-content { padding: 4px; }
                .nb-box-wrapper { position: relative; }
                .nb-panel-header { display: flex; align-items: center; gap: 10px; }
                .nb-panel-back { cursor: pointer; font-size: 16px; }
                .nb-panel-message { font-size: 14px; color: #555; line-height: 1.6; }
                .nb-attachment-link { color: #3c8dbc; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; }
                .nb-spacer { height: 40px; }
            `}</style>
            <div className="content-wrapper">
                <section className="content nb-content">
                    <div className="box-solid nb-box-wrapper">
                        <div className="box-header">
                            <h3 className="box-title">Notice Board</h3>
                            <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>

                        <div className="box-body">
                            {loading ? (
                                <div className="text-center">Loading...</div>
                            ) : notifications.length === 0 ? (
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
                            <div className="nb-panel-header">
                                <i className="fa fa-arrow-left nb-panel-back" onClick={closePanel}></i>
                                <h4 className="box-title">{selectedNotification.title}</h4>
                            </div>
                            <div className="dividerhr"></div>
                            <div className="nb-panel-message" dangerouslySetInnerHTML={{ __html: selectedNotification.message }} />

                            {selectedNotification.attachment && (
                                <a href={`https://newlayout.wisibles.com/uploads/school_content/material/${selectedNotification.attachment}`} target="_blank" rel="noreferrer" className="attachment-link nb-attachment-link">
                                    <i className="fa fa-download"></i>
                                    Download Attachment
                                </a>
                            )}

                            <ul className="email-list-group">
                                <li><i className="fa fa-calendar-check-o"></i>Publish Date: {selectedNotification.publish_date}</li>
                                <li><i className="fa fa-calendar"></i>Notice Date: {selectedNotification.date}</li>
                                {(selectedNotification.name || selectedNotification.surname) && (
                                    <li><i className="fa fa-user"></i>Created By: {selectedNotification.name} {selectedNotification.surname}</li>
                                )}
                            </ul>
                            <div className="dividerhr"></div>
        </>)}
                </div>

                <div className="nb-spacer"></div>
            </div>
        </>
    );
};

export default NoticeBoard_User;
