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
import { validateName, validateDescription, sanitizeName } from '../../utils/validation';

const RoomType = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        room_type: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [roomtypelist, setRoomTypeList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Columns
    const columns = [
        { key: 'room_type', label: 'Room Type', sortKey: 'room_type' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) newVisible.delete(key);
        else newVisible.add(key);
        setVisibleColumns(newVisible);
    };

    const { sortedData, requestSort, sortConfig, getSortIcon } = useTableSort(roomtypelist);

    const filteredRoomTypeList = sortedData.filter(roomtype =>
        Object.values(roomtype).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Export Data formatting
    const formatCell = (row, key) => {
        return row[key] || '';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, filteredRoomTypeList, formatCell);
    };
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
        let sanitizedValue = value;
        let errorMsg = '';

        if (name === 'room_type') {
            if (value.length > 50) {
                errorMsg = 'Maximum 50 characters allowed';
            }
            sanitizedValue = sanitizeName(value);
        }

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        
        const roomTypeError = validateName(formData.room_type);
        if (roomTypeError) {
            newErrors.room_type = roomTypeError.replace('Name', 'Room Type');
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
            setSubmitting(false);
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

            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '0px' }}>
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
                                                maxLength={51}
                                                autoFocus
                                            />
                                            {errors.room_type && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.room_type}</span>}
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
                                    <div className="mailbox-controls">
                                        <div className="pull-left">
                                            <div className="btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'room_type_list.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'room_type_list.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'room_type_list.pdf', 'Room Type List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Room Type List'); }}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group">
                                                    <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false" title="Columns">
                                                        <i className="fa fa-columns"></i> <span ></span>
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
                                                        <th key={col.key} onClick={() => requestSort(col.sortKey)} style={{ cursor: 'pointer' }}>
                                                            {col.label} {getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRoomTypeList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    filteredRoomTypeList.map(roomtype => (
                                                        <tr key={roomtype.id}>
                                                            {visibleColumns.has('room_type') && <td className="mailbox-name">
                                                                <a
                                                                    href="#"
                                                                    data-toggle="tooltip"
                                                                    title={roomtype.description || 'No description'}
                                                                    onClick={(e) => e.preventDefault()}
                                                                >
                                                                    {roomtype.room_type}
                                                                </a>
                                                            </td>}
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
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default RoomType;
