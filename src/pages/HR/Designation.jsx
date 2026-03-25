import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const Designation = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    const fetchDesignations = async () => {
        setLoading(true);
        try {
            const response = await api.getDesignationList();
            if (response && response.status === 'success') {
                const formattedData = response.designation.map(desig => ({
                    id: desig.id,
                    name: desig.designation
                }));
                setDesignations(formattedData);
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
            // toast.error('Failed to fetch designations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        const isDuplicate = designations.some(desig => 
            desig.name.toLowerCase() === formData.name.trim().toLowerCase() && 
            (!isEditing || desig.id !== formData.id)
        );

        if (isDuplicate) {
            toast.error('Designation name already exists');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const response = await api.updateDesignation({
                    designationid: formData.id,
                    type: formData.name
                });
                if (response && response.status === 'success') {
                    toast.success('Designation updated successfully');
                    fetchDesignations(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to update designation');
                }
            } else {
                const response = await api.addDesignation({ type: formData.name });
                if (response && response.status === 'success') {
                    toast.success('Designation added successfully');
                    fetchDesignations(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to add designation');
                }
            }
            setFormData({ id: '', name: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving designation:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (d) => {
        setLoading(true);
        try {
            const response = await api.getDesignationForEdit(d.id);
            if (response && response.status === 'success' && response.result) {
                setFormData({
                    id: response.result.id,
                    name: response.result.designation
                });
                setIsEditing(true);
            } else {
                toast.error('Failed to fetch designation details');
            }
        } catch (error) {
            console.error('Error fetching designation details:', error);
            toast.error('An error occurred while fetching details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this designation?')) {
            setLoading(true);
            try {
                const response = await api.deleteDesignation(id);
                if (response && response.status === 'success') {
                    toast.success('Designation deleted successfully');
                    fetchDesignations(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to delete designation');
                }
            } catch (error) {
                console.error('Error deleting designation:', error);
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
                                    <h3 className="box-title">{isEditing ? 'Edit Designation' : 'Add Designation'}</h3>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label><small className="req"> *</small>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
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
                                    <h3 className="box-title titlefix">Designation List</h3>
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
                                                ) : designations.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">No Result Found</td>
                                                    </tr>
                                                ) : (
                                                    designations.map(d => (
                                                        <tr key={d.id}>
                                                            <td>{d.name}</td>
                                                            <td className="text-right white-space-nowrap">
                                                                <button
                                                                    onClick={() => handleEdit(d)}
                                                                    className="btn btn-default btn-xs"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(d.id)}
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

export default Designation;
