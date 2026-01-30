import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';

const SubjectList = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [subjectName, setSubjectName] = useState('');
    const [subjectType, setSubjectType] = useState('');
    const [subjectCode, setSubjectCode] = useState('');

    // Subject Types (radio options)
    const subjectTypes = [
        { key: 'theory', value: 'Theory' },
        { key: 'practical', value: 'Practical' }
    ];

    // Data States
    const [subjectList, setSubjectList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Initialize mock data
    useEffect(() => {
        const mockSubjects = [
            { id: 1, name: 'English', code: 'ENG101', type: 'theory' },
            { id: 2, name: 'Hindi', code: 'HIN102', type: 'theory' },
            { id: 3, name: 'Mathematics', code: 'MAT103', type: 'theory' },
            { id: 4, name: 'Science', code: 'SCI104', type: 'practical' },
            { id: 5, name: 'Social Studies', code: 'SOC105', type: 'theory' },
            { id: 6, name: 'Computer Science', code: 'CS106', type: 'practical' },
            { id: 7, name: 'Physics', code: 'PHY107', type: 'practical' },
            { id: 8, name: 'Chemistry', code: 'CHE108', type: 'practical' },
        ];
        setSubjectList(mockSubjects);
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        if (id && subjectList.length > 0) {
            const subjectToEdit = subjectList.find(s => s.id === parseInt(id));
            if (subjectToEdit) {
                setIsEditMode(true);
                setSubjectName(subjectToEdit.name);
                setSubjectCode(subjectToEdit.code);
                setSubjectType(subjectToEdit.type);
            }
        } else {
            setIsEditMode(false);
            setSubjectName('');
            setSubjectCode('');
            setSubjectType('');
        }
    }, [id, subjectList]);

    const handleSave = (e) => {
        e.preventDefault();

        if (!subjectName) {
            alert('The Subject Name field is required.');
            return;
        }
        if (!subjectType) {
            alert('The Subject Type field is required.');
            return;
        }

        const newSubject = {
            id: isEditMode ? parseInt(id) : Date.now(),
            name: subjectName,
            code: subjectCode,
            type: subjectType
        };

        if (isEditMode) {
            setSubjectList(prev => prev.map(s => s.id === newSubject.id ? newSubject : s));
            alert('Record Updated Successfully');
            navigate('/admin/subject');
        } else {
            setSubjectList(prev => [...prev, newSubject]);
            alert('Record Saved Successfully');
            // Reset form
            setSubjectName('');
            setSubjectCode('');
            setSubjectType('');
        }
    };

    const handleDelete = (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setSubjectList(prev => prev.filter(s => s.id !== deleteId));
        }
    };

    const filteredList = subjectList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '655px', marginTop: '18px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Add/Edit Subject Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Subject' : 'Add Subject'}</h3>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Subject Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="form-control"
                                                placeholder=""
                                                value={subjectName}
                                                onChange={(e) => setSubjectName(e.target.value)}
                                            />
                                            <span className="text-danger"></span>
                                        </div>

                                        {/* Subject Type Radio Buttons */}
                                        <div className="form-group">
                                            {subjectTypes.map((type) => (
                                                <label className="radio-inline" key={type.key}>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={type.key}
                                                        checked={subjectType === type.key}
                                                        onChange={(e) => setSubjectType(e.target.value)}
                                                    />
                                                    {type.value}
                                                </label>
                                            ))}
                                            <span className="text-danger"></span>
                                        </div>

                                        <div className="form-group">
                                            <br />
                                            <label>Subject Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder=""
                                                value={subjectCode}
                                                onChange={(e) => setSubjectCode(e.target.value)}
                                            />
                                            <span className="text-danger"></span>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Subject List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary" id="sublist">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Subject List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages">
                                        <div className="download_label">Subject List</div>

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
                                                        <th>Subject</th>
                                                        <th>Subject Code</th>
                                                        <th>Subject Type</th>
                                                        <th className="text-right no-print noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map(subject => (
                                                        <tr key={subject.id}>
                                                            <td className="mailbox-name">{subject.name}</td>
                                                            <td className="mailbox-name">{subject.code}</td>
                                                            <td className="mailbox-name">{subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}</td>
                                                            <td className="mailbox-date pull-right no-print">
                                                                <Link
                                                                    to={`/admin/subject/edit/${subject.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a
                                                                    href="#"
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(subject.id);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
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

                                            <div className="row">
                                                <div className="col-md-5">
                                                    <div className="dataTables_info">
                                                        Records: 1 to {filteredList.length} of {subjectList.length}
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

export default SubjectList;
