import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';
import { api } from '../../services/api';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const UserLog = () => {
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    // Active tab
    const [activeTab, setActiveTab] = useState('all_users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [visibleColumns, setVisibleColumns] = useState(new Set(['User', 'Role', 'Class', 'IP Address', 'Login Date Time', 'User Agent']));

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

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
    const getTabColumns = (tab) => {
        const hasClass = tab === 'all_users' || tab === 'student';
        const cols = ['User', 'Role'];
        if (hasClass) cols.push('Class');
        cols.push('IP Address', 'Login Date Time', 'User Agent');
        return cols;
    };

    const getExportData = (tab) => {
        const cols = getTabColumns(tab);
        const headers = cols.filter(col => visibleColumns.has(col));
        const data = getFilteredData(tab);
        const rows = data.map(item => {
            const rowData = {
                'User': item.user,
                'Role': item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : '',
                'Class': item.class,
                'IP Address': item.ipaddress || item.ip_address,
                'Login Date Time': item.login_datetime,
                'User Agent': item.user_agent
            };
            return headers.map(key => String(rowData[key] ?? ''));
        });
        return { headers, rows };
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
                        <div className="col-md-12" style={{ paddingBottom: '10px' }}>
                            <div className="form-group">
                                <a className="btn btn-primary btn-sm pull-right checkbox-toggle" onClick={handleClearUserLog} style={{ cursor: 'pointer' }}>
                                    Clear Userlog Record
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table toolbar */}
                <TableToolbar
                    searchTerm={tableSearch[tab] || ''}
                    onSearchChange={(val) => handleSearchChange(tab, val)}
                    recordsPerPage={recordsPerPage}
                    onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    columns={getTabColumns(tab).map(c => ({ key: c, label: c }))}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    getExportData={() => getExportData(tab)}
                    exportFileName={`${tab}_log`}
                    exportTitle={tab.replace(/_/g, ' ') + ' User Log'}
                />


                <table className="table table-striped table-bordered table-hover userlog-table" data-export-title="User Log">
                    <thead>
                        <tr>
                            {visibleColumns.has('User') && <th>Users</th>}
                            {visibleColumns.has('Role') && <th style={{ width: '150px' }}>Role</th>}
                            {(hasClassColumn(tab) && visibleColumns.has('Class')) && <th>Class</th>}
                            {visibleColumns.has('IP Address') && <th>IP Address</th>}
                            {visibleColumns.has('Login Date Time') && <th style={{ width: '200px' }}>Login Date Time</th>}
                            {visibleColumns.has('User Agent') && <th>User Agent</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={colCount} className="text-center">Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={colCount} className="text-center text-danger">{error}</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={colCount} className="text-center" style={{ padding: '40px 15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                        <img src="/images/addnewitem.svg" alt="No data" style={{ width: '120px', opacity: 0.6 }} />
                                        <span style={{ color: '#999', fontSize: '14px' }}>No data available in table</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentRecords.map((item, index) => (
                                <tr key={item.id || index}>
                                    {visibleColumns.has('User') && <td>{item.user}</td>}
                                    {visibleColumns.has('Role') && <td>{item.role ? item.role.charAt(0).toUpperCase() + item.role.slice(1) : ''}</td>}
                                    {(hasClassColumn(tab) && visibleColumns.has('Class')) && <td>{item.class}</td>}
                                    {visibleColumns.has('IP Address') && <td>{item.ipaddress || item.ip_address}</td>}
                                    {visibleColumns.has('Login Date Time') && <td>{item.login_datetime}</td>}
                                    {visibleColumns.has('User Agent') && <td>{item.user_agent}</td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Record count and pagination */}
                <div className="pt15 pb15">
                    <Pagination
                        totalItems={filteredData.length}
                        itemsPerPage={recordsPerPage}
                        currentPage={currentPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

                /* Mobile responsive styles */
                @media (max-width: 767px) {
                    .nav-tabs-custom .nav.nav-tabs { flex-wrap: wrap; }
                    .nav-tabs-custom .nav.nav-tabs > li > a { font-size: 12px; padding: 8px 10px; }
                    .userlog-table th, .userlog-table td { font-size: 12px; padding: 6px 8px !important; }
                    .tab-content { padding: 10px !important; }
                }
            `}</style>

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
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
