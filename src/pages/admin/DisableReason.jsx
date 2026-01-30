import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import '../../utils/include_files';

const DisableReason = () => {
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Form state
    const [reasonId, setReasonId] = useState('');
    const [reasonName, setReasonName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Fetch disable reasons on mount
    useEffect(() => {
        fetchDisableReasons();
    }, []);

    const fetchDisableReasons = async () => {
        setLoading(true);
        try {
            const response = await api.getDisableReasonList();
            if (response.status && response.data) {
                setReasons(response.data.reasons || []);
            }
        } catch (error) {
            console.error('Error fetching disable reasons:', error);
            setErrorMessage('Failed to load disable reasons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reasonName.trim()) {
            setErrorMessage('Please enter a disable reason');
            return;
        }

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            let response;
            if (isEditing && reasonId) {
                response = await api.updateDisableReason({
                    id: reasonId,
                    reason: reasonName
                });
            } else {
                response = await api.addDisableReason({
                    reason: reasonName
                });
            }

            if (response.status === 'success' || response.status === true) {
                setSuccessMessage(response.message || 'Record saved successfully');
                setReasonName('');
                setReasonId('');
                setIsEditing(false);
                fetchDisableReasons();
            } else {
                setErrorMessage(response.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Error saving disable reason:', error);
            setErrorMessage(error.message || 'Failed to save disable reason');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (reason) => {
        setReasonId(reason.id);
        setReasonName(reason.reason);
        setIsEditing(true);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            const response = await api.deleteDisableReason(id);
            if (response.status === 'success' || response.status === true) {
                setSuccessMessage('Record deleted successfully');
                fetchDisableReasons();
            } else {
                setErrorMessage(response.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting disable reason:', error);
            setErrorMessage(error.message || 'Failed to delete');
        }
    };

    const handleReset = () => {
        setReasonId('');
        setReasonName('');
        setIsEditing(false);
        setSuccessMessage('');
        setErrorMessage('');
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="row">
                        {/* Add/Edit Form - Left Column */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">
                                        <i className="fa fa-users"></i> {isEditing ? 'Edit Disable Reason' : 'Add Disable Reason'}
                                    </h3>
                                </div>
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        {successMessage && (
                                            <div className="alert alert-success">{successMessage}</div>
                                        )}
                                        {errorMessage && (
                                            <div className="alert alert-danger">{errorMessage}</div>
                                        )}

                                        <input type="hidden" id="reason_id" name="reason_id" value={reasonId} />

                                        <div className="row">
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label htmlFor="name">Disable Reason <small className="req">*</small></label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        className="form-control"
                                                        value={reasonName}
                                                        onChange={(e) => setReasonName(e.target.value)}
                                                        placeholder="Enter disable reason"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="btn btn-default"
                                                onClick={handleReset}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn btn-info pull-right"
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List - Right Column */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title">
                                        <i className="fa fa-users"></i> Disable Reason List
                                    </h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Disable Reason List</div>

                                    <div className="mailbox-messages">
                                        {loading ? (
                                            <div className="text-center" style={{ padding: '20px' }}>
                                                <i className="fa fa-spinner fa-spin fa-2x"></i>
                                                <p>Loading...</p>
                                            </div>
                                        ) : (
                                            <table className="table table-hover table-striped table-bordered example">
                                                <thead>
                                                    <tr>
                                                        <th>Disable Reason</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reasons.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="2" className="text-center">
                                                                No disable reasons found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        reasons.map((reason) => (
                                                            <tr key={reason.id}>
                                                                <td>{reason.reason}</td>
                                                                <td className="text-right">
                                                                    <button
                                                                        className="btn btn-default btn-xs"
                                                                        onClick={() => handleEdit(reason)}
                                                                        data-toggle="tooltip"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </button>
                                                                    {' '}
                                                                    <button
                                                                        className="btn btn-default btn-xs"
                                                                        onClick={() => handleDelete(reason.id)}
                                                                        data-toggle="tooltip"
                                                                        title="Delete"
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
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

export default DisableReason;
