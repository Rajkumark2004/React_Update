import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';

const RoomType = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        room_type: '',
        description: ''
    });

    const [roomtypelist, setRoomTypeList] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getRoomTypeData();

            if (response && response.status && response.data) {
                setRoomTypeList(response.data.roomtypelist || []);
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
        if (!formData.room_type) {
            toast.error('Please enter room type');
            return;
        }

        setLoading(true);
        try {
            const response = await api.createRoomType(formData);

            if (response && response.status === true) {
                toast.success(response.message || 'Room type added successfully');
                setFormData({
                    room_type: '',
                    description: ''
                });
                fetchData(); // Refresh list
            } else {
                toast.error(response.message || 'Failed to add room type');
            }
        } catch (error) {
            console.error('Error creating room type:', error);
            toast.error('Failed to add room type');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room type?')) {
            try {
                const response = await api.deleteRoomType(id);

                if (response && response.status === true) {
                    toast.success(response.message || 'Room type deleted successfully');
                    fetchData();
                } else {
                    toast.error(response.message || 'Failed to delete room type');
                }
            } catch (error) {
                console.error('Error deleting room type:', error);
                toast.error('Failed to delete room type');
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
                                    <h3 className="box-title">Add Room Type</h3>
                                </div>
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Room Type<small className="req"> *</small></label>
                                            <input
                                                type="text"
                                                name="room_type"
                                                value={formData.room_type}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                                autoFocus
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

                        {/* Room Type List */}
                        <div className="col-md-8">
                            <div className="box box-primary" id="rtype">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Room Type List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <div className="download_label">Room Type List</div>
                                        <div className="table-responsive overflow-visible">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        <th>Room Type</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {roomtypelist.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="2" className="text-center">No Record Found</td>
                                                        </tr>
                                                    ) : (
                                                        roomtypelist.map(roomtype => (
                                                            <tr key={roomtype.id}>
                                                                <td className="mailbox-name">
                                                                    <a
                                                                        href="#"
                                                                        data-toggle="tooltip"
                                                                        title={roomtype.description || 'No description'}
                                                                        onClick={(e) => e.preventDefault()}
                                                                    >
                                                                        {roomtype.room_type}
                                                                    </a>
                                                                </td>
                                                                <td className="mailbox-date pull-right no-print">
                                                                    <Link
                                                                        to={`/admin/roomtype/edit/${roomtype.id}`}
                                                                        className="btn btn-default btn-xs"
                                                                        data-toggle="tooltip"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDelete(roomtype.id)}
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
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default RoomType;
