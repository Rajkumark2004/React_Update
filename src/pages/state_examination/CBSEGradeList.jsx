import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../utils/include_files';
import { copyToClipboard, downloadCSV, downloadExcel, printTable } from '../../utils/tableExport';

const CBSEGradeList = () => {
    const { sessionYear } = useSession();
    const navigate = useNavigate();

    // Mock Data
    const appName = "Smart School";
    const userData = {
        name: "Joe",
        pimage: "/public/images/userprofile.jpg",
        role: "Super Admin"
    };



    const cbseSubmenu = [
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
    ];

    const [gradeList, setGradeList] = useState([]);
    const [loading, setLoading] = useState(true);

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
            const totalRows = response.status && response.data ? response.data.total_rows : 2; // Default to 2 if fail

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
                    fetchGradeList();
                } else {
                    alert(response.message || "Delete failed");
                }
            } catch (error) {
                console.error("Error deleting grade:", error);
                alert("An error occurred while deleting.");
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
                fetchGradeList(); // Refresh list
                setShowModal(false);
                resetForm();
            } else {
                alert(response.message || "Operation failed");
            }
        } catch (error) {
            console.error("Error saving grade:", error);
            alert("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => console.log("Logout");
    const handleSearch = (term) => console.log("Search:", term);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredGradeList = gradeList.filter(grade =>
        (grade.name && grade.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (grade.description && grade.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Grade Title");
        if (!hiddenColumns.includes(1)) headers.push("Description");
        if (!hiddenColumns.includes(2)) headers.push("Grade");

        const rows = filteredGradeList.map(grade => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(grade.name);
            if (!hiddenColumns.includes(1)) row.push(grade.description);
            if (!hiddenColumns.includes(2)) {
                if (grade.data && grade.data.length > 0) {
                    const gradeStr = grade.data.map(r => `${r.name} (${r.minimum_percentage}-${r.maximum_percentage})`).join(', ');
                    row.push(gradeStr);
                } else {
                    row.push("");
                }
            }
            return row;
        });

        return { headers, rows };
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header appName={appName} userData={userData} handleLogout={handleLogout} />
            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/cbseexam/grade/index"
                handleSearch={handleSearch}
            />

            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> State Examination</h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Exam Grade List</h3>
                                    <div className="box-tools pull-right">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={handleAddOpen}
                                        >
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                        <div className="btn-group pull-right mml15">
                                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-body" style={{ fontSize: '13px' }}>
                                    <div className="download_label">Exam Grade List</div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="pull-left mb10">
                                                <div className="input-group" style={{ width: '200px', display: 'inline-table', verticalAlign: 'middle' }}>
                                                    <input
                                                        type="text"
                                                        className="form-control input-sm"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ fontSize: '13px' }}
                                                    />
                                                    <span className="input-group-addon">
                                                        <i className="fa fa-search"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="dt-buttons btn-group pull-right">
                                                <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Exam_Grade_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Exam_Grade_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Exam Grade List'); }}><i className="fa fa-print"></i></button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><i className="fa fa-columns"></i></button>
                                                    {showColumnsDropdown && (
                                                        <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                            <li>
                                                                <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Grade Title</label>
                                                            </li>
                                                            <li>
                                                                <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Description</label>
                                                            </li>
                                                            <li>
                                                                <label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Grade</label>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive mailbox-messages overflow-visible-lg">
                                        <table className="table table-striped table-bordered table-hover example" style={{ fontSize: '13px' }}>
                                            <thead>
                                                <tr>
                                                    {!hiddenColumns.includes(0) && <th width="10%">Grade Title</th>}
                                                    {!hiddenColumns.includes(1) && <th width="20%">Description</th>}
                                                    {!hiddenColumns.includes(2) && <th width="65%">Grade</th>}
                                                    <th width="5%" className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredGradeList.map((grade) => (
                                                    <tr key={grade.id}>
                                                        {!hiddenColumns.includes(0) && <td>{grade.name}</td>}
                                                        {!hiddenColumns.includes(1) && <td>{grade.description}</td>}
                                                        {!hiddenColumns.includes(2) && <td className="mailbox-name">
                                                            <table className="table table-bordered table-hover table-last-right" style={{ fontSize: '13px', marginBottom: '0' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Grade</th>
                                                                        <th>Maximum Percentage</th>
                                                                        <th>Minimum Percentage</th>
                                                                        <th>Remark</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {grade.data && grade.data.length > 0 ? (
                                                                        grade.data.map((range, idx) => (
                                                                            <tr key={idx}>
                                                                                <td>{range.name}</td>
                                                                                <td>{range.maximum_percentage}</td>
                                                                                <td>{range.minimum_percentage}</td>
                                                                                <td>{range.description}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr><td colSpan="4">No ranges defined</td></tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </td>}
                                                        <td className="white-space-nowrap text-right">
                                                            <button
                                                                onClick={() => handleEditOpen(grade)}
                                                                className="btn btn-default btn-xs"
                                                                title="Edit"
                                                                style={{ marginRight: '5px' }}
                                                            >
                                                                <i className="fa fa-pencil"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(grade.id)}
                                                                className="btn btn-default btn-xs"
                                                                title="Delete"
                                                            >
                                                                <i className="fa fa-remove"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-5">
                                            <div className="dataTables_info" style={{ paddingTop: '8px', fontSize: '13px' }}>
                                                Showing 1 to {filteredGradeList.length} of {filteredGradeList.length} records
                                            </div>
                                        </div>
                                        <div className="col-md-7">
                                            <div className="dataTables_paginate paging_simple_numbers pull-right" style={{ fontSize: '13px' }}>
                                                <ul className="pagination">
                                                    <li className="paginate_button previous disabled">
                                                        <a href="#"><i className="fa fa-angle-left"></i></a>
                                                    </li>
                                                    <li className="paginate_button active"><a href="#">1</a></li>
                                                    <li className="paginate_button next disabled">
                                                        <a href="#"><i className="fa fa-angle-right"></i></a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div className="modal fade in" role="dialog" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog2 modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                    <h4 className="modal-title">{editMode ? 'Edit Exam Grade' : 'Add Exam Grade'}</h4>
                                </div>
                                <div className="scroll-area">
                                    <form role="form" onSubmit={handleSubmit}>
                                        <div className="modal-body minheight260">
                                            <div className="modal-body-inner">
                                                <div className="form-group">
                                                    <label>Name</label><small className="req"> *</small>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Description</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    />
                                                </div>

                                                <div className="row">
                                                    <div className="form-group">
                                                        <label className="btn btn-xs btn-info pull-right" onClick={addRange}>Add More</label>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Range Name</label> <small className="req"> *</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Maximum Percentage</label> <small className="req"> *</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Minimum Percentage</label> <small className="req"> *</small>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Remark</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-1">
                                                        <div className="form-group"></div>
                                                    </div>
                                                </div>

                                                <div id="grade_result">
                                                    {formData.ranges.map((range, index) => (
                                                        <div className="row" key={range.id || index}>
                                                            <div className="col-md-2">
                                                                <div className="form-group">
                                                                    <input
                                                                        className="form-control"
                                                                        value={range.name}
                                                                        onChange={(e) => handleRangeChange(index, 'name', e.target.value)}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className="form-group">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        value={range.maximum_percentage}
                                                                        onChange={(e) => handleRangeChange(index, 'maximum_percentage', e.target.value)}
                                                                        required
                                                                        min="0"
                                                                        max="100"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className="form-group">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        value={range.minimum_percentage}
                                                                        onChange={(e) => handleRangeChange(index, 'minimum_percentage', e.target.value)}
                                                                        required
                                                                        min="0"
                                                                        max="100"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className="form-group">
                                                                    <textarea
                                                                        className="form-control"
                                                                        value={range.description}
                                                                        onChange={(e) => handleRangeChange(index, 'description', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-1">
                                                                <div className="form-group">
                                                                    <span
                                                                        className="section_id_error text-danger rtl-float-right cursor-pointer"
                                                                        onClick={() => removeRange(index)}
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                        </div>
                                        <div className="modal-footer clearboth mx-nt-lr-15 pb0">
                                            <button type="submit" className="btn btn-primary pull-right">Save</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}

            <Footer />
        </div>
    );
};

export default CBSEGradeList;
