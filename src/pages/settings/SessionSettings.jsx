import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsMenu from "../../components/SettingsMenu";
import Loader from "../../components/Loader";
import "../../utils/include_files.js";
import api from "../../services/api";
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from "../../utils/Pagination";

const SessionSettings = () => {
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newSession, setNewSession] = useState('');
    const [viewSession, setViewSession] = useState(null);
    const [editSession, setEditSession] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(50);
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const columns = [
        { index: 0, label: 'Session' },
        { index: 1, label: 'Status' }
    ];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const filteredSessions = sessions.filter(s =>
        s.session.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastRecord = currentPage * (recordsPerPage === -1 ? filteredSessions.length : recordsPerPage);
    const indexOfFirstRecord = indexOfLastRecord - (recordsPerPage === -1 ? filteredSessions.length : recordsPerPage);
    const currentRecords = filteredSessions.slice(indexOfFirstRecord, indexOfLastRecord);

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Session");
        if (!hiddenColumns.includes(1)) headers.push("Status");

        const rows = filteredSessions.map(session => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(session.session);
            if (!hiddenColumns.includes(1)) row.push(session.status === 'active' ? 'Active' : 'Inactive');
            return row;
        });

        return { headers, rows };
    };

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const response = await api.getSessions();
            // Map API response to component format
            const formattedSessions = (response.data || []).map(s => ({
                id: parseInt(s.id),
                session: s.session,
                status: s.active != 0 ? 'active' : 'inactive',
                created_at: s.created_at
            }));
            setSessions(formattedSessions);
        } catch (err) {
            setError(err.message || 'Failed to load sessions');
            console.error('Error fetching sessions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch sessions on component mount
    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        if (editSession) {
            // Edit mode
            try {
                setIsLoading(true);
                await api.updateSession(editSession.id, { session: newSession });
                alert('Session Updated Successfully');
                setEditSession(null);
                setNewSession('');
                await fetchSessions();
            } catch (error) {
                console.error('Error updating session:', error);
                alert(error.message || 'Error updating session');
            } finally {
                setIsLoading(false);
            }
        } else if (newSession) {
            // Add mode
            try {
                setIsLoading(true);
                await api.createSession(newSession);
                alert('Session Created Successfully');
                setNewSession('');
                await fetchSessions();
            } catch (error) {
                console.error('Error creating session:', error);
                alert(error.message || 'Error creating session');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = async (session) => {
        try {
            setIsLoading(true);
            const response = await api.getSession(session.id);
            if (response.status === 'success' && response.session) {
                setEditSession(response.session);
                setNewSession(response.session.session);
            } else {
                // Fallback to local data if API structure doesn't match expectations
                setEditSession(session);
                setNewSession(session.session);
            }
        } catch (error) {
            console.error('Error fetching session details:', error);
            // Fallback to local data on error
            setEditSession(session);
            setNewSession(session.session);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditSession(null);
        setNewSession('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                setIsLoading(true);
                await api.deleteSession(id);
                alert('Session Deleted Successfully');
                await fetchSessions();
            } catch (error) {
                console.error('Error deleting session:', error);
                alert(error.message || 'Error deleting session');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (viewSession) {
        return (
            <SettingsMenu>
                <div className="row">
                    <div className="col-md-12">
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">Session List</h3>
                                <div className="box-tools pull-right"></div>
                            </div>
                            <div className="box-body no-padding">
                                <div className="mailbox-controls">
                                    <button onClick={() => setViewSession(null)} className="btn btn-primary btn-sm" data-toggle="tooltip" title="Add Session">
                                        <i className="fa fa-plus"></i> Add Session
                                    </button>
                                </div>
                                <div className="table-responsive mailbox-messages">
                                    <table className="table table-hover table-striped">
                                        <tbody>
                                            <tr>
                                                <td>Session</td>
                                                <td className="mailbox-name"><a href="#" onClick={(e) => e.preventDefault()}>{viewSession.session}</a></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="box-footer">
                                <div className="mailbox-controls">
                                    <div className="pull-right"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsMenu>
        );
    }

    return (
        <SettingsMenu>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="row">
                    <style>{`
                        @media (max-width: 767px) {
                            .col-md-4, .col-md-8 { width: 100% !important; float: none !important; }
                            .box-header h3.box-title { font-size: 16px !important; }
                            .table th, .table td { font-size: 12px; padding: 6px 8px !important; }
                        }
                    `}</style>
                    {/* Add/Edit Session Column */}
                    <div className="col-md-4">
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">{editSession ? 'Edit Session' : 'Add Session'}</h3>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="box-body">
                                    <div className="form-group mb5">
                                        <label>Session</label><small className="req"> *</small>
                                        <input
                                            autoFocus
                                            type="text"
                                            className="form-control"
                                            value={newSession}
                                            onChange={(e) => setNewSession(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="box-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                                    {editSession && (
                                        <button type="button" className="btn btn-default pull-right" style={{ marginRight: '5px' }} onClick={cancelEdit}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Session List Column */}
                    <div className="col-md-8">
                        <div className="box box-primary">
                            <div
                                className="box-header"
                                style={{
                                    padding: '15px',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                {/* ROW 1 */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '15px'
                                    }}
                                >
                                    <h3
                                        className="box-title"
                                        style={{
                                            margin: 0,
                                            fontSize: '20px',
                                            fontWeight: 500
                                        }}
                                    >
                                        Session List
                                    </h3>

                                    <button
                                        className="btn btn-primary btn-sm"
                                        style={{
                                            borderRadius: '20px',
                                            padding: '6px 14px'
                                        }}
                                        onClick={() => navigate('/settings')}
                                    >
                                        <i className="fa fa-arrow-left"></i> Back
                                    </button>
                                </div>

                                {/* ROW 2 - Standardized toolbar */}
                                <div
                                    className="row mb-2 no-print"
                                    style={{
                                        marginBottom: '10px',
                                        display: isMobile ? 'flex' : 'block',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        alignItems: isMobile ? 'center' : 'stretch',
                                        gap: isMobile ? '15px' : '0'
                                    }}
                                >
                                    <div
                                        className={isMobile ? '' : 'col-sm-6'}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: isMobile ? '15px' : '20px',
                                            justifyContent: isMobile ? 'center' : 'flex-start',
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        <div className="dataTables_length">
                                            <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                Records:
                                                <select
                                                    value={recordsPerPage}
                                                    onChange={(e) => {
                                                        setRecordsPerPage(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }}
                                                    className="form-control input-sm"
                                                    style={{ width: '80px', margin: '0 10px' }}
                                                >
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                    <option value="-1">All</option>
                                                </select>
                                            </label>
                                        </div>
                                        <div className="dataTables_filter">
                                            <input
                                                type="search"
                                                className="form-control input-sm"
                                                placeholder="Search..."
                                                style={{
                                                    display: 'inline-block',
                                                    width: '180px',
                                                    border: 'none',
                                                    borderBottom: '1px solid #ccc',
                                                    borderRadius: '0',
                                                    boxShadow: 'none',
                                                    backgroundColor: 'transparent',
                                                    paddingLeft: '0',
                                                    outline: 'none',
                                                    textAlign: isMobile ? 'center' : 'left'
                                                }}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={isMobile ? 'text-center' : 'col-sm-6 text-right'}>
                                        <div className="dt-buttons btn-group" style={{ float: 'right' }}>
                                            <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                <i className="fa fa-files-o"></i>
                                            </button>
                                            <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Session_List.xls'); }}>
                                                <i className="fa fa-file-excel-o"></i>
                                            </button>
                                            <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Session_List.csv'); }}>
                                                <i className="fa fa-file-text-o"></i>
                                            </button>
                                            <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Session_List.pdf', 'Session List'); }}>
                                                <i className="fa fa-file-pdf-o"></i>
                                            </button>
                                            <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Session List'); }}>
                                                <i className="fa fa-print"></i>
                                            </button>
                                            <div className="btn-group">
                                                <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                    <i className="fa fa-columns"></i>
                                                </button>
                                                {showColumnsDropdown && (
                                                    <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                        {columns.map(col => (
                                                            <label key={col.index} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left' }}>
                                                                <input type="checkbox" checked={!hiddenColumns.includes(col.index)} onChange={() => toggleColumnVisibility(col.index)} style={{ marginRight: '6px' }} /> {col.label}
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="box-body">
                                <div className="mailbox-messages">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {!hiddenColumns.includes(0) && <th>Session</th>}
                                                    {!hiddenColumns.includes(1) && <th>Status</th>}
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentRecords.map((session) => (
                                                    <tr key={session.id}>
                                                        {!hiddenColumns.includes(0) && <td className="mailbox-name">
                                                            <a href="#" onClick={(e) => { e.preventDefault(); setViewSession(session); }} title="View">
                                                                {session.session}
                                                            </a>
                                                        </td>}
                                                        {!hiddenColumns.includes(1) && <td className="mailbox-name">
                                                            {session.status === 'active' && <span className="label bg-green font-weight-normal">Active</span>}
                                                        </td>}
                                                        <td className="mailbox-date text-right">
                                                            <button className="btn btn-default btn-xs" title="Edit" onClick={() => startEdit(session)}>
                                                                <i className="fa fa-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Delete"
                                                                disabled={session.status === 'active'}
                                                                onClick={() => handleDelete(session.id)}
                                                            >
                                                                <i className="fa fa-remove"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {filteredSessions.length > 0 && (
                                <div style={{ paddingLeft: '5px', paddingRight: '5px' }}>
                                    <Pagination
                                        totalItems={filteredSessions.length}
                                        itemsPerPage={recordsPerPage}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SettingsMenu>
    );
};

export default SessionSettings;
