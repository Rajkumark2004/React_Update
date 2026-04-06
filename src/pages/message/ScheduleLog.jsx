import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const ScheduleLog = () => {
    const navigate = useNavigate();

    // Data states
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Sort states
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Mock data initialization
    useEffect(() => {
        setMessages([
            {
                id: 1,
                title: 'Monthly Newsletter',
                message: 'Welcome to our monthly newsletter. We have exciting updates for you.',
                created_at: '2026-01-20 10:00:00',
                schedule_date_time: '2026-02-01 09:00:00',
                send_mail: true,
                send_sms: false,
                is_group: true,
                is_individual: false,
                is_class: false
            },
            {
                id: 2,
                title: 'Fee Reminder - Class 10',
                message: 'Dear Parent, this is a reminder regarding the pending fees for your ward.',
                created_at: '2026-01-25 14:30:00',
                schedule_date_time: '2026-01-28 08:00:00',
                send_mail: true,
                send_sms: true,
                is_group: false,
                is_individual: false,
                is_class: true
            },
            {
                id: 3,
                title: 'Emergency Holiday',
                message: 'Due to heavy rains, the school will remain closed tomorrow.',
                created_at: '2026-01-26 15:00:00',
                schedule_date_time: '2026-01-26 15:30:00',
                send_mail: false,
                send_sms: true,
                is_group: true,
                is_individual: false,
                is_class: false
            },
            {
                id: 4,
                title: 'Individual Meeting',
                message: 'Dear Parent, please attend the parent-teacher meeting on Saturday.',
                created_at: '2026-01-20 09:00:00',
                schedule_date_time: '2026-01-21 10:00:00',
                send_mail: true,
                send_sms: false,
                is_group: false,
                is_individual: true,
                is_class: false
            }
        ]);
    }, []);

    // Sort logic
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedMessages = useMemo(() => {
        let sortableItems = [...messages];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [messages, sortConfig]);

    // Filter and Pagination logic
    const filteredMessages = sortedMessages.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            setMessages(prev => prev.filter(m => m.id !== id));
            alert('Schedule deleted successfully');
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <i className="fa fa-sort text-muted" style={{ fontSize: '10px', marginLeft: '5px' }}></i>;
        }
        return sortConfig.direction === 'asc'
            ? <i className="fa fa-sort-asc" style={{ fontSize: '10px', marginLeft: '5px' }}></i>
            : <i className="fa fa-sort-desc" style={{ fontSize: '10px', marginLeft: '5px' }}></i>;
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-bullhorn"></i> Communicate</h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Schedule Email SMS Log</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages" style={{ overflow: 'visible' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                            <div className="dataTables_filter" style={{ textAlign: 'left', width: '300px' }}>
                                                <input
                                                    type="search"
                                                    placeholder="Search..."
                                                    className="form-control"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ border: '0', borderBottom: '1px solid #f4f4f4', background: 'transparent', boxShadow: 'none' }}
                                                />
                                            </div>
                                            <div className="dt-buttons btn-group">
                                                <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" style={{ border: 'none', background: 'none' }}><span><i className="fa fa-files-o"></i></span></a>
                                                <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" style={{ border: 'none', background: 'none' }}><span><i className="fa fa-file-text-o"></i></span></a>
                                                <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" style={{ border: 'none', background: 'none' }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                                <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF" style={{ border: 'none', background: 'none' }}><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                <a className="btn btn-default buttons-print btn-sm" title="Print" style={{ border: 'none', background: 'none' }}><span><i className="fa fa-print"></i></span></a>
                                                <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" style={{ border: 'none', background: 'none' }}><span><i className="fa fa-columns"></i></span></a>
                                            </div>
                                        </div>

                                        <div style={{ overflow: 'visible' }}>
                                            <table className="table table-striped table-bordered table-hover" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => requestSort('title')} style={{ cursor: 'pointer' }}>Title {getSortIcon('title')}</th>
                                                        <th onClick={() => requestSort('message')} style={{ cursor: 'pointer' }}>Message {getSortIcon('message')}</th>
                                                        <th onClick={() => requestSort('created_at')} style={{ cursor: 'pointer' }}>Date {getSortIcon('created_at')}</th>
                                                        <th onClick={() => requestSort('schedule_date_time')} style={{ cursor: 'pointer' }}>Schedule Date {getSortIcon('schedule_date_time')}</th>
                                                        <th onClick={() => requestSort('send_mail')} style={{ cursor: 'pointer' }}>Email {getSortIcon('send_mail')}</th>
                                                        <th onClick={() => requestSort('send_sms')} style={{ cursor: 'pointer' }}>SMS {getSortIcon('send_sms')}</th>
                                                        <th onClick={() => requestSort('is_group')} style={{ cursor: 'pointer' }}>Group {getSortIcon('is_group')}</th>
                                                        <th onClick={() => requestSort('is_individual')} style={{ cursor: 'pointer' }}>Individual {getSortIcon('is_individual')}</th>
                                                        <th onClick={() => requestSort('is_class')} style={{ cursor: 'pointer' }}>Class {getSortIcon('is_class')}</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map((message) => (
                                                        <tr key={message.id}>
                                                            <td className="mailbox-name">{message.title}</td>
                                                            <td className="mailbox-name">
                                                                {message.message ? (
                                                                    <p className="text text-info" style={{ marginBottom: 0 }}>{message.message}</p>
                                                                ) : (
                                                                    <p className="text text-danger" style={{ marginBottom: 0 }}>No description</p>
                                                                )}
                                                            </td>
                                                            <td className="mailbox-name">{message.created_at}</td>
                                                            <td className="mailbox-name">{message.schedule_date_time}</td>
                                                            <td className="mailbox-name">
                                                                {message.send_mail && <i className="fa fa-check"></i>}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.send_sms && <i className="fa fa-check"></i>}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.is_group && <i className="fa fa-check"></i>}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.is_individual && <i className="fa fa-check"></i>}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {message.is_class && <i className="fa fa-check"></i>}
                                                            </td>
                                                            <td className="mailbox-name text-right">
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    onClick={() => navigate(`/admin/mailsms/edit_schedule/${message.id}`)}
                                                                    title="View/Edit"
                                                                    style={{ border: 'none', background: 'none' }}
                                                                >
                                                                    <i className="fa fa-reorder"></i>
                                                                </button>
                                                                &nbsp;
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    onClick={() => handleDelete(message.id)}
                                                                    title="Delete"
                                                                    style={{ border: 'none', background: 'none' }}
                                                                >
                                                                    <i className="fa fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {currentItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan="10" className="text-center">No record found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="row" style={{ marginTop: '10px' }}>
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" role="status" aria-live="polite" style={{ fontSize: '11px', color: '#666' }}>
                                                    Records: {filteredMessages.length === 0 ? '0 to 0 of 0' : `${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, filteredMessages.length)} of ${filteredMessages.length}`}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="pull-right">
                                                    <ul className="pagination" style={{ margin: '0', float: 'right' }}>
                                                        <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) paginate(currentPage - 1); }}>
                                                                <i className="fa fa-angle-left"></i>
                                                            </a>
                                                        </li>
                                                        {[...Array(totalPages)].map((_, i) => (
                                                            <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); paginate(i + 1); }}>{i + 1}</a>
                                                            </li>
                                                        ))}
                                                        <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) paginate(currentPage + 1); }}>
                                                                <i className="fa fa-angle-right"></i>
                                                            </a>
                                                        </li>
                                                    </ul>
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
        </div>
    );
};

export default ScheduleLog;
