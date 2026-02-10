import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsMenu from "../../components/SettingsMenu";
import Loader from "../../components/Loader";
import "../../utils/include_files.js";
import api from "../../services/api";

const SessionSettings = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newSession, setNewSession] = useState('');

    const [viewSession, setViewSession] = useState(null);

    const [editSession, setEditSession] = useState(null);

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
                                        style={{
                                            width: '280px',
                                            border: 'none',
                                            borderBottom: '1px solid #ccc',
                                            borderRadius: 0,
                                            boxShadow: 'none'
                                        }}
                                    />

                                    {/* Icons */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '10px'
                                        }}
                                    >
                                        <button className="btn btn-default btn-xs" title="Copy">
                                            <i className="fa fa-files-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-xs" title="Excel">
                                            <i className="fa fa-file-excel-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-xs" title="CSV">
                                            <i className="fa fa-file-text-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-xs" title="PDF">
                                            <i className="fa fa-file-pdf-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-xs" title="Print">
                                            <i className="fa fa-print"></i>
                                        </button>
                                        <button className="btn btn-default btn-xs" title="Columns">
                                            <i className="fa fa-columns"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="box-body">
                                <div className="mailbox-messages">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Session</th>
                                                    <th>Status</th>
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sessions.map((session) => (
                                                    <tr key={session.id}>
                                                        <td className="mailbox-name">
                                                            <a href="#" onClick={(e) => { e.preventDefault(); setViewSession(session); }} title="View">
                                                                {session.session}
                                                            </a>
                                                        </td>
                                                        <td className="mailbox-name">
                                                            {session.status === 'active' && <span className="label bg-green font-weight-normal">Active</span>}
                                                        </td>
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
