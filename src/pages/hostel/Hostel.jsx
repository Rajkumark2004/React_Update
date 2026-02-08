import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';

const Hostel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        hostel_name: '',
        type: '',
        address: '',
        intake: '',
        description: ''
    });

    const [hostellist, setHostelList] = useState([]);
    const hostelTypes = ['Boys', 'Girls', 'Combined']; // Hostel type options

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getHostelData();

            if (response && response.status && response.data) {
                setHostelList(response.data.listhostel || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.hostel_name) {
            toast.error('Please enter hostel name');
            return;
        }
        if (!formData.type) {
            toast.error('Please select type');
            return;
        }

        setLoading(true);
        try {
            const response = await api.createHostel(formData);

            if (response && response.status === true) {
                toast.success(response.message || 'Hostel added successfully');
                setFormData({
                    hostel_name: '',
                    type: '',
                    address: '',
                    intake: '',
                    description: ''
                });
                fetchData(); // Refresh list
            } else {
                toast.error(response.message || 'Failed to add hostel');
            }
        } catch (error) {
            console.error('Error creating hostel:', error);
            toast.error('Failed to add hostel');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this hostel?')) {
            try {
                const response = await api.deleteHostel(id);

                if (response && response.status === true) {
                    toast.success(response.message || 'Hostel deleted successfully');
                    fetchData();
                } else {
                    toast.error(response.message || 'Failed to delete hostel');
                }
            } catch (error) {
                console.error('Error deleting hostel:', error);
                toast.error('Failed to delete hostel');
            }
        }
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '16px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-building-o"></i> Hostel
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Add Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Hostel</h3>
                                </div>
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Hostel Name<small className="req"> *</small></label>
                                            <input
                                                type="text"
                                                name="hostel_name"
                                                value={formData.hostel_name}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                                autoFocus
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Type<small className="req"> *</small></label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select</option>
                                                {hostelTypes.map(type => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Intake</label>
                                            <input
                                                type="text"
                                                name="intake"
                                                value={formData.intake}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows="3"
                                                placeholder=""
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Hostel List */}
                        <div className="col-md-8">
                            <div className="box box-primary" id="holist">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Hostel List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages table-responsive overflow-visible">
                                        <div className="download_label">Hostel List</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Hostel Name</th>
                                                    <th>Type</th>
                                                    <th>Address</th>
                                                    <th>Intake</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {hostellist.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    hostellist.map(hostel => (
                                                        <tr key={hostel.id}>
                                                            <td className="mailbox-name">
                                                                <a
                                                                    href="#"
                                                                    data-toggle="tooltip"
                                                                    title={hostel.description || 'No description'}
                                                                    onClick={(e) => e.preventDefault()}
                                                                >
                                                                    {hostel.hostel_name}
                                                                </a>
                                                            </td>
                                                            <td className="mailbox-name">{hostel.type}</td>
                                                            <td className="mailbox-name">{hostel.address}</td>
                                                            <td className="mailbox-name">{hostel.intake}</td>
                                                            <td className="mailbox-date pull-right no-print">
                                                                <Link
                                                                    to={`/admin/hostel/edit/${hostel.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(hostel.id)}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Delete"
                                                                    style={{ marginLeft: '5px' }}
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

export default Hostel;
