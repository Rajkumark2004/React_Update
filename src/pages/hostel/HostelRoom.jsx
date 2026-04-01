import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';
import { validateRoomNo, validateNoOfBeds, validateCost, validateDescription, sanitizeNameWithNumbers, sanitizeNumbers, sanitizeDecimal } from '../../utils/validation';

const HostelRoom = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        room_no: '',
        hostel_id: '',
        room_type_id: '',
        no_of_bed: '',
        cost_per_bed: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    // Mock data - will be replaced with API calls
    const [hostellist, setHostelList] = useState([]);
    const [roomtypelist, setRoomTypeList] = useState([]);
    const [hostelroomlist, setHostelRoomList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Columns
    const columns = [
        { key: 'room_no', label: 'Room Number / Name', sortKey: 'room_no' },
        { key: 'hostel_name', label: 'Hostel', sortKey: 'hostel_name' },
        { key: 'room_type', label: 'Room Type', sortKey: 'room_type' },
        { key: 'no_of_bed', label: 'Number of Bed', sortKey: 'no_of_bed' },
        { key: 'cost_per_bed', label: 'Cost Per Bed', sortKey: 'cost_per_bed' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) newVisible.delete(key);
        else newVisible.add(key);
        setVisibleColumns(newVisible);
    };

    const { sortedData, requestSort, sortConfig, getSortIcon } = useTableSort(hostelroomlist);

    const filteredHostelRoomList = sortedData.filter(room =>
        Object.values(room).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Export Data formatting
    const formatCell = (row, key) => {
        return row[key] || '';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, filteredHostelRoomList, formatCell);
    };

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
        let sanitizedValue = value;
        let errorMsg = '';
        
        if (name === 'room_no') {
            if (value.length > 50) {
                errorMsg = 'Maximum 50 characters allowed';
            }
            sanitizedValue = sanitizeNameWithNumbers(value);
        }
        if (name === 'no_of_bed') sanitizedValue = sanitizeNumbers(value);
        if (name === 'cost_per_bed') sanitizedValue = sanitizeDecimal(value);
        
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};

        const roomNoError = validateRoomNo(formData.room_no);
        if (roomNoError) {
            newErrors.room_no = roomNoError;
        }

        if (!formData.hostel_id) {
            newErrors.hostel_id = 'Please select hostel';
        }

        if (!formData.room_type_id) {
            newErrors.room_type_id = 'Please select room type';
        }

        const noOfBedsError = validateNoOfBeds(formData.no_of_bed);
        if (noOfBedsError) {
            newErrors.no_of_bed = noOfBedsError;
        }

        const costError = validateCost(formData.cost_per_bed);
        if (costError) {
            newErrors.cost_per_bed = costError;
        }

        const descriptionError = validateDescription(formData.description);
        if (descriptionError) {
            newErrors.description = descriptionError;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({}); // Clear errors if validation passes

        setSubmitting(true);
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
            setSubmitting(false);
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

            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '0px' }}>
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
                                                maxLength={51} // 51 to capture the keypress and show the validation toast
                                                autoFocus
                                            />
                                            {errors.room_no && <span className="text-danger">{errors.room_no}</span>}
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
                                            {errors.hostel_id && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.hostel_id}</span>}
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
                                            {errors.room_type_id && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.room_type_id}</span>}
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
                                            {errors.no_of_bed && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.no_of_bed}</span>}
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
                                            {errors.cost_per_bed && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.cost_per_bed}</span>}
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
                                            {errors.description && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.description}</span>}
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Save'}
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
                                    <div className="mailbox-controls">
                                        <div className="pull-left">
                                            <div className="btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'hostel_room_list.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'hostel_room_list.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'hostel_room_list.pdf', 'Hostel Room List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Hostel Room List'); }}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group">
                                                    <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false" title="Columns">
                                                        <i className="fa fa-columns"></i> <span></span>
                                                    </button>
                                                    <ul className="dropdown-menu" style={{ padding: '10px', minWidth: '150px' }}>
                                                        {columns.map(col => (
                                                            <li key={col.key} style={{ padding: '0px' }}>
                                                                <label style={{ display: 'block', margin: '0', fontWeight: 'normal', cursor: 'pointer' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={visibleColumns.has(col.key)}
                                                                        onChange={() => toggleColumn(col.key)}
                                                                        style={{ marginRight: '8px' }}
                                                                    />
                                                                    {col.label}
                                                                </label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pull-right">
                                            <div className="has-feedback">
                                                <input
                                                    type="text"
                                                    className="form-control input-sm"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <span className="glyphicon glyphicon-search form-control-feedback"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mailbox-messages table-responsive overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => requestSort(col.sortKey)} style={{ cursor: 'pointer' }} className={col.key === 'cost_per_bed' ? 'text-right' : ''}>
                                                            {col.label} {getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHostelRoomList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    filteredHostelRoomList.map(room => (
                                                        <tr key={room.id}>
                                                            {visibleColumns.has('room_no') && <td className="mailbox-name">
                                                                <a
                                                                    href="#"
                                                                    data-toggle="tooltip"
                                                                    title={room.description || 'No description'}
                                                                    onClick={(e) => e.preventDefault()}
                                                                >
                                                                    {room.room_no}
                                                                </a>
                                                            </td>}
                                                            {visibleColumns.has('hostel_name') && <td className="mailbox-name">{room.hostel_name}</td>}
                                                            {visibleColumns.has('room_type') && <td className="mailbox-name">{room.room_type}</td>}
                                                            {visibleColumns.has('no_of_bed') && <td className="mailbox-name">{room.no_of_bed}</td>}
                                                            {visibleColumns.has('cost_per_bed') && <td className="mailbox-name text-right">{room.cost_per_bed}</td>}
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
