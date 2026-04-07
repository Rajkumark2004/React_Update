import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const OnlineCourseList = () => {
    const navigate = useNavigate();
    const { id: categoryId } = useParams();

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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

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

    // Calculate pagination
    const totalItems = filteredVideos.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredVideos.slice(indexOfFirstItem, indexOfLastItem); const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Title");

        const rows = filteredVideos.map(video => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(video.title);
            return row;
        });

        return { headers, rows };
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
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .content-wrapper { min-height: 90vh; }
                .box-header .box-title { font-size: 18px; margin: 0; line-height: 1; }
                .box-header.ptbnull { padding-top: 0; padding-bottom: 0; }
                .box-title.titlefix { margin-top: 5px; }
                .pull-right { float: right!important; }
                .btn-primary { background-color: #9754ca; border-color: #9754ca; color: #fff; margin-top: 3px;}
                .btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 20px; }
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
                .dt-buttons.btn-group {
                    border: 1px solid #ccc;
                    border-radius: 20px;
                    padding: 0;
                    background: #f9f9f9;
                    display: inline-flex;
                    align-items: center;
                    overflow: hidden;
                }
                .dt-buttons.btn-group .btn {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 4px 10px !important;
                    border-right: 1px solid #ccc !important;
                    border-radius: 0 !important;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dt-buttons.btn-group .btn:last-child {
                    border-right: none !important;
                }
                .dt-buttons.btn-group .btn:hover {
                    background: #f0f0f0 !important;
                }
                .mailbox-messages input[type="search"] { border: none; border-bottom: 1px solid #ccc; box-shadow: none; border-radius: 0; outline: none; margin-bottom: 12px;}
                .mailbox-messages input[type="search"]:focus { border-bottom: 1px solid #3c8dbc; }
                .req { color: red; }
                @media (max-width: 767px) {
                    .course-list-toolbar {
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        border-bottom: none !important;
                        gap: 5px !important;
                    }
                    .course-list-toolbar .al-search-col,
                    .course-list-toolbar .al-btn-col {
                        display: flex !important;
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .course-list-toolbar .al-btn-col {
                        margin-bottom: 10px;
                    }
                    .course-list-toolbar .al-search-col {
                        margin-bottom: 5px;
                    }
                    .mailbox-messages input[type="search"] {
                        margin-bottom: 0px;
                    }
                }
               
            `}</style>

            <Header />
            <Sidebar currentUrl="/admin/onlinecourse" />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="nav-tabs-custom theme-shadow box box-primary" style={{ marginTop: '0px' }}>
                                <div className="box-header ptbnull" style={{ padding: '5px 5px 10px 10px' }}>
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
                                                <div className="course-list-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '8px 10px', borderBottom: '1px solid #f4f4f4' }}>
                                                    <div className="al-search-col">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                                            <div className="dataTables_length">
                                                                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                                    Records:
                                                                    <select
                                                                        value={recordsPerPage}
                                                                        onChange={(e) => {
                                                                            setRecordsPerPage(Number(e.target.value));
                                                                            setCurrentPage(1);
                                                                        }}
                                                                        className="form-control input-sm"
                                                                        style={{ width: '80px', margin: '0 10px' }}
                                                                    >
                                                                        <option value="10">10</option>
                                                                        <option value="25">25</option>
                                                                        <option value="50">50</option>
                                                                        <option value="100">100</option>
                                                                        <option value="-1">All</option>
                                                                    </select>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="search"
                                                                placeholder="Search..."
                                                                value={searchTerm}
                                                                onChange={(e) => {
                                                                    setSearchTerm(e.target.value);
                                                                    setCurrentPage(1);
                                                                }}
                                                                style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="al-btn-col">
                                                        <div className="dt-buttons btn-group">
                                                            <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                            <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Video_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                            <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Video_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                            <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Video_List.pdf', 'Video List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                            <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Video List'); }}><i className="fa fa-print"></i></button>

                                                            <div className="btn-group" style={{ display: 'inline-flex' }}>
                                                                <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderRight: 'none !important' }}>
                                                                    <i className="fa fa-columns"></i>
                                                                </button>
                                                                {showColumnsDropdown && (
                                                                    <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto', minWidth: '150px' }}>
                                                                        <li>
                                                                            <label style={{ display: 'block', padding: '5px 15px', margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                                                                                <input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} style={{ marginRight: '8px' }} /> Title
                                                                            </label>
                                                                        </li>
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="table-responsive overflow-visible">
                                                    <table className="table table-striped table-bordered table-hover example">
                                                        <thead>
                                                            <tr>
                                                                {!hiddenColumns.includes(0) && <th>Title</th>}
                                                                <th className="pull-right noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {loading && videos.length === 0 ? (
                                                                <tr><td colSpan="2" className="text-center">Loading...</td></tr>
                                                            ) : error && videos.length === 0 ? (
                                                                <tr><td colSpan="2" className="text-center text-danger">{error}</td></tr>
                                                            ) : currentItems.length === 0 ? (
                                                                <tr><td colSpan="2" className="text-center">No videos found</td></tr>
                                                            ) : (
                                                                currentItems.map((video) => (
                                                                    <tr key={video.id}>
                                                                        {!hiddenColumns.includes(0) && <td>{video.title}</td>}
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
                                                <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                                    <Pagination
                                                        totalItems={totalItems}
                                                        itemsPerPage={recordsPerPage}
                                                        currentPage={currentPage}
                                                        onPageChange={(page) => setCurrentPage(page)}
                                                    />
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
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
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
                                    <button type="button" className="btn btn-default" onClick={() => setShowAddModal(false)}>Cancel</button>
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
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
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
                                    <button type="button" className="btn btn-default" onClick={() => setShowEditModal(false)}>Cancel</button>
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
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowViewModal(false)}>&times;</button>
                                <h4 className="modal-title">View Video</h4>
                            </div>
                            <div className="modal-body">
                                <div className="embed-responsive embed-responsive-16by9">
                                    <iframe className="embed-responsive-item" src={viewUrl} allowFullScreen title="Video Viewer"></iframe>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={() => setShowViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineCourseList;
