import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await api.getDepartmentList();
            if (response && response.status === 'success') {
                // Formatting the data to match the expected structure if needed
                // The API returns departmenttype array
                const formattedData = response.departmenttype.map(dept => ({
                    id: dept.id,
                    name: dept.department_name
                }));
                setDepartments(formattedData);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            // toast.error('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
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

        const isDuplicate = departments.some(dept =>
            dept.name.toLowerCase() === formData.name.trim().toLowerCase() &&
            (!isEditing || dept.id !== formData.id)
        );

        if (isDuplicate) {
            toast.error('Department name already exists');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const response = await api.updateDepartment({
                    departmenttypeid: formData.id,
                    type: formData.name
                });
                if (response && response.status === 'success') {
                    toast.success('Department updated successfully');
                    fetchDepartments(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to update department');
                }
            } else {
                const response = await api.addDepartment({ type: formData.name });
                if (response && response.status === 'success') {
                    toast.success('Department added successfully');
                    fetchDepartments(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to add department');
                }
            }
            setFormData({ id: '', name: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving department:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (d) => {
        setLoading(true);
        try {
            const response = await api.getDepartmentForEdit(d.id);
            if (response && response.status === 'success' && response.result) {
                setFormData({
                    id: response.result.id,
                    name: response.result.department_name
                });
                setIsEditing(true);
            } else {
                toast.error('Failed to fetch department details');
            }
        } catch (error) {
            console.error('Error fetching department details:', error);
            toast.error('An error occurred while fetching details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            setLoading(true);
            try {
                const response = await api.deleteDepartment(id);
                if (response && response.status === 'success') {
                    toast.success('Department deleted successfully');
                    fetchDepartments(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to delete department');
                }
            } catch (error) {
                console.error('Error deleting department:', error);
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
                                    <h3 className="box-title">{isEditing ? 'Edit Department' : 'Add Department'}</h3>
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
                                    <h3 className="box-title titlefix">Department List</h3>
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
                                                ) : departments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">No Result Found</td>
                                                    </tr>
                                                ) : (
                                                    departments.map(d => (
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

export default Department;
