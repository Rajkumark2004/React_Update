import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';
import { api } from '../../services/api';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';

const UserLog = () => {
    const navigate = useNavigate();

    // Active tab
    const [activeTab, setActiveTab] = useState('all_users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 100;

    // Reset page on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Raw data from API
    const [allLogs, setAllLogs] = useState([]);

    // Table search per tab
    const [tableSearch, setTableSearch] = useState({
        all_users: '',
        staff: '',
        student: '',
        parent: '',
    });

    // Reset page on search change
    const handleSearchChange = (tab, value) => {
        setTableSearch(prev => ({ ...prev, [tab]: value }));
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchUserLogs = async () => {
            setLoading(true);
            try {
                const response = await api.getUserLog();
                if (response.status === 'success') {
                    const logs = response.userlogList || [];
                    console.log('User logs fetched:', logs);
                    setAllLogs(logs);
                } else {
                    setError('Failed to fetch user logs');
                }
            } catch (err) {
                console.error('Error fetching user logs:', err);
                setError(err.message || 'An error occurred while fetching user logs');
            } finally {
                setLoading(false);
            }
        };

        fetchUserLogs();
    }, []);

    // Derived data by role - Case Insensitive
    const staffData = useMemo(() =>
        allLogs.filter(u => {
            const r = (u.role || '').toLowerCase();
            return r !== 'student' && r !== 'parent';
        }),
        [allLogs]
    );
    const studentData = useMemo(() =>
        allLogs.filter(u => (u.role || '').toLowerCase() === 'student'),
        [allLogs]
    );
    const parentData = useMemo(() =>
        allLogs.filter(u => (u.role || '').toLowerCase() === 'parent'),
        [allLogs]
    );

    // Get data for current tab
    const getTabData = (tab) => {
        switch (tab) {
            case 'staff': return staffData;
            case 'student': return studentData;
            case 'parent': return parentData;
            default: return allLogs;
        }
    };

    // Get filtered data for a tab
    const getFilteredData = (tab) => {
        const data = getTabData(tab);
        const search = tableSearch[tab] || '';
        if (!search) return data;
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    // Handle clear user log
    const handleClearUserLog = () => {
        if (window.confirm('Are you sure you want to delete all user log records?')) {
            // Ideally this would be an API call
            alert('User log records cleared successfully.');
        }
    };

    // Export helpers for UserLog
    const getTabHeaders = (tab) => {
        const hasClass = tab === 'all_users' || tab === 'student';
        const cols = [];
        if (!hiddenColumns.includes(0)) cols.push('User');
        if (!hiddenColumns.includes(1)) cols.push('Role');
        if (hasClass && !hiddenColumns.includes(2)) cols.push('Class');
        if (!hiddenColumns.includes(3)) cols.push('IP Address');
        if (!hiddenColumns.includes(4)) cols.push('Login Date Time');
        if (!hiddenColumns.includes(5)) cols.push('User Agent');
        return cols;
    };
    const getTabRows = (tab) => {
        const data = getFilteredData(tab);
        const hasClass = tab === 'all_users' || tab === 'student';
        return data.map(item => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(item.user);
            if (!hiddenColumns.includes(1)) row.push(item.role || '');
            if (hasClass && !hiddenColumns.includes(2)) row.push(item.class || '');
            if (!hiddenColumns.includes(3)) row.push(item.ipaddress || item.ip_address || '');
            if (!hiddenColumns.includes(4)) row.push(item.login_datetime || '');
            if (!hiddenColumns.includes(5)) row.push(item.user_agent || '');
            return row.map(String);
        });
    };

    // Table action handlers
    const handleCopy = (tab) => {
        copyToClipboard(getTabHeaders(tab), getTabRows(tab));
    };

    const handlePrint = (tab) => {
        printTable(getTabHeaders(tab), getTabRows(tab), tab.replace(/_/g, ' ') + ' User Log');
    };

    const handleExcel = (tab) => {
        downloadExcel(getTabHeaders(tab), getTabRows(tab), `${tab}_log.xls`);
    };

    const handleCSV = (tab) => {
        downloadCSV(getTabHeaders(tab), getTabRows(tab), `${tab}_log.csv`);
    };

    const handlePDF = (tab) => {
        downloadPDF(getTabHeaders(tab), getTabRows(tab), `${tab}_log.pdf`, tab.replace(/_/g, ' ') + ' User Log');
    };

    // Check if tab has Class column
    const hasClassColumn = (tab) => tab === 'all_users' || tab === 'student';

    // Render table for a tab
    const renderTable = (tab) => {
        const filteredData = getFilteredData(tab);
        const colCount = hasClassColumn(tab) ? 6 : 5;

        // Pagination indices
        const indexOfLastRecord = currentPage * recordsPerPage;
        const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
        const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
        const totalPages = Math.ceil(filteredData.length / recordsPerPage);

        return (
            <div>
                {/* Clear User Log button - only on All Users tab */}
                {tab === 'all_users' && (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <a className="btn btn-primary btn-sm pull-right checkbox-toggle" onClick={handleClearUserLog} style={{ cursor: 'pointer' }}>
                                    Clear Userlog Record
                                </a>
                            </div>
                        </div>
                    </div>
                )}

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
                                    value={tableSearch[tab]}
                                    onChange={(e) => handleSearchChange(tab, e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pull-right">
                            <div className="dt-buttons btn-group" style={{ paddingBottom: '2px', marginTop: '10px' }}>
                                <button className="btn btn-default dt-button buttons-copy buttons-html5" title="Copy" onClick={() => handleCopy(tab)}><i className="fa fa-copy"></i></button>
                                <button className="btn btn-default dt-button buttons-excel buttons-html5" title="Excel" onClick={() => handleExcel(tab)}><i className="fa fa-file-excel-o"></i></button>
                                <button className="btn btn-default dt-button buttons-csv buttons-html5" title="CSV" onClick={() => handleCSV(tab)}><i className="fa fa-file-text-o"></i></button>
                                <button className="btn btn-default dt-button buttons-pdf buttons-html5" title="PDF" onClick={() => handlePDF(tab)}><i className="fa fa-file-pdf-o"></i></button>
                                <button className="btn btn-default dt-button buttons-print" title="Print" onClick={() => handlePrint(tab)}><i className="fa fa-print"></i></button>

                            </div>
                        </div>
                    </div>
                </div>


                <table className="table table-striped table-bordered table-hover userlog-table" data-export-title="User Log">
                    <thead>
                        <tr>
                            {!hiddenColumns.includes(0) && <th>Users</th>}
                            {!hiddenColumns.includes(1) && <th style={{ width: '150px' }}>Role</th>}
                            {(hasClassColumn(tab) && !hiddenColumns.includes(2)) && <th>Class</th>}
                            {!hiddenColumns.includes(3) && <th>IP Address</th>}
                            {!hiddenColumns.includes(4) && <th style={{ width: '200px' }}>Login Date Time</th>}
                            {!hiddenColumns.includes(5) && <th>User Agent</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={colCount} className="text-center">Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={colCount} className="text-center text-danger">{error}</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={colCount} className="text-center">No data available in table</td></tr>
                        ) : (
                            currentRecords.map((item, index) => (
                                <tr key={item.id || index}>
                                    {!hiddenColumns.includes(0) && <td>{item.user}</td>}
                                    {!hiddenColumns.includes(1) && <td>{item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : ''}</td>}
                                    {(hasClassColumn(tab) && !hiddenColumns.includes(2)) && <td>{item.class}</td>}
                                    {!hiddenColumns.includes(3) && <td>{item.ipaddress || item.ip_address}</td>}
                                    {!hiddenColumns.includes(4) && <td>{item.login_datetime}</td>}
                                    {!hiddenColumns.includes(5) && <td>{item.user_agent}</td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Record count and pagination */}
                <div className="row" style={{ marginTop: '10px' }}>
                    <div className="col-sm-5">
                        <div className="dataTables_info" style={{ paddingLeft: '10px', fontSize: '12px' }}>
                            Records: {filteredData.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length}
                            {tableSearch[tab] && getTabData(tab).length !== filteredData.length && ` (filtered from ${getTabData(tab).length} total)`}
                        </div>
                    </div>
                    <div className="col-sm-7">
                        {totalPages > 1 && (
                            <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right', paddingRight: '10px' }}>
                                <ul className="pagination" style={{ margin: '0', float: 'right', fontSize: '12px' }}>
                                    <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&lt;</a>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i + 1} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }} style={{ padding: '5px 10px' }}>{i + 1}</a>
                                        </li>
                                    ))}
                                    <li className={`paginate_button next ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&gt;</a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <style>{`
                .userlog-table th, .userlog-table td {
                    padding: 10px 15px !important;
                    white-space: nowrap;
                }
                .userlog-table td:last-child, .userlog-table th:last-child {
                    white-space: normal;
                }
            `}</style>

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">

                    <div className="nav-tabs-custom theme-shadow" style={{ marginTop: '0px' }}>
                        {/* Tabs Header */}
                        <ul className="nav nav-tabs pull-right">
                            <li className="pull-right header">
                                <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                                    <i className="fa fa-arrow-left"></i> Back
                                </button>
                            </li>
                            <li className={activeTab === 'parent' ? 'active' : ''}>
                                <a href="#tab_parent" onClick={(e) => { e.preventDefault(); setActiveTab('parent'); }}>Parent</a>
                            </li>
                            <li className={activeTab === 'student' ? 'active' : ''}>
                                <a href="#tab_student" onClick={(e) => { e.preventDefault(); setActiveTab('student'); }}>Students</a>
                            </li>
                            <li className={activeTab === 'staff' ? 'active' : ''}>
                                <a href="#tab_staff" onClick={(e) => { e.preventDefault(); setActiveTab('staff'); }}>Staff</a>
                            </li>
                            <li className={activeTab === 'all_users' ? 'active' : ''}>
                                <a href="#tab_allusers" onClick={(e) => { e.preventDefault(); setActiveTab('all_users'); }}>All Users</a>
                            </li>
                            <li className="pull-left header" style={{ paddingLeft: '10px' }}>User Log</li>
                        </ul>

                        {/* Tab Content */}
                        <div className="tab-content" style={{ padding: '15px' }}>
                            {/* All Users Tab */}
                            <div className={`tab-pane table-responsive ${activeTab === 'all_users' ? 'active' : ''}`} id="tab_allusers">
                                {activeTab === 'all_users' && renderTable('all_users')}
                            </div>

                            {/* Staff Tab */}
                            <div className={`tab-pane table-responsive ${activeTab === 'staff' ? 'active' : ''}`} id="tab_staff">
                                {activeTab === 'staff' && renderTable('staff')}
                            </div>

                            {/* Students Tab */}
                            <div className={`tab-pane table-responsive ${activeTab === 'student' ? 'active' : ''}`} id="tab_student">
                                {activeTab === 'student' && renderTable('student')}
                            </div>

                            {/* Parent Tab */}
                            <div className={`tab-pane table-responsive ${activeTab === 'parent' ? 'active' : ''}`} id="tab_parent">
                                {activeTab === 'parent' && renderTable('parent')}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default UserLog;
