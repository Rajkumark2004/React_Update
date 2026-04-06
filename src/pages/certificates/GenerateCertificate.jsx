import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

const GenerateCertificate = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

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
        3: [{ id: 1, section: 'A' }, { id: 2, section: 'B' }],
        4: [{ id: 3, section: 'C' }],
        5: [{ id: 4, section: 'D' }]
    };

    const certificates = [
        { id: 1, certificate_name: 'Transfer Certificate' },
        { id: 2, certificate_name: 'Character Certificate' },
        { id: 3, certificate_name: 'Bonafide Certificate' }
    ];

    const mockStudents = [
        { id: 1, admission_no: '18001', name: 'John Doe', class: 'Class 1(A)', father_name: 'Robert Doe', dob: '2015-05-20', gender: 'Male', category: 'General', mobile_no: '9876543210' },
        { id: 2, admission_no: '18002', name: 'Jane Smith', class: 'Class 1(A)', father_name: 'Samuel Smith', dob: '2016-03-12', gender: 'Female', category: 'OBC', mobile_no: '9876543211' }
    ];

    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        certificate_id: ''
    });

    const [studentList, setStudentList] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };
    const sessionYear = currentSession?.session || '2024-25';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'class_id') {
            setFormData(prev => ({ ...prev, section_id: '' }));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setStudentList(mockStudents);
        setSearched(true);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(studentList.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        if (selectedStudents.length === 0) {
            alert('No record selected');
        } else {
            alert('Generating Certificates for ' + selectedStudents.length + ' students...');
        }
    };

    const filteredStudents = studentList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/generatecertificate" />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-newspaper-o"></i> Certificate</h1>
                </section>
                <section className="content" style={{ minHeight: '608px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select name="class_id" className="form-control" value={formData.class_id} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        {formData.class_id && sections[formData.class_id]?.map(s => (
                                                            <option key={s.id} value={s.id}>{s.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Certificate</label><small className="req"> *</small>
                                                    <select name="certificate_id" className="form-control" value={formData.certificate_id} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {certificates.map(t => <option key={t.id} value={t.id}>{t.certificate_name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle"><i className="fa fa-search"></i> Search</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {searched && (
                                    <div className="box-body">
                                        <div style={{ borderTop: '1px solid #f4f4f4', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 className="box-title" style={{ fontSize: '20px' }}>Student List</h3>
                                            <button className="btn btn-info btn-sm" onClick={handleGenerate}>Generate</button>
                                        </div>

                                        <div className="row pb10">
                                            <div className="col-sm-6">
                                                <div className="pull-left">
                                                    <label style={{ fontWeight: 'normal' }}>Search:
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder=""
                                                            style={{ display: 'inline-block', width: 'auto', marginLeft: '5px' }}
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="dt-buttons btn-group pull-right">
                                                    <button className="btn btn-default btn-sm" title="Copy"><i className="fa fa-copy"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Print"><i className="fa fa-print"></i></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr>
                                                        <th className="text-center" style={{ width: '30px', verticalAlign: 'middle' }}><input type="checkbox" onChange={handleSelectAll} checked={studentList.length > 0 && selectedStudents.length === studentList.length} /></th>
                                                        <th>Admission No</th>
                                                        <th>Student Name</th>
                                                        <th>Class</th>
                                                        <th>Father Name</th>
                                                        <th>Date of Birth</th>
                                                        <th>Gender</th>
                                                        <th>Category</th>
                                                        <th>Mobile No</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                                        <tr key={student.id}>
                                                            <td className="text-center" style={{ width: '30px', verticalAlign: 'middle' }}>
                                                                <input type="checkbox" className="checkbox center-block" checked={selectedStudents.includes(student.id)} onChange={() => handleSelectStudent(student.id)} />
                                                            </td>
                                                            <td>{student.admission_no}</td>
                                                            <td>{student.name}</td>
                                                            <td>{student.class}</td>
                                                            <td>{student.father_name}</td>
                                                            <td>{student.dob}</td>
                                                            <td>{student.gender}</td>
                                                            <td>{student.category}</td>
                                                            <td>{student.mobile_no}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="9" className="text-center text-danger">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="row mt10">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">
                                                    Records: 1 to {filteredStudents.length} of {filteredStudents.length}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="pull-right">
                                                    <ul className="pagination pagination-sm" style={{ margin: 0 }}>
                                                        <li className="disabled"><span>&lt;</span></li>
                                                        <li className="active"><span>1</span></li>
                                                        <li className="disabled"><span>&gt;</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default GenerateCertificate;
