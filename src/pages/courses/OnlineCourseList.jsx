import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OnlineCourseList = () => {
    const navigate = useNavigate();
    const { id: categoryId } = useParams();
    const { currentSession, clearSession } = useSession();

    // State
    const [videos, setVideos] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentVideo, setCurrentVideo] = useState({ title: '', url: '' });
    const [viewUrl, setViewUrl] = useState('');

    // Fetch Videos from API
    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await api.getOnlineCourseVideoList(categoryId);
            if (response && response.status && response.data) {
                setVideos(response.data);
            } else {
                setVideos([]);
                setError(response.message || 'Failed to fetch videos');
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
            setError('An error occurred while fetching videos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (categoryId) {
            fetchVideos();
        }
    }, [categoryId]);

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
        }
    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const sessionYear = currentSession?.session || '2024-25';

    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'Fees.png', label: 'Fees Collection', url: '#' },
        { id: 4, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '#' },
        { id: 6, icon: 'courses.png', label: 'Courses', url: '/admin/onlinecourse' },
        { id: 7, icon: 'homework.png', label: 'Homework', url: '#' },
        { id: 8, icon: 'transport.png', label: 'Transport', url: '#', active: false },
        { id: 9, icon: 'messages.png', label: 'Messages', url: '#' },
        { id: 10, icon: 'hr.png', label: 'Human Resource', url: '#' },
        { id: 11, icon: 'download_resouces.png', label: 'Download Center', url: '#' },
        { id: 12, icon: 'certificate.png', label: 'Certificate', url: '#' },
        { id: 13, icon: 'income.png', label: 'Income', url: '#' },
        { id: 14, icon: 'expenses.png', label: 'Expenses', url: '#' },
        { id: 15, icon: 'hostle.png', label: 'Hostel', url: '#' },
        { id: 16, icon: 'reports.png', label: 'Reports', url: '#' },
        { id: 17, icon: 'settings.png', label: 'System Settings', url: '/settings' }
    ];

    const mobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 4, icon: 'settings.png', label: 'More', url: '/settings' },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search triggered');
    };

    const handleExport = (type) => {
        if (type === 'Print') {
            window.print();
        } else {
            toast.success(`${type} export triggered (Simulation)`);
        }
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();

        if (!currentVideo.title || !currentVideo.url) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                category_id: categoryId,
                title: currentVideo.title,
                url: currentVideo.url
            };
            const response = await api.addOnlineCourseVideo(payload);
            if (response && response.status) {
                toast.success(response.message || 'Video added successfully');
                setCurrentVideo({ title: '', url: '' });
                setShowAddModal(false);
                setError(null);
                fetchVideos(); // Refresh the list
            } else {
                toast.error(response.message || 'Failed to add video');
            }
        } catch (err) {
            console.error("Error adding video:", err);
            toast.error('An error occurred while adding the video');
        } finally {
            setLoading(false);
        }
    };

    const handleEditVideo = async (video) => {
        setLoading(true);
        try {
            const response = await api.getOnlineCourseVideoDetails(video.id);
            if (response && response.status && response.data) {
                setCurrentVideo(response.data);
                setShowEditModal(true);
                setError(null);
            } else {
                toast.error(response.message || 'Failed to fetch video details');
            }
        } catch (err) {
            console.error("Error fetching video details:", err);
            toast.error('An error occurred while fetching video details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateVideo = async (e) => {
        e.preventDefault();

        if (!currentVideo.title || !currentVideo.url) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                id: currentVideo.id,
                title: currentVideo.title,
                url: currentVideo.url
            };
            const response = await api.updateOnlineCourseVideo(payload);
            if (response && response.status) {
                toast.success(response.message || 'Video updated successfully');
                setShowEditModal(false);
                setError(null);
                fetchVideos(); // Refresh the list
            } else {
                toast.error(response.message || 'Failed to update video');
            }
        } catch (err) {
            console.error("Error updating video:", err);
            toast.error('An error occurred while updating the video');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = async (id) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            setLoading(true);
            try {
                const response = await api.deleteOnlineCourseVideo(id);
                if (response && response.status) {
                    toast.success(response.message || 'Video deleted successfully');
                    fetchVideos(); // Refresh the list
                } else {
                    toast.error(response.message || 'Failed to delete video');
                }
            } catch (err) {
                console.error("Error deleting video:", err);
                toast.error('An error occurred while deleting the video');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleViewVideo = (url) => {
        let embedUrl = url;
        if (url.includes('youtu.be')) {
            const videoId = url.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            const videoId = urlObj.searchParams.get('v');
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        setViewUrl(embedUrl);
        setShowViewModal(true);
    };

    return (
        <div className="wrapper">
            <style>{`
                .content-wrapper { min-height: 90vh; }
                .box-header .box-title { font-size: 18px; margin: 0; line-height: 1; }
                .box-header.ptbnull { padding-top: 0; padding-bottom: 0; }
                .box-title.titlefix { margin-top: 5px; }
                .pull-right { float: right!important; }
                .btn-primary { background-color: #337ab7; border-color: #2e6da4; color: #fff; }
                .btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }
                .table-striped>tbody>tr:nth-of-type(odd) { background-color: #f9f9f9; }
                .table-bordered { border: 1px solid #f4f4f4; }
                
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 1050;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding-top: 50px;
                }
                .modal-dialog {
                    width: 600px;
                    margin: 30px auto;
                    background: #fff;
                    border-radius: 6px;
                    box-shadow: 0 5px 15px rgba(0,0,0,.5);
                    position: relative;
                }
                .modal-dialog.modal-lg { width: 900px; }
                .modal-header {
                    padding: 15px;
                    border-bottom: 1px solid #e5e5e5;
                }
                .modal-title { margin: 0; line-height: 1.42857143; font-size: 18px; font-weight: 500; }
                .modal-body { position: relative; padding: 15px; }
                .modal-footer {
                    padding: 15px;
                    text-align: right;
                    border-top: 1px solid #e5e5e5;
                }
                .close { float: right; font-size: 21px; font-weight: 700; line-height: 1; color: #000; text-shadow: 0 1px 0 #fff; opacity: .2; border: none; background: none; cursor: pointer; }
                .form-control {
                    display: block;
                    width: 100%;
                    height: 34px;
                    padding: 6px 12px;
                    font-size: 14px;
                    line-height: 1.42857143;
                    color: #555;
                    background-color: #fff;
                    background-image: none;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .embed-responsive {
                    position: relative;
                    display: block;
                    width: 100%;
                    padding: 0;
                    overflow: hidden;
                }
                .embed-responsive-16by9 { padding-bottom: 56.25%; }
                .embed-responsive .embed-responsive-item {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
                }
                .dt-buttons .btn { border: none; background: transparent; box-shadow: none; border-bottom: 1px solid #ccc; border-radius: 0; }
                .dt-buttons .btn:hover { background: #f0f0f0; }
                .mailbox-messages input[type="search"] { border: none; border-bottom: 1px solid #ccc; box-shadow: none; border-radius: 0; outline: none; }
                .mailbox-messages input[type="search"]:focus { border-bottom: 1px solid #3c8dbc; }
                .req { color: red; }
            `}</style>

            <Header appName="School Management System" userData={userData} pendingTasks={[]} handleLogout={handleLogout} />
            <Sidebar sidebarMenus={sidebarMenus} mobileNavItems={mobileNavItems} handleSearch={handleSearch} sessionYear={sessionYear} currentUrl="/admin/onlinecourse" />

            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="nav-tabs-custom theme-shadow box box-primary" style={{ marginTop: '20px' }}>
                                <div className="box-header ptbnull" style={{ padding: '10px' }}>
                                    <h3 className="box-title titlefix pt5">Video List</h3>
                                    <div className="box-tools pull-right">
                                        <button className="btn btn-primary btn-sm question-btn" onClick={() => { setCurrentVideo({ title: '', url: '' }); setShowAddModal(true); }}>
                                            <i className="fa fa-plus"></i> Add Video
                                        </button>
                                    </div>
                                </div>
                                <div className="tab-content">
                                    <div className="tab-pane active" id="tab_1">
                                        <div className="box-body p0">
                                            <div className="mailbox-messages">
                                                <div style={{ padding: '10px', display: 'inline-block' }}>
                                                    <label>Search: <input type="search" className="form-control input-sm" placeholder="" style={{ display: 'inline-block', width: 'auto' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label>
                                                </div>

                                                <div className="dt-buttons btn-group pull-right" style={{ padding: '10px', marginBottom: '10px' }}>
                                                    <button className="btn btn-default btn-sm" title="Copy" onClick={() => handleExport('Copy')}><i className="fa fa-copy"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Excel" onClick={() => handleExport('Excel')}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="CSV" onClick={() => handleExport('CSV')}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="PDF" onClick={() => handleExport('PDF')}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => handleExport('Print')}><i className="fa fa-print"></i></button>
                                                </div>

                                                <div className="table-responsive overflow-visible">
                                                    <table className="table table-striped table-bordered table-hover example">
                                                        <thead>
                                                            <tr>
                                                                <th>Title</th>
                                                                <th className="pull-right noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {loading && videos.length === 0 ? (
                                                                <tr><td colSpan="2" className="text-center">Loading...</td></tr>
                                                            ) : error && videos.length === 0 ? (
                                                                <tr><td colSpan="2" className="text-center text-danger">{error}</td></tr>
                                                            ) : filteredVideos.length === 0 ? (
                                                                <tr><td colSpan="2" className="text-center">No videos found</td></tr>
                                                            ) : (
                                                                filteredVideos.map((video) => (
                                                                    <tr key={video.id}>
                                                                        <td>{video.title}</td>
                                                                        <td className="pull-right noExport">
                                                                            <button className="btn btn-default btn-xs" onClick={() => handleViewVideo(video.url)}>
                                                                                <i className="fa fa-eye"></i>
                                                                            </button>
                                                                            <button className="btn btn-default btn-xs" onClick={() => handleEditVideo(video)}>
                                                                                <i className="fa fa-pencil"></i>
                                                                            </button>
                                                                            <button className="btn btn-default btn-xs" onClick={() => handleDeleteVideo(video.id)}>
                                                                                <i className="fa fa-trash"></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />

            {/* Add Video Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowAddModal(false)}>&times;</button>
                                <h4 className="modal-title">Add Video</h4>
                            </div>
                            <form onSubmit={handleAddVideo}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Video Title</label><small className="req"> *</small>
                                        <input type="text" className="form-control" value={currentVideo.title} onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Video Url</label><small className="req"> *</small>
                                        <input type="url" className="form-control" value={currentVideo.url} onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })} />
                                        <span className="text-danger">{error}</span>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <i className='fa fa-spinner fa-spin'></i> : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Video Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowEditModal(false)}>&times;</button>
                                <h4 className="modal-title">Edit Video</h4>
                            </div>
                            <form onSubmit={handleUpdateVideo}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Video Title</label><small className="req"> *</small>
                                        <input type="text" className="form-control" value={currentVideo.title} onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Video Url</label><small className="req"> *</small>
                                        <input type="url" className="form-control" value={currentVideo.url} onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <i className='fa fa-spinner fa-spin'></i> : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Video Modal */}
            {showViewModal && (
                <div className="modal-overlay">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">View Video</h4>
                                <button type="button" className="close" onClick={() => setShowViewModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="embed-responsive embed-responsive-16by9">
                                    <iframe className="embed-responsive-item" src={viewUrl} allowFullScreen title="Video Viewer"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineCourseList;
