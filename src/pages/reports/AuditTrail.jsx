import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const AuditTrail = () => {
    const navigate = useNavigate();

    // Table search state
    const [tableSearch, setTableSearch] = useState('');

    // Mock Data - Audit Trail entries
    const [auditData, setAuditData] = useState([
        { id: 1, message: 'Admin logged in', user: 'Super Admin', ip_address: '192.168.1.10', action: 'Login', platform: 'Windows', agent: 'Chrome 120.0', date_time: '03/15/2025 09:30:00 AM' },
        { id: 2, message: 'Student "Rahul Kumar" details updated', user: 'Staff (Rajesh)', ip_address: '192.168.1.15', action: 'Update', platform: 'Windows', agent: 'Firefox 121.0', date_time: '03/15/2025 10:45:00 AM' },
        { id: 3, message: 'New visitor "Aman" added', user: 'Receptionist', ip_address: '192.168.1.5', action: 'Create', platform: 'Android', agent: 'Chrome Mobile 120.0', date_time: '03/15/2025 11:15:00 AM' },
        { id: 4, message: 'Fee payment of $500 for "Priya Sharma" collected', user: 'Accountant', ip_address: '192.168.1.50', action: 'Payment', platform: 'Windows', agent: 'Edge 120.0', date_time: '03/15/2025 01:20:00 PM' },
        { id: 5, message: 'Class "10" timetable changed', user: 'Super Admin', ip_address: '192.168.1.10', action: 'Update', platform: 'Windows', agent: 'Chrome 120.0', date_time: '03/15/2025 03:00:00 PM' },
        { id: 6, message: 'Admission record for "Amit Singh" deleted', user: 'Super Admin', ip_address: '192.168.1.10', action: 'Delete', platform: 'Windows', agent: 'Chrome 120.0', date_time: '03/14/2025 05:45:00 PM' },
    ]);

    // Filtered data based on search
    const filteredData = auditData.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    // Handle clear audit trail
    const handleClearAuditTrail = () => {
        if (window.confirm('Are you sure you want to delete all audit trail records?')) {
            setAuditData([]);
            alert('Audit trail records cleared successfully.');
        }
    };

    // Table action handlers
    const handleCopy = () => {
        const headers = 'Message\tUsers\tIP Address\tAction\tPlatform\tAgent\tDate Time';
        const text = filteredData.map(item =>
            `${item.message}\t${item.user}\t${item.ip_address}\t${item.action}\t${item.platform}\t${item.agent}\t${item.date_time}`
        ).join('\n');

        navigator.clipboard.writeText(headers + '\n' + text);
        alert('Copied to clipboard!');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-calendar-check-o"></i> Audit Trail Log</h3>
                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                            <i className="fa fa-arrow-left"></i> Back
                        </button>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-info">
                                <div className="box-header with-border">
                                    <div className="row">
                                        <div className="col-md-4 col-sm-4">
                                            <h3 className="box-title"><i className="fa fa-users"></i> Audit Trail Report List</h3>
                                        </div>
                                        <div className="col-md-8 col-sm-8">
                                            <div className="pull-right">
                                                <button onClick={handleClearAuditTrail} className="btn btn-primary btn-sm checkbox-toggle" style={{ marginRight: '5px' }}>
                                                    Clear Audit Trail Record
                                                </button>
                                                <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                                    <i className="fa fa-arrow-left"></i> Back
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="box-body table-responsive">
                                    {/* Table toolbar */}
                                    <div className="row mb10">
                                        <div className="col-sm-12">
                                            <div className="pull-left">
                                                <div className="form-group mb0" style={{ paddingBottom: '5px' }}>
                                                    <i className="fa fa-search" style={{ color: '#999', marginRight: '5px' }}></i>
                                                    <input
                                                        type="text"
                                                        className="form-control input-sm"
                                                        placeholder="Search..."
                                                        style={{ width: '200px', border: 'none', display: 'inline-block', background: 'transparent', boxShadow: 'none' }}
                                                        value={tableSearch}
                                                        onChange={(e) => setTableSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="pull-right">
                                                <div className="dt-buttons btn-group" style={{ paddingBottom: '2px' }}>
                                                    <button className="btn btn-default dt-button" title="Copy" onClick={handleCopy} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-copy"></i></button>
                                                    <button className="btn btn-default dt-button" title="Excel" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default dt-button" title="CSV" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default dt-button" title="PDF" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default dt-button" title="Print" onClick={handlePrint} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-print"></i></button>
                                                    <button className="btn btn-default dt-button" title="Columns" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-columns"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="download_label" style={{ display: 'none' }}>Audit Trail Report List</div>
                                    <table className="table table-striped table-bordered table-hover audit-table" data-export-title="Audit Trail Report List">
                                        <thead>
                                            <tr>
                                                <th>Message</th>
                                                <th>Users</th>
                                                <th>IP Address</th>
                                                <th>Action</th>
                                                <th>Platform</th>
                                                <th>Agent</th>
                                                <th>Date Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center">No data available in table</td></tr>
                                            ) : (
                                                filteredData.map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td>{item.message}</td>
                                                        <td>{item.user}</td>
                                                        <td>{item.ip_address}</td>
                                                        <td>{item.action}</td>
                                                        <td>{item.platform}</td>
                                                        <td>{item.agent}</td>
                                                        <td>{item.date_time}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Record count and pagination */}
                                    <div className="row" style={{ marginTop: '10px' }}>
                                        <div className="col-sm-5">
                                            <div className="dataTables_info" style={{ paddingLeft: '10px', fontSize: '12px' }}>
                                                Records: {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of {filteredData.length}
                                                {tableSearch && auditData.length !== filteredData.length && ` (filtered from ${auditData.length} total)`}
                                            </div>
                                        </div>
                                        <div className="col-sm-7">
                                            <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                <ul className="pagination" style={{ margin: '0', float: 'right', fontSize: '12px' }}>
                                                    <li className="paginate_button previous disabled">
                                                        <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&lt;</a>
                                                    </li>
                                                    <li className="paginate_button active">
                                                        <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px' }}>1</a>
                                                    </li>
                                                    <li className="paginate_button next disabled">
                                                        <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&gt;</a>
                                                    </li>
                                                </ul>
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

export default AuditTrail;
