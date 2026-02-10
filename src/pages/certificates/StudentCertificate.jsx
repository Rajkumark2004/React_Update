import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

const StudentCertificate = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [admissionNo, setAdmissionNo] = useState('');
    const [student, setStudent] = useState(null);
    const [searched, setSearched] = useState(false);

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

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock data search
        if (admissionNo === '18001') {
            setStudent({
                id: 1,
                admission_no: '18001',
                firstname: 'John',
                lastname: ' Doe',
                class: 'Class 1',
                section: 'A',
                hasBonafide: true,
                hasTC: false
            });
        } else {
            setStudent(null);
        }
        setSearched(true);
    };

    return (
        <div className="wrapper" style={{ marginTop: '17px' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/studentcertificate" />

            <div className="content-wrapper" style={{ minHeight: '608px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> Fees Collection</h1>
                </section>

                <section className="content" style={{ minHeight: '608px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Enter Admission Number</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <form onSubmit={handleSearch} className="form-inline">
                                                <div className="form-group">
                                                    <label>Admission No</label><small className="req"> *</small>&nbsp;
                                                    <input
                                                        autoFocus
                                                        id="admissionid"
                                                        name="admissionid"
                                                        type="text"
                                                        className="form-control"
                                                        value={admissionNo}
                                                        onChange={(e) => setAdmissionNo(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                &nbsp;
                                                <button type="submit" className="btn btn-primary btn-sm checkbox-toggle">
                                                    <i className="fa fa-search"></i> Search
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {searched && (
                                    <div className="ptt10">
                                        <div className="box-header ptbnull" style={{ borderTop: '1px solid #f4f4f4' }}></div>
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix"><i className="fa fa-money"></i> Student Details</h3>
                                        </div>
                                        <div className="box-body table-responsive">
                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Admission Number</th>
                                                        <th>Name</th>
                                                        <th>Class</th>
                                                        <th>Section</th>
                                                        <th>Bonafide</th>
                                                        <th>Transfer</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {student ? (
                                                        <tr>
                                                            <td>{student.admission_no}</td>
                                                            <td>{student.firstname}{student.lastname}</td>
                                                            <td>{student.class}</td>
                                                            <td>{student.section}</td>
                                                            <td>
                                                                <button className="btn btn-info btn-xs mr-5">Bonafide Certificate Update</button>
                                                                {student.hasBonafide && <button className="btn btn-info btn-xs" style={{ marginLeft: '5px' }}>Generate</button>}
                                                            </td>
                                                            <td>
                                                                <button className="btn btn-info btn-xs mr-5">Transfer Certificate Update</button>
                                                                {student.hasTC && <button className="btn btn-info btn-xs" style={{ marginLeft: '5px' }}>Generate</button>}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-danger text-center">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
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

export default StudentCertificate;
