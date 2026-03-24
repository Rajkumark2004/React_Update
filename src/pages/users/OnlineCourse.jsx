import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const OnlineCourse = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const [courseCategories, setCourseCategories] = useState([]);

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    initialName = userObj.username || "User";
                    setUserData(prev => ({
                        ...prev,
                        name: initialName,
                        role: userObj.role || 'Student',
                        avatar: userObj.image || "/uploads/student_images/no_image.png"
                    }));
                }
                const res = await api_users.getUserDashboard();
                if (res && res.status && res.data && res.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: res.data.student.name || initialName,
                        id: res.data.student.id || prev.id,
                        adminLogoUrl: res.data.sch_setting?.admin_logo && res.data.sch_setting?.base_url
                            ? `${res.data.sch_setting.base_url}uploads/school_content/admin_logo/${res.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            }
        };

        const fetchOnlineCourses = async () => {
            try {
                const res = await api_users.getOnlineCourses();
                console.log("Online Courses API Response Data:", res);
                if (res && res.status && res.data && res.data.category_list) {
                    setCourseCategories(res.data.category_list);
                }
            } catch (error) {
                console.error("Failed to load online courses:", error);
            }
        };

        fetchUserData();
        fetchOnlineCourses();
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
            .content-wrapper{
                padding:2px 4px 10px 2px !important;
                margin-top: 40px !important;
            }
                .oc-box {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin: 25px 5px 15px 10px;
                }
                .oc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    border-bottom: 1px solid #f4f4f4;
                }
                .oc-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                }
                .oc-table-wrapper { padding: 0px 5px 30px 4px; }

                .oc-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .oc-table thead th {
                    padding: 10px 15px;
                    border-bottom: 1px solid #ddd;
                    font-weight: 600;
                    color: #333;
                    text-align: left;
                }
                .oc-table tbody td {
                    padding: 7px 15px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                }
                .oc-table tbody tr:last-child td { border-bottom: none; }
                .oc-table tbody tr:hover { background: #fafafa; }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    /* Padding balancing for mobile */
                    .content-wrapper { padding-left: 0px !important; padding-right: 0px !important; }
                    .content { padding-left: 10px !important; padding-right: 10px !important; }
                    /* Top padding reduction */
                    .content-wrapper { margin-top: 10px !important; padding-top: 0px !important; }
                    .oc-box { margin-top: 5px !important; }
                     .content{
                        padding:54px 4px 10px 0px !important;
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

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                /* OnlineCourse page specific */
                .oc-content { padding: 3px; }
                .oc-box-wrapper { position: relative; }
                .oc-th-full { width: 100%; }
                .oc-th-action { text-align: right; padding-right: 15px; }
                .oc-td-action { text-align: right; padding-right: 0px; }
                .oc-action-link { cursor: pointer; color: #008bb2; position: relative; left: 20px; }
                .oc-empty-cell { text-align: center; padding: 20px; }
            `}</style>
            <div className="content-wrapper">
                <section className="content oc-content">
                    <div className="oc-box oc-box-wrapper">
                        <div className="oc-header">
                            <h3 className="box-title">Online Course Category</h3>
                            <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                        <div className="oc-table-wrapper">
                            <div className="table-responsive">
                                <table className="oc-table">
                                    <thead>
                                        <tr>
                                            <th className="oc-th-full">Category</th>
                                            <th className="oc-th-action">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseCategories.length > 0 ? (
                                            courseCategories.map((category) => (
                                                <tr key={category.id}>
                                                    <td>{category.category_name}</td>
                                                    <td className="oc-td-action">
                                                        <a onClick={(e) => { e.preventDefault(); navigate(`/user/onlinecourse/list/${category.id}`); }} className="oc-action-link">
                                                            <i className="fa fa-list"></i>
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="oc-empty-cell">No categories found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default OnlineCourse;
