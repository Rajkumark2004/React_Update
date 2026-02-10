import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

const StudentIdCard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // Mock Data
    // Mock Data
    const [idCardList, setIdCardList] = useState([]);

    useEffect(() => {
        fetchIdCardList();
    }, []);

    const fetchIdCardList = async () => {
        try {
            const response = await api.getStudentIdCard();
            if (response.status && response.data) {
                // Transform API data to match component state structure
                const formattedData = response.data.map(item => ({
                    ...item,
                    enable_admission_no: item.enable_admission_no == 1,
                    enable_student_name: item.enable_student_name == 1,
                    enable_class: item.enable_class == 1,
                    enable_fathers_name: item.enable_fathers_name == 1,
                    enable_mothers_name: item.enable_mothers_name == 1,
                    enable_address: item.enable_address == 1,
                    enable_phone: item.enable_phone == 1,
                    enable_dob: item.enable_dob == 1,
                    enable_blood_group: item.enable_blood_group == 1,
                    enable_student_barcode: item.enable_student_barcode == 1,
                    enable_vertical_card: item.enable_vertical_card == 1,
                    vertical: item.enable_vertical_card == 1, // Map enable_vertical_card to vertical for display logic if needed
                }));
                setIdCardList(formattedData);
            }
        } catch (error) {
            console.error('Error fetching student ID cards:', error);
            // toast.error('Failed to fetch ID card templates'); 
        }
    };


    // Form State
    const [formData, setFormData] = useState({
        school_name: '',
        address: '',
        title: '',
        header_color: '#000000',
        enable_admission_no: false,
        enable_student_name: false,
        enable_class: false,
        enable_fathers_name: false,
        enable_mothers_name: false,
        enable_address: false,
        enable_phone: false,
        enable_dob: false,
        enable_blood_group: false,
        vertical_card: false,
        student_barcode: false,
        old_background: '',
        old_logo_img: '',
        old_sign_image: ''
    });

    const [activeViewItem, setActiveViewItem] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const colorPickerRef = useRef(null);

    // Colorpicker useEffect removed as we are using native input type='color'

    const getImageUrl = (type, filename) => {
        if (!filename) return "";
        // Based on typical structure: /backend/uploads/certificate/student_id_card/background/filename
        const uploadPath = `/backend/uploads/certificate/student_id_card/${type}/${filename}`;
        return `https://newlayout.wisibles.com${uploadPath}`;
    };


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

    const handleEdit = async (id) => {
        try {
            const response = await api.getStudentIdCardEditDetails(id);
            if (response.status && response.data) {
                const editData = Array.isArray(response.data) ? response.data[0] : response.data;
                setFormData({
                    school_name: editData.school_name || '',
                    address: editData.school_address || editData.address || '',
                    title: editData.title || '',
                    header_color: editData.header_color || '#000000',
                    enable_admission_no: editData.enable_admission_no == 1,
                    enable_student_name: editData.enable_student_name == 1,
                    enable_class: editData.enable_class == 1,
                    enable_fathers_name: editData.enable_fathers_name == 1,
                    enable_mothers_name: editData.enable_mothers_name == 1,
                    enable_address: editData.enable_address == 1,
                    enable_phone: editData.enable_phone == 1,
                    enable_dob: editData.enable_dob == 1,
                    enable_blood_group: editData.enable_blood_group == 1,
                    vertical_card: editData.enable_vertical_card == 1,
                    student_barcode: editData.enable_student_barcode == 1,
                    old_background: editData.background || '',
                    old_logo_img: editData.logo || '',
                    old_sign_image: editData.sign_image || ''
                });
                setIsEditing(true);
                setEditId(id);
                // Scroll to top or form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error fetching edit details:', error);
            alert('Failed to fetch ID card details for editing');
        }
    };

    const handleView = async (id) => {
        try {
            const response = await api.viewStudentIdCard(id);
            if (response.status && response.data) {
                // Determine if response.data is an array or object
                const item = Array.isArray(response.data) ? response.data[0] : response.data;

                // Transform for display logic
                const formattedItem = {
                    ...item,
                    background_image: item.background || item.background_image,
                    logo_img: item.logo || item.logo_img,
                    address: item.school_address || item.address,
                    enable_admission_no: item.enable_admission_no == 1,
                    enable_student_name: item.enable_student_name == 1,
                    enable_class: item.enable_class == 1,
                    enable_fathers_name: item.enable_fathers_name == 1,
                    enable_mothers_name: item.enable_mothers_name == 1,
                    enable_address: item.enable_address == 1,
                    enable_phone: item.enable_phone == 1,
                    enable_dob: item.enable_dob == 1,
                    enable_blood_group: item.enable_blood_group == 1,
                    enable_student_barcode: item.enable_student_barcode == 1,
                    enable_vertical_card: item.enable_vertical_card == 1,
                    vertical: item.enable_vertical_card == 1,
                };

                setActiveViewItem(formattedItem);
                setShowViewModal(true);
            }
        } catch (error) {
            console.error('Error fetching view details:', error);
            alert('Failed to fetch ID card details for viewing');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formPayload = new FormData();
        formPayload.append('school_name', formData.school_name);
        formPayload.append('address', formData.address);
        formPayload.append('title', formData.title);
        formPayload.append('header_color', formData.header_color);

        // Toggles mapping based on refined pattern
        formPayload.append('is_active_admission_no', formData.enable_admission_no ? 1 : 0);
        formPayload.append('is_active_student_name', formData.enable_student_name ? 1 : 0);
        formPayload.append('is_active_class', formData.enable_class ? 1 : 0);
        formPayload.append('is_active_father_name', formData.enable_fathers_name ? 1 : 0);
        formPayload.append('is_active_mother_name', formData.enable_mothers_name ? 1 : 0);
        formPayload.append('is_active_address', formData.enable_address ? 1 : 0);
        formPayload.append('is_active_phone', formData.enable_phone ? 1 : 0);
        formPayload.append('is_active_dob', formData.enable_dob ? 1 : 0);
        formPayload.append('is_active_blood_group', formData.enable_blood_group ? 1 : 0);
        formPayload.append('enable_vertical_card', formData.vertical_card ? 1 : 0);
        formPayload.append('enable_student_barcode', formData.student_barcode ? 1 : 0);

        // Old image references for persistence
        if (isEditing) {
            formPayload.append('old_background', formData.old_background || '');
            formPayload.append('old_logo_img', formData.old_logo_img || '');
            formPayload.append('old_sign_image', formData.old_sign_image || '');
        }
        formPayload.append('status', 1);

        if (formData.background_image) formPayload.append('background_image', formData.background_image);
        if (formData.logo_img) formPayload.append('logo_img', formData.logo_img);
        if (formData.sign_image) formPayload.append('sign_image', formData.sign_image);
        if (isEditing && editId) formPayload.append('id', editId);

        try {
            const response = isEditing
                ? await api.updateStudentIdCard(formPayload)
                : await api.createStudentIdCard(formPayload);

            if (response.status) {
                alert(isEditing ? 'ID Card Updated Successfully!' : 'ID Card Saved Successfully!');
                fetchIdCardList();
                // Reset form
                setFormData({
                    school_name: '',
                    address: '',
                    title: '',
                    header_color: '#000000',
                    enable_admission_no: false,
                    enable_student_name: false,
                    enable_class: false,
                    enable_fathers_name: false,
                    enable_mothers_name: false,
                    enable_address: false,
                    enable_phone: false,
                    enable_dob: false,
                    enable_blood_group: false,
                    vertical_card: false,
                    student_barcode: false,
                    old_background: '',
                    old_logo_img: '',
                    old_sign_image: ''
                });
                setIsEditing(false);
                setEditId(null);
            } else {
                alert(response.message || 'Failed to save ID card');
            }
        } catch (error) {
            console.error('Error saving ID card:', error);
            alert('Error saving ID card. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteStudentIdCard(id); // Assuming an API call like this exists
                if (response.status) {
                    alert('ID Card Deleted Successfully!');
                    fetchIdCardList(); // Re-fetch the list to update the UI
                } else {
                    alert(response.message || 'Failed to delete ID card');
                }
            } catch (error) {
                console.error('Error deleting ID card:', error);
                alert('Error deleting ID card. Please try again.');
            }
        }
    };

    const dropzoneStyle = {
        border: '2px dashed #d2d6de',
        borderRadius: '5px',
        padding: '8px 10px',
        textAlign: 'center',
        background: '#f9f9f9',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    };

    const dropzoneHoverStyle = {
        borderColor: '#3c8dbc'
    };

    return (
        <div className="wrapper" style={{ marginTop: '17px' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/studentidcard" />

            <div className="content-wrapper" style={{ minHeight: '600px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-newspaper-o"></i> Certificate</h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Sub Menu / Tabs */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border" style={{ padding: '10px 0' }}>
                                    <h3 className="box-title" style={{ fontSize: '15px' }}>Certificate</h3>
                                </div>
                                <ul className="tablists list-unstyled">
                                    {/*<li style={{ marginBottom: '10px' }}>
                                        <Link to="/admin/certificate/student_certificate" style={{ display: 'block', padding: '5px', color: '#333' }}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/certificates/1.png" alt="icon" style={{ width: '20px', marginRight: '10px' }} />
                                            Student Certificate
                                        </Link>
                                    </li>*/}
                                    {/*  <li style={{ marginBottom: '10px' }}>
                                        <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'block', padding: '5px', color: '#333' }}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/certificates/2.png" alt="icon" style={{ width: '20px', marginRight: '10px' }} />
                                            Generate Certificate
                                        </a>
                                    </li>*/}
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link to="/admin/certificate/student_id_card" className="active" style={{ display: 'block', padding: '5px', background: '#f4f4f4', borderLeft: '3px solid #3c8dbc', fontWeight: 'bold', color: '#000' }}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/certificates/3.png" alt="icon" style={{ width: '20px', marginRight: '10px' }} />
                                            Student ID Card
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link to="/admin/certificate/generate_id_card" style={{ display: 'block', padding: '5px', color: '#333' }}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/certificates/4.png" alt="icon" style={{ width: '20px', marginRight: '10px' }} />
                                            Generate ID Card
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link to="/admin/certificate/staff_id_card" style={{ display: 'block', padding: '5px', color: '#333' }}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/certificates/5.png" alt="icon" style={{ width: '20px', marginRight: '10px' }} />
                                            Staff ID Card
                                        </Link>
                                    </li>
                                    {/*} <li style={{ marginBottom: '10px' }}>
                                        <Link to="/admin/certificate/generate_staff_id_card" style={{ display: 'block', padding: '5px', color: '#333' }}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/certificates/6.png" alt="icon" style={{ width: '20px', marginRight: '10px' }} />
                                            Generate Staff ID Card
                                        </Link>
                                    </li>*/}
                                </ul>
                            </div>
                        </div>

                        {/* Add Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title" style={{ fontSize: '15px' }}>{isEditing ? 'Edit Student ID Card' : 'Add Student ID Card'}</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body" style={{ fontSize: '13px' }}>
                                        <div className="form-group">
                                            <label>Background Image</label>
                                            <div
                                                style={dropzoneStyle}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3c8dbc'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d2d6de'}
                                                onClick={() => document.getElementById('background_image_input').click()}
                                            >
                                                <i className="fa fa-cloud-upload" style={{ fontSize: '18px', color: '#999' }}></i>
                                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Drag & drop or click</p>
                                                <input
                                                    id="background_image_input"
                                                    type="file"
                                                    name="background_image"
                                                    style={{ display: 'none' }}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Logo</label>
                                            <div
                                                style={dropzoneStyle}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3c8dbc'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d2d6de'}
                                                onClick={() => document.getElementById('logo_img_input').click()}
                                            >
                                                <i className="fa fa-cloud-upload" style={{ fontSize: '18px', color: '#999' }}></i>
                                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Drag & drop or click</p>
                                                <input
                                                    id="logo_img_input"
                                                    type="file"
                                                    name="logo_img"
                                                    style={{ display: 'none' }}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Signature</label>
                                            <div
                                                style={dropzoneStyle}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3c8dbc'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d2d6de'}
                                                onClick={() => document.getElementById('sign_image_input').click()}
                                            >
                                                <i className="fa fa-cloud-upload" style={{ fontSize: '18px', color: '#999' }}></i>
                                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Drag & drop or click</p>
                                                <input
                                                    id="sign_image_input"
                                                    type="file"
                                                    name="sign_image"
                                                    style={{ display: 'none' }}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>School Name <small className="req" style={{ color: 'red' }}> *</small></label>
                                            <input type="text" name="school_name" className="form-control" value={formData.school_name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Address/Phone/Email <small className="req" style={{ color: 'red' }}> *</small></label>
                                            <textarea name="address" className="form-control" rows="3" value={formData.address} onChange={handleInputChange} required></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>ID Card Title <small className="req" style={{ color: 'red' }}> *</small></label>
                                            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Header Color</label>
                                            <input
                                                type="color"
                                                name="header_color"
                                                className="form-control"
                                                value={formData.header_color}
                                                onChange={handleInputChange}
                                                style={{ height: '34px', padding: '2px' }}
                                            />
                                        </div>

                                        {/* Toggles */}
                                        {[
                                            { label: 'Admission No', name: 'enable_admission_no' },
                                            { label: 'Student Name', name: 'enable_student_name' },
                                            { label: 'Class', name: 'enable_class' },
                                            { label: 'Father Name', name: 'enable_fathers_name' },
                                            { label: 'Mother Name', name: 'enable_mothers_name' },
                                            { label: 'Student Address', name: 'enable_address' },
                                            { label: 'Phone', name: 'enable_phone' },
                                            { label: 'Date of Birth', name: 'enable_dob' },
                                            { label: 'Blood Group', name: 'enable_blood_group' },
                                            { label: 'Design Type (Vertical)', name: 'vertical_card' },
                                            { label: 'Barcode', name: 'student_barcode' },
                                        ].map((item) => (
                                            <div key={item.name} className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <label style={{ fontWeight: 'normal', margin: 0 }}>{item.label}</label>
                                                <div className="material-switch">
                                                    <input
                                                        id={item.name}
                                                        name={item.name}
                                                        type="checkbox"
                                                        checked={formData[item.name]}
                                                        onChange={handleInputChange}
                                                        className="chk"
                                                    />
                                                    <label htmlFor={item.name} className="label-success"></label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="box-footer">
                                        {isEditing && (
                                            <button type="button" className="btn btn-default btn-sm" onClick={() => {
                                                setIsEditing(false);
                                                setEditId(null);
                                                setFormData({
                                                    school_name: '',
                                                    address: '',
                                                    title: '',
                                                    header_color: '#000000',
                                                    enable_admission_no: false,
                                                    enable_student_name: false,
                                                    enable_class: false,
                                                    enable_fathers_name: false,
                                                    enable_mothers_name: false,
                                                    enable_address: false,
                                                    enable_phone: false,
                                                    enable_dob: false,
                                                    enable_blood_group: false,
                                                    vertical_card: false,
                                                    student_barcode: false,
                                                    old_background: '',
                                                    old_logo_img: '',
                                                    old_sign_image: ''
                                                });
                                            }} style={{ marginRight: '5px' }}>Cancel</button>
                                        )}
                                        <button type="submit" className="btn btn-info pull-right btn-sm">{isEditing ? 'Update' : 'Save'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix" style={{ fontSize: '15px' }}>Student ID Card List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <div className="row pb10">
                                            <div className="col-sm-6">
                                                <div className="pull-left">
                                                    <label style={{ fontWeight: 'normal' }}>Search:
                                                        <input type="search" className="form-control input-sm" placeholder="" style={{ display: 'inline-block', width: 'auto', marginLeft: '5px' }} />
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
                                                        <th>ID Card Title</th>
                                                        <th>Background Image</th>
                                                        <th className="text-center">Design Type</th>
                                                        <th className="text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {idCardList.map(item => (
                                                        <tr key={item.id}>
                                                            <td><a href="#" onClick={(e) => { e.preventDefault(); handleView(item.id); }}>{item.title}</a></td>
                                                            <td>
                                                                {item.background_image ? <img src={getImageUrl('background', item.background_image)} width="40" alt="bg" /> : <i className="fa fa-picture-o fa-2x"></i>}
                                                            </td>
                                                            <td className="text-center">{item.vertical ? 'Vertical' : 'Horizontal'}</td>
                                                            <td className="text-right">
                                                                <button className="btn btn-default btn-xs" onClick={() => handleView(item.id)} title="View"><i className="fa fa-reorder"></i></button>
                                                                <button className="btn btn-default btn-xs" onClick={() => handleEdit(item.id)} title="Edit" style={{ marginLeft: '2px' }}><i className="fa fa-pencil"></i></button>
                                                                <button className="btn btn-default btn-xs" onClick={() => handleDelete(item.id)} title="Delete" style={{ marginLeft: '2px' }}><i className="fa fa-remove"></i></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="row mt10">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">Records: 1 to {idCardList.length} of {idCardList.length}</div>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* View Modal */}
            {showViewModal && activeViewItem && (
                <>
                    <div className="modal fade in" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-md">
                            <div className="modal-content" style={{ borderRadius: 0 }}>
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setShowViewModal(false)}>&times;</button>
                                    <h4 className="modal-title">View ID Card</h4>
                                </div>
                                <div className="modal-body" style={{ background: '#f4f4f4', padding: '30px', display: 'flex', justifyContent: 'center' }}>

                                    {/* ID Card Layout Replicated from studentidcard.php */}
                                    <div className="id-card-container" style={{
                                        width: activeViewItem.vertical ? '250px' : '400px',
                                        background: '#fff',
                                        backgroundImage: activeViewItem.background_image ? `url(${getImageUrl('background', activeViewItem.background_image)})` : 'none',
                                        backgroundSize: '100% 100%',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        fontFamily: 'arial',
                                        fontSize: '12px'
                                    }}>
                                        {/* Header */}
                                        <div style={{
                                            background: activeViewItem.header_color,
                                            color: '#fff',
                                            padding: '10px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                {activeViewItem.logo_img ? (
                                                    <img src={getImageUrl('logo', activeViewItem.logo_img)} width="25" height="25" alt="logo" />
                                                ) : (
                                                    <img src="/backend/images/s-favican.png" width="25" height="25" alt="logo" />
                                                )}
                                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeViewItem.school_name}</div>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div style={{ textAlign: 'center', padding: '5px', fontSize: '10px', color: '#000' }}>
                                            {activeViewItem.address}
                                        </div>

                                        {/* Title */}
                                        <div style={{
                                            background: activeViewItem.header_color,
                                            color: '#fff',
                                            textAlign: 'center',
                                            textTransform: 'uppercase',
                                            padding: '2px 0',
                                            fontSize: '14px'
                                        }}>
                                            {activeViewItem.title}
                                        </div>

                                        {/* Main Body */}
                                        <div style={{ padding: '10px', display: 'flex', flexDirection: activeViewItem.vertical ? 'column' : 'row' }}>
                                            <div style={{ flex: '0 0 80px', textAlign: 'center' }}>
                                                <img src="/uploads/student_images/no_image.png" style={{ width: '70px', height: '80px', border: '1px solid #ccc', borderRadius: '4px' }} alt="student" />
                                            </div>
                                            <div style={{ flex: 1, paddingLeft: activeViewItem.vertical ? '0' : '15px', paddingTop: activeViewItem.vertical ? '10px' : '0' }}>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {activeViewItem.enable_admission_no && <li style={{ marginBottom: '3px' }}><strong>Adm. No:</strong> <span style={{ float: 'right' }}>1001</span></li>}
                                                    {activeViewItem.enable_student_name && <li style={{ marginBottom: '3px' }}><strong>Student Name:</strong> <span style={{ float: 'right' }}>Student Name</span></li>}
                                                    {activeViewItem.enable_class && <li style={{ marginBottom: '3px' }}><strong>Class:</strong> <span style={{ float: 'right' }}>CLASS</span></li>}
                                                    {activeViewItem.enable_fathers_name && <li style={{ marginBottom: '3px' }}><strong>Father:</strong> <span style={{ float: 'right' }}>FATHER</span></li>}
                                                    {activeViewItem.enable_mothers_name && <li style={{ marginBottom: '3px' }}><strong>Mother:</strong> <span style={{ float: 'right' }}>MOTHER</span></li>}
                                                    {activeViewItem.enable_address && <li style={{ marginBottom: '3px' }}><strong>Address:</strong> <span style={{ float: 'right' }}>ADDRESS</span></li>}
                                                    {activeViewItem.enable_phone && <li style={{ marginBottom: '3px' }}><strong>Phone:</strong> <span style={{ float: 'right' }}>PHONE</span></li>}
                                                    {activeViewItem.enable_dob && <li style={{ marginBottom: '3px' }}><strong>D.O.B:</strong> <span style={{ float: 'right' }}>DOB</span></li>}
                                                    {activeViewItem.enable_blood_group && <li style={{ marginBottom: '3px' }}><strong>Blood Group:</strong> <span style={{ float: 'right' }}>A+</span></li>}
                                                    {/* Signature */}
                                                    {activeViewItem.sign_image && (
                                                        <li style={{ marginTop: '10px', textAlign: 'right' }}>
                                                            <img src={getImageUrl('signature', activeViewItem.sign_image)} width="50" height="30" alt="signature" />
                                                            <p style={{ margin: 0, fontSize: '8px', borderTop: '0.5px solid #000', display: 'inline-block' }}>Principal Signature</p>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Barcode Placeholder */}
                                        {activeViewItem.enable_student_barcode && (
                                            <div style={{ padding: '0 10px 10px 10px', textAlign: 'center' }}>
                                                <div style={{ height: '30px', background: '#fff', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
                                                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 3px)' }}></div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '8px' }}>STD12345</p>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}

            <Footer />
        </div >
    );
}

export default StudentIdCard;
