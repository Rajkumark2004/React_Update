import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const SubjectTeacher = () => {
    const navigate = useNavigate();

    // Form States
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [subjectId, setSubjectId] = useState('');

    // Data States
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [assignmentList, setAssignmentList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Initialize mock data
    useEffect(() => {
        // Mock Classes
        setClassList([
            { id: 0, class: 'Nursery' },
            { id: 1, class: 'LKG' },
            { id: 2, class: 'UKG' },
            { id: 3, class: 'Class 1' },
            { id: 4, class: 'Class 2' },
            { id: 5, class: 'Class 3' },
            { id: 6, class: 'Class 4' },
            { id: 7, class: 'Class 5' },
            { id: 8, class: 'Class 6' },
            { id: 9, class: 'Class 7' },
            { id: 10, class: 'Class 8' },
            { id: 11, class: 'Class 9' },
            { id: 12, class: 'Class 10' },
            { id: 13, class: '11' }
        ]);

        // Mock All Sections
        setAllSections([
            { section_id: 1, section: 'A', class_id: 1 },
            { section_id: 2, section: 'B', class_id: 1 },
            { section_id: 3, section: 'C', class_id: 2 }
        ]);

        // Mock Teachers
        setTeacherList([
            { id: 1, name: 'John', surname: 'Smith', employee_id: 'EMP001' },
            { id: 2, name: 'Sarah', surname: 'Johnson', employee_id: 'EMP002' },
            { id: 3, name: 'Michael', surname: 'Brown', employee_id: 'EMP003' }
        ]);

        // Mock Subjects
        setSubjectList([
            { id: 1, name: 'Mathematics' },
            { id: 2, name: 'Science' },
            { id: 3, name: 'English' }
        ]);

        // Mock Assignments
        setAssignmentList([
            { stid: 1, class: 'Class 1', section: 'A', name: 'John', surname: 'Smith', employee_id: 'EMP001', subject_name: 'Mathematics' },
            { stid: 2, class: 'Class 1', section: 'B', name: 'Sarah', surname: 'Johnson', employee_id: 'EMP002', subject_name: 'Science' }
        ]);
    }, []);

    // Update sections when class changes
    useEffect(() => {
        if (classId) {
            setSectionList(allSections.filter(s => s.class_id === parseInt(classId)));
        } else {
            setSectionList([]);
        }
        setSectionId('');
    }, [classId, allSections]);

    const handleSave = (e) => {
        e.preventDefault();
        if (!classId || !sectionId || !teacherId || !subjectId) {
            alert('Please fill all required fields');
            return;
        }

        const selectedClass = classList.find(c => c.id === parseInt(classId));
        const selectedSection = sectionList.find(s => s.section_id === parseInt(sectionId));
        const selectedTeacher = teacherList.find(t => t.id === parseInt(teacherId));
        const selectedSubject = subjectList.find(s => s.id === parseInt(subjectId));

        const newAssignment = {
            stid: Date.now(),
            class: selectedClass.class,
            section: selectedSection.section,
            name: selectedTeacher.name,
            surname: selectedTeacher.surname,
            employee_id: selectedTeacher.employee_id,
            subject_name: selectedSubject.name
        };

        setAssignmentList([...assignmentList, newAssignment]);
        alert('Record Saved Successfully');
        // Reset form
        setTeacherId('');
        setSubjectId('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setAssignmentList(assignmentList.filter(a => a.stid !== id));
        }
    };

    const filteredList = assignmentList.filter(item =>
        item.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '18px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Add Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Assign Subject Teacher</h3>
                                </div>
                                <form onSubmit={handleSave} acceptCharset="utf-8">
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
                                                {sectionList.map(s => <option key={s.section_id} value={s.section_id}>{s.section}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Teacher</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={teacherId}
                                                onChange={(e) => setTeacherId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {teacherList.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name} {t.surname} ({t.employee_id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Subject</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={subjectId}
                                                onChange={(e) => setSubjectId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {subjectList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Teacher List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Teacher List</div>

                                        {/* DataTables Controls */}
                                        <div className="dataTables_wrapper no-footer">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                <div className="dataTables_filter" style={{ textAlign: 'left' }}>
                                                    <label>Search:
                                                        <input
                                                            type="search"
                                                            placeholder=""
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            style={{ marginLeft: '0.5em', display: 'inline-block', width: 'auto' }}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="dt-buttons btn-group">
                                                    <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy"><span><i className="fa fa-files-o"></i></span></a>
                                                    <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV"><span><i className="fa fa-file-text-o"></i></span></a>
                                                    <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel"><span><i className="fa fa-file-excel-o"></i></span></a>
                                                    <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF"><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                    <a className="btn btn-default buttons-print btn-sm" title="Print"><span><i className="fa fa-print"></i></span></a>
                                                    <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns"><span><i className="fa fa-columns"></i></span></a>
                                                </div>
                                            </div>

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        <th>Class</th>
                                                        <th>Section</th>
                                                        <th>Staff Name</th>
                                                        <th>Subject</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map(item => (
                                                        <tr key={item.stid}>
                                                            <td className="mailbox-name">{item.class}</td>
                                                            <td>{item.section}</td>
                                                            <td>{item.name} {item.surname} ({item.employee_id})</td>
                                                            <td>{item.subject_name}</td>
                                                            <td className="mailbox-date pull-right">
                                                                <a
                                                                    href="#"
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(item.stid);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredList.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
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

export default SubjectTeacher;
