import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsMenu from "../../components/SettingsMenu";
import Loader from "../../components/Loader";
import "../../utils/include_files.js";
import api from "../../services/api";
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';

const SessionSettings = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newSession, setNewSession] = useState('');
    const [viewSession, setViewSession] = useState(null);
    const [editSession, setEditSession] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
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

                                {/* ROW 2 */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Search */}
                                    <input
                                        type="text"
                                        className="form-control input-sm"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '280px',
                                            border: 'none',
                                            borderBottom: '1px solid #ccc',
                                            borderRadius: 0,
                                            boxShadow: 'none'
                                        }}
                                    />

                                    {/* Icons */}
                                    <div className="dt-buttons btn-group">
                                        <button className="btn btn-default btn-sm dt-button buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                        <button className="btn btn-default btn-sm dt-button buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Session_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                        <button className="btn btn-default btn-sm dt-button buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Session_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                        <button className="btn btn-default btn-sm dt-button buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Session_List.pdf', 'Session List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                        <button className="btn btn-default btn-sm dt-button buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Session List'); }}><i className="fa fa-print"></i></button>
                                        <div className="btn-group">
                                            <button className="btn btn-default btn-sm dt-button buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                <i className="fa fa-columns"></i>
                                            </button>
                                            {showColumnsDropdown && (
                                                <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                    {columns.map(col => (
                                                        <li key={col.index}><label style={{ fontWeight: 'normal', width: '100%', margin: 0, padding: '3px 20px', cursor: 'pointer' }}><input type="checkbox" checked={!hiddenColumns.includes(col.index)} onChange={() => toggleColumnVisibility(col.index)} style={{ marginRight: '10px' }} /> {col.label}</label></li>
                                                    ))}
                                                </ul>
                                            )}
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
                                                {filteredSessions.map((session) => (
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
                        </div>
                    </div>
                </div>
            )}
        </SettingsMenu>
    );
};

export default SessionSettings;
