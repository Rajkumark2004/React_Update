import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

const GenerateStaffIdCard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // Mock Data for Roles
    const roles = [
        { id: 1, type: 'Admin' },
        { id: 2, type: 'Teacher' },
        { id: 3, type: 'Super Admin' },
        { id: 4, type: 'Fee Agent' },
        { id: 5, type: 'Director' },
        { id: 6, type: 'NON_Teaching' }
    ];

    // Mock Data for ID Card Templates
    const idCards = [
        { id: 1, title: 'Sample Staff ID Card' },
        { id: 2, title: 'Sample Staff ID Card Vertical' }
    ];

    // Mock Data for Staff List
    const [staffList, setStaffList] = useState([]);
    const [searched, setSearched] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const mockStaffData = [
        { id: 101, employee_id: 'EMP001', name: 'James', surname: 'Wilson', role: 'Admin', designation: 'Teacher', department: 'Mathematics', father_name: 'Robert Wilson', mother_name: 'Mary Wilson', date_of_joining: '2022-01-10', local_address: '123 Street, City', contact_no: '9876543210', dob: '1990-05-15' },
        { id: 102, employee_id: 'EMP002', name: 'Sarah', surname: 'Johnson', role: 'Librarian', designation: 'Librarian', department: 'Library', father_name: 'David Johnson', mother_name: 'Linda Johnson', date_of_joining: '2021-11-20', local_address: '456 Lane, City', contact_no: '9876543211', dob: '1988-08-22' },
        { id: 103, employee_id: 'EMP003', name: 'Michael', surname: 'Brown', role: 'Accountant', designation: 'Accountant', department: 'Finance', father_name: 'William Brown', mother_name: 'Patricia Brown', date_of_joining: '2023-03-05', local_address: '789 Road, City', contact_no: '9876543212', dob: '1992-12-10' }
    ];

    const [formData, setFormData] = useState({
        role_id: '',
        id_card: ''
    });

    const [searchedParams, setSearchedParams] = useState({
        role_id: '',
        id_card: ''
    });

    const [selectedStaff, setSelectedStaff] = useState([]);

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
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchedParams({ ...formData });
        setStaffList(mockStaffData);
        setSearched(true);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStaff(staffList.map(s => s.id));
        } else {
            setSelectedStaff([]);
        }
    };

    const handleSelectStaff = (id) => {
        setSelectedStaff(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        if (selectedStaff.length === 0) {
            alert('No record selected');
        } else {
            alert('Generating ID Cards for ' + selectedStaff.length + ' staff members...');
        }
    };

    return (
        <div className="wrapper" style={{ marginTop: '17px' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/generatestaffidcard" />

            <div className="content-wrapper" style={{ minHeight: '600px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-newspaper-o"></i> Certificate</h1>
                </section>
                <section className="content" style={{ minHeight: '608px' }}>
                    <div className="row">


                        {/* Search Criteria */}
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Role</label><small className="req" style={{ color: 'red' }}> *</small>
                                                    <select name="role_id" className="form-control" value={formData.role_id} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {roles.map(role => <option key={role.id} value={role.id}>{role.type}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>ID Card Template</label><small className="req" style={{ color: 'red' }}> *</small>
                                                    <select name="id_card" className="form-control" value={formData.id_card} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {idCards.map(card => <option key={card.id} value={card.id}>{card.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <button type="submit" className="btn btn-primary btn-sm pull-right"><i className="fa fa-search"></i> Search</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {searched && (
                                    <div className="box-body">
                                        <div style={{ borderTop: '1px solid #f4f4f4', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 className="box-title" style={{ fontSize: '20px' }}>Staff</h3>
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
                                                        <th className="text-center"><input type="checkbox" onChange={handleSelectAll} checked={staffList.length > 0 && selectedStaff.length === staffList.length} /></th>
                                                        <th>Staff Name</th>
                                                        <th>Designation</th>
                                                        <th>Department</th>
                                                        <th>Father Name</th>
                                                        <th>Mother Name</th>
                                                        <th>Date of Joining</th>
                                                        <th>Address</th>
                                                        <th>Phone</th>
                                                        <th>Date of Birth</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).length > 0 ? staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).map(staff => (
                                                        <tr key={staff.id}>
                                                            <td className="text-center"><input type="checkbox" checked={selectedStaff.includes(staff.id)} onChange={() => handleSelectStaff(staff.id)} /></td>
                                                            <td>{staff.name} {staff.surname}</td>
                                                            <td>{staff.designation}</td>
                                                            <td>{staff.department}</td>
                                                            <td>{staff.father_name}</td>
                                                            <td>{staff.mother_name}</td>
                                                            <td>{staff.date_of_joining}</td>
                                                            <td>{staff.local_address}</td>
                                                            <td>{staff.contact_no}</td>
                                                            <td>{staff.dob}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="11" className="text-center text-danger">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="row mt10">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">
                                                    Records: 1 to {staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).length} of {staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).length}
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

export default GenerateStaffIdCard;
