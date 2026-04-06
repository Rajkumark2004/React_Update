import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import api from '../../../services/api';

const WhatsAppLog = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                // API call would go here
                // const response = await api.getWhatsAppLog();
                // setMessages(response.data || []);

                // Mock data for UI demonstration
                setMessages([
                    {
                        id: 1,
                        title: 'Holiday Notice',
                        message: 'School will remain closed on Monday',
                        created_at: '2026-02-06 10:30:00',
                        send_mail: true,
                        send_sms: true,
                        is_group: true,
                        is_individual: false,
                        is_class: false
                    },
                    {
                        id: 2,
                        title: 'Exam Schedule',
                        message: 'Final exams start from next week',
                        created_at: '2026-02-05 14:00:00',
                        send_mail: true,
                        send_sms: false,
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
                                    <h3 className="box-title">Email / SMS Log</h3>
                                    <div className="box-tools pull-right"></div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Email / SMS Log</div>
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Date</th>
                                                    <th>Email</th>
                                                    <th>SMS</th>
                                                    <th>Group</th>
                                                    <th>Individual</th>
                                                    <th>Class</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : messages.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center text-danger">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    messages.map(message => (
                                                        <tr key={message.id}>
                                                            <td className="mailbox-name">{message.title}</td>
                                                            <td className="mailbox-name">{message.message}</td>
                                                            <td className="mailbox-name">{formatDate(message.created_at)}</td>
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

export default WhatsAppLog;
