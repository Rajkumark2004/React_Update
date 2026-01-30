import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import '../../../utils/include_files';

const AssignClassTeacher = () => {
    // Form States
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [selectedTeachers, setSelectedTeachers] = useState([]);

    // Data States
    const [sectionOptions, setSectionOptions] = useState([]);
    const [assignTeacherList, setAssignTeacherList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const classes = [
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
    ];

    const sections = {
        1: [{ id: 1, section: 'A' }, { id: 2, section: 'B' }],
        2: [{ id: 1, section: 'A' }, { id: 3, section: 'C' }],
        3: [{ id: 2, section: 'B' }]
    };

    const teachers = [
        { id: 1, name: 'Jason', surname: 'Sharlton', employee_id: '90000234' },
        { id: 2, name: 'Jane', surname: 'Doe', employee_id: '90000123' },
        { id: 3, name: 'John', surname: 'Smith', employee_id: '90000456' }
    ];

    // Simulate initial data fetch
    useEffect(() => {
        // Mock assignments
        setAssignTeacherList([
            { class_id: 1, section_id: 1, class: 'Class 1', section: 'A', teachers: [teachers[0], teachers[1]] },
            { class_id: 2, section_id: 1, class: 'Class 2', section: 'A', teachers: [teachers[2]] }
        ]);
    }, []);

    // Effects
    useEffect(() => {
        if (classId) {
            setSectionOptions(sections[classId] || []);
        } else {
            setSectionOptions([]);
        }
    }, [classId]);

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

    const handleSave = (e) => {
        e.preventDefault();
        if (classId && sectionId && selectedTeachers.length > 0) {
            alert('Class Teacher assigned successfully');
            // Logic to update state would go here in a real app
            window.location.reload();
        } else {
            alert('Please fill all required fields');
        }
    };

    const handleDelete = (class_id, section_id) => {
        if (confirm('Are you sure you want to delete this?')) {
            alert('Deleted successfully');
            // Logic to update state would go here in a real app
        }
    };

    // Filter Logic
    const filteredList = assignTeacherList.filter(item => {
        const term = searchTerm.toLowerCase();
        const classMatch = item.class.toLowerCase().includes(term);
        const sectionMatch = item.section.toLowerCase().includes(term);
        const teacherMatch = item.teachers.some(t =>
            t.name.toLowerCase().includes(term) ||
            t.surname.toLowerCase().includes(term) ||
            t.employee_id.toLowerCase().includes(term)
        );
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
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
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
                                                {sectionOptions.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Class Teacher</label><small className="req"> *</small>
                                            {teachers.map(teacher => (
                                                <div className="checkbox" key={teacher.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTeachers.includes(teacher.id)}
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
                                                            <td className="mailbox-name">{item.class}</td>
                                                            <td>{item.section}</td>
                                                            <td>
                                                                {item.teachers.map((t, idx) => (
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
