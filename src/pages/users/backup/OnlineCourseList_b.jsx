
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../user_components/Header_user.jsx';
import Sidebar from '../user_components/Sidebar_user.jsx';
import Footer from '../user_components/Footer.jsx';
import TopSidebar from '../user_components/TopSidebar.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { api_users } from '../../../services/api_users.js';
import '../../../utils/include_files.js';

const OnlineCourseList = () => {
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

    // Video View Modal State
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');

    const [videoList, setVideoList] = useState([]);

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

        const fetchOnlineCourseList = async () => {
            if (!id) return;
            try {
                const res = await api_users.getOnlineCourseList(id);
                if (res && res.data) {
                    console.log("Online Course List API Response Data:", res.data);
                    if (res.data.video_list) {
                        setVideoList(res.data.video_list);
                    }
                }
            } catch (error) {
                console.error("Failed to load online course list:", error);
            }
        };

        fetchUserData();
        fetchOnlineCourseList();
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

    const openVideo = (url) => {
        let embedUrl = url;
        if (url.includes('youtu.be')) {
            const videoId = url.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtube.com/watch')) {
            const videoId = new URL(url).searchParams.get("v");
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        setCurrentVideoUrl(embedUrl);
        setShowVideoModal(true);
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
                .sessionul, .fixedmenu, .search-form, .navbar-form { display: none !important; }
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 0px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 70px);
                }
.box-title{
font-size: 18px !important;
font-weight: 200 !important;
}
                /* Online Course Page Styles */
                .oc-box {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin: 25px 10px 15px 10px;
                }
                .oc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 15px 12px 15px;
                    border-bottom: 1px solid #f4f4f4;
                }
                .oc-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                }
                .oc-table-wrapper { padding: 10px 5px 30px 5px; }

                .oc-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .oc-table thead th {
                    padding: 4px 0px 5px 15px;
                    border-bottom: 1px solid #ddd;
                    font-weight: 600;
                    color: #333;
                    text-align: left;
                }
                .oc-table tbody td {
                    padding: 4px 0px 5px 15px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                }
                .oc-table tbody tr:last-child td { border-bottom: none; }
                .oc-table tbody tr:hover { background: #fafafa; }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                .modal-content {
                    margin-top: 60px;
                    background: #fff;
                    border-radius: 4px;
                    width: 1030px;
                    max-width: 90%;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                .modal-header {
                    background: #fff !important;
                    padding: 9px;
                    border-bottom: 1px solid #e5e5e5;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h4 {
                    margin: 8px;
                    font-size: 15px;
                    color: #000 !important;
                }
                .modal-body {
                    padding: 15px;
                }
                .close-btn {
                    border: none;
                    background: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #000 !important;
                }
                .embed-responsive {
                    position: relative;
                    display: block;
                    width: 100%;
                    padding: 0;
                    overflow: hidden;
                }
                .embed-responsive-16by9 {
                    padding-bottom: 56.25%;
                }
                .embed-responsive-item {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
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
                currentUrl="/user/onlinecourse"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "3px" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="oc-box">
                        <div className="oc-header">
                            <h3 className="box-title">Video List</h3>
                        </div>
                        <div className="oc-table-wrapper">
                            <div className="table-responsive">
                                <table className="oc-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '100%' }}>Title</th>
                                            <th style={{ textAlign: 'right', paddingRight: '15px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videoList.length > 0 ? (
                                            videoList.map((video) => (
                                                <tr key={video.id}>
                                                    <td>{video.title}</td>
                                                    <td style={{ textAlign: 'right', paddingRight: '15px' }}>
                                                        <button
                                                            onClick={() => openVideo(video.url)}
                                                            style={{
                                                                color: '#0084b5',
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                left: '10px'
                                                            }}
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>No videos found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {showVideoModal && (
                <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>View Video</h4>
                            <button className="close-btn" onClick={() => setShowVideoModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="embed-responsive embed-responsive-16by9">
                                <iframe
                                    className="embed-responsive-item"
                                    src={currentVideoUrl}
                                    allowFullScreen
                                    title="Video Player"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OnlineCourseList;
