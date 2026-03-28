import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';

const Assessment = () => {
    const { sessionYear } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeAssessment, setActiveAssessment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        rows: [
            { ui_id: Date.now(), id: '', type_name: '', code: '', maximum_marks: '', pass_percentage: '', type_description: '' }
        ]
    });

    const [assessments, setAssessments] = useState([]);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setIsLoading(true);
        try {
            const response = await api.getCBSEAssessments();
            if (response.status && response.data) {
                setAssessments(response.data);
            } else {
                setAssessments([]);
            }
        } catch (error) {
            console.error("Failed to fetch assessments", error);
            // Optionally set mock data if API fails during dev/demo
            // setAssessments([]); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...formData.rows];
        newRows[index][field] = value;
        setFormData({ ...formData, rows: newRows });
    };

    const addRow = () => {
        setFormData({
            ...formData,
            rows: [...formData.rows, { ui_id: Date.now(), id: '', type_name: '', code: '', maximum_marks: '', pass_percentage: '', type_description: '' }]
        });
    };

    const removeRow = (index) => {
        if (formData.rows.length > 1) {
            const newRows = formData.rows.filter((_, i) => i !== index);
            setFormData({ ...formData, rows: newRows });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "This field is required";

        const rowErrors = [];
        formData.rows.forEach((row, index) => {
            const currentLineErrors = {};
            if (!row.type_name.trim()) currentLineErrors.type_name = "This field is required";
            if (!row.code.trim()) currentLineErrors.code = "This field is required";
            if (!String(row.maximum_marks).trim()) currentLineErrors.maximum_marks = "This field is required";
            if (!String(row.pass_percentage).trim()) currentLineErrors.pass_percentage = "This field is required";

            if (Object.keys(currentLineErrors).length > 0) {
                rowErrors[index] = currentLineErrors;
            }
        });

        if (Object.keys(newErrors).length > 0 || rowErrors.length > 0) {
            setErrors({ ...newErrors, rows: rowErrors });
            return;
        }

        setErrors({});

        // Construct payload as per requirement:
        // { "name": "...", "description": "...", "row": [1, 2], "type_name_1": "...", ... }

        const payload = {
            name: formData.name,
            description: formData.description,
            types: formData.rows.map(row => {
                const typeObj = {
                    name: row.type_name,
                    code: row.code,
                    maximum_marks: parseFloat(row.maximum_marks) || 0,
                    pass_percentage: parseFloat(row.pass_percentage) || 0,
                };
                if (row.type_description) {
                    typeObj.description = row.type_description;
                }
                if (row.id) {
                    typeObj.id = parseInt(row.id, 10);
                }
                return typeObj;
            })
        };

        // Add ID if editing
        if (isEditing) {
            payload.record_id = parseInt(formData.id, 10);
            payload.action = "update"; // Required for edit operation
        }

        try {
            // Check if editing or adding
            // The request was specifically for "Add", usually "Edit" is a different endpoint or handled by same if ID present.
            // Assuming Add for now based on request. If edit behaves differently, might need adjustment.
            // Re-using addCBSEAssessment for now (or updateCBSEAssessment if it exists/implemented later).

            // For now, let's assume this handles Add.
            const response = await api.addCBSEAssessment(payload);

            if (response.status) {
                alert(response.message || "Record Saved Successfully");
                setShowModal(false);
                resetForm();
                fetchAssessments(); // Refresh list
            } else {
                alert(response.error || "Failed to save assessment.");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            alert("Error submitting assessment.");
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            rows: [{ ui_id: Date.now(), id: '', type_name: '', code: '', maximum_marks: '', pass_percentage: '', type_description: '' }]
        });
        setErrors({});
        setIsEditing(false);
    };

    const handleEdit = async (assessment) => {
        try {
            const response = await api.getCBSEAssessmentDetails(assessment.id);
            if (response.status && response.data) {
                const data = response.data;

                // Map API list response to form rows
                const rows = (data.list || []).map(item => ({
                    ui_id: Date.now() + Math.random(),
                    id: item.id || '',
                    type_name: item.name,
                    code: item.code,
                    maximum_marks: item.maximum_marks,
                    pass_percentage: item.pass_percentage,
                    type_description: item.description
                }));

                // If no rows, ensure at least one empty row
                if (rows.length === 0) {
                    rows.push({ ui_id: Date.now(), id: '', type_name: '', code: '', maximum_marks: '', pass_percentage: '', type_description: '' });
                }

                setFormData({
                    id: data.id,
                    name: data.name,
                    description: data.description || '',
                    rows: rows
                });
                setIsEditing(true);
                setShowModal(true);
            } else {
                alert("Failed to fetch assessment details.");
            }
        } catch (error) {
            console.error("Edit Error:", error);
            alert("Error fetching assessment details.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const response = await api.deleteCBSEAssessment(id);
                if (response.status) {
                    alert(response.message || "Record Deleted Successfully");
                    fetchAssessments(); // Refresh list
                } else {
                    alert("Failed to delete record.");
                }
            } catch (error) {
                console.error("Delete Error:", error);
                alert("Error deleting record.");
            }
        }
    };

    {/*}  const cbseSubmenu = [
        { label: 'Exam', url: '/cbseexam/exam', active: false, icon: '1.png' },
        { label: 'Exam Schedule', url: '#', active: false, icon: '2.png' },
        { label: 'Print Marksheet', url: '#', active: false, icon: '3.png' },
        { label: 'Exam Grade', url: '#', active: false, icon: '4.png' },
        { label: 'Assign Observation', url: '#', active: false, icon: '5.png' },
        { label: 'Observation', url: '#', active: false, icon: '6.png' },
        { label: 'Observation Parameter', url: '#', active: false, icon: '7.png' },
        { label: 'Assessment', url: '/cbseexam/assessment', active: true, icon: '8.png' },
        { label: 'Term', url: '/cbseexam/term', active: false, icon: '9.png' },
        { label: 'Template', url: '/cbseexam/template', active: false, icon: '4.png' },
        { label: 'Reports', url: '#', active: false, icon: '10.png' },
        { label: 'Setting', url: '#', active: false, icon: '11.png' },
    ];*/}

    const filteredAssessments = assessments.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        if (!hiddenColumns.includes(0)) headers.push("Assessment");
        if (!hiddenColumns.includes(1)) headers.push("Assessment Description");
        if (!hiddenColumns.includes(2)) headers.push("Assessment Type");

        const rows = filteredAssessments.map(assessment => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(assessment.name);
            if (!hiddenColumns.includes(1)) row.push(assessment.description);
            if (!hiddenColumns.includes(2)) {
                if (assessment.data && assessment.data.length > 0) {
                    const typeStr = assessment.data.map(item => `${item.name} (${item.code})`).join(', ');
                    row.push(typeStr);
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
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> State Examination</h1>
                </section>
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Assessment List</h3>
                                    <div className="box-tools pull-right">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => { resetForm(); setShowModal(true); }}
                                        >
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                        <div className="btn-group pull-right mml15">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <div className="row" style={{ marginBottom: '10px' }}>
                                            <div className="col-md-6">
                                                <div className="pull-left">
                                                    <label style={{ fontWeight: 'normal' }}>Search:
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder=""
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5em' }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="pull-right dt-buttons btn-group">
                                                    <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Assessment_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Assessment_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Assessment_List.pdf', 'Assessment List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Assessment List'); }}><i className="fa fa-print"></i></button>
                                                    <div className="btn-group">
                                                        <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><i className="fa fa-columns"></i></button>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Assessment</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Assessment Description</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Assessment Type</label>
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive overflow-visible-lg">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th width="10%">Assessment</th>}
                                                        {!hiddenColumns.includes(1) && <th width="20%">Assessment Description</th>}
                                                        {!hiddenColumns.includes(2) && <th width="65%">Assessment Type</th>}
                                                        <th className="text-right noExport" width="5%">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAssessments.map(assessment => (
                                                        <tr key={assessment.id}>
                                                            {!hiddenColumns.includes(0) && <td>{assessment.name}</td>}
                                                            {!hiddenColumns.includes(1) && <td>{assessment.description}</td>}
                                                            {!hiddenColumns.includes(2) && <td className="mailbox-name">
                                                                <table className="table table-bordered table-hover" style={{ marginBottom: 0 }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Name</th>
                                                                            <th>Code</th>
                                                                            <th>Maximum Marks</th>
                                                                            <th>Passing Percentage</th>
                                                                            <th>Description</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {assessment.data.map(item => (
                                                                            <tr key={item.id}>
                                                                                <td>{item.name}</td>
                                                                                <td>{item.code}</td>
                                                                                <td>{item.maximum_marks}</td>
                                                                                <td>{item.pass_percentage}</td>
                                                                                <td width="50%">{item.description}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </td>}
                                                            <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                                                <button className="btn btn-default btn-xs" title="Edit" onClick={() => handleEdit(assessment)}><i className="fa fa-pencil"></i></button>
                                                                <button className="btn btn-default btn-xs" title="Delete" onClick={() => handleDelete(assessment.id)}><i className="fa fa-trash"></i></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">Showing 1 to {filteredAssessments.length} of {assessments.length}</div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="dataTables_paginate paging_simple_numbers">
                                                    <ul className="pagination" style={{ margin: '0', float: 'right' }}>
                                                        <li className="paginate_button previous disabled"><a href="#"><i className="fa fa-angle-left"></i></a></li>
                                                        <li className="paginate_button active"><a href="#">1</a></li>
                                                        <li className="paginate_button next disabled"><a href="#"><i className="fa fa-angle-right"></i></a></li>
                                                    </ul>
                                                </div>
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
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                <h4 className="modal-title">{isEditing ? "Edit Assessment" : "Add Assessment"}</h4>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                                        <label>Assessment</label><small className="req"> *</small>
                                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} />
                                        {errors.name && <span className="text-danger">{errors.name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Assessment Description</label>
                                        <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleInputChange}></textarea>
                                    </div>
                                    <hr />
                                    <h5 className="box-title">Assessment Type</h5>
                                    <div id="grade_result">
                                        <div className="row">
                                            <div className="col-md-2"><b>Name</b><small className="req"> *</small></div>
                                            <div className="col-md-2"><b>Code</b><small className="req"> *</small></div>
                                            <div className="col-md-2"><b>Maximum Marks</b><small className="req"> *</small></div>
                                            <div className="col-md-2"><b>Passing Percentage</b><small className="req"> *</small></div>
                                            <div className="col-md-3"><b>Description</b></div>
                                            <div className="col-md-1"></div>
                                        </div>
                                        {formData.rows.map((row, index) => (
                                            <div className="row mb10" key={row.ui_id} style={{ marginBottom: '10px' }}>
                                                <div className={`col-md-2 ${errors.rows && errors.rows[index] && errors.rows[index].type_name ? 'has-error' : ''}`}>
                                                    <input type="text" className="form-control" value={row.type_name} onChange={(e) => handleRowChange(index, 'type_name', e.target.value)} />
                                                    {errors.rows && errors.rows[index] && errors.rows[index].type_name && <span className="text-danger">{errors.rows[index].type_name}</span>}
                                                </div>
                                                <div className={`col-md-2 ${errors.rows && errors.rows[index] && errors.rows[index].code ? 'has-error' : ''}`}>
                                                    <input type="text" className="form-control" value={row.code} onChange={(e) => handleRowChange(index, 'code', e.target.value)} />
                                                    {errors.rows && errors.rows[index] && errors.rows[index].code && <span className="text-danger">{errors.rows[index].code}</span>}
                                                </div>
                                                <div className={`col-md-2 ${errors.rows && errors.rows[index] && errors.rows[index].maximum_marks ? 'has-error' : ''}`}>
                                                    <input type="number" className="form-control" value={row.maximum_marks} onChange={(e) => handleRowChange(index, 'maximum_marks', e.target.value)} />
                                                    {errors.rows && errors.rows[index] && errors.rows[index].maximum_marks && <span className="text-danger">{errors.rows[index].maximum_marks}</span>}
                                                </div>
                                                <div className={`col-md-2 ${errors.rows && errors.rows[index] && errors.rows[index].pass_percentage ? 'has-error' : ''}`}>
                                                    <input type="number" className="form-control" value={row.pass_percentage} onChange={(e) => handleRowChange(index, 'pass_percentage', e.target.value)} />
                                                    {errors.rows && errors.rows[index] && errors.rows[index].pass_percentage && <span className="text-danger">{errors.rows[index].pass_percentage}</span>}
                                                </div>
                                                <div className="col-md-3">
                                                    <textarea className="form-control" rows="1" value={row.type_description} onChange={(e) => handleRowChange(index, 'type_description', e.target.value)}></textarea>
                                                </div>
                                                <div className="col-md-1">
                                                    <span className="text-danger cursor-pointer" onClick={() => removeRow(index)}><i className="fa fa-remove"></i></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="btn btn-default btn-sm add_row" onClick={addRow}><i className="fa fa-plus"></i> Add More</button>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade in" onClick={() => setShowModal(false)}></div>}
            <Footer />
        </div>
    );
};

export default Assessment;
