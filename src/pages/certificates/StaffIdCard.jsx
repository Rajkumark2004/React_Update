import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api.js';
import { copyToClipboard, downloadCSV, downloadExcel, printTable } from '../../utils/tableExport';

const StaffIdCard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [idCardList, setIdCardList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Initialize Dropify
    useEffect(() => {
        const $ = window.jQuery;
        let drEvent;
        const timer = setTimeout(() => {
            try {
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    drEvent = $('.dropify').dropify();
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            try {
                if (drEvent && $ && $.fn && typeof $.fn.dropify === 'function') {
                    // Destroy each dropify instance
                    $('.dropify').each(function () {
                        const dropifyData = $(this).data('dropify');
                        if (dropifyData) {
                            dropifyData.destroy();
                        }
                    });
                }
            } catch (e) {
                console.log('Dropify destroy error:', e);
            }
        };
    }, [isEditing, editId]);


    // Form State
    const [formData, setFormData] = useState({
        school_name: '',
        address: '',
        title: '',
        header_color: '#000000',
        enable_name: false,
        enable_staff_id: false,
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

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const filteredIdCards = idCardList.filter(item =>
        item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("ID Card Title");
        if (!hiddenColumns.includes(1)) headers.push("Background Image");
        if (!hiddenColumns.includes(2)) headers.push("Design Type");

        const rows = filteredIdCards.map(item => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(item.title);
            if (!hiddenColumns.includes(1)) row.push(item.background ? "Yes" : "No");
            if (!hiddenColumns.includes(2)) row.push(item.enable_vertical_card == 1 ? 'Vertical' : 'Horizontal');
            return row;
        });

        return { headers, rows };
    };

    useEffect(() => {
        fetchIdCards();
    }, []);

    const getImageUrl = (type, filename) => {
        // If it's already an absolute URL, return it
        if (filename && filename.startsWith('http')) return filename;

        // Make sure we don't double the upload path if the filename already contains it
        if (filename && filename.startsWith('uploads/')) return `https://newlayout.wisibles.com/${filename}`;
        if (filename && filename.startsWith('/uploads/')) return `https://newlayout.wisibles.com${filename}`;

        switch (type) {
            case 'background':
                return filename ? `https://newlayout.wisibles.com/uploads/staff_id_card/background/${filename}` : '';
            case 'logo':
                return filename ? `https://newlayout.wisibles.com/uploads/staff_id_card/logo/${filename}` : '';
            case 'signature':
                return filename ? `https://newlayout.wisibles.com/uploads/staff_id_card/signature/${filename}` : '';
            case 'staff':
            default:
                return "https://newlayout.wisibles.com/uploads/staff_images/no_image.png";
        }
    };

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
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
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
        if (formData.background) formDataToSubmit.append('background_image', formData.background);
        if (formData.logo) formDataToSubmit.append('logo_img', formData.logo);
        if (formData.sign_image) formDataToSubmit.append('sign_image', formData.sign_image);

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
                enable_name: false, enable_staff_id: false,
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
        <div className="wrapper" style={{ marginTop: '0px' }}>
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
                                        <div className="form-group" key={`bg-${editId}-${formData.old_background}`}>
                                            <label>Background Image</label>
                                            <input
                                                type="file"
                                                name="background"
                                                className="dropify"
                                                data-height="40"
                                                data-default-file={isEditing && formData.old_background ? getImageUrl('background', formData.old_background) : ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group" key={`logo-${editId}-${formData.old_logo_img}`}>
                                            <label>Logo</label>
                                            <input
                                                type="file"
                                                name="logo"
                                                className="dropify"
                                                data-height="40"
                                                data-default-file={isEditing && formData.old_logo_img ? getImageUrl('logo', formData.old_logo_img) : ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group" key={`sign-${editId}-${formData.old_sign_image}`}>
                                            <label>Signature</label>
                                            <input
                                                type="file"
                                                name="sign_image"
                                                className="dropify"
                                                data-height="40"
                                                data-default-file={isEditing && formData.old_sign_image ? getImageUrl('signature', formData.old_sign_image) : ''}
                                                onChange={handleInputChange}
                                            />
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
                                                        enable_name: false, enable_staff_id: false,
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
                                                    <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Staff_ID_Cards.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Staff_ID_Cards.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Staff ID Cards'); }}><i className="fa fa-print"></i></button>
                                                    <div className="btn-group">
                                                        <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                            <i className="fa fa-columns"></i>
                                                        </button>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> ID Card Title</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Background Image</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Design Type</label></li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive overflow-visible">
                                            <table className="table table-striped table-bordered table-hover" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th>ID Card Title</th>}
                                                        {!hiddenColumns.includes(1) && <th>Background Image</th>}
                                                        {!hiddenColumns.includes(2) && <th className="text-center">Design Type</th>}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredIdCards.map(item => (
                                                        <tr key={item.id}>
                                                            {!hiddenColumns.includes(0) && <td><a href="#" onClick={(e) => { e.preventDefault(); setActiveViewItem(item); setShowViewModal(true); }}>{item.title}</a></td>}
                                                            {!hiddenColumns.includes(1) && <td>
                                                                {item.background ? <img className="object-fit-cover fit-image-40" src={getImageUrl('background', item.background)} width="40" alt="bg" /> : <i className="fa fa-picture-o fa-2x"></i>}
                                                            </td>}
                                                            {!hiddenColumns.includes(2) && <td className="text-center">{item.enable_vertical_card == 1 ? 'Vertical' : 'Horizontal'}</td>}
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
                                                    Records: 1 to {filteredIdCards.length} of {filteredIdCards.length}
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
                                    width: activeViewItem.is_vertical ? '280px' : '462px',
                                    height: activeViewItem.is_vertical ? '462px' : '280px',
                                    margin: '0 auto',
                                    border: '1px solid #ccc',
                                    position: 'relative',
                                    backgroundImage: activeViewItem.background_image ? `url(${getImageUrl('background', activeViewItem.background_image)})` : 'none',
                                    backgroundSize: 'cover'
                                }}>
                                    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {/* Header */}
                                        <div style={{ background: activeViewItem.header_color || '#595959', padding: '10px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                                            {activeViewItem.logo_img ? <img src={getImageUrl('logo', activeViewItem.logo_img)} alt="Logo" style={{ height: '40px', marginRight: '10px' }} /> : <img src="/backend/images/s-favican.png" alt="logo" style={{ height: '40px', marginRight: '10px' }} />}
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '16px' }}>{activeViewItem.school_name}</h4>
                                                <p style={{ margin: 0, fontSize: '10px' }}>{activeViewItem.address}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, padding: '10px', display: 'flex', gap: '15px' }}>
                                            <div style={{ width: '100px', height: '120px', border: '1px solid #ddd', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={getImageUrl('staff', null)} style={{ width: '90px', height: '110px', border: '1px solid #ccc', borderRadius: '4px' }} alt="staff" />
                                            </div>
                                            <div style={{ flex: 1, fontSize: '11px', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                <h3 style={{ margin: 0, fontSize: '16px', color: activeViewItem.header_color }}>{activeViewItem.title}</h3>
                                                {activeViewItem.enable_name == 1 && <p style={{ margin: 0 }}><strong>Name:</strong> John Doe</p>}
                                                {activeViewItem.enable_staff_id == 1 && <p style={{ margin: 0 }}><strong>Staff ID:</strong> 12345</p>}

                                                {activeViewItem.enable_designation == 1 && <p style={{ margin: 0 }}><strong>Designation:</strong> Senior Teacher</p>}
                                                {activeViewItem.enable_staff_department == 1 && <p style={{ margin: 0 }}><strong>Department:</strong> Academic</p>}
                                                {activeViewItem.enable_fathers_name == 1 && <p style={{ margin: 0 }}><strong>Father's Name:</strong> Robert Doe</p>}
                                                {activeViewItem.enable_mothers_name == 1 && <p style={{ margin: 0 }}><strong>Mother's Name:</strong> Mary Doe</p>}
                                                {activeViewItem.enable_date_of_joining == 1 && <p style={{ margin: 0 }}><strong>Joining Date:</strong> 2020-01-01</p>}
                                                {activeViewItem.enable_permanent_address == 1 && <p style={{ margin: 0 }}><strong>Address:</strong> High Street, City</p>}
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
                                                    <img src={getImageUrl('signature', activeViewItem.sign_image)} alt="Signature" style={{ height: '30px' }} />
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
