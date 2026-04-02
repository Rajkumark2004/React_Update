import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';

const ClassList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [className, setClassName] = useState('');
    const [selectedSections, setSelectedSections] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionsList, setSectionsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialSections, setInitialSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch Initial Data
    useEffect(() => {
        const fetchClassesAndSections = async () => {
            setLoading(true);
            try {
                const data = await api.getClasses();
                if (data && data.status === 'success') {
                    setSectionsList(data.sectionlist || []);
                    setClassList(data.classsectionlist || []);
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                toast.error('Failed to load classes');
            } finally {
                setLoading(false);
            }
        };
        fetchClassesAndSections();
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        const fetchClassDetails = async () => {
            if (id) {
                setLoading(true);
                try {
                    const data = await api.getClassForEdit(id);
                    if (data && data.status === 'success') {
                        setIsEditMode(true);
                        setClassName(data.class.class);
                        // Map sections to their section_id (which corresponds to id in sectionlist)
                        const sectionIds = (data.class.sections || []).map(s => s.section_id);
                        setSelectedSections(sectionIds);
                        setInitialSections(sectionIds);

                        // Ensure sections list is populated if it comes with the edit response
                        if (data.sectionlist) {
                            setSectionsList(data.sectionlist);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching class details:', error);
                    toast.error('Failed to load class details');
                } finally {
                    setLoading(false);
                }
            } else {
                setIsEditMode(false);
                setClassName('');
                setSelectedSections([]);
                setInitialSections([]);
            }
        };
        fetchClassDetails();
    }, [id]);


    const handleClassChange = (e) => {
        const val = e.target.value.slice(0, 50);
        setClassName(val);
        if (errors.class) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.class;
                return newErrors;
            });
        }
    };
 
    const handleCheckboxChange = (sectionId) => {
        let nextSections;
        setSelectedSections(prev => {
            if (prev.includes(sectionId)) {
                nextSections = prev.filter(id => id !== sectionId);
            } else {
                nextSections = [...prev, sectionId];
            }
            
            if (nextSections.length > 0 && errors.sections) {
                setErrors(p => {
                    const n = { ...p };
                    delete n.sections;
                    return n;
                });
            }
            return nextSections;
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({});
 
        let hasError = false;
        const newErrors = {};
 
        if (!className) {
            newErrors.class = 'The Class field is required.';
            hasError = true;
        }
        if (selectedSections.length === 0) {
            newErrors.sections = 'The Section field is required.';
            hasError = true;
        }
 
        if (hasError) {
            setErrors(newErrors);
            return;
        }
 
        setSubmitting(true);
        try {
            console.log('DEBUG: Submitting class data:', isEditMode ? 'EDIT' : 'ADD');
            if (isEditMode) {
                const payload = {
                    id: id,
                    pre_class_id: id,
                    prev_sections: initialSections,
                    class: className,
                    sections: selectedSections
                };
                const response = await api.updateClass(payload);
                console.log('DEBUG: updateClass response:', response);
                if (response.status === 'success') {
                    toast.success('Record Updated Successfully');
                    setClassName('');
                    setSelectedSections([]);
                    setInitialSections([]);
                    navigate('/admin/classes');
                    // Refresh data
                    const data = await api.getClasses();
                    if (data && data.status === 'success') {
                        setClassList(data.classsectionlist || []);
                    }
                } else if (response.status === 'fail') {
                    if (response.errors) setErrors(response.errors);
                    const errorMsg = response.message || (response.errors ? Object.values(response.errors)[0] : 'Failed to update record');
                    toast.error(errorMsg);
                } else {
                    toast.error(response.message || 'Failed to update record');
                }
            } else {
                // Add new
                const payload = {
                    class: className,
                    sections: selectedSections
                };
                const response = await api.addClass(payload);
                console.log('DEBUG: addClass response:', response);
                if (response.status === 'success') {
                    toast.success('Record Saved Successfully');
                    setClassName('');
                    setSelectedSections([]);
                    // Refresh data
                    const data = await api.getClasses();
                    if (data && data.status === 'success') {
                        setClassList(data.classsectionlist || []);
                    }
                } else if (response.status === 'fail') {
                    if (response.errors) setErrors(response.errors);
                    const errorMsg = response.message || (response.errors ? Object.values(response.errors)[0] : 'Failed to save record');
                    toast.error(errorMsg);
                } else {
                    toast.error(response.message || 'Failed to save record');
                }
            }
        } catch (error) {
            console.error('DEBUG: handleSave catch error:', error);
            toast.error(error.message || 'Failed to save record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this class? All students in this class will also be deleted.')) {
            try {
                const response = await api.deleteClass(deleteId);
                if (response.status === 'success') {
                    toast.success('Record Deleted Successfully');
                    // Refresh data
                    const data = await api.getClasses();
                    if (data && data.status === 'success') {
                        setClassList(data.classsectionlist || []);
                    }
                    if (isEditMode && parseInt(id) === deleteId) {
                        navigate('/admin/classes');
                    }
                }
            } catch (error) {
                console.error('Error deleting class:', error);
                toast.error(error.message || 'Failed to delete record');
            }
        }
    };

    // Filter Logic
    const filteredList = classList.filter(item => {
        return item.class.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const headers = ['Class', 'Sections'];

    const getExportData = () => {
        const exportHeaders = headers.filter((_, i) => !hiddenColumns.includes(i));
        const exportRows = filteredList.map(item => {
            const rowData = [];
            if (!hiddenColumns.includes(0)) rowData.push(item.class);
            if (!hiddenColumns.includes(1)) rowData.push(item.sections ? item.sections.map(s => s.section).join(', ') : '');
            return rowData;
        });
        return { headers: exportHeaders, rows: exportRows };
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '676px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics
                    </h1>
                </section>

                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        {/* Add/Edit Class Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Class' : 'Add Class'}</h3>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label htmlFor="class">Class</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                id="class"
                                                name="class"
                                                placeholder=""
                                                type="text"
                                                className="form-control"
                                                value={className}
                                                onChange={handleClassChange}
                                            />
                                            {errors.class && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.class}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Sections</label><small className="req"> *</small>
                                            {sectionsList.map((vehicle) => (
                                                <div className="checkbox" key={vehicle.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            name="sections[]"
                                                            value={vehicle.id}
                                                            checked={selectedSections.includes(vehicle.id)}
                                                            onChange={() => handleCheckboxChange(vehicle.id)}
                                                        />
                                                        {vehicle.section}
                                                    </label>
                                                </div>
                                            ))}
                                            {errors.sections && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.sections}</span>}
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

                        {/* Class List Table */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Class List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>

                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Class List</div>

                                        {/* DataTables Look-alike Controls */}
                                        <div className="dataTables_wrapper no-footer">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                <div className="dataTables_filter" style={{ textAlign: 'left' }}>
                                                    <input
                                                        type="search"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                    />
                                                </div>
                                                <div className="dt-buttons btn-group">
                                                    <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><span><i className="fa fa-files-o"></i></span></a>
                                                    <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Class_List.csv'); }}><span><i className="fa fa-file-text-o"></i></span></a>
                                                    <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Class_List.xls'); }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                                    <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Class_List.pdf'); }}><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                    <a className="btn btn-default buttons-print btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Class List'); }}><span><i className="fa fa-print"></i></span></a>
                                                    <div className="btn-group">
                                                        <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Class</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Sections</label>
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th>Class</th>}
                                                        {!hiddenColumns.includes(1) && <th>Sections</th>}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map((vehroute) => (
                                                        <tr key={vehroute.id}>
                                                            {!hiddenColumns.includes(0) && (
                                                                <td className="mailbox-name">
                                                                    {vehroute.class}
                                                                </td>
                                                            )}
                                                            {!hiddenColumns.includes(1) && (
                                                                <td>
                                                                    {vehroute.sections && vehroute.sections.length > 0 && vehroute.sections.map((value, index) => (
                                                                        <div key={index}>{value.section}</div>
                                                                    ))}
                                                                </td>
                                                            )}
                                                            <td className="mailbox-date pull-right">
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                    onClick={() => navigate(`/admin/classes/edit/${vehroute.id}`)}
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </button>
                                                                <a
                                                                    href="#"
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Delete"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(vehroute.id);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredList.length === 0 && (
                                                        <tr>
                                                            <td colSpan="3" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            <div className="row">
                                                <div className="col-md-5">
                                                    <div className="dataTables_info">
                                                        Records: 1 to {filteredList.length} of {classList.length}
                                                    </div>
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
            <Footer />
        </div>
    );
};

export default ClassList;
