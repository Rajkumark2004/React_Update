import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const WhatsAppScheduleLog = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                // API call would go here
                // const response = await api.getWhatsAppScheduleLog();
                // setMessages(response.data || []);

                // Mock data for UI demonstration
                setMessages([
                    {
                        id: 1,
                        title: 'PTM Reminder',
                        message: 'Parent Teacher Meeting tomorrow at 10 AM',
                        created_at: '2026-02-06 09:00:00',
                        schedule_date_time: '2026-02-07 08:00:00',
                        send_mail: true,
                        send_sms: true,
                        is_group: true,
                        is_individual: false,
                        is_class: false
                    },
                    {
                        id: 2,
                        title: 'Fee Reminder',
                        message: 'Please pay your pending fees before month end',
                        created_at: '2026-02-05 11:00:00',
                        schedule_date_time: '2026-02-10 09:00:00',
                        send_mail: true,
                        send_sms: true,
                        is_group: false,
                        is_individual: false,
                        is_class: true
                    }
                ]);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this scheduled message?')) {
            try {
                // API call would go here
                // await api.deleteWhatsAppSchedule(id);
                setMessages(prev => prev.filter(m => m.id !== id));
                toast.success('Scheduled message deleted successfully');
            } catch (error) {
                toast.error('Failed to delete scheduled message');
            }
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-bullhorn"></i></h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Schedule Email / SMS Log</h3>
                                    <div className="box-tools pull-right"></div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Schedule Email / SMS Log</div>
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
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : messages.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center text-danger">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    messages.map(message => (
                                                        <tr key={message.id}>
                                                            <td className="mailbox-name">{message.title}</td>
                                                            <td className="mailbox-name">
                                                                {message.message ? (
                                                                    <p className="text text-info">{message.message}</p>
                                                                ) : (
                                                                    <p className="text text-danger">No Description</p>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name">{formatDate(message.created_at)}</td>
                                                            <td className="mailbox-name">{formatDate(message.schedule_date_time)}</td>
                                                            <td className="mailbox-name">
                                                                {message.send_mail && (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.send_sms && (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.is_group && (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.is_individual && (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.is_class && (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name text-right">
                                                                <Link
                                                                    to={`/admin/sendwhatsapp/edit_schedule/${message.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    title="View / Edit"
                                                                >
                                                                    <i className="fa fa-reorder"></i>
                                                                </Link>
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={() => handleDelete(message.id)}
                                                                    style={{ marginLeft: '5px' }}
                                                                >
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
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default WhatsAppScheduleLog;
