import React, { useState } from 'react';
import SettingsMenu from './SettingsMenu';
import './include_files.js';

const NotificationSettings = () => {
    // Mock Data for notification list
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Exam Schedule Released',
            message: 'The exam schedule for the upcoming semester has been released. Please download the attachment for details.',
            publish_date: '2025-01-10',
            date: '2025-01-12',
            created_by: 'Admin',
            attachment: 'schedule.pdf'
        },
        {
            id: 2,
            title: 'Holiday Announcement',
            message: 'The school will remain closed on 2025-01-26 for Republic Day.',
            publish_date: '2025-01-15',
            date: '2025-01-26',
            created_by: 'Principal',
            attachment: ''
        },
        {
            id: 3,
            title: 'Fee Submission Deadline',
            message: 'Last date for fee submission is 2025-02-15.',
            publish_date: '2025-02-01',
            date: '2025-02-15',
            created_by: 'Accounts',
            attachment: ''
        }
    ]);

    const [viewNotification, setViewNotification] = useState(null);

    const handleView = (notification) => {
        setViewNotification(notification);
    };

    if (viewNotification) {
        return (
            <SettingsMenu>
                <div className="row">
                    <div className="col-md-12">
                        <div className="box box-primary">
                            <div className="box-body">
                                <div className="d-flex pr-2" style={{ display: 'flex', alignItems: 'center' }}>
                                    <a href="#" className="mail-sidebar" onClick={(e) => { e.preventDefault(); setViewNotification(null); }}>
                                        <i className="fa fa-arrow-left valign-top pr-1 fs-2" style={{ fontSize: '18px', marginRight: '10px' }}></i>
                                    </a>
                                    <h4 className="box-title mt0 mb0" style={{ margin: 0 }}>{viewNotification.title}</h4>
                                </div>
                                <div className="dividerhr" style={{ borderTop: '1px solid #ebebeb', margin: '15px 0' }}></div>
                                <p>{viewNotification.message}</p>

                                {viewNotification.attachment && (
                                    <a href="#" onClick={(e) => e.preventDefault()}><i className="fa fa-download pr-1"></i> Download Attachment</a>
                                )}

                                <ul className="email-list-group ptt10" style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                                    <li><i className="fa fa-calendar-check-o pr-1"></i> Publish Date: {viewNotification.publish_date}</li>
                                    <li><i className="fa fa-calendar pr-1"></i> Notice Date: {viewNotification.date}</li>
                                    <li><i className="fa fa-user pr-1"></i> Created By: {viewNotification.created_by}</li>
                                </ul>
                                <div className="dividerhr" style={{ borderTop: '1px solid #ebebeb', margin: '15px 0' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsMenu>
        );
    }

    return (
        <SettingsMenu>
            <div className="row">
                <div className="col-md-12">
                    <div className="box box-solid">
                        <div className="box-header ptbnull">
                            <h3 className="box-title titlefix">Notice Board</h3>
                            <div className="box-tools pull-right">
                                <button className="btn btn-primary btn-sm" onClick={() => window.history.back()}> <i className="fa fa-arrow-left"></i> Back</button>
                            </div>
                        </div>
                        <div className="box-body pt0">
                            {notifications.length === 0 ? (
                                <div className="alert alert-info">No Record Found</div>
                            ) : (
                                notifications.map((notification) => (
                                    <div className="email-info" key={notification.id} style={{ borderBottom: '1px solid #f4f4f4', padding: '10px 0' }}>
                                        <a href="#" className="navbar-toggle2 force-visible mail-sidebar notification_msg" onClick={(e) => { e.preventDefault(); handleView(notification); }}>
                                            <h4 className="h4-title" style={{ margin: '0 0 5px' }}><i className="fa fa-envelope-o" style={{ marginRight: '5px' }}></i>{notification.title}</h4>
                                            <div className="email-discription" style={{ color: '#666', fontSize: '13px' }}>{notification.message.substring(0, 100)}...</div>
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SettingsMenu>
    );
};

export default NotificationSettings;
