import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const SubjectGroupList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [classId, setClassId] = useState('');
    const [selectedSections, setSelectedSections] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [description, setDescription] = useState('');

    // Mock Data
    const [classList, setClassList] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [subjectGroupList, setSubjectGroupList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const headers = ['Name', 'Class (Section)', 'Subject'];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(col => col !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const exportHeaders = headers.filter((_, i) => !hiddenColumns.includes(i));
        const exportRows = filteredList.map(group => {
            const rowData = [];
            if (!hiddenColumns.includes(0)) rowData.push(group.name);
            if (!hiddenColumns.includes(1)) rowData.push(group.sections ? group.sections.map(sec => `${sec.class}(${sec.section})`).join(', ') : '');
            if (!hiddenColumns.includes(2)) rowData.push(group.group_subject ? group.group_subject.map(subj => subj.name).join(', ') : '');
            return rowData;
        });
        return { headers: exportHeaders, rows: exportRows };
    };

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            let data;
            if (id) {
                data = await api.getSubjectGroupDetails(id);
            } else {
                data = await api.getSubjectGroupList();
            }

            if (data && (data.status === 'success' || data.status === true)) {
                // Common data mapping
                if (data.data) {
                    // For details response structure
                    const details = data.data;
                    setClassList(details.classlist || []);
                    setSubjectList(details.subjectlist || []);
                    // For list response structure (it matches generally but list might be under subjectgroupList)
                    // But for edit, we might primarily need the single group details to populate form
                    // The list on the right might still need all groups?
                    // The user said "when I click on edit, i need the fields in edit/id to be filled from this apis response"
                    // The list on the right typically shows all items. If getSubjectGroupDetails ONLY returns one item in `subjectgroup`, 
                    // then the list on the right might be empty or just show that one.
                    // However, often edit pages still show the full list. 
                    // If the user *only* wants to fill the form, we should probably fetch the List SEPARATELY if getSubjectGroupDetails doesn't return the full list.
                    // Looking at the response: "subjectgroup": [{...}] (array of 1).
                    // So if we use this data for `subjectGroupList` state, the table will only show 1 row.
                    // This is acceptable behavior for "details/edit" view usually, or we might need to fetch `getSubjectGroupList` AND `getSubjectGroupDetails` if we want the full list + details.
                    // Given the request focuses on "fields in edit/id to be filled", I'll prioritize populating the form.
                    // If the list becomes single-item, so be it, unless I see a reason to fetch both.
                    // Let's check `getSubjectGroupList` response again. It had `subjectgroupList`.
                    // This new response has `subjectgroup` inside `data`.

                    setSubjectGroupList(details.subjectgroup || (data.subjectgroupList || []));
                } else {
                    // Fallback for getSubjectGroupList standard response
                    setSubjectGroupList(data.subjectgroupList || []);
                    setClassList(data.classlist || []);
                    setSubjectList(data.subjectlist || []);
                }
            } else {
                toast.error(data.message || 'Failed to load initial data');
            }
        } catch (error) {
            console.error('Error fetching subject group data:', error);
            toast.error('Failed to load subject groups');
        } finally {
            setLoading(false);
        }
    };

    // Handle Edit Mode Population
    useEffect(() => {
        if (id && subjectGroupList.length > 0) {
            // Find the group related to this ID. 
            // Since we fetched specifically for this ID if (id) is present in fetchInitialData (mostly), 
            // the list might only contain this one, or if we fetched all, we find it.
            const groupToEdit = subjectGroupList.find(g => String(g.id) === String(id));

            if (groupToEdit) {
                setIsEditMode(true);
                setName(groupToEdit.name);

                // Get class_id from sections if not directly on groupToEdit
                let parsedClassId = groupToEdit.class_id;
                if (!parsedClassId && groupToEdit.sections && groupToEdit.sections.length > 0) {
                    parsedClassId = groupToEdit.sections[0].class_id;
                }
                setClassId(parsedClassId);
                setDescription(groupToEdit.description);

                // Set selections
                // Set selections
                const sectionIds = groupToEdit.sections ? groupToEdit.sections.map(s => {
                    if (s && typeof s === 'object') {
                        if (s.class_section_id !== undefined && s.class_section_id !== null) return String(s.class_section_id);
                        if (s.section_id !== undefined) return String(s.section_id);
                        if (s.id !== undefined) return String(s.id);
                    }
                    return String(s);
                }).filter(s => s && s !== 'undefined' && s !== '') : [];

                const subjectIds = groupToEdit.group_subject ? groupToEdit.group_subject.map(s => {
                    if (s && typeof s === 'object') {
                        if (s.subject_id !== undefined) return String(s.subject_id);
                        if (s.id !== undefined) return String(s.id);
                    }
                    return String(s);
                }).filter(s => s && s !== 'undefined' && s !== '') : [];

                setSelectedSections(sectionIds);
                setSelectedSubjects(subjectIds);

                // Fetch sections for the selected class to populate checkboxes
                if (parsedClassId) {
                    fetchSectionsForClass(parsedClassId);
                }
            }
        } else if (!id) {
            // Reset if no ID (Add Mode)
            setIsEditMode(false);
            setName('');
            setClassId('');
            setSelectedSections([]);
            setSelectedSubjects([]);
            setDescription('');
            setAvailableSections([]);
        }
    }, [id, subjectGroupList]); // Re-run when ID changes or list loads
 
    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const fetchSectionsForClass = async (cId) => {
        try {
            const data = await api.getSectionsByClass(cId);
            if (data && (data.status === true || data.status === 'success')) {
                setAvailableSections(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleClassChange = async (e) => {
        const selectedId = e.target.value;
        setClassId(selectedId);
        setSelectedSections([]);
        setAvailableSections([]);
        clearError('class_id');

        if (selectedId) {
            fetchSectionsForClass(selectedId);
        }
    };

    const handleSectionCheckboxChange = (sectionId) => {
        const idStr = String(sectionId);
        setSelectedSections(prev => {
            const next = prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr];
            if (next.length > 0) clearError('sections');
            return next;
        });
    };

    const handleSubjectCheckboxChange = (subjectId) => {
        const idStr = String(subjectId);
        setSelectedSubjects(prev => {
            const next = prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr];
            if (next.length > 0) clearError('subject');
            return next;
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({});
 
        let hasError = false;
        const newErrors = {};
 
        if (!name) { newErrors.name = 'The Name field is required.'; hasError = true; }
        if (!classId) { newErrors.class_id = 'The Class field is required.'; hasError = true; }
        if (selectedSections.length === 0) { newErrors.sections = 'The Section field is required.'; hasError = true; }
        if (selectedSubjects.length === 0) { newErrors.subject = 'The Subject field is required.'; hasError = true; }
 
        if (hasError) {
            setErrors(newErrors);
            return;
        }
 
        const payload = {
            name: name,
            description: description,
            class_id: parseInt(classId, 10),
            subject: selectedSubjects.map(sId => parseInt(sId, 10)).filter(n => !isNaN(n)),
            sections: selectedSections.map(sId => parseInt(sId, 10)).filter(n => !isNaN(n))
        };
 
        setSubmitting(true);
        try {
            let response;
            if (isEditMode) {
                response = await api.editSubjectGroup(id, payload);
            } else {
                response = await api.addSubjectGroup(payload);
            }
 
            if (response.status === 'success' || response.status === true) {
                toast.success(isEditMode ? 'Record Updated Successfully' : 'Record Saved Successfully');
                if (isEditMode) {
                    navigate('/admin/subjectgroup');
                } else {
                    // Reset form
                    setName('');
                    setClassId('');
                    setSelectedSections([]);
                    setSelectedSubjects([]);
                    setDescription('');
                    setAvailableSections([]);
                }
                fetchInitialData();
            } else if (response.status === 'fail' && response.errors) {
                setErrors(response.errors);
                const firstMsg = Object.values(response.errors)[0] || 'Validation failed';
                toast.error(firstMsg);
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving subject group:', error);
            toast.error(error.message || 'An error occurred while saving');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteSubjectGroup(deleteId);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting subject group:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const filteredList = subjectGroupList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Subject Group' : 'Add Subject Group'}</h3>
                                    <div className="btn-group pull-right visible-xs-block visible-sm-block">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                                            />
                                            {errors.name && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.name}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Class</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={classId}
                                                onChange={handleClassChange}
                                            >
                                                <option value="">Select</option>
                                                {classList.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                ))}
                                            </select>
                                            {errors.class_id && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.class_id}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label className="control-label">Sections</label><small className="req"> *</small>
                                            <div className="section_checkbox">
                                                {availableSections.length > 0 ? (
                                                    availableSections.map(sec => (
                                                        <div className="checkbox" key={sec.id}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    value={sec.id}
                                                                    checked={selectedSections.includes(String(sec.id))}
                                                                    onChange={() => handleSectionCheckboxChange(sec.id)}
                                                                />
                                                                {sec.section}
                                                            </label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div>No Section</div>
                                                )}
                                            </div>
                                            {errors.sections && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.sections}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Subject</label><small className="req"> *</small>
                                            {subjectList.map(subj => (
                                                <div className="checkbox" key={subj.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            value={subj.id}
                                                            checked={selectedSubjects.includes(String(subj.id))}
                                                            onChange={() => handleSubjectCheckboxChange(subj.id)}
                                                        />
                                                        {subj.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {errors.subject && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.subject}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Enter ..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            ></textarea>
                                            <span className="text-danger"></span>
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

                        <div className="col-md-8">
                            <div className="box box-primary" id="subject_list">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Subject Group List</h3>
                                    <div className="btn-group pull-right hidden-xs hidden-sm">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="dt-controls-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                            <div className="dataTables_length">
                                                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                    Records:
                                                    <select
                                                        value={recordsPerPage}
                                                        onChange={(e) => {
                                                            setRecordsPerPage(Number(e.target.value));
                                                            setCurrentPage(1);
                                                        }}
                                                        className="form-control input-sm"
                                                        style={{ width: '80px', margin: '0 10px' }}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                        <option value="-1">All</option>
                                                    </select>
                                                </label>
                                            </div>
                                            {/* Search */}
                                            <div id="DataTables_Table_0_filter" className="dataTables_filter" style={{ display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type="search"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Export Icons Right */}
                                        <div className="dt-buttons btn-group">
                                            <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><span><i className="fa fa-files-o"></i></span></a>
                                            <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Subject_Group_List.csv'); }}><span><i className="fa fa-file-text-o"></i></span></a>
                                            <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Subject_Group_List.xls'); }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                            <a className="btn btn-default buttons-print btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Subject Group List'); }}><span><i className="fa fa-print"></i></span></a>
                                            <div className="btn-group">
                                                <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                {showColumnsDropdown && (
                                                    <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                        <li>
                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Name</label>
                                                        </li>
                                                        <li>
                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Class (Section)</label>
                                                        </li>
                                                        <li>
                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Subject</label>
                                                        </li>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Subject Group List</div>
                                        <table className="table table-striped table-bordered table-hover example" id="headerTable">
                                            <thead>
                                                <tr>
                                                    {!hiddenColumns.includes(0) && <th style={{ textAlign: 'left' }}>Name</th>}
                                                    {!hiddenColumns.includes(1) && <th style={{ textAlign: 'left' }}>Class (Section)</th>}
                                                    {!hiddenColumns.includes(2) && <th style={{ textAlign: 'left' }}>Subject</th>}
                                                    <th style={{ textAlign: 'right' }} className="no_print">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map(group => (
                                                    <tr key={group.id}>
                                                        {!hiddenColumns.includes(0) && <td className="mailbox-name" style={{ textAlign: 'left' }}>
                                                            <a href="#" className="detail_popover">{group.name}</a>
                                                            <div className="fee_detail_popover" style={{ display: 'none' }}>
                                                                {group.description ? (
                                                                    <p className="text text-info">{group.description}</p>
                                                                ) : (
                                                                    <p className="text text-danger">No Description</p>
                                                                )}
                                                            </div>
                                                        </td>}
                                                        {!hiddenColumns.includes(1) && <td style={{ textAlign: 'left' }}>
                                                            <ol className="p-0" style={{ paddingLeft: '15px', marginBottom: 0 }}>
                                                                {group.sections && group.sections.map((sec, idx) => (
                                                                    <li key={idx}>{sec.class}({sec.section})</li>
                                                                ))}
                                                            </ol>
                                                        </td>}
                                                        {!hiddenColumns.includes(2) && <td style={{ textAlign: 'left' }}>
                                                            <table width="100%">
                                                                <tbody>
                                                                    {group.group_subject && group.group_subject.map((subj, idx) => (
                                                                        <tr key={idx}><td style={{ border: 'none', padding: '2px 0' }}><div>{subj.name}</div></td></tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </td>}
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                                <Link to={`/admin/subjectgroup/edit/${group.id}`} className="btn btn-default btn-xs" title="Edit">
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a
                                                                    href="#"
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(group.id);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {currentItems.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center">No Result Found</td>
                                                    </tr>
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

export default SubjectGroupList;
