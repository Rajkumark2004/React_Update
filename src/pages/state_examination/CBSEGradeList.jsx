import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../utils/include_files';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const CBSEGradeList = () => {
    const { sessionYear } = useSession();
    const navigate = useNavigate();



    {/*} const cbseSubmenu = [
        { label: 'Exam', url: '/cbseexam/exam', active: false, icon: '1.png' },
        { label: 'Exam Schedule', url: '/cbseexam/schedule', active: false, icon: '2.png' },
        { label: 'Print Marksheet', url: '/cbseexam/result/marksheet', active: false, icon: '3.png' },
        { label: 'Exam Grade', url: '/cbseexam/grade/index', active: true, icon: '4.png' },
        { label: 'Assign Observation', url: '#', active: false, icon: '5.png' },
        { label: 'Observation', url: '#', active: false, icon: '6.png' },
        { label: 'Observation Parameter', url: '#', active: false, icon: '7.png' },
        { label: 'Assessment', url: '#', active: false, icon: '8.png' },
        { label: 'Term', url: '#', active: false, icon: '9.png' },
        { label: 'Template', url: '#', active: false, icon: '4.png' },
        { label: 'Reports', url: '#', active: false, icon: '10.png' },
        { label: 'Setting', url: '/cbseexam/setting', active: false, icon: '11.png' },
    ];*/}

    const [gradeList, setGradeList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const fetchGradeList = async () => {
        console.log("fetchGradeList called");
        try {
            setLoading(true);
            const response = await api.getCBSEGradeList();
            if (response.status && response.data) {
                setGradeList(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch grade list", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchGradeList();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ranges: []
    });
    const [initialRangeIds, setInitialRangeIds] = useState([]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            ranges: [
                { id: Date.now(), name: '', maximum_percentage: '', minimum_percentage: '', description: '' }
            ]
        });
        setEditMode(false);
        setEditId(null);
        setInitialRangeIds([]);
    };

    const handleAddOpen = async () => {
        setLoading(true);
        try {
            const response = await api.getCBSEGradeForm({ action: 'add', record_id: 0 });
            const totalRows = 1; // Force 1 row for adding as per request

            const initialRanges = [];
            for (let i = 0; i < totalRows; i++) {
                initialRanges.push({ id: Date.now() + i, name: '', maximum_percentage: '', minimum_percentage: '', description: '' });
            }

            setFormData({
                name: '',
                description: '',
                ranges: initialRanges
            });
            setEditMode(false);
            setEditId(null);
            setInitialRangeIds([]);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching grade form:", error);
            // Fallback
            resetForm();
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditOpen = async (grade) => {
        setEditId(grade.id);
        setEditMode(true);
        setLoading(true);
        try {
            const response = await api.getCBSEGradeForm({ action: 'update', record_id: grade.id });
            if (response.status && response.data && response.data.get_old_data) {
                const data = response.data.get_old_data;
                const ranges = data.list ? data.list.map(d => ({
                    id: d.id,
                    name: d.name,
                    description: d.description,
                    maximum_percentage: d.maximum_percentage,
                    minimum_percentage: d.minimum_percentage
                })) : [];

                setFormData({
                    name: data.grade_detail.name,
                    description: data.grade_detail.description,
                    ranges: ranges
                });
                setInitialRangeIds(ranges.map(r => r.id));
            } else {
                // Fallback to local data if API fails to provide details
                setFormData({
                    name: grade.name,
                    description: grade.description,
                    ranges: grade.data && grade.data.length > 0 ? grade.data.map(d => ({ ...d, id: d.id || Date.now() + Math.random() })) : []
                });
                setInitialRangeIds(grade.data && grade.data.length > 0 ? grade.data.map(d => d.id) : []);
            }
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching grade details:", error);
            // Fallback
            setFormData({
                name: grade.name,
                description: grade.description,
                ranges: grade.data && grade.data.length > 0 ? grade.data.map(d => ({ ...d, id: d.id || Date.now() + Math.random() })) : []
            });
            setInitialRangeIds(grade.data && grade.data.length > 0 ? grade.data.map(d => d.id) : []);
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                setLoading(true);
                const response = await api.deleteCBSEGrade({ id });
                if (response.status) {
                    toast.success(response.message || 'Record deleted successfully');
                    fetchGradeList();
                } else {
                    toast.error(response.message || "Delete failed");
                }
            } catch (error) {
                console.error("Error deleting grade:", error);
                toast.error("An error occurred while deleting.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRangeChange = (index, field, value) => {
        const newRanges = [...formData.ranges];
        if (newRanges[index]) {
            let val = value;
            if (field === 'maximum_percentage' || field === 'minimum_percentage') {
                if (value !== '') {
                    const num = parseFloat(value);
                    if (num > 100) val = "100";
                    if (num < 0) val = "0";
                }
            }
            newRanges[index][field] = val;
            setFormData({ ...formData, ranges: newRanges });
        }
    };

    const addRange = () => {
        setFormData({
            ...formData,
            ranges: [...formData.ranges, { id: Date.now(), name: '', maximum_percentage: '', minimum_percentage: '', description: '' }]
        });
    };

    const removeRange = (index) => {
        const newRanges = [...formData.ranges];
        newRanges.splice(index, 1);
        setFormData({ ...formData, ranges: newRanges });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;
        for (let i = 0; i < formData.ranges.length; i++) {
            const range = formData.ranges[i];
            const max = parseFloat(range.maximum_percentage);
            const min = parseFloat(range.minimum_percentage);
            
            if (isNaN(max) || isNaN(min) || max < 0 || max > 100 || min < 0 || min > 100) {
                toast.error(`Invalid percentage values in row ${i + 1}. Must be between 0 and 100.`);
                isValid = false;
                break;
            }
            if (min > max) {
                toast.error(`Row ${i + 1}: Minimum percentage (${min}) cannot be greater than Maximum percentage (${max}).`);
                isValid = false;
                break;
            }
        }
        if (!isValid) return;

        try {
            setLoading(true);
            // Transform data for API
            const payload = {
                name: formData.name,
                description: formData.description,
                row: formData.ranges.map((_, i) => i + 1),
                update_id: [],
                prev_ids: initialRangeIds
            };

            if (editMode) {
                payload.action = 'update';
                payload.record_id = editId;
            } else {
                // payload.action = 'add'; // Removed per request
                payload.record_id = 0;
            }

            formData.ranges.forEach((range, index) => {
                const i = index + 1;
                payload[`range_name_${i}`] = range.name;
                payload[`type_description_${i}`] = range.description;
                payload[`maximum_percentage_${i}`] = range.maximum_percentage;
                payload[`minimum_percentage_${i}`] = range.minimum_percentage;

                // Identify if range is existing (from backend) or new.
                // Existing IDs are small integers. New ones are Date.now() (large).
                const isBackendId = range.id && range.id < 1000000000000;
                payload.update_id.push(isBackendId ? range.id : 0);
            });

            let response;
            if (editMode) {
                // If update endpoint expects same format, use payload. Check if id is needed in body or URL.
                // Assuming it's needed in body based on previous implementation.
                response = await api.addCBSEGrade(payload);
            } else {
                const { id, ...newPayload } = payload;
                response = await api.addCBSEGrade(newPayload);
            }

            if (response.status) {
                toast.success(response.message || `Record ${editMode ? 'updated' : 'saved'} successfully`);
                fetchGradeList(); // Refresh list
                setShowModal(false);
                resetForm();
            } else {
                toast.error(response.message || "Operation failed");
            }
        } catch (error) {
            console.error("Error saving grade:", error);
            toast.error(error.message || "An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };


    //const handleSearch = (term) => console.log("Search:", term);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredGradeList = gradeList.filter(grade =>
        (grade.name && grade.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (grade.description && grade.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calculate pagination
    const totalItems = filteredGradeList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredGradeList.slice(indexOfFirstItem, indexOfLastItem);

    const tableColumns = [
        { key: 'title', label: 'Grade Title' },
        { key: 'description', label: 'Description' },
        { key: 'grade', label: 'Grade' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(
        () => new Set(tableColumns.map(c => c.key))
    );

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const getExportData = () => {
        const headers = [];
        if (visibleColumns.has('title')) headers.push('Grade Title');
        if (visibleColumns.has('description')) headers.push('Description');
        if (visibleColumns.has('grade')) {
            headers.push('Grade');
            headers.push('');
            headers.push('');
            headers.push('');
        }

        const rows = [];

        const subHeaderRow = [];
        if (visibleColumns.has('title')) subHeaderRow.push('');
        if (visibleColumns.has('description')) subHeaderRow.push('');
        if (visibleColumns.has('grade')) {
            subHeaderRow.push('Grade');
            subHeaderRow.push('Maximum Percentage');
            subHeaderRow.push('Minimum Percentage');
            subHeaderRow.push('Remark');
        }

        if (filteredGradeList.length > 0) {
            rows.push(subHeaderRow);
        }
        filteredGradeList.forEach(grade => {
            if (grade.data && grade.data.length > 0) {
                grade.data.forEach((range, idx) => {
                    const row = [];
                    if (visibleColumns.has('title')) row.push(idx === 0 ? (grade.name || '') : '');
                    if (visibleColumns.has('description')) row.push(idx === 0 ? (grade.description || '') : '');
                    if (visibleColumns.has('grade')) {
                        row.push(range.name || '');
                        row.push(range.maximum_percentage || '');
                        row.push(range.minimum_percentage || '');
                        row.push(range.description || '');
                    }
                    rows.push(row);
                });
            } else {
                const row = [];
                if (visibleColumns.has('title')) row.push(grade.name || '');
                if (visibleColumns.has('description')) row.push(grade.description || '');
                if (visibleColumns.has('grade')) {
                    row.push('');
                    row.push('');
                    row.push('');
                    row.push('');
                }
                rows.push(row);
            }
        });

        return { headers, rows };
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .hover-nested-row {
                        background-color: #fff !important;
                    }
                    .hover-nested-row:hover {
                        background-color: #f1f1f1 !important;
                        cursor: pointer;
                    }
                    .hover-main-entry:hover {
                        background-color: #f9f9f9 !important;
                    }
                    .action-button-boxed {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 24px;
                        height: 24px;
                        background: #fff;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .action-button-boxed:hover {
                        background: #f1f1f1;
                    }
                `}
            </style>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> State Examination</h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Exam Grade List</h3>
                                    <div className="box-tools pull-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={handleAddOpen}
                                            style={{ borderRadius: '20px', padding: '5px 12px' }}
                                        >
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="btn btn-primary btn-sm"
                                            style={{ borderRadius: '20px', padding: '5px 12px' }}
                                        >
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body" style={{ fontSize: '13px' }}>
                                    <div className="download_label">Exam Grade List</div>
                                    <style>
                                        {`
                                            @media (max-width: 765px) {
                                                .ml5 { margin-left: 0px !important; margin-top: 5px !important; }
                                                .mobile-stack {
                                                    display: flex !important;
                                                    flex-direction: column !important;
                                                    align-items: center !important;
                                                    gap: 10px !important;
                                                    padding-bottom: 5px !important;
                                                }
                                                .mobile-stack .pull-left {
                                                    margin-bottom: 5px !important;
                                                }
                                                .mobile-stack > div {
                                                    width: 100% !important;
                                                    text-align: center !important;
                                                }
                                                .mobile-stack .pull-right, .mobile-stack .pull-left {
                                                    float: none !important;
                                                    justify-content: center !important;
                                                }
                                                .mobile-stack .dt-buttons {
                                                    justify-content: center !important;
                                                }
                                                .mailbox-messages {
                                                    border: 1px solid #ddd !important;
                                                    border-radius: 4px !important;
                                                }
                                                .mailbox-messages table.table {
                                                    border: none !important;
                                                }
                                                .mailbox-messages table.table th, 
                                                .mailbox-messages table.table td,
                                                .mailbox-messages table.table table th,
                                                .mailbox-messages table.table table td {
                                                    border-left: none !important;
                                                    border-right: none !important;
                                                    border-bottom: 1px solid #eee !important;
                                                }
                                                .mailbox-messages table.table tr:last-child td,
                                                .mailbox-messages table.table table tr:last-child td {
                                                    border-bottom: none !important;
                                                }
                                                .modal-body-responsive {
                                                    padding: 15px 10px !important;
                                                }
                                                .modal-header-responsive {
                                                    padding: 15px 10px !important;
                                                    border-bottom: none !important;
                                                }
                                                .modal-footer-responsive {
                                                    padding: 0px 10px 15px 10px !important;
                                                }
                                                .add-more-responsive {
                                                    text-align: right !important;
                                                    width: 100% !important;
                                                    display: block !important;
                                                    padding-right: 0 !important;
                                                }
                                                .row-fit-mobile {
                                                    margin: 0 !important;
                                                }
                                                .col-fit-mobile {
                                                    padding: 0 !important;
                                                    margin-bottom: 10px !important;
                                                }
                                                .removal-button-responsive {
                                                    justify-content: flex-end !important;
                                                    padding-right: 0 !important;
                                                    margin-top: 5px !important;
                                                }
                                                .modal-dialog {
                                                    width: 100% !important;
                                                    margin: 10px !important;
                                                }
                                                .grade-row-group {
                                                    background: #f9f9f9;
                                                    padding: 10px;
                                                    border-radius: 4px;
                                                    margin-bottom: 10px;
                                                    border: 1px solid #ddd;
                                                }
                                            }
                                            @media (min-width: 766px) {
                                                .mobile-stack {
                                                    display: flex !important;
                                                    align-items: center !important;
                                                    justify-content: space-between !important;
                                                    flex-wrap: wrap !important;
                                                }
                                            }
                                        `}
                                    </style>
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={tableColumns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="Exam_Grade_List"
                                        exportTitle="Exam Grade List"
                                    />
                                    <div className="mailbox-messages" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <table className="table no-margin" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                                    <th style={{ width: '10%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Grade Title</th>
                                                    <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Description</th>
                                                    <th style={{ width: '65%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Grade Data</th>
                                                    <th style={{ width: '5%', fontWeight: '600', padding: '12px 8px', color: '#000', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((grade) => (
                                                    <tr key={grade.id} className="hover-main-entry" style={{ borderBottom: '1px solid #f4f4f4', transition: 'background-color 0.2s' }}>
                                                        <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                                            <strong>{grade.name}</strong>
                                                        </td>
                                                        <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                                            {grade.description}
                                                        </td>
                                                        <td style={{ padding: '8px 0', borderTop: 'none' }}>
                                                            <table style={{ width: '100%', marginBottom: '0', tableLayout: 'fixed' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ width: '10%', color: '#000', fontWeight: '600', borderBottom: 'none', padding: '4px 8px' }}>Grade</th>
                                                                        <th style={{ width: '25%', color: '#000', fontWeight: '600', borderBottom: 'none', padding: '4px 40px' }}>Maximum Percentage</th>
                                                                        <th style={{ width: '25%', color: '#000', fontWeight: '600', borderBottom: 'none', padding: '4px 40px' }}>Minimum Percentage</th>
                                                                        <th style={{ width: '40%', color: '#000', fontWeight: '600', borderBottom: 'none', padding: '4px 40px' }}>Remark</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {grade.data && grade.data.length > 0 ? (
                                                                        grade.data.map((range, midx) => (
                                                                            <tr key={midx} className="hover-nested-row" style={{ borderTop: '1px solid #f4f4f4' }}>
                                                                                <td style={{ padding: '6px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{range.name}</td>
                                                                                <td style={{ padding: '6px 40px', borderTop: 'none' }}>{range.maximum_percentage}</td>
                                                                                <td style={{ padding: '6px 40px', borderTop: 'none' }}>{range.minimum_percentage}</td>
                                                                                <td style={{ padding: '6px 40px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{range.description}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="4" className="text-muted" style={{ padding: '6px 8px' }}>No ranges defined</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '15px 8px', borderTop: 'none' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', whiteSpace: 'nowrap' }}>
                                                                <div onClick={() => handleEditOpen(grade)} className="action-button-boxed" title="Edit">
                                                                    <i className="fa fa-pencil" style={{ color: '#555', fontSize: '12px' }}></i>
                                                                </div>
                                                                <div onClick={() => handleDelete(grade.id)} className="action-button-boxed" title="Delete">
                                                                    <i className="fa fa-remove" style={{ color: '#000', fontSize: '13px', fontWeight: 'bold' }}></i>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
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

            {/* Modal */}
            {showModal && (
                <div className="modal fade in hide-scrollbar" role="dialog" style={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050, overflowY: 'auto' }}>
                    <div className="modal-dialog modal-dialog2 modal-xl" style={{ margin: '30px auto' }}>
                        <div className="modal-content">
                            <div className="modal-header modal-header-responsive" style={{ background: '#7e3abd', color: 'white' }}>
                                <button type="button" className="close" onClick={() => setShowModal(false)} style={{ color: 'white', opacity: 1, marginRight: '20px' }}>&times;</button>
                                <h4 className="modal-title" style={{ color: 'white', fontWeight: 'bold' }}>{editMode ? 'Edit Exam Grade' : 'Add Exam Grade'}</h4>
                            </div>
                            <div className="">
                                <form role="form" onSubmit={handleSubmit}>
                                    <div className="modal-body modal-body-responsive" style={{ padding: '20px' }}>
                                        <div className="container-fluid" style={{ padding: 0 }}>
                                            <div className="row row-fit-mobile">
                                                <div className="col-md-12 col-fit-mobile">
                                                    <div className="form-group">
                                                        <label>Grade Title</label><small className="req"> *</small>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12 col-fit-mobile">
                                                    <div className="form-group">
                                                        <label>Description</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={formData.description}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            style={{ resize: 'none' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row row-fit-mobile" style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                                <div className="col-md-6 col-fit-mobile"></div>
                                                <div className="col-md-6 text-right col-fit-mobile add-more-responsive">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm add_row"
                                                        onClick={addRange}
                                                        style={{ backgroundColor: '#7e3abd', color: 'white', borderRadius: '20px', padding: '5px 15px', border: 'none' }}
                                                    >
                                                        Add More
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="hide-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
                                                <div className="row row-fit-mobile hidden-xs hidden-sm" style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                                                    <div className="col-md-2" style={{ fontSize: '12px' }}>Grade<small className="req">*</small></div>
                                                    <div className="col-md-3" style={{ fontSize: '12px' }}>Maximum Percentage <small className="req">*</small></div>
                                                    <div className="col-md-3" style={{ fontSize: '12px' }}>Minimum Percentage <small className="req">*</small></div>
                                                    <div className="col-md-3" style={{ fontSize: '12px' }}>Remark</div>
                                                    <div className="col-md-1"></div>
                                                </div>

                                                <div id="grade_result">
                                                    {formData.ranges.map((range, index) => (
                                                        <div className="row mb10 grade-row-group" key={range.id || index} style={{ marginBottom: '15px' }}>
                                                            <div className="col-md-2 col-fit-mobile">
                                                                <label className="visible-xs visible-sm" style={{ fontSize: '12px' }}>Grade<small className="req">*</small></label>
                                                                <input
                                                                    className="form-control input-sm"
                                                                    value={range.name}
                                                                    onChange={(e) => handleRangeChange(index, 'name', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-md-3 col-fit-mobile">
                                                                <label className="visible-xs visible-sm" style={{ fontSize: '12px' }}>Maximum Percentage <small className="req">*</small></label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control input-sm"
                                                                    value={range.maximum_percentage}
                                                                    onChange={(e) => handleRangeChange(index, 'maximum_percentage', e.target.value)}
                                                                    required
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                            </div>
                                                            <div className="col-md-3 col-fit-mobile">
                                                                <label className="visible-xs visible-sm" style={{ fontSize: '12px' }}>Minimum Percentage <small className="req">*</small></label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control input-sm"
                                                                    value={range.minimum_percentage}
                                                                    onChange={(e) => handleRangeChange(index, 'minimum_percentage', e.target.value)}
                                                                    required
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                            </div>
                                                            <div className="col-md-3 col-fit-mobile">
                                                                <label className="visible-xs visible-sm" style={{ fontSize: '12px' }}>Remark</label>
                                                                <textarea
                                                                    className="form-control input-sm"
                                                                    rows="1"
                                                                    value={range.description}
                                                                    onChange={(e) => handleRangeChange(index, 'description', e.target.value)}
                                                                    style={{ resize: 'none', minHeight: '30px' }}
                                                                />
                                                            </div>
                                                            <div className="col-md-1 col-fit-mobile removal-button-responsive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px' }}>
                                                                {formData.ranges.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn"
                                                                        onClick={() => removeRange(index)}
                                                                        title="Remove"
                                                                        style={{ background: 'none', border: 'none', color: '#ff0000', padding: '0', boxShadow: 'none' }}
                                                                    >
                                                                        <i className="fa fa-remove" style={{ fontSize: '20px' }}></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer modal-footer-responsive" style={{ borderTop: 'none', paddingBottom: '20px' }}>
                                        <button
                                            type="submit"
                                            className="btn pull-right"
                                            style={{ backgroundColor: '#7e3abd', color: 'white', borderRadius: '20px', padding: '8px 25px', fontSize: '14px', fontWeight: 'bold', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CBSEGradeList;
