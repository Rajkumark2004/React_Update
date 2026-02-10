import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api.js';

const StaffIdCard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [idCardList, setIdCardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

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

    // Form State
    const [formData, setFormData] = useState({
        school_name: '',
        address: '',
        title: '',
        header_color: '#000000',
        enable_name: false,
        enable_staff_id: false,
        enable_staff_role: false,
        enable_designation: false,
        enable_staff_department: false,
        enable_fathers_name: false,
        enable_mothers_name: false,
        enable_date_of_joining: false,
        enable_permanent_address: false,
        enable_staff_phone: false,
        enable_staff_dob: false,
        enable_vertical_card: false,
        enable_staff_barcode: false,
        old_background: '',
        old_logo_img: '',
        old_sign_image: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [activeViewItem, setActiveViewItem] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const colorPickerRef = useRef(null);

    useEffect(() => {
        fetchIdCards();
    }, []);

    const fetchIdCards = async () => {
        setIsLoading(true);
        try {
            const response = await api.getStaffIdCards();
            if (response.status && response.data) {
                setIdCardList(response.data);
            }
        } catch (error) {
            console.error('Error fetching staff ID cards:', error);
        } finally {
            setIsLoading(false);
        }
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSubmit = new FormData();

        // Append text fields
        formDataToSubmit.append('title', formData.title);
        formDataToSubmit.append('school_name', formData.school_name);
        formDataToSubmit.append('address', formData.address);
        formDataToSubmit.append('header_color', formData.header_color);

        // Toggles mapping based on screenshot
        formDataToSubmit.append('is_active_staff_name', formData.enable_name ? '1' : '0');
        formDataToSubmit.append('is_active_staff_id', formData.enable_staff_id ? '1' : '0');
        formDataToSubmit.append('is_active_designation', formData.enable_designation ? '1' : '0');
        formDataToSubmit.append('is_active_department', formData.enable_staff_department ? '1' : '0');
        formDataToSubmit.append('is_active_staff_father_name', formData.enable_fathers_name ? '1' : '0');
        formDataToSubmit.append('is_active_staff_mother_name', formData.enable_mothers_name ? '1' : '0');
        formDataToSubmit.append('is_active_date_of_joining', formData.enable_date_of_joining ? '1' : '0');
        formDataToSubmit.append('is_active_staff_permanent_address', formData.enable_permanent_address ? '1' : '0');
        formDataToSubmit.append('is_active_staff_phone', formData.enable_staff_phone ? '1' : '0');
        formDataToSubmit.append('is_active_staff_dob', formData.enable_staff_dob ? '1' : '0');
        formDataToSubmit.append('enable_vertical_card', formData.enable_vertical_card ? '1' : '0');
        formDataToSubmit.append('enable_staff_barcode', formData.enable_staff_barcode ? '1' : '0');

        // Old image references for persistence
        if (isEditing) {
            formDataToSubmit.append('old_background', formData.old_background || '');
            formDataToSubmit.append('old_logo_img', formData.old_logo_img || '');
            formDataToSubmit.append('old_sign_image', formData.old_sign_image || '');
        }

        // Append files
        const bgInput = document.getElementById('background_image_input');
        const logoInput = document.getElementById('logo_input');
        const signInput = document.getElementById('signature_input');

        if (bgInput?.files[0]) formDataToSubmit.append('background_image', bgInput.files[0]);
        if (logoInput?.files[0]) formDataToSubmit.append('logo_img', logoInput.files[0]);
        if (signInput?.files[0]) formDataToSubmit.append('sign_image', signInput.files[0]);

        try {
            if (isEditing) {
                formDataToSubmit.append('id', editId);
                await api.updateStaffIdCard(formDataToSubmit);
                alert('Staff ID Card Updated Successfully!');
            } else {
                await api.createStaffIdCard(formDataToSubmit);
                alert('Staff ID Card Created Successfully!');
            }
            setIsEditing(false);
            setEditId(null);
            setFormData({
                school_name: '', address: '', title: '', header_color: '#000000',
                enable_name: false, enable_staff_id: false, enable_staff_role: false,
                enable_designation: false, enable_staff_department: false, enable_fathers_name: false,
                enable_mothers_name: false, enable_date_of_joining: false, enable_permanent_address: false,
                enable_staff_phone: false, enable_staff_dob: false, enable_vertical_card: false,
                enable_staff_barcode: false,
                old_background: '',
                old_logo_img: '',
                old_sign_image: ''
            });
            fetchIdCards();
        } catch (error) {
            console.error('Error saving staff ID card:', error);
            alert('Failed to save staff ID card');
        }
    };

    const handleView = async (id) => {
        try {
            const response = await api.viewStaffIdCard(id);
            if (response.status && response.data) {
                const viewData = Array.isArray(response.data) ? response.data[0] : response.data;
                setActiveViewItem({
                    ...viewData,
                    background_image: viewData.background,
                    logo_img: viewData.logo,
                    address: viewData.school_address,
                    is_vertical: viewData.enable_vertical_card == 1
                });
                setShowViewModal(true);
            }
        } catch (error) {
            console.error('Error viewing details:', error);
            alert('Failed to fetch ID card details');
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await api.getStaffIdCardEditDetails(id);
            if (response.status && response.data) {
                const editData = Array.isArray(response.data) ? response.data[0] : response.data;
                setFormData({
                    school_name: editData.school_name || '',
                    address: editData.school_address || '',
                    title: editData.title || '',
                    header_color: editData.header_color || '#000000',
                    enable_name: editData.enable_name == 1,
                    enable_staff_id: editData.enable_staff_id == 1,
                    enable_staff_role: editData.enable_staff_role == 1,
                    enable_designation: editData.enable_designation == 1,
                    enable_staff_department: editData.enable_staff_department == 1,
                    enable_fathers_name: editData.enable_fathers_name == 1,
                    enable_mothers_name: editData.enable_mothers_name == 1,
                    enable_date_of_joining: editData.enable_date_of_joining == 1,
                    enable_permanent_address: editData.enable_permanent_address == 1,
                    enable_staff_phone: editData.enable_staff_phone == 1,
                    enable_staff_dob: editData.enable_staff_dob == 1,
                    enable_vertical_card: editData.enable_vertical_card == 1,
                    enable_staff_barcode: editData.enable_staff_barcode == 1,
                    old_background: editData.background || '',
                    old_logo_img: editData.logo || '',
                    old_sign_image: editData.sign_image || ''
                });
                setIsEditing(true);
                setEditId(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error fetching edit details:', error);
            alert('Failed to fetch details for editing');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                await api.deleteStaffIdCard(id);
                alert('Staff ID Card Deleted Successfully!');
                fetchIdCards();
            } catch (error) {
                console.error('Error deleting staff ID card:', error);
                alert('Failed to delete staff ID card');
            }
        }
    };

    return (
        <div className="wrapper" style={{ marginTop: '17px' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/staffidcard" />

            <div className="content-wrapper" style={{ minHeight: '600px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title" style={{ fontSize: '15px' }}>Add Staff ID Card</h3>
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
                                                    name="background"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files[0]?.name;
                                                        if (fileName) {
                                                            e.target.parentElement.querySelector('p').innerText = fileName;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Logo</label>
                                            <div
                                                style={dropzoneStyle}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3c8dbc'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d2d6de'}
                                                onClick={() => document.getElementById('logo_input').click()}
                                            >
                                                <i className="fa fa-cloud-upload" style={{ fontSize: '18px', color: '#999' }}></i>
                                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Drag & drop or click</p>
                                                <input
                                                    id="logo_input"
                                                    type="file"
                                                    name="logo"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files[0]?.name;
                                                        if (fileName) {
                                                            e.target.parentElement.querySelector('p').innerText = fileName;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Signature</label>
                                            <div
                                                style={dropzoneStyle}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3c8dbc'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#d2d6de'}
                                                onClick={() => document.getElementById('signature_input').click()}
                                            >
                                                <i className="fa fa-cloud-upload" style={{ fontSize: '18px', color: '#999' }}></i>
                                                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Drag & drop or click</p>
                                                <input
                                                    id="signature_input"
                                                    type="file"
                                                    name="sign_image"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files[0]?.name;
                                                        if (fileName) {
                                                            e.target.parentElement.querySelector('p').innerText = fileName;
                                                        }
                                                    }}
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
                                            { label: 'Staff Name', name: 'enable_name' },
                                            { label: 'Staff ID', name: 'enable_staff_id' },
                                            { label: 'Staff Role', name: 'enable_staff_role' },
                                            { label: 'Designation', name: 'enable_designation' },
                                            { label: 'Department', name: 'enable_staff_department' },
                                            { label: 'Father Name', name: 'enable_fathers_name' },
                                            { label: 'Mother Name', name: 'enable_mothers_name' },
                                            { label: 'Date of Joining', name: 'enable_date_of_joining' },
                                            { label: 'Permanent Address', name: 'enable_permanent_address' },
                                            { label: 'Phone', name: 'enable_staff_phone' },
                                            { label: 'Date of Birth', name: 'enable_staff_dob' },
                                            { label: 'Design Type (Vertical)', name: 'enable_vertical_card' },
                                            { label: 'Barcode', name: 'enable_staff_barcode' },
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
                                        <button type="submit" className="btn btn-info pull-right btn-sm">{isEditing ? 'Update' : 'Save'}</button>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                className="btn btn-default pull-right btn-sm"
                                                style={{ marginRight: '5px' }}
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditId(null);
                                                    setFormData({
                                                        school_name: '', address: '', title: '', header_color: '#000000',
                                                        enable_name: false, enable_staff_id: false, enable_staff_role: false,
                                                        enable_designation: false, enable_staff_department: false, enable_fathers_name: false,
                                                        enable_mothers_name: false, enable_date_of_joining: false, enable_permanent_address: false,
                                                        enable_staff_phone: false, enable_staff_dob: false, enable_vertical_card: false,
                                                        enable_staff_barcode: false,
                                                        old_background: '',
                                                        old_logo_img: '',
                                                        old_sign_image: ''
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix" style={{ fontSize: '15px' }}>Staff ID Card List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginTop: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
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
                                                        <th>ID Card Title</th>
                                                        <th>Background Image</th>
                                                        <th className="text-center">Design Type</th>
                                                        <th className="text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {idCardList.filter(item =>
                                                        item.title.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).map(item => (
                                                        <tr key={item.id}>
                                                            <td><a href="#" onClick={(e) => { e.preventDefault(); setActiveViewItem(item); setShowViewModal(true); }}>{item.title}</a></td>
                                                            <td>
                                                                {item.background ? <img src={`https://newlayout.wisibles.com/${item.background}`} width="40" alt="bg" /> : <i className="fa fa-picture-o fa-2x"></i>}
                                                            </td>
                                                            <td className="text-center">{item.enable_vertical_card == 1 ? 'Vertical' : 'Horizontal'}</td>
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
                                                <div className="dataTables_info">
                                                    Records: 1 to {idCardList.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())).length} of {idCardList.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())).length}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            {/* View Modal */}
            {showViewModal && activeViewItem && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowViewModal(false)}>&times;</button>
                                <h4 className="modal-title">View ID Card</h4>
                            </div>
                            <div className="modal-body" id="certificate_detail">
                                <div style={{
                                    width: activeViewItem.is_vertical ? '300px' : '500px',
                                    height: activeViewItem.is_vertical ? '500px' : '300px',
                                    margin: '0 auto',
                                    border: '1px solid #ccc',
                                    position: 'relative',
                                    backgroundImage: activeViewItem.background_image ? `url(https://newlayout.wisibles.com/${activeViewItem.background_image})` : 'none',
                                    backgroundSize: 'cover'
                                }}>
                                    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {/* Header */}
                                        <div style={{ background: activeViewItem.header_color || '#595959', padding: '10px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                                            {activeViewItem.logo_img && <img src={`https://newlayout.wisibles.com/${activeViewItem.logo_img}`} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />}
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '16px' }}>{activeViewItem.school_name}</h4>
                                                <p style={{ margin: 0, fontSize: '10px' }}>{activeViewItem.address}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, padding: '10px', display: 'flex', gap: '15px' }}>
                                            <div style={{ width: '100px', height: '120px', border: '1px solid #ddd', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa fa-user" style={{ fontSize: '40px', color: '#ccc' }}></i>
                                            </div>
                                            <div style={{ flex: 1, fontSize: '12px' }}>
                                                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: activeViewItem.header_color }}>{activeViewItem.title}</h3>
                                                {activeViewItem.enable_name == 1 && <p><strong>Name:</strong> John Doe</p>}
                                                {activeViewItem.enable_staff_id == 1 && <p><strong>Staff ID:</strong> 12345</p>}
                                                {activeViewItem.enable_staff_role == 1 && <p><strong>Role:</strong> Teacher</p>}
                                                {activeViewItem.enable_designation == 1 && <p><strong>Designation:</strong> Senior Teacher</p>}
                                                {activeViewItem.enable_staff_department == 1 && <p><strong>Department:</strong> Academic</p>}
                                                {activeViewItem.enable_fathers_name == 1 && <p><strong>Father's Name:</strong> Robert Doe</p>}
                                                {activeViewItem.enable_mothers_name == 1 && <p><strong>Mother's Name:</strong> Mary Doe</p>}
                                                {activeViewItem.enable_date_of_joining == 1 && <p><strong>Joining Date:</strong> 2020-01-01</p>}
                                                {activeViewItem.enable_permanent_address == 1 && <p><strong>Address:</strong> High Street, City</p>}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div style={{ fontSize: '10px' }}>
                                                {activeViewItem.enable_staff_phone == 1 && <p style={{ margin: 0 }}>Phone: 9876543210</p>}
                                                {activeViewItem.enable_staff_dob == 1 && <p style={{ margin: 0 }}>DOB: 1985-05-20</p>}
                                            </div>
                                            {activeViewItem.sign_image && (
                                                <div style={{ textAlign: 'center' }}>
                                                    <img src={`https://newlayout.wisibles.com/${activeViewItem.sign_image}`} alt="Signature" style={{ height: '30px' }} />
                                                    <p style={{ margin: 0, fontSize: '10px', borderTop: '1px solid #000' }}>Principal Signature</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Barcode Placeholder */}
                                        {activeViewItem.enable_staff_barcode == 1 && (
                                            <div style={{ padding: '0 10px 10px 10px', textAlign: 'center' }}>
                                                <div style={{ height: '30px', background: '#fff', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
                                                    <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 3px)' }}></div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '8px' }}>STAFF12345</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default StaffIdCard;
