
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
    const [roleId, setRoleId] = useState(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);

                // Extract role ID with fallback
                let extractedRoleId = null;
                if (user.roles && typeof user.roles === 'object') {
                    extractedRoleId = Object.values(user.roles)[0];
                }

                // Fallback to '7' (Super Admin) if no role found, common in this app
                const finalRoleId = extractedRoleId || '7';
                setRoleId(finalRoleId);

                console.log('NoticeBoard: Fetching with roleId:', finalRoleId);
                const response = await api.getNoticeBoardList(finalRoleId);

                if (response && (response.status === true || response.status === 'success' || response.notificationlist)) {
                    // The response object contains notificationlist directly
                    setNotifications(response.notificationlist || response.data?.notificationlist || []);
                    // Use user_id from API response if available
                    if (response.user_id) {
                        setRoleId(response.user_id);
                    }
                }
            } else {
                console.warn('NoticeBoard: No user found in localStorage');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
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
                                            <div key={notification.id} className="email-info d-flex" style={{ borderBottom: '1px solid #f4f4f4', padding: '10px 0', cursor: 'pointer', position: 'relative' }} onClick={() => openDetails(notification)}>
                                                <div style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                                    <h4 className="h4-title" style={{ margin: '0', fontSize: '15px' }}>
                                                        <i className="fa fa-envelope-o" style={{ marginRight: '5px' }}></i>
                                                        {notification.title}
                                                    </h4>
                                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', marginLeft: '18px' }}>
                                                        <i className="fa fa-calendar" style={{ marginRight: '4px' }}></i>
                                                        {notification.publish_date}
                                                    </div>
                                                </div>
                                                <div className="" style={{ marginLeft: '10px', display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                                                    {(notification.created_id == user_id || roleId === '7') && (
                                                        <>
                                                            <Link to={`/admin/notification/edit/${notification.id}`} className="" data-toggle="tooltip" title="Edit" style={{ color: '#0084B4' }} onClick={(e) => e.stopPropagation()}>
                                                                <i className="fa fa-pencil"></i>
                                                            </Link>
                                                            <Link to="#" className="" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notification.id); }} style={{ color: '#d9534f' }}>
                                                                <i className="fa fa-remove"></i>
                                                            </Link>
                                                        </>
                                                    )}
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

                        <div>
                            <h4 style={{ fontSize: '15px', marginBottom: '15px', fontWeight: 500, color: '#333' }}>Message To</h4>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                {selectedNotification.visible_staff === 'Yes' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                                        <i className="fa fa-users"></i>
                                        <span>Admin</span>
                                    </div>
                                )}
                                {selectedNotification.visible_student === 'Yes' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                                        <i className="fa fa-user"></i>
                                        <span>Student</span>
                                    </div>
                                )}
                                {selectedNotification.visible_parent === 'Yes' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                                        <i className="fa fa-user"></i>
                                        <span>Parent</span>
                                    </div>
                                )}
                            </div>
                        </div>
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
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .email-info:hover .hover-show {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default NoticeBoard;
