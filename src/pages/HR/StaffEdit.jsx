import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../../utils/include_files'; // Import global styles
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';

const StaffEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();

    // Mock Data for the form
    const [staff, setStaff] = useState({
        id: id || '1',
        employee_id: '101',
        role: '2',
        designation: '1',
        department: '1',
        firstname: 'Jason',
        surname: 'Sharlton',
        father_name: 'John Sharlton',
        mother_name: 'Mary Sharlton',
        email: 'jason@gmail.com',
        gender: 'Male',
        dob: '1990-05-15',
        date_of_joining: '2023-01-10',
        contact_no: '9876543210',
        emergency_contact_no: '9876543211',
        marital_status: 'Married',
        local_address: '123 Street, City',
        permanent_address: '456 Avenue, Town',
        qualification: 'B.Tech',
        work_exp: '5 Years',
        note: 'Excellent performance',
        epf_no: 'EPF12345',
        basic_salary: '50000',
        contract_type: 'Permanent',
        shift: 'Day',
        location: 'Main Branch',
        bank_account_no: '123456789',
        bank_name: 'Example Bank',
        ifsc_code: 'EXAMP001',
        bank_branch: 'City Center',
        facebook: 'fb.com/jason',
        twitter: 'twitter.com/jason',
        linkedin: 'linkedin.com/jason',
        instagram: 'instgr.am/jason'
    });

    // Layout Props Mock Data


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStaff(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Saving staff details:', staff);
        alert('Staff details saved successfully (Mock)');
        navigate('/admin/staff/profile');
    };

    return (
        <div className="wrapper">
            <Header appName="School Management System" sessionYear={currentSession?.session || '2024-25'} userData={{ name: 'Admin User', avatar: '/images/no_image.png', role: 'Super Admin' }} />
            <Sidebar
                sessionYear={currentSession?.session || '2024-25'}
            />

            <div className="content-wrapper" style={{ minHeight: '946px', marginTop: '17px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Left Sidebar (HR Submenu) */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Human Resource</h3>
                                </div>
                                <ul className="tablists">
                                    <li><a href="/admin/staff" className=""><img src="/public/images/staffdirectory.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Directory</a></li>
                                    <li><a href="/admin/staff/attendance"><img src="/public/images/staffattendence.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Attendance</a></li>
                                    <li><a href="/admin/payroll"><img src="/public/images/payroll.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Payroll</a></li>
                                    <li><a href="/admin/leaverequest"><img src="/public/images/approveleave.png" alt="icon4" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Approve Leave Request</a></li>
                                    <li><a href="/admin/staff/leaverequest"><img src="/public/images/applyleave.png" alt="icon5" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Apply Leave</a></li>
                                    <li><a href="/admin/leavetypes"><img src="/public/images/leavetype.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Leave Type</a></li>
                                    <li><a href="/admin/staff/rating"><img src="/public/images/teachersrating.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Teachers Rating</a></li>
                                    <li><a href="/admin/department"><img src="/public/images/department.png" alt="icon8" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Department</a></li>
                                    <li><a href="/admin/designation"><img src="/public/images/designation.png" alt="icon9" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Designation</a></li>
                                    <li><a href="/admin/disabledstaff"><img src="/public/images/disabledstaff.png" alt="icon10" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Disabled Staff</a></li>
                                    <li><a href="/admin/staff/staffrecruitment"><img src="/public/images/staffrecruitment.png" alt="icon11" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Recruitment</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-10">
                            <div className="box box-primary">
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="alert alert-info">
                                            Staff email is their login username, password is generated automatically and send to staff email. Superadmin can change staff password on their staff profile page.
                                        </div>

                                        <div className="tshadow mb25 bozero">
                                            <h4 className="pagetitleh2">Basic Information</h4>
                                            <div className="around10">
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Staff ID</label><small className="req"> *</small>
                                                            <input type="text" name="employee_id" className="form-control" value={staff.employee_id} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Role</label><small className="req"> *</small>
                                                            <select name="role" className="form-control" value={staff.role} onChange={handleInputChange}>
                                                                <option value="1">Admin</option>
                                                                <option value="2">Teacher</option>
                                                                <option value="3">Accountant</option>
                                                                <option value="4">Librarian</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Designation</label>
                                                            <select name="designation" className="form-control" value={staff.designation} onChange={handleInputChange}>
                                                                <option value="1">Senior Teacher</option>
                                                                <option value="2">Professor</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Department</label>
                                                            <select name="department" className="form-control" value={staff.department} onChange={handleInputChange}>
                                                                <option value="1">Academic</option>
                                                                <option value="2">Administration</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>First Name</label><small className="req"> *</small>
                                                            <input type="text" name="firstname" className="form-control" value={staff.firstname} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input type="text" name="surname" className="form-control" value={staff.surname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father's Name</label>
                                                            <input type="text" name="father_name" className="form-control" value={staff.father_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother's Name</label>
                                                            <input type="text" name="mother_name" className="form-control" value={staff.mother_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Email</label><small className="req"> *</small>
                                                            <input type="email" name="email" className="form-control" value={staff.email} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Gender</label><small className="req"> *</small>
                                                            <select name="gender" className="form-control" value={staff.gender} onChange={handleInputChange}>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Birth</label><small className="req"> *</small>
                                                            <input type="date" name="dob" className="form-control" value={staff.dob} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Joining</label>
                                                            <input type="date" name="date_of_joining" className="form-control" value={staff.date_of_joining} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input type="text" name="contact_no" className="form-control" value={staff.contact_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Emergency Contact</label>
                                                            <input type="text" name="emergency_contact_no" className="form-control" value={staff.emergency_contact_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Marital Status</label>
                                                            <select name="marital_status" className="form-control" value={staff.marital_status} onChange={handleInputChange}>
                                                                <option value="Single">Single</option>
                                                                <option value="Married">Married</option>
                                                                <option value="Widowed">Widowed</option>
                                                                <option value="Separated">Separated</option>
                                                                <option value="Not Specified">Not Specified</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Photo</label>
                                                            <input type="file" className="form-control" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Current Address</label>
                                                            <textarea name="local_address" className="form-control" rows="3" value={staff.local_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Permanent Address</label>
                                                            <textarea name="permanent_address" className="form-control" rows="3" value={staff.permanent_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Qualification</label>
                                                            <textarea name="qualification" className="form-control" rows="3" value={staff.qualification} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Work Experience</label>
                                                            <textarea name="work_exp" className="form-control" rows="3" value={staff.work_exp} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="box-group collapsed-box">
                                            <div className="panel box box-success">
                                                <div className="box-header with-border">
                                                    <h4 className="box-title">
                                                        <a data-toggle="collapse" href="#collapsedDetails" aria-expanded="true">
                                                            <i className="fa fa-fw fa-plus"></i> Add More Details
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="collapsedDetails" className="panel-collapse collapse in">
                                                    <div className="box-body">
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Payroll</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>EPF No</label>
                                                                        <input type="text" name="epf_no" className="form-control" value={staff.epf_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Basic Salary</label>
                                                                        <input type="text" name="basic_salary" className="form-control" value={staff.basic_salary} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Contract Type</label>
                                                                        <select name="contract_type" className="form-control" value={staff.contract_type} onChange={handleInputChange}>
                                                                            <option value="Permanent">Permanent</option>
                                                                            <option value="Probation">Probation</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Bank Account Details</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Account Number</label>
                                                                        <input type="text" name="bank_account_no" className="form-control" value={staff.bank_account_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Name</label>
                                                                        <input type="text" name="bank_name" className="form-control" value={staff.bank_name} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>IFSC Code</label>
                                                                        <input type="text" name="ifsc_code" className="form-control" value={staff.ifsc_code} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Social Media Link</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Facebook URL</label>
                                                                        <input type="text" name="facebook" className="form-control" value={staff.facebook} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Twitter URL</label>
                                                                        <input type="text" name="twitter" className="form-control" value={staff.twitter} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StaffEdit;
