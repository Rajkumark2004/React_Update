import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const NotificationList = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roleId, setRoleId] = useState('7'); // Default to 7 if not found

    const fetchData = async () => {
        setLoading(true);
        try {
            // Extract role ID from user login response
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Extract first role ID from roles object (e.g., {"Super Admin": "7"})
                const roles = user.roles || {};
                const extractedRoleId = Object.values(roles)[0];
                if (extractedRoleId) {
                    setRoleId(extractedRoleId);
                }
            }

            const response = await api.getNotifications();
            if (response && response.status === true && response.data) {
                setNotifications(response.data.notification_list || []);
            } else {
                toast.error(response.message || 'Failed to fetch circulars');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load circulars');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openDetails = (notification) => {
        setSelectedNotification(notification);
        setIsSidebarOpen(true);
    };

    const closeDetails = (e) => {
        if (e) e.preventDefault();
        setIsSidebarOpen(false);
        setSelectedNotification(null);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this circular?')) {
            try {
                const response = await api.deleteNotification(id);
                if (response.status === true || response.status === 'success') {
                    toast.success('Circular deleted successfully');
                    fetchData(); // Refresh list
                } else {
                    toast.error(response.message || 'Failed to delete circular');
                }
            } catch (error) {
                console.error('Error deleting circular:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const handleEdit = (id, e) => {
        e.stopPropagation();
        navigate(`/admin/notification_class/edit/${id}`);
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-bullhorn"></i> Communicate
                    </h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12" style={{ marginTop: '0px' }}>
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">
                                        <i className="fa fa-commenting-o"></i> Circular
                                    </h3>
                                    <div className="box-tools pull-right">
                                        <button
                                            onClick={() => navigate('/admin/notification_class/add')}
                                            className="btn btn-primary btn-sm"
                                            style={{ marginRight: '5px' }}
                                        >
                                            <i className="fa fa-plus"></i> Add Circular
                                        </button>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body pt0">
                                    {notifications.length === 0 ? (
                                        <div className="alert alert-info">No record found</div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="email-info d-flex"
                                                style={{
                                                    borderBottom: '1px solid #f4f4f4',
                                                    padding: '10px 0',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => openDetails(notification)}
                                            >
                                                <div className="mail-sidebar-link" style={{ flex: 1 }}>
                                                    <h4 className="h4-title" style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                                                        <i className="fa fa-envelope-o" style={{ marginRight: '10px', color: '#777' }}></i>
                                                        {notification.title}
                                                    </h4>
                                                </div>
                                                <div className="hover-show" style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={(e) => handleEdit(notification.id, e)}
                                                        className="btn-link"
                                                        style={{ border: 'none', background: 'none', color: '#999', padding: '5px' }}
                                                        title="Edit"
                                                    >
                                                        <i className="fa fa-pencil"></i>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(notification.id, e)}
                                                        className="btn-link"
                                                        style={{ border: 'none', background: 'none', color: '#999', padding: '5px' }}
                                                        title="Delete"
                                                    >
                                                        <i className="fa fa-remove"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sidebar Container Overlay */}
            {isSidebarOpen && <div className="side-panel-overlay" onClick={closeDetails}></div>}

            <div className={`custom-side-panel ${isSidebarOpen ? 'open' : ''}`}>
                <a href="#" onClick={closeDetails} className="mail-close-btn">
                    <i className="fa fa-times" style={{ fontSize: '20px' }}></i>
                </a>
                {selectedNotification && (
                    <div id="notificationdata" style={{ padding: '20px', paddingTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa fa-arrow-left" style={{ cursor: 'pointer', fontSize: '18px', color: '#0084B4' }} onClick={closeDetails}></i>
                            <h3 style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: '400' }}>{selectedNotification.title}</h3>
                        </div>
                        <hr style={{ margin: '15px 0', borderColor: '#eee' }} />

                        <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', marginBottom: '25px' }} dangerouslySetInnerHTML={{ __html: selectedNotification.message }} />

                        {selectedNotification.attachment && (
                            <div style={{ marginBottom: '15px' }}>
                                <a href={`https://newlayout.wisibles.com/uploads/school_content/material/${selectedNotification.attachment}`} target="_blank" rel="noreferrer" style={{ color: '#0084B4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <i className="fa fa-download"></i> Download Attachment
                                </a>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '10px', fontSize: '13px', color: '#555' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa fa-calendar-check-o"></i> Publish Date: {selectedNotification.publish_date}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa fa-calendar"></i> Notice Date: {selectedNotification.date}</div>
                        </div>

                        {selectedNotification.created_by && (
                            <div style={{ fontSize: '13px', color: '#555', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa fa-user"></i> Created By: {selectedNotification.created_by} {selectedNotification.created_id ? `(${selectedNotification.created_id})` : ''}
                            </div>
                        )}

                        <hr style={{ margin: '15px 0', borderColor: '#eee' }} />
                    </div>
                )}
            </div>

            <Footer />
            <style>{`
                .custom-side-panel {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100vh;
                    background: #fff;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                    z-index: 1050;
                    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow-y: auto;
                }
                .custom-side-panel.open {
                    right: 0;
                }
                .side-panel-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1040;
                }
                .mail-close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    color: #0084B4;
                    z-index: 10;
                }
                .email-info:hover {
                    background-color: #f9f9f9;
                }
                .hover-show {
                    opacity: 0.2;
                    transition: opacity 0.2s;
                }
                .email-info:hover .hover-show {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default NotificationList;
