
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const ContentView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const [content, setContent] = useState(null);
    const [isExpired, setIsExpired] = useState(true);

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getSharedByName = (record) => {
        if (!record) return 'Staff';
        const namePart = `${record.name || ''} ${record.surname || ''}`.trim();
        const empIdPart = record.employee_id ? `(${record.employee_id})` : '';
        return `${namePart} ${empIdPart}`.trim() || 'Staff';
    };

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

        const fetchContentDetail = async () => {
            try {
                const res = await api_users.getContentDetail(id);
                if (res && res.status && res.data && res.data.content) {
                    setIsExpired(false);
                    const c = res.data.content;
                    setContent({
                        title: c.title,
                        share_date: formatDate(c.share_date),
                        valid_upto: formatDate(c.valid_upto),
                        shared_by: getSharedByName(c),
                        description: c.description || '',
                        attachments: c.upload_contents || []
                    });
                } else {
                    setIsExpired(true);
                }
            } catch (error) {
                console.error("Failed to load content detail:", error);
                setIsExpired(true);
            }
        };

        fetchUserData();
        fetchContentDetail();
    }, [id]);

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
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }
                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }
                .sidebar::-webkit-scrollbar { width: 5px; }
                .sidebar::-webkit-scrollbar-track { background: transparent; }
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
                .sessionul, .fixedmenu, .search-form, .navbar-form { display: none !important; }
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 0px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 70px);
                }

                .box-info {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 10px 15px 10px;
                }

                .box-header {
                    padding: 10px 17px;
                    border-bottom: 1px solid #f4f4f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .box-title {
                    margin-right: 1260px !important;
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                }

                .box-body {
                    padding: 15px 17px;
                }

                .alert {
                    padding: 15px;
                    margin-bottom: 20px;
                    border: 1px solid #ffb8b0;
                    border-radius: 4px;
                }

                .alert-danger {
                    color: #a94442;
                    background-color: #ffd1cc;
                    border-color: #ebccd1;
                }

                .mt0 { margin-top: 0; }
                .list-group-item {
                    border: 1px solid #eee;
                    margin-bottom: 5px;
                    padding: 10px 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-radius: 4px;
                }
                .list-group-item a {
                    color: #337ab7;
                    text-decoration: none;
                }
                .list-group-item a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .hide-mobile { display: none !important; }
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
                currentUrl="/user/content/list"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "5px" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="box box-info">
                        <div className="box-header">
                            <h3 className="box-title">Content</h3>
                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm pull-right">
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                        <div className="box-body">
                            {isExpired ? (
                                <div className="alert alert-danger">
                                    Sorry, this link is invalid or expired. please contact to system admin.
                                </div>
                            ) : (
                                <>
                                    <h4 className="mt0">{content?.title}</h4>
                                    <div className="row" style={{ marginBottom: '15px' }}>
                                        <div className="col-md-4"><label>Upload Date</label> : {content?.share_date}</div>
                                        <div className="col-md-4"><label>Valid Upto</label> : {content?.valid_upto}</div>
                                        <div className="col-md-4"><label>Shared By</label> : {content?.shared_by}</div>
                                    </div>
                                    <div className="row" style={{ marginBottom: '20px' }}>
                                        <div className="col-md-12"><label>Description</label> : {content?.description}</div>
                                    </div>
                                    <h4 className="box-title" style={{ marginBottom: '10px' }}>Attachments</h4>
                                    <ul className="list-group">
                                        {content?.attachments?.map(file => (
                                            <li key={file.id} className="list-group-item">
                                                <i className={`fa ${file.file_type === 'pdf' ? 'fa-file-pdf-o' : 'fa-file-excel-o'}`} style={{ fontSize: '20px', color: file.file_type === 'pdf' ? '#ff0000' : '#217346' }}></i>
                                                <a href="#" onClick={(e) => e.preventDefault()}>
                                                    {file.real_name} <i className="fa fa-download"></i>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default ContentView;
