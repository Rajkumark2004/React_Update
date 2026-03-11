
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
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
        <div className="wrapper">
            <style>{`
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

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
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

                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 25px !important;
                    margin-top: 50px !important;
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
                
                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }
            `}</style>

            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/timetable"
            />

            <div className="content-wrapper">
                <section className="content">
                    <div className="box box-primary">
                        <div className="box-header with-border">
                            <h3 className="box-title"><i className="fa fa-calendar"></i> Class Timetable</h3>
                        </div>
                        <div className="box-body">
                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                    <i className="fa fa-spinner fa-spin"></i> Loading timetable...
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped">
                                        <thead>
                                            <tr>
                                                {days.map(day => (
                                                    <th key={day} style={{ textTransform: 'capitalize' }}>{day}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                {days.map(day => (
                                                    <td key={day} width="14%" style={{ verticalAlign: 'top' }}>
                                                        {!timetable[day] || timetable[day].length === 0 ? (
                                                            <div className="attachment-block block-b-noraml clearfix">
                                                                <b className="text text-danger"><i className="fa fa-times-circle"></i> Not Scheduled</b>
                                                            </div>
                                                        ) : (
                                                            timetable[day].map((item, idx) => (
                                                                <div key={idx} className="attachment-block attachment-block-normal clearfix">
                                                                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
                                                                        <i className="fa fa-book" style={{ width: '16px', color: '#666', marginRight: '6px' }}></i>
                                                                        <span><strong style={{ fontWeight: '600' }}>Subject:</strong> {item.subject_name} {item.code && `(${item.code})`}</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
                                                                        <i className="fa fa-clock-o" style={{ width: '16px', color: '#666', marginRight: '6px' }}></i>
                                                                        <span>{item.time_from} - {item.time_to}</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                                                        <i className="fa fa-building" style={{ width: '16px', color: '#666', marginRight: '6px' }}></i>
                                                                        <span><strong style={{ fontWeight: '600' }}>Room No:</strong> {item.room_no}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default Timetable;

