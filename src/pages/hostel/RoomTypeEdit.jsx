import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';
import { validateName, validateDescription, sanitizeName } from '../../utils/validation';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const RoomTypeEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        room_type: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    const [roomtypelist, setRoomTypeList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const filteredRoomTypeList = roomtypelist.filter(roomtype =>
        Object.values(roomtype).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalItems = filteredRoomTypeList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredRoomTypeList.slice(indexOfFirstItem, indexOfLastItem);

    const columns = [
        { key: 'room_type', label: 'Room Type' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) {
            newVisible.delete(key);
        } else {
            newVisible.add(key);
        }
        setVisibleColumns(newVisible);
    };

    const getExportData = () => {
        const activeCols = columns.filter(c => visibleColumns.has(c.key));
        const headers = activeCols.map(c => c.label);
        const rows = filteredRoomTypeList.map(rt => activeCols.map(c => rt[c.key]));
        return { headers, rows };
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getRoomTypeData();

            if (response && response.status && response.data) {
                setRoomTypeList(response.data.roomtypelist || []);

                // Find and populate the room type being edited
                const roomTypeToEdit = response.data.roomtypelist?.find(rt => rt.id === id);
                if (roomTypeToEdit) {
                    setFormData({
                        id: roomTypeToEdit.id,
                        room_type: roomTypeToEdit.room_type,
                        description: roomTypeToEdit.description || ''
                    });
                }
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
            const response = await api.updateRoomType(formData);

            if (response && response.status === true) {
                toast.success(response.message || 'Room type updated successfully');
                navigate('/admin/roomtype');
            } else {
                toast.error(response.message || 'Failed to update room type');
            }
        } catch (error) {
            console.error('Error updating room type:', error);
            toast.error('Failed to update room type');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (roomTypeId) => {
        if (window.confirm('Are you sure you want to delete this room type?')) {
            try {
                const response = await api.deleteRoomType(roomTypeId);

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

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-building-o"></i> Hostel
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Edit Form */}
                        <div className={`col-md-4 ${isMobile ? 'col-xs-12' : ''}`} style={{ marginBottom: isMobile ? '20px' : '0' }}>
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Room Type</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <input type="hidden" name="id" value={formData.id} />

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
                                                placeholder="Enter ..."
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
                        <div className={`col-md-8 ${isMobile ? 'col-xs-12' : ''}`}>
                            <div className="box box-primary" id="rtype">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Room Type List</h3>
                                </div>
                                <div className="box-body">
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={toggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="room_type_list"
                                        exportTitle="Room Type List"
                                    />
                                    <div className="mailbox-messages table-responsive">
                                        <div className="download_label">Room Type List</div>
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.has('room_type') && <th>Room Type</th>}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={visibleColumns.size + 1} className="text-center">No Record Found</td>
                                                        </tr>
                                                    ) : (
                                                        currentItems.map(roomtype => (
                                                            <tr key={roomtype.id}>
                                                                {visibleColumns.has('room_type') && (
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
                                                                )}
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
                                    <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                        <Pagination 
                                            totalItems={totalItems} 
                                            itemsPerPage={recordsPerPage} 
                                            currentPage={currentPage}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
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

export default RoomTypeEdit;
