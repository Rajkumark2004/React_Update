import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import toast from 'react-hot-toast';

const EmailSMSScheduleLog = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Mock data - replace with API call
        setMessages([
            { id: 1, title: 'Monthly Reminder', message: 'Monthly fee reminder', created_at: '2026-02-01 10:00:00', schedule_date_time: '2026-02-15 09:00:00', send_mail: true, send_sms: false, is_group: true, is_individual: false, is_class: false },
            { id: 2, title: 'Event Notice', message: 'Annual day celebration', created_at: '2026-02-02 11:30:00', schedule_date_time: '2026-02-20 08:00:00', send_mail: true, send_sms: true, is_group: false, is_individual: false, is_class: true }
        ]);
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this scheduled message?')) {
            setMessages(prev => prev.filter(m => m.id !== id));
            toast.success('Scheduled message deleted');
        }
    };

    const sidebarLinks = [
        { icon: 'fa fa-bullhorn', label: 'Notice Board', path: '/admin/notification' },
        { icon: 'fa fa-envelope', label: 'Send Email', path: '/admin/mailsms/compose' },
        { icon: 'fa fa-mobile', label: 'Send SMS', path: '/admin/mailsms/compose_sms' },
        { icon: 'fa fa-list', label: 'Email/SMS Log', path: '/admin/mailsms' },
        { icon: 'fa fa-clock-o', label: 'Schedule Log', path: '/admin/mailsms/schedule', active: true },
        { icon: 'fa fa-file-text-o', label: 'Email Template', path: '/admin/mailsms/email_template' },
        { icon: 'fa fa-file-o', label: 'SMS Template', path: '/admin/mailsms/sms_template' }
    ];

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="box box-solid">
                                <div className="box-header with-border"><h3 className="box-title">Communicate</h3></div>
                                <div className="box-body no-padding">
                                    <ul className="nav nav-pills nav-stacked">
                                        {sidebarLinks.map((link, i) => (
                                            <li key={i} className={link.active ? 'active' : ''}>
                                                <Link to={link.path}><i className={link.icon}></i> {link.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Schedule Email / SMS Log</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Message</th>
                                                    <th>Date</th>
                                                    <th>Schedule Date</th>
                                                    <th>Email</th>
                                                    <th>SMS</th>
                                                    <th>Group</th>
                                                    <th>Individual</th>
                                                    <th>Class</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {messages.map(msg => (
                                                    <tr key={msg.id}>
                                                        <td>{msg.title}</td>
                                                        <td>{msg.message || <span className="text-danger">No Description</span>}</td>
                                                        <td>{formatDate(msg.created_at)}</td>
                                                        <td>{formatDate(msg.schedule_date_time)}</td>
                                                        <td>{msg.send_mail && <i className="fa fa-check-square-o"></i>}</td>
                                                        <td>{msg.send_sms && <i className="fa fa-check-square-o"></i>}</td>
                                                        <td>{msg.is_group && <i className="fa fa-check-square-o"></i>}</td>
                                                        <td>{msg.is_individual && <i className="fa fa-check-square-o"></i>}</td>
                                                        <td>{msg.is_class && <i className="fa fa-check-square-o"></i>}</td>
                                                        <td>
                                                            <Link to={`/admin/mailsms/edit_schedule/${msg.id}`} className="btn btn-default btn-xs" title="View/Edit">
                                                                <i className="fa fa-reorder"></i>
                                                            </Link>
                                                            <button className="btn btn-default btn-xs" title="Delete" onClick={() => handleDelete(msg.id)}>
                                                                <i className="fa fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default EmailSMSScheduleLog;
