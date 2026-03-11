import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import '../../utils/include_files'; // Ensure global styles are loaded
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';

const StaffSearch = () => {
    const { sessionYear } = useSession();
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock Data for Layout Props
    const appName = "Smart School";
    const userData = {
        name: "Joe",
        pimage: "public/images/userprofile.jpg",
        role: "Super Admin"
    };




    const handleLogout = () => {
        console.log("Logout clicked");
    };

    const handleSearch = (term) => {
        console.log("Search term:", term);
    };

    // Fetch staff list from API
    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getStaffList();

                if (response.status && response.data) {
                    // Map API response to component format
                    const mappedStaff = response.data.resultlist.map(staff => ({
                        id: staff.id,
                        employee_id: staff.employee_id,
                        name: staff.name,
                        surname: staff.surname || '',
                        role: staff.user_type || '',
                        role_id: staff.role_id,
                        department: staff.department || '',
                        designation: staff.designation || '',
                        mobile: staff.contact_no || '',
                        email: staff.email || '',
                        image: staff.image ? `https://newlayout.wisibles.com/uploads/staff_images/${staff.image}` : 'https://newlayout.wisibles.com/uploads/staff_images/default_male.jpg',
                        gender: staff.gender || '',
                        location: staff.location || '',
                        is_active: staff.is_active
                    }));

                    setStaffList(mappedStaff);
                    setRoles(response.data.staff_role || []);
                }
            } catch (err) {
                console.error('Error fetching staff list:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaffList();
    }, []);

    // Filter Logic
    const filteredStaff = staffList.filter(staff => {
        const matchesRole = selectedRole ? staff.role_id === selectedRole : true;
        const matchesSearch = searchTerm ? (
            staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        return matchesRole && matchesSearch;
    });

    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                handleLogout={handleLogout}
            />
            <Sidebar

                handleSearch={handleSearch}
                sessionYear={sessionYear}
            />

            <div className="content-wrapper" style={{ marginTop: '0px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-sitemap"></i> Human Resource
                    </h1>
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
                                    <li><Link to="/admin/staff/search" className="active"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Directory</Link></li>
                                    <li><Link to="/admin/staff/attendance"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/2.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Attendance</Link></li>
                                    {/* <li><a href="/admin/payroll"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Payroll</a></li> */}
                                    <li><Link to="/admin/leaverequest"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/4.png" alt="icon4" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Approve Leave Request</Link></li>
                                    <li><Link to="/admin/staff/leaverequest"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/5.png" alt="icon5" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Apply Leave</Link></li>
                                    <li><Link to="/admin/leavetypes"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/6.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Leave Type</Link></li>
                                    {/* <li><Link to="/admin/staff/rating"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/7.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Teachers Rating</Link></li> */}
                                    <li><Link to="/admin/department"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/8.png" alt="icon8" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Department</Link></li>
                                    <li><Link to="/admin/designation"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/9.png" alt="icon9" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Designation</Link></li>
                                    {/* <li><Link to="/admin/disabledstaff"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/88.png" alt="icon10" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Disabled Staff</Link></li>*/}₹
                                    {/* <li><Link to="/admin/staff/staffrecruitment"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/1.png" alt="icon11" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Recruitment</Link></li> */}
                                </ul>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-md-10">
                            {/* Search Box */}
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="box-tools pull-right">
                                        <Link to="/admin/staff/create" className="btn btn-primary btn-sm">
                                            <i className="fa fa-plus"></i> Add Staff
                                        </Link>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <form onSubmit={(e) => e.preventDefault()}>
                                                <div className="row">
                                                    <div className="col-sm-8">
                                                        <div className="form-group">
                                                            <label>Role</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control"
                                                                value={selectedRole}
                                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                {roles.map(role => (
                                                                    <option key={role.id} value={role.id}>{role.type}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle" style={{ marginTop: '23px' }}>
                                                                <i className="fa fa-search"></i> Search
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-md-6">
                                            <form onSubmit={(e) => e.preventDefault()}>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <label>Search By Keyword</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Search By Staff ID, Name, Role..."
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                />
                                                                <span className="input-group-btn">
                                                                    <button className="btn btn-primary btn-sm" type="submit"><i className="fa fa-search"></i> Search</button>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="nav-tabs-custom border0">
                                <ul className="nav nav-tabs">
                                    <li className={viewMode === 'card' ? 'active' : ''}>
                                        <a href="#tab_1" onClick={() => setViewMode('card')}><i className="fa fa-newspaper-o"></i> Card View</a>
                                    </li>
                                    <li className={viewMode === 'list' ? 'active' : ''}>
                                        <a href="#tab_2" onClick={() => setViewMode('list')}><i className="fa fa-list"></i> List View</a>
                                    </li>
                                </ul>
                                <div className="tab-content">
                                    {/* Loading State */}
                                    {loading && (
                                        <Loader />
                                    )}

                                    {/* Error State */}
                                    {error && !loading && (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle"></i> Error: {error}
                                        </div>
                                    )}

                                    {/* Card View */}
                                    {!loading && !error && (
                                        <>
                                            <div className={`tab-pane ${viewMode === 'card' ? 'active' : ''}`} id="tab_1">
                                                <div className="row">
                                                    {filteredStaff.map(staff => (
                                                        <div key={staff.id} className="col-md-4 col-sm-6">
                                                            <div className="staffinfo-box">
                                                                <div className="staffleft-box">
                                                                    <img src={staff.image || "https://newlayout.wisibles.com/uploads/staff_images/default_male.jpg"} alt={staff.name} />
                                                                </div>
                                                                <div className="staffleft-content">
                                                                    <h5><span data-toggle="tooltip" title="Name">{staff.name} {staff.surname}</span></h5>
                                                                    <p><font data-toggle="tooltip" title="Employee Id">{staff.employee_id}</font></p>
                                                                    <p><font data-toggle="tooltip" title="Contact Number">{staff.mobile}</font></p>
                                                                    <p>
                                                                        <font data-toggle="tooltip" title="Location">{staff.location}</font>
                                                                        <font data-toggle="tooltip" title="Department"> {staff.department}</font>
                                                                    </p>
                                                                    <p className="staffsub">
                                                                        <span data-toggle="tooltip" title="Role">{staff.role}</span>
                                                                        <span data-toggle="tooltip" title="Designation">{staff.designation}</span>
                                                                    </p>
                                                                </div>
                                                                <div className="overlay3">
                                                                    <div className="stafficons">
                                                                        <a title="View" href={`/admin/staff/profile/${staff.id}`}><i className="fa fa-navicon"></i></a>
                                                                        <Link title="Edit" to={`/admin/staff/edit/${staff.id}`}><i className="fa fa-pencil"></i></Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {filteredStaff.length === 0 && (
                                                        <div className="col-md-12">
                                                            <div className="alert alert-info">No Record Found</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* List View */}
                                            <div className={`tab-pane ${viewMode === 'list' ? 'active' : ''}`} id="tab_2">
                                                <div className="table-responsive">
                                                    <table className="table table-striped table-bordered table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Staff ID</th>
                                                                <th>Name</th>
                                                                <th>Role</th>
                                                                <th>Department</th>
                                                                <th>Designation</th>
                                                                <th>Mobile Number</th>
                                                                <th className="text-right">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredStaff.map(staff => (
                                                                <tr key={staff.id}>
                                                                    <td>{staff.employee_id}</td>
                                                                    <td><a href={`/admin/staff/profile/${staff.id}`}>{staff.name} {staff.surname}</a></td>
                                                                    <td>{staff.role}</td>
                                                                    <td>{staff.department}</td>
                                                                    <td>{staff.designation}</td>
                                                                    <td>{staff.mobile}</td>
                                                                    <td className="text-right">
                                                                        <a href={`/admin/staff/profile/${staff.id}`} className="btn btn-default btn-xs" title="View">
                                                                            <i className="fa fa-reorder"></i>
                                                                        </a>
                                                                        <Link to={`/admin/staff/edit/${staff.id}`} className="btn btn-default btn-xs" title="Edit">
                                                                            <i className="fa fa-pencil"></i>
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {filteredStaff.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="7" className="text-center">No Record Found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
                                    )}
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

export default StaffSearch;
