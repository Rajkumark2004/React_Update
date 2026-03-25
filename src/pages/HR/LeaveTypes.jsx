import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const LeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        type: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const response = await api.getLeaveTypeList();
            if (response && response.status === 'success') {
                const formattedData = response.leavetype.map(lt => ({
                    id: lt.id,
                    type: lt.type
                }));
                setLeaveTypes(formattedData);
            }
        } catch (error) {
            console.error('Error fetching leave types:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, type: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.type.trim()) {
            toast.error('Name is required');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const response = await api.updateLeaveType({
                    leavetypeid: formData.id,
                    type: formData.type
                });
                if (response && response.status === 'success') {
                    toast.success('Leave Type updated successfully');
                    fetchLeaveTypes(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to update leave type');
                }
            } else {
                const response = await api.createLeaveType({ type: formData.type });
                if (response && response.status === 'success') {
                    if (response.id === null) {
                        toast.error('Leave type already exists');
                    } else {
                        toast.success('Leave Type added successfully');
                        fetchLeaveTypes(); // Refresh the list
                    }
                } else {
                    toast.error(response?.message || 'Failed to add leave type');
                }
            }
            setFormData({ id: '', type: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving leave type:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (lt) => {
        setLoading(true);
        try {
            const response = await api.getLeaveTypeForEdit(lt.id);
            if (response && response.status === 'success' && response.result) {
                setFormData({
                    id: response.result.id,
                    type: response.result.type
                });
                setIsEditing(true);
            } else {
                toast.error('Failed to fetch leave type details');
            }
        } catch (error) {
            console.error('Error fetching leave type details:', error);
            toast.error('An error occurred while fetching details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this leave type?')) {
            setLoading(true);
            try {
                const response = await api.deleteLeaveType(id);
                if (response && response.status === 'success') {
                    toast.success('Leave Type deleted successfully');
                    fetchLeaveTypes(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to delete leave type');
                }
            } catch (error) {
                console.error('Error deleting leave type:', error);
                toast.error('An error occurred while deleting');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditing ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label><small className="req"> *</small>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary pull-right">
                                            {isEditing ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Leave Type List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive no-padding">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : leaveTypes.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">No Result Found</td>
                                                    </tr>
                                                ) : (
                                                    leaveTypes.map(lt => (
                                                        <tr key={lt.id}>
                                                            <td>{lt.type}</td>
                                                            <td className="text-right white-space-nowrap">
                                                                <button
                                                                    onClick={() => handleEdit(lt)}
                                                                    className="btn btn-default btn-xs"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(lt.id)}
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    style={{ marginLeft: '3px' }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
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

export default LeaveTypes;
