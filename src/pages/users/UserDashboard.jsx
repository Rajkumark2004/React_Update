
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';
import { api_users } from '../../services/api_users';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "student",
        id: "",
        admission_no: "",
        avatar: "/uploads/student_images/1.jpg",
        adminLogoUrl: ""
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // First try to load initial username from localStorage
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    initialName = userObj.username || "User";
                    setUserData(prev => ({ ...prev, name: initialName, role: userObj.role || 'student', avatar: userObj.image || "/uploads/student_images/1.jpg" }));
                }

                // Then fetch real data from dashboard API
                const res = await api_users.getUserDashboard();
                if (res && res.status && res.data && res.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: res.data.student.name || initialName,
                        id: res.data.student.id || prev.id,
                        admission_no: res.data.student.admission_no || "",
                        adminLogoUrl: res.data.sch_setting?.admin_logo && res.data.sch_setting?.base_url
                            ? `${res.data.sch_setting.base_url}uploads/school_content/admin_logo/${res.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };



    const themeColor = "#9c68e4";

    return (
        <div className="wrapper">
            <style>{`
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



                /* Layout adjustments */
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 25px !important;
                }
                
                .welcome-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 30px 45px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                    min-height: 230px;
                }
                
                .welcome-text h3 {
                    font-size: 26px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 10px 0;
                }
                
                .welcome-text p {
                    font-size: 16px;
                    color: #777;
                    margin-bottom: 30px;
                }
                
                .btn-check-now {
                    background-color: ${themeColor} !important;
                    color: #fff !important;
                    padding: 10px 32px;
                    border-radius: 10px;
                    font-weight: 500;
                    font-size: 15px;
                    text-decoration: none;
                    display: inline-block;
                }
                
                .welcome-image img {
                    max-width: 320px;
                    height: auto;
                }

                .notice-board-container {
                    margin-top: 47px; 
                }
                
                .notice-board-card {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    min-height: 200px;
                    width: 100%;
                }

                .notice-header {
                    padding: 18px 25px;
                    border-bottom: 1px solid #f9f9f9;
                }
                
                .notice-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                }

                .notice-body {
                    padding: 18px 25px;
                }

                .notice-item {
                    display: flex;
                    align-items: center;
                    color: #666;
                    font-size: 14px;
                }

                .notice-item i.fa-envelope-o {
                    color: #e74c3c;
                    margin-right: 12px;
                    font-size: 17px;
                }

                .dashboard-card {
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                    min-height: 290px;
                }

                .card-title-bar {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f9f9f9;
                }

                .card-title-bar h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                    margin: 0;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                }

                .empty-state img {
                    width: 130px;
                    height: auto;
                    opacity: 0.8;
                }

                /* Hide standard search and session UI */
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



            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/dashboard"
            />

            <div className="content-wrapper" style={{ marginTop: '50px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-lg-8 col-md-8">
                            <div className="welcome-card">
                                <div className="welcome-text">
                                    <h3 style={{ marginLeft: '25px' }}>Hello {userData.name}</h3>
                                    <p>Check your personalized profile</p>
                                    <Link to="/user/profile" className="btn-check-now">Check Now</Link>
                                </div>
                                <div className="welcome-image">
                                    <img src="/images/dash_illustration.png" alt="Welcome" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="notice-board-container">
                                <div className="notice-board-card">
                                    <div className="notice-header">
                                        <h3>Notice Board</h3>
                                    </div>
                                    <div className="notice-body">
                                        <div className="notice-item">
                                            <i className="fa fa-envelope-o"></i>
                                            <span>Test <span style={{ color: '#3498db' }}>(<i className="fa fa-info-circle"></i> 11/01/2026)</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card">
                                <div className="card-title-bar">
                                    <h3>Subject Progress</h3>
                                </div>
                                <div className="empty-state">
                                    <img src="/images/addnewitem.svg" alt="No data" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card">
                                <div className="card-title-bar">
                                    <h3>Upcoming Class</h3>
                                </div>
                                <div className="empty-state">
                                    {/* Empty state for upcoming classes */}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card">
                                <div className="card-title-bar">
                                    <h3>Homework</h3>
                                </div>
                                <div className="empty-state">
                                    <img src="/images/addnewitem.svg" alt="No data" />
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

export default UserDashboard;
