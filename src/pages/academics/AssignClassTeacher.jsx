import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const AssignClassTeacher = () => {
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

    // Fetch Initial Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getAssignClassTeacher();
            if (response && response.status === true && response.data) {
                const data = response.data;
                setClassList(data.classes || []);
                setTeacherList(data.teachers || []);
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

    const { class_id: editClassId, section_id: editSectionId } = useParams();

    // Fetch Details if in Edit Mode
    useEffect(() => {
        const fetchDetails = async () => {
            if (editClassId && editSectionId) {
                try {
                    const response = await api.getClassTeacherDetails(editClassId, editSectionId);
                    if (response && response.status === true && response.data) {
                        const data = response.data;
                        setClassId(data.class_id);
                        setSectionId(data.section_id);

                        // Populate teacher list from all_teachers if provided
                        if (data.all_teachers) {
                            setTeacherList(data.all_teachers);
                        }

                        // Extract teacher IDs from assigned_teachers
                        const assignedIds = (data.assigned_teachers || []).map(t => parseInt(t.id));
                        setSelectedTeachers(assignedIds);
                    } else {
                        toast.error(response.message || 'Failed to fetch assignment details');
                    }
                } catch (error) {
                    console.error('Error fetching details:', error);
                    toast.error('Failed to load assignment details');
                }
            }
        };

        fetchDetails();
    }, [editClassId, editSectionId]);

    // Fetch Sections when Class Changes
    useEffect(() => {
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
        setSelectedTeachers(prev => {
            if (prev.includes(teacherId)) {
                return prev.filter(id => id !== teacherId);
            } else {
                return [...prev, teacherId];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!classId || !sectionId || selectedTeachers.length === 0) {
            toast.error('Please fill all required fields');
            return;
        }

        const payload = {
            class_id: parseInt(classId),
            section_id: parseInt(sectionId),
            teachers: selectedTeachers.map(id => parseInt(id))
        };

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

                <section className="content" style={{ marginTop: '18px' }}>
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
                                                            checked={selectedTeachers.includes(parseInt(teacher.id))}
                                                            onChange={() => handleTeacherToggle(parseInt(teacher.id))}
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
                                                    <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy"><span><i className="fa fa-files-o"></i></span></a>
                                                    <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV"><span><i className="fa fa-file-text-o"></i></span></a>
                                                    <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel"><span><i className="fa fa-file-excel-o"></i></span></a>
                                                    <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF"><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                    <a className="btn btn-default buttons-print btn-sm" title="Print"><span><i className="fa fa-print"></i></span></a>
                                                    <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns"><span><i className="fa fa-columns"></i></span></a>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <table className="table table-striped table-bordered table-hover example" id="DataTables_Table_0" role="grid" aria-describedby="DataTables_Table_0_info">
                                                <thead>
                                                    <tr role="row">
                                                        <th>Class</th>
                                                        <th>Section</th>
                                                        <th>Class Teacher</th>
                                                        <th className="text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map((item, index) => (
                                                        <tr key={index} role="row" className={index % 2 === 0 ? "odd" : "even"}>
                                                            <td className="mailbox-name">
                                                                {item.class || item.teachers?.[0]?.class}
                                                            </td>
                                                            <td>
                                                                {item.section || item.teachers?.[0]?.section}
                                                            </td>
                                                            <td>
                                                                {(item.teachers || []).map((t, idx) => (
                                                                    <div key={idx}>
                                                                        {t.name} {t.surname} ({t.employee_id})<br />
                                                                    </div>
                                                                ))}
                                                            </td>
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
