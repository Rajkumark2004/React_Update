import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';
import { api_users } from '../../services/api_users';

const Timetable = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const [isLoading, setIsLoading] = useState(true);
    const [timetable, setTimetable] = useState({});
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    initialName = userObj.username || "User";
                    setUserData(prev => ({
                        ...prev,
                        name: initialName,
                        role: userObj.role || 'student',
                        avatar: userObj.image || "/uploads/student_images/no_image.png"
                    }));
                }

                const dashRes = await api_users.getUserDashboard();
                if (dashRes && dashRes.status && dashRes.data && dashRes.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: dashRes.data.student.name || initialName,
                        id: dashRes.data.student.id || prev.id,
                        adminLogoUrl: dashRes.data.sch_setting?.admin_logo && dashRes.data.sch_setting?.base_url
                            ? `${dashRes.data.sch_setting.base_url}uploads/school_content/admin_logo/${dashRes.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }

                const res = await api_users.getTimetable();
                if (res && res.status && res.data && res.data.timetable) {
                    setTimetable(res.data.timetable);
                }
            } catch (error) {
                console.error("Failed to load timetable:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

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
        <>
            <style>{`
                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }


                /* Match profile icon spacing to English/Currency/Switch Class (all 0 12px) */
                .navbar-custom-menu .nav > li.user-menu > a {
                    padding: 0 12px !important;
                }

                /* Group all 4 nav items together on the right with no gap between sections */
                .navbar-static-top .pull-right {
                    display: flex !important;
                    align-items: center !important;
                    gap: 0 !important;
                }
                .navbar-static-top .pull-right .custom-nav-right {
                    display: flex !important;
                    align-items: center !important;
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

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper {
                    margin-left: 80px !important;
                    padding: 0px 4px 0px 4px !important;
                }
                .main-footer {
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

                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 3px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 50px);
                }
                .attachment-block {
                    border: 1px solid #f4f4f4;
                    padding: 10px;
                    margin-bottom: 15px;
                    background: #f7f7f7;
                    border-radius: 4px;
                }
                .attachment-block-normal {
                    border-left: 3px solid ${themeColor};
                }
                .block-b-noraml {
                    border-left: 3px solid #dd4b39;
                }
                .relative { position: relative; }
                .attachment-left-space { padding-left: 5px; }
                
                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    /* Padding balancing for mobile */
                    .content-wrapper { padding-left: 0px !important; padding-right: 0px !important; }
                    .content { padding-left: 10px !important; padding-right: 10px !important; }
                }

                .tt-box {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 5px 15px 10px;
                }
                
                .tt-header {
                    padding: 11px 17px;
                    border-bottom: 1px solid #f4f4f4;
                }
                
                .tt-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 400;
                    color: #333;
                }

                /* Timetable Grid Layout */
                .tt-grid {
                    display: flex;
                    gap: 0;
                    overflow-x: auto;
                    padding: 0;
                }

                .tt-day-col {
                    flex: 1;
                    min-width: 130px;
                }

                .tt-day-col:last-child {
                    border-right: none;
                }

                .tt-day-header {
                    padding: 8px 10px;
                    font-weight: 600;
                    font-size: 13px;
                    color: #444;
                    border-bottom: 1px solid #eee;
                    text-align: left;
                }

                .tt-card {
                    margin: 8px 6px;
                    border: 1px solid #e8e8e8;
                    border-radius: 6px;
                    padding: 8px 10px;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                }

                .tt-row {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 5px;
                    gap: 6px;
                }

                .tt-row:last-child {
                    margin-bottom: 0;
                }

                .tt-icon {
                    font-size: 13px;
                    color: #6c757d;
                    margin-top: 1px;
                    flex-shrink: 0;
                    width: 14px;
                }

                .tt-text {
                    font-size: 13px;
                    color: #00a65a;
                    line-height: 1.4;
                }

                .tt-not-scheduled {
                    margin: 8px 6px;
                    border: 1px solid #fce8e6;
                    border-radius: 6px;
                    padding: 8px 10px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    // background: #fff8f8;
                    font-size: 12px;
                    color: #ff0000;
                    text-align: center;
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                @media (max-width: 769px) {
                 .content{
                        padding:0px 5px 0px 0px !important;
                    }
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
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* Timetable page specific */
                .tt-content { padding: 1px; }
                .tt-box-wrapper { position: relative; }
                .tt-body-padded { padding-bottom: 30px; }
                .tt-loading { text-align: center; padding: 40px; color: #888; }
            `}</style>
            <div className="content-wrapper">
                <section className="content tt-content">
                    <div className="tt-box tt-box-wrapper">
                        <div className="tt-header">
                            <h3>Class Timetable</h3>
                            <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                        <div className="box-body tt-body-padded">
                            {isLoading ? (
                                <div className="tt-loading">
                                    <i className="fa fa-spinner fa-spin"></i> Loading timetable...
                                </div>
                            ) : (
                                <div className="tt-grid">
                                    {days.map(day => (
                                        <div key={day} className="tt-day-col">
                                            <div className="tt-day-header">{day}</div>
                                            {!timetable[day] || timetable[day].length === 0 ? (
                                                <div className="tt-not-scheduled">
                                                    <i className="fa fa-times-circle"></i> Not Scheduled
                                                </div>
                                            ) : (
                                                timetable[day].map((item, idx) => (
                                                    <div key={idx} className="tt-card">
                                                        <div className="tt-row">
                                                            <i className="fa fa-edit tt-icon"></i>
                                                            <span className="tt-text"><strong>Subject: </strong>{item.subject_name}{item.code ? ` (${item.code})` : ''}</span>
                                                        </div>
                                                        <div className="tt-row">
                                                            <i className="fa fa-clock-o tt-icon"></i>
                                                            <span className="tt-text">{item.time_from} - {item.time_to}</span>
                                                        </div>
                                                        <div className="tt-row">
                                                            <i className="fa fa-th tt-icon"></i>
                                                            <span className="tt-text"><strong>Room No.: </strong>{item.room_no}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Timetable;
