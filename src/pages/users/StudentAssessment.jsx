
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const StudentAssessment = () => {
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
    const [assessmentList, setAssessmentList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user info for header
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                let isParent = false;
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    isParent = userObj.role === 'parent';
                    initialName = userObj.username || "User";
                    setUserData(prev => ({
                        ...prev,
                        name: initialName,
                        role: userObj.role || 'student',
                        avatar: userObj.image || "/uploads/student_images/no_image.png"
                    }));
                }

                // Fetch Dashboard to get student ID and logo
                const dashRes = await api_users.getUserDashboard();
                if (dashRes && dashRes.status && dashRes.data && dashRes.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: isParent ? initialName : (dashRes.data.student.name || initialName),
                        id: dashRes.data.student.id || prev.id,
                        adminLogoUrl: dashRes.data.sch_setting?.admin_logo && dashRes.data.sch_setting?.base_url
                            ? `${dashRes.data.sch_setting.base_url}uploads/school_content/admin_logo/${dashRes.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }

                // Fetch Student Assessment (Diary) List
                const res = await api_users.getStudentDiaryList();
                if (res && res.status && res.data && res.data.studentdairylist) {
                    setAssessmentList(res.data.studentdairylist);
                }
            } catch (error) {
                console.error("Failed to load assessments:", error);
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

    const filteredData = assessmentList.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (item.class && item.class.toLowerCase().includes(term)) ||
            (item.section && item.section.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
    });

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
                .sa-box {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    margin: 0 15px 15px 15px;
                    overflow: hidden;
                }
                .sa-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f9f9f9;
                }
                .sa-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                }
                .sa-table-wrapper {
                    padding: 15px 20px;
                }
                .sa-table-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .sa-search-input {
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 8px 15px;
                    font-size: 13px;
                    width: 200px;
                    outline: none;
                }
                .sa-table-responsive {
                    overflow-x: auto;
                }
                .sa-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .sa-table th {
                    text-align: left;
                    padding: 12px;
                    border-bottom: 1px solid #f0f0f0;
                    color: #777;
                    font-size: 13px;
                    font-weight: 600;
                }
                .sa-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f9f9f9;
                    color: #555;
                    font-size: 13px;
                }
                .sa-empty-state {
                    padding: 40px;
                    text-align: center;
                }
                .sa-empty-illustration img {
                    width: 150px;
                    margin-bottom: 15px;
                    opacity: 0.6;
                }
                .download-btn {
                    color: ${themeColor};
                    cursor: pointer;
                    font-size: 16px;
                }

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
                currentUrl="/user/studentassessment"
            />

            <div className="content-wrapper">
                <section className="content">
                    <div className="sa-box">
                        <div className="sa-header">
                            <h3>Student Assessment</h3>
                        </div>
                        <div className="sa-table-wrapper">
                            <div className="sa-table-top">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="sa-search-input"
                                />
                            </div>

                            <div className="sa-table-responsive">
                                <table className="sa-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th>Description</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                                            </tr>
                                        ) : filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="sa-empty-state">
                                                        <div className="sa-empty-illustration">
                                                            <img src="/images/addnewitem.svg" alt="empty" />
                                                        </div>
                                                        <div className="sa-empty-text">No data available in table</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <tr key={item.id || index}>
                                                    <td>{item.date}</td>
                                                    <td>{item.class}</td>
                                                    <td>{item.section}</td>
                                                    <td>{item.description}</td>
                                                    <td>
                                                        {item.document && (
                                                            <a href={item.document} target="_blank" rel="noopener noreferrer" className="download-btn">
                                                                <i className="fa fa-download"></i>
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StudentAssessment;
