
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../../utils/include_files';

const NoticeBoard = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [roleId, setRoleId] = useState('7'); // Default to 7 if not found

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Extract first role ID from roles object (e.g., {"Super Admin": "7"})
                const roles = user.roles || {};
                const roleId = Object.values(roles)[0];

                if (roleId) {
                    setRoleId(roleId);
                    const response = await api.getNoticeBoardList(roleId);
                    if (response && response.status && response.data) {
                        setNotifications(response.data.notificationlist || []);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    // Get current user ID from localStorage
    const getUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id;
        }
        return null;
    };
    const user_id = getUserId();

    const openDetails = async (notification) => {
        setSelectedNotification(notification);
        setIsSidebarOpen(true);
    };

    const closeDetails = (e) => {
        if (e) e.preventDefault();
        setIsSidebarOpen(false);
        setSelectedNotification(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteNoticeBoard(id, roleId);
                if (response && (response.status === true || response.status === 'success')) {
                    toast.success('Notification deleted successfully');
                    fetchNotifications(); // Refresh list
                } else {
                    toast.error('Failed to delete notification');
                }
            } catch (error) {
                console.error('Error deleting notification:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px', marginTop: '0px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-bullhorn"></i> Communicate <small>1.0.0</small>
                    </h1>
                </section>

                <section className="content">
                    <div className="row" style={{ marginTop: '0px' }}>
                        {/* Left Sidebar (Submenu) */}
                        <div className="col-md-2 hide-mobile">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Communicate</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/notification" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Notice Board
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mailsms/compose">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/2.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send Email
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mailsms/compose_sms">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send SMS
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/sendwhatsapp/compose_sms">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/3.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send Whatsapp
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/notification_class/index">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/1.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Circular
                                        </Link>
                                    </li>
                                    {/*} <li>
                                        <Link to="/admin/mail/email_sms_log">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/4.png" alt="icon4" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Email / SMS Log
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/schedule_log">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/5.png" alt="icon5" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Schedule Email SMS Log
                                        </Link>
                                    </li>
                                     <li>
                                        <Link to="/student/bulkmail">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/6.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Login Credentials Send
                                        </Link>
                                    </li> 
                                    <li>
                                        <Link to="/admin/mail/send_reminders">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fr.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send Reminders
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/email_template">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/7.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Email Template
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/sms_template">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/8.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            SMS Template
                                        </Link>
                                    </li>*/}
                                </ul>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-md-10">
                            <div className="box box-solid1 box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-commenting-o"></i> Notice Board</h3>
                                    <div className="box-tools pull-right">
                                        <Link to="/admin/notification/add" className="btn btn-primary btn-sm">
                                            <i className="fa fa-plus"></i> Post New Message
                                        </Link>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm" style={{ marginLeft: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs mright5 hide-desktop">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body pt0">
                                    {loading ? (
                                        <div className="text-center p10">
                                            <i className="fa fa-spinner fa-spin fa-2x"></i>
                                            <p>Loading notifications...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="alert alert-info" style={{ marginTop: '10px' }}>No Record Found</div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div key={notification.id} className="email-info d-flex" style={{ borderBottom: '1px solid #f4f4f4', padding: '10px 0', cursor: 'pointer' }} onClick={() => openDetails(notification)}>
                                                <div style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                                    <h4 className="h4-title" style={{ margin: '0', fontSize: '15px' }}>
                                                        <i className="fa fa-envelope-o" style={{ marginRight: '5px' }}></i>
                                                        {notification.title}
                                                    </h4>
                                                </div>
                                                <div className="hover-show" style={{ marginLeft: '10px', display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                                                    {notification.created_id == user_id && (
                                                        <>
                                                            <Link to={`/admin/notification/edit/${notification.id}`} className="" data-toggle="tooltip" title="Edit" style={{ color: '#666' }} onClick={(e) => e.stopPropagation()}>
                                                                <i className="fa fa-pencil"></i>
                                                            </Link>
                                                            <Link to="#" className="" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notification.id); }} style={{ color: '#666' }}>
                                                                <i className="fa fa-remove"></i>
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Notice Detail Panel */}
                                <aside className={`notice-detail-panel ${isSidebarOpen ? 'open' : ''}`} role="dialog">
                                    <div className="notice-detail-content">
                                        <a href="#" className="notice-close-btn" onClick={closeDetails}>
                                            <i className="fa fa-times"></i>
                                        </a>
                                        {selectedNotification && (
                                            <div id="notificationdata" style={{ padding: '0' }}>
                                                <div>
                                                    {/* Header with back arrow and title */}
                                                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <a href="#" onClick={closeDetails} style={{ color: '#00bcd4', fontSize: '24px' }}>
                                                            <i className="fa fa-arrow-left"></i>
                                                        </a>
                                                        <h3 style={{ margin: 0, flex: 1, fontSize: '18px', fontWeight: 500 }}>{selectedNotification.title}</h3>
                                                    </div>

                                                    {/* Message content */}
                                                    <div style={{ padding: '20px' }}>
                                                        <div style={{ marginBottom: '20px', fontSize: '15px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: selectedNotification.message }}></div>

                                                        {/* Date information */}
                                                        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px', fontSize: '14px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <i className="fa fa-calendar" style={{ color: '#666' }}></i>
                                                                <span>Publish Date: {selectedNotification.publish_date}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <i className="fa fa-calendar" style={{ color: '#666' }}></i>
                                                                <span>Notice Date: {selectedNotification.date}</span>
                                                            </div>
                                                        </div>

                                                        {/* Created By */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px' }}>
                                                            <i className="fa fa-user" style={{ color: '#666' }}></i>
                                                            <span>Created By: {selectedNotification.created_by} ({selectedNotification.created_id})</span>
                                                        </div>

                                                        {/* Divider */}
                                                        <hr style={{ margin: '20px 0', borderColor: '#e0e0e0' }} />

                                                        {/* Message To section */}
                                                        <div>
                                                            <h4 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 500 }}>Message To</h4>
                                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                                {selectedNotification.visible_staff === 'Yes' && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                                                        <i className="fa fa-users" style={{ color: '#666' }}></i>
                                                                        <span>Admin</span>
                                                                    </div>
                                                                )}
                                                                {selectedNotification.visible_student === 'Yes' && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                                                        <i className="fa fa-user" style={{ color: '#666' }}></i>
                                                                        <span>Student</span>
                                                                    </div>
                                                                )}
                                                                {selectedNotification.visible_parent === 'Yes' && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                                                        <i className="fa fa-user" style={{ color: '#666' }}></i>
                                                                        <span>Parent</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
            <style>{`
                .notice-detail-panel {
                    position: fixed;
                    top: 0;
                    right: -500px;
                    width: 500px;
                    height: 100%;
                    background: #fff;
                    z-index: 1050;
                    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    overflow-y: auto;
                }
                .notice-detail-panel.open {
                    right: 0;
                }
                .notice-close-btn {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 20px;
                    color: #444;
                    z-index: 10;
                }
                .hover-show {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                .email-info:hover .hover-show {
                    opacity: 1;
                }
                .email-info:hover {
                    background-color: #f9f9f9;
                }
            `}</style>
        </div>
    );
};

export default NoticeBoard;
