import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const NotificationList = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Mock data initialization
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                title: 'Summer Vacation Start',
                message: 'The summer vacation will start from 1st June 2026. The school will reopen on 1st July 2026.',
                created_id: 1, // Mock user ID
                date: '2026-05-20'
            },
            {
                id: 2,
                title: 'New Session 2026-27',
                message: 'The new academic session will commence from 1st April 2026. Uniforms and books are available at the store.',
                created_id: 1,
                date: '2026-03-15'
            },
            {
                id: 3,
                title: 'Exam Schedule Updated',
                message: 'The final examination schedule for Class 10 has been updated. Please check the notice board for details.',
                created_id: 2,
                date: '2026-02-10'
            }
        ]);
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

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this circular?')) {
            setNotifications(notifications.filter(n => n.id !== id));
        }
    };

    const handleEdit = (id, e) => {
        e.stopPropagation();
        navigate(`/admin/notification_class/edit/${id}`);
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '16px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-bullhorn"></i> Communicate
                    </h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12" style={{ marginTop: '10px' }}>
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

                                {/* Sidebar Container / Drawer */}
                                <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
                                    <article className={`email-collection ${isSidebarOpen ? 'open' : ''}`}>
                                        <a href="#" onClick={closeDetails} className="mail-close-btn">
                                            <i className="fa fa-times" style={{ fontSize: '20px' }}></i>
                                        </a>
                                        {selectedNotification && (
                                            <div id="notificationdata" style={{ padding: '20px' }}>
                                                <h3>{selectedNotification.title}</h3>
                                                <hr />
                                                <div style={{ color: '#666', lineHeight: '1.6' }}>
                                                    {selectedNotification.message}
                                                </div>
                                                <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                                                    Published on: {selectedNotification.date}
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
            <style>{`
                .sidebar-container {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100vh;
                    background: #fff;
                    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
                    z-index: 1050;
                    transition: right 0.3s ease;
                }
                .sidebar-container.open {
                    right: 0;
                }
                .email-collection {
                    height: 100%;
                    overflow-y: auto;
                    position: relative;
                }
                .mail-close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    color: #333;
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
