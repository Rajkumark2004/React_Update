import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

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
                console.log("Online Course List API Response Data:", res);
                if (res && res.status && res.data && res.data.video_list) {
                    setVideoList(res.data.video_list);
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
        <>
            <style>{`
                /* Online Course Page Styles */
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
                    .content-wrapper {
                        margin-left: 80px !important;
                         padding:40px 0px 10px 2px !important;
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
                    
                    .mobile-box-back-btn {
                        display: flex !important;
                        align-items: center;
                        gap: 5px;
                        background: ${themeColor};
                        color: #fff !important;
                        padding: 6px 15px;
                        border: none;
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
                    .content {
                         padding:53px 5px 10px 0px !important;
                    }
                    .oc-header {
                        padding-right: 80px !important;
                    }
                    .ocl-th-action,
                    .ocl-td-action {
                        padding-right: 8px !important;
                        white-space: nowrap !important;
                    }
                    .table-responsive {
                        overflow-x: hidden !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                /* OnlineCourseList page specific */
                .ocl-content { padding: 3px; }
                .ocl-header-wrap { position: relative; }
                .ocl-th-full { width: 100%; }
                .ocl-th-action { text-align: right; padding-right: 15px; }
                .ocl-td-action { text-align: right; padding-right: 15px; }
                .ocl-view-btn { color: #0084b5; background: none; border: none; cursor: pointer; }
                .ocl-empty-cell { text-align: center; padding: 20px; }
            `}</style>
            <div className="content-wrapper">
                <section className="content ocl-content">

                    <div className="oc-box">
                        <div className="oc-header ocl-header-wrap">
                            <button className="mobile-box-back-btn" onClick={() => navigate('/user/onlinecourse')}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                            <h3 className="box-title">Video List</h3>
                        </div>
                        <div className="oc-table-wrapper">
                            <div className="table-responsive">
                                <table className="oc-table">
                                    <thead>
                                        <tr>
                                            <th className="ocl-th-full">Title</th>
                                            <th className="ocl-th-action">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videoList.length > 0 ? (
                                            videoList.map((video) => (
                                                <tr key={video.id}>
                                                    <td>{video.title}</td>
                                                    <td className="ocl-td-action">
                                                        <button
                                                            onClick={() => openVideo(video.url)}
                                                            className="ocl-view-btn"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="ocl-empty-cell">No videos found</td>
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
        </>
    );
};

export default OnlineCourseList;