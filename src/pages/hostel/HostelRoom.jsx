import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';

const HostelRoom = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        room_no: '',
        hostel_id: '',
        room_type_id: '',
        no_of_bed: '',
        cost_per_bed: '',
        description: ''
    });

    // Mock data - will be replaced with API calls
    const [hostellist, setHostelList] = useState([]);
    const [roomtypelist, setRoomTypeList] = useState([]);
    const [hostelroomlist, setHostelRoomList] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getHostelRoomData();

            if (response && response.status && response.data) {
                setHostelList(response.data.hostellist || []);
                setRoomTypeList(response.data.roomtypelist || []);
                setHostelRoomList(response.data.hostelroomlist || []);
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
        if (!formData.room_no) {
            toast.error('Please enter room number');
            return;
        }
        if (!formData.hostel_id) {
            toast.error('Please select hostel');
            return;
        }
        if (!formData.room_type_id) {
            toast.error('Please select room type');
            return;
        }
        if (!formData.no_of_bed) {
            toast.error('Please enter number of beds');
            return;
        }
        if (!formData.cost_per_bed) {
            toast.error('Please enter cost per bed');
            return;
        }

        setLoading(true);
        try {
            const response = await api.createHostelRoom(formData);

            if (response && response.status === true) {
                toast.success(response.message || 'Hostel room added successfully');
                setFormData({
                    room_no: '',
                    hostel_id: '',
                    room_type_id: '',
                    no_of_bed: '',
                    cost_per_bed: '',
                    description: ''
                });
                fetchData(); // Refresh list
            } else {
                toast.error(response.message || 'Failed to add hostel room');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Failed to add hostel room');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this hostel room?')) {
            try {
                const response = await api.deleteHostelRoom(id);

                if (response && response.status === true) {
                    toast.success(response.message || 'Hostel room deleted successfully');
                    fetchData();
                } else {
                    toast.error(response.message || 'Failed to delete hostel room');
                }
            } catch (error) {
                console.error('Error deleting room:', error);
                toast.error('Failed to delete hostel room');
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
                        {/* Left Sidebar (Submenu) */}
                        <div className="col-md-2 hide-mobile">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Front Office</h3>
                                </div>
                                <ul className="tablists">
                                    <li className="active">
                                        <Link to="/admin/hostelroom" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/reports/12.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Hostel Rooms
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/roomtype">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/front_office/2.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Room Type
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/hostel">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/front_office/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Hostel
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Add Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Hostel Room</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Room Number / Name<small className="req"> *</small></label>
                                            <input
                                                type="text"
                                                name="room_no"
                                                value={formData.room_no}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                                autoFocus
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Hostel<small className="req"> *</small></label>
                                            <select
                                                name="hostel_id"
                                                value={formData.hostel_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select</option>
                                                {hostellist.map(hostel => (
                                                    <option key={hostel.id} value={hostel.id}>
                                                        {hostel.hostel_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Room Type<small className="req"> *</small></label>
                                            <select
                                                name="room_type_id"
                                                value={formData.room_type_id}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select</option>
                                                {roomtypelist.map(roomtype => (
                                                    <option key={roomtype.id} value={roomtype.id}>
                                                        {roomtype.room_type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Number of Bed<small className="req"> *</small></label>
                                            <input
                                                type="text"
                                                name="no_of_bed"
                                                value={formData.no_of_bed}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Cost Per Bed<small className="req"> *</small></label>
                                            <input
                                                type="text"
                                                name="cost_per_bed"
                                                value={formData.cost_per_bed}
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

                        {/* Room List */}
                        <div className="col-md-6">
                            <div className="box box-primary" id="hroom">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Hostel Room List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages table-responsive overflow-visible">
                                        <div className="download_label">Hostel Room List</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Room Number / Name</th>
                                                    <th>Hostel</th>
                                                    <th>Room Type</th>
                                                    <th>Number of Bed</th>
                                                    <th className="text-right">Cost Per Bed</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {hostelroomlist.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    hostelroomlist.map(room => (
                                                        <tr key={room.id}>
                                                            <td className="mailbox-name">
                                                                <a
                                                                    href="#"
                                                                    data-toggle="tooltip"
                                                                    title={room.description || 'No description'}
                                                                    onClick={(e) => e.preventDefault()}
                                                                >
                                                                    {room.room_no}
                                                                </a>
                                                            </td>
                                                            <td className="mailbox-name">{room.hostel_name}</td>
                                                            <td className="mailbox-name">{room.room_type}</td>
                                                            <td className="mailbox-name">{room.no_of_bed}</td>
                                                            <td className="mailbox-name text-right">{room.cost_per_bed}</td>
                                                            <td className="mailbox-date pull-right no-print">
                                                                <Link
                                                                    to={`/admin/hostelroom/edit/${room.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(room.id)}
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

export default HostelRoom;
