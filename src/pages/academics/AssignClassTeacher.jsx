import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import '../../utils/include_files';

const AssignClassTeacher = () => {
    const navigate = useNavigate();
    // Form States
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [selectedTeachers, setSelectedTeachers] = useState([]);

    // Data States
    const [classList, setClassList] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [assignTeacherList, setAssignTeacherList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Edit tracking states
    const [prevIds, setPrevIds] = useState([]);
    const [existingAssignments, setExistingAssignments] = useState([]);
    const [originalClassId, setOriginalClassId] = useState('');
    const [originalSectionId, setOriginalSectionId] = useState('');

    const { class_id: editClassId, section_id: editSectionId } = useParams();

    // Fetch Initial Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getAssignClassTeacher();
            if (response && response.status === true && response.data) {
                const data = response.data;
                setClassList(data.classes || []);
                // Only set teacherList from listing API if NOT in edit mode
                if (!editClassId) {
                    setTeacherList(data.teachers || []);
                }
                setAssignTeacherList(data.assigned_teachers || []);
            } else {
                toast.error(response.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch Details if in Edit Mode
    useEffect(() => {
        const fetchDetails = async () => {
            if (editClassId && editSectionId) {
                console.log('[DEBUG] fetchDetails called with editClassId:', editClassId, 'editSectionId:', editSectionId);
                try {
                    const response = await api.getClassTeacherDetails(editClassId, editSectionId);
                    console.log('[DEBUG] getClassTeacherDetails response:', response);
                    console.log('[DEBUG] response.status:', response?.status, 'typeof:', typeof response?.status);
                    console.log('[DEBUG] response.data:', response?.data ? 'exists' : 'missing');

                    if (response && response.status === true && response.data) {
                        const data = response.data;

                        // Populate classList from the edit response
                        if (data.classes && data.classes.length > 0) {
                            setClassList(data.classes);
                        }

                        // Populate sections from the edit response
                        if (data.sections && data.sections.length > 0) {
                            const mappedSections = data.sections.map(s => ({
                                section_id: s.id,
                                section: s.section
                            }));
                            console.log('[DEBUG] Mapped sections:', mappedSections);
                            setSectionOptions(mappedSections);
                        }

                        // Set class and section AFTER options are loaded
                        setClassId(editClassId);
                        setSectionId(editSectionId);

                        // Populate teacher list from the edit response
                        if (data.teachers) {
                            console.log('[DEBUG] Setting teacherList from data.teachers, count:', data.teachers.length);
                            console.log('[DEBUG] Teacher IDs:', data.teachers.map(t => t.id));
                            setTeacherList(data.teachers);
                        } else if (data.all_teachers) {
                            console.log('[DEBUG] Setting teacherList from data.all_teachers');
                            setTeacherList(data.all_teachers);
                        } else {
                            console.log('[DEBUG] No teachers found in response data');
                        }

                        // Extract assigned teachers
                        let assignedGroup = [];
                        console.log('[DEBUG] data.assigned_teachers:', data.assigned_teachers);
                        console.log('[DEBUG] Is array:', Array.isArray(data.assigned_teachers));

                        if (data.assigned_teachers && Array.isArray(data.assigned_teachers) && data.assigned_teachers.length > 0) {
                            const firstItem = data.assigned_teachers[0];

                            if (firstItem.teachers && Array.isArray(firstItem.teachers)) {
                                // Grouped format: [{class_id, section_id, teachers: [...]}]
                                const group = data.assigned_teachers.find(g => String(g.class_id) === String(editClassId) && String(g.section_id) === String(editSectionId)) || data.assigned_teachers[0];
                                console.log('[DEBUG] Grouped format - Found group:', group?.class_id, group?.section_id);
                                assignedGroup = group?.teachers || [];
                            } else if (firstItem.id && (firstItem.ctid || firstItem.class_id)) {
                                // Flat format: [{id, ctid, class_id, section_id, name, ...}, ...]
                                // Each item IS a teacher object directly
                                console.log('[DEBUG] Flat format - treating assigned_teachers as direct teacher list');
                                assignedGroup = data.assigned_teachers;
                            }
                        } else if (data.assigned_teachers && !Array.isArray(data.assigned_teachers) && data.assigned_teachers.teachers) {
                            assignedGroup = data.assigned_teachers.teachers;
                        }

                        console.log('[DEBUG] assignedGroup length:', assignedGroup.length);
                        console.log('[DEBUG] assignedGroup IDs:', assignedGroup.map(t => t.id));

                        const assignedIds = assignedGroup.map(t => String(t.id));
                        console.log('[DEBUG] Setting selectedTeachers to:', assignedIds);
                        setSelectedTeachers(assignedIds);

                        // Store original values for payload
                        setOriginalClassId(editClassId);
                        setOriginalSectionId(editSectionId);

                        const assignData = assignedGroup.map(t => ({
                            id: String(t.id),
                            ctid: parseInt(t.ctid || t.class_teacher_id || t.id)
                        }));
                        console.log('[DEBUG] existingAssignments:', assignData);
                        setExistingAssignments(assignData);

                        const pIds = assignData.map(a => a.ctid);
                        setPrevIds(pIds);
                    } else {
                        console.log('[DEBUG] Response check failed. status:', response?.status, 'data:', response?.data);
                        toast.error(response.message || 'Failed to fetch assignment details');
                    }
                } catch (error) {
                    console.error('[DEBUG] Error fetching details:', error);
                    toast.error('Failed to load assignment details');
                }
            } else {
                console.log('[DEBUG] fetchDetails skipped - editClassId:', editClassId, 'editSectionId:', editSectionId);
            }
        };

        fetchDetails();
    }, [editClassId, editSectionId]);

    // Fetch Sections when Class Changes (skip in edit mode - fetchDetails handles it)
    useEffect(() => {
        if (editClassId) return; // In edit mode, sections come from fetchDetails

        const fetchSections = async () => {
            if (classId) {
                try {
                    const data = await api.getSectionsByClass(classId);
                    if (data && (data.status === 'success' || data.status === true)) {
                        const sections = data.sections || data.data || Object.values(data);
                        setSectionOptions(sections);
                    } else {
                        setSectionOptions([]);
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    setSectionOptions([]);
                }
            } else {
                setSectionOptions([]);
            }
            // Only reset sectionId if NOT in edit mode and switching class
            if (!editClassId) {
                setSectionId('');
            }
        };

        fetchSections();
    }, [classId, editClassId]);

    // Handlers
    const handleTeacherToggle = (teacherId) => {
        const tId = String(teacherId); // Normalize to string just in case
        setSelectedTeachers(prev => {
            if (prev.includes(tId)) {
                return prev.filter(id => id !== tId);
            } else {
                return [...prev, tId];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!classId || !sectionId || selectedTeachers.length === 0) {
            toast.error('Please fill all required fields');
            return;
        }

        let payload;
        if (editClassId) {
            payload = {
                class: parseInt(classId),
                section: parseInt(sectionId),
                teachers: selectedTeachers.map(id => parseInt(id)),
                classteacherid: existingAssignments.map(ea => parseInt(ea.id)),
                prev_class_id: parseInt(originalClassId),
                prev_section_id: parseInt(originalSectionId),
                previd: existingAssignments.map(ea => parseInt(ea.ctid))
            };
        } else {
            payload = {
                class_id: parseInt(classId),
                section_id: parseInt(sectionId),
                teachers: selectedTeachers.map(id => parseInt(id))
            };
        }

        try {
            const response = editClassId
                ? await api.updateClassTeacher(payload)
                : await api.assignClassTeacher(payload);

            if (response.status === 'success' || response.status === true) {
                toast.success('Record Saved Successfully');
                // Reset form
                setClassId('');
                setSectionId('');
                setSelectedTeachers([]);
                // Refresh list
                fetchData();
                // If we were editing, navigate back to the main list
                if (editClassId) {
                    navigate('/admin/teacher/assign_class_teacher');
                }
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            toast.error(error.message || 'An error occurred while saving');
        }
    };

    const handleDelete = async (class_id, section_id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteClassTeacher(class_id, section_id);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchData();
                } else {
                    toast.error(response.message || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting assignment:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    // Filter Logic
    const filteredList = assignTeacherList.filter(item => {
        const term = searchTerm.toLowerCase();
        const firstTeacher = item.teachers?.[0];
        const classVal = item.class || firstTeacher?.class || "";
        const sectionVal = item.section || firstTeacher?.section || "";

        const classMatch = classVal.toLowerCase().includes(term);
        const sectionMatch = sectionVal.toLowerCase().includes(term);
        const teacherMatch = item.teachers?.some(t =>
            t.name?.toLowerCase().includes(term) ||
            t.surname?.toLowerCase().includes(term) ||
            t.employee_id?.toLowerCase().includes(term)
        ) || false;
        return classMatch || sectionMatch || teacherMatch;
    });

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(col => col !== colIndex) : [...prev, colIndex]
        );
    };

    const headers = ['Class', 'Section', 'Class Teacher'];

    const getExportData = () => {
        return filteredList.map(item => {
            const firstTeacher = item.teachers?.[0] || {};
            const classVal = item.class || firstTeacher.class || "";
            const sectionVal = item.section || firstTeacher.section || "";
            const teachersList = item.teachers ? item.teachers.map(t => `${t.name} ${t.surname} (${t.employee_id})`).join(', ') : '';
            return [classVal, sectionVal, teachersList];
        });
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
                        {/* Left Column - Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Assign Class Teacher</h3>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Class</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={classId}
                                                onChange={(e) => setClassId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Section</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={sectionId}
                                                onChange={(e) => setSectionId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {sectionOptions.map(s => <option key={s.section_id} value={s.section_id}>{s.section}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Class Teacher</label><small className="req"> *</small>
                                            {teacherList.map(teacher => (
                                                <div className="checkbox" key={teacher.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTeachers.includes(String(teacher.id))}
                                                            onChange={() => handleTeacherToggle(teacher.id)}
                                                        />
                                                        {teacher.name} {teacher.surname} ({teacher.employee_id})
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column - List */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Class Teacher List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-controls">
                                        <div className="pull-right">
                                        </div>
                                    </div>

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Class Teacher List</div>

                                        <div className="dataTables_wrapper no-footer">
                                            {/* Top Control Bar */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>

                                                {/* Search Left */}
                                                <div id="DataTables_Table_0_filter" className="dataTables_filter" style={{ textAlign: 'left' }}>
                                                    <label>Search:<input
                                                        type="search"
                                                        className=""
                                                        placeholder=""
                                                        aria-controls="DataTables_Table_0"
                                                        style={{ marginLeft: '0.5em', display: 'inline-block', width: 'auto' }}
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    /></label>
                                                </div>

                                                {/* Export Icons Right */}
                                                <div className="dt-buttons btn-group">
                                                    <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><span><i className="fa fa-files-o"></i></span></a>
                                                    <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Assign_Class_Teacher.csv'); }}><span><i className="fa fa-file-text-o"></i></span></a>
                                                    <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Assign_Class_Teacher.xls'); }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                                    <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Assign_Class_Teacher.pdf'); }}><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                    <a className="btn btn-default buttons-print btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Assign Class Teacher'); }}><span><i className="fa fa-print"></i></span></a>
                                                    <div className="btn-group">
                                                        <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Class</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Section</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Class Teacher</label>
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <table className="table table-striped table-bordered table-hover example" id="DataTables_Table_0" role="grid" aria-describedby="DataTables_Table_0_info">
                                                <thead>
                                                    <tr role="row">
                                                        {!hiddenColumns.includes(0) && <th>Class</th>}
                                                        {!hiddenColumns.includes(1) && <th>Section</th>}
                                                        {!hiddenColumns.includes(2) && <th>Class Teacher</th>}
                                                        <th className="text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map((item, index) => (
                                                        <tr key={index} role="row" className={index % 2 === 0 ? "odd" : "even"}>
                                                            {!hiddenColumns.includes(0) && (
                                                                <td className="mailbox-name">
                                                                    {item.class || item.teachers?.[0]?.class}
                                                                </td>
                                                            )}
                                                            {!hiddenColumns.includes(1) && (
                                                                <td>
                                                                    {item.section || item.teachers?.[0]?.section}
                                                                </td>
                                                            )}
                                                            {!hiddenColumns.includes(2) && (
                                                                <td>
                                                                    {(item.teachers || []).map((t, idx) => (
                                                                        <div key={idx}>
                                                                            {t.name} {t.surname} ({t.employee_id})<br />
                                                                        </div>
                                                                    ))}
                                                                </td>
                                                            )}
                                                            <td className="mailbox-date pull-right">
                                                                <Link
                                                                    to={`/admin/teacher/update_class_teacher/${item.class_id}/${item.section_id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    title="Edit"
                                                                    style={{ marginRight: '5px' }}
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={() => handleDelete(item.class_id, item.section_id)}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredList.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            {/* Bottom Control Bar */}
                                            <div className="row">
                                                <div className="col-md-5">
                                                    <div className="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite">
                                                        Records: 1 to {filteredList.length} of {assignTeacherList.length}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div> {/* Closes box-body */}
                            </div> {/* Closes box box-primary */}
                        </div> {/* Closes col-md-8 */}
                    </div> {/* Closes row */}
                </section> {/* Closes section.content */}
            </div> {/* Closes content-wrapper */}
            <Footer />
        </div>
    );
};

export default AssignClassTeacher;
