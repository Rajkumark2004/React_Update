import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files';

const StaffImport = () => {
    const { sessionYear } = useSession();
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        role: '',
        designation: '',
        department: '',
        file: null
    });
    const [importSummary, setImportSummary] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await api.getStaffImportMeta();
            if (response && response.status && response.data) {
                const data = response.data;
                setRoles(data.roles || []);
                setDesignations(data.designation || []);
                setDepartments(data.department || []);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    const dropifyElement = $('.dropify').dropify();
                    dropifyElement.on('dropify.afterClear', () => {
                        setFormData(prev => ({ ...prev, file: null }));
                    });
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [loading]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.file) {
            toast.error('Please select a CSV file to import');
            return;
        }

        const data = new FormData();
        data.append('file', formData.file);
        data.append('role', formData.role);
        data.append('designation', formData.designation);
        data.append('department', formData.department);

        setImportSummary(null);
        setLoading(true);
        try {
            const response = await api.importStaff(data);
            if (response && response.status) {
                toast.success(response.message || 'Import completed successfully');
                // Show import summary if available
                if (response.summary) {
                    setImportSummary(response.summary);
                }
                // Optional: reset form or file input
                setFormData(prev => ({ ...prev, file: null }));
                // Reset dropify if possible (usually needs jQuery trigger)
                try {
                    const $ = window.jQuery;
                    $('.dropify').data('dropify').resetPreview();
                    $('.dropify').data('dropify').clearElement();
                } catch (e) {}
            } else {
                toast.error(response.message || 'Import failed');
            }
        } catch (error) {
            console.error('Error importing staff:', error);
            toast.error('An error occurred during import');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <Sidebar sessionYear={sessionYear} />
                <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                    <Loader />
                </div>
                <Footer />
            </div>
        );
    }

    const sampleFields = [
        /* { key: 'staff_id', label: 'Staff ID', required: true },
         { key: 'first_name', label: 'First </br >Name', required: true },
         { key: 'last_name', label: 'Last </br> Name' },
         //  { key: 'role', label: 'Role' },
         // { key: 'designation', label: 'Designation' },
         //  { key: 'department', label: 'Department' },
         { key: 'father_name', label: 'Father Name' },
         { key: 'mother_name', label: 'Mother Name' },
         { key: 'email', label: 'Email', required: true },
         { key: 'gender', label: 'Gender', required: true },
         { key: 'date_of_birth', label: 'Date of Birth', required: true },
         { key: 'date_of_joining', label: 'Date of Joining' },
         { key: 'phone', label: 'Phone' },
         { key: 'emergency_contact_number', label: 'Emergency Contact </br> Number' },
         { key: 'marital_status', label: 'Marital Status' },
         { key: 'current_address', label: 'Current Address' },
         { key: 'permanent_address', label: 'Permanent Address' },
         { key: 'qualification', label: 'Qualification' },
         { key: 'work_experience', label: 'Work Experience' },
         { key: 'note', label: 'Note' },*/
        { key: 'staff_id', label: 'Staff ID', required: true },
        { key: 'first_name', label: <>First <br /> Name</>, required: true },
        { key: 'last_name', label: <>Last <br /> Name</> },

        // { key: 'role', label: 'Role' },
        // { key: 'designation', label: 'Designation' },
        // { key: 'department', label: 'Department' },

        { key: 'father_name', label: 'Father Name' },
        { key: 'mother_name', label: 'Mother Name' },
        { key: 'email', label: 'Email', required: true },
        { key: 'gender', label: 'Gender', required: true },
        { key: 'date_of_birth', label: <>Date of <br /> Birth</>, required: true },
        { key: 'date_of_joining', label: <>Date of <br /> Joining</> },
        { key: 'phone', label: 'Phone' },
        { key: 'emergency_contact_number', label: <>Emergency Contact <br /> Number</> },
        { key: 'marital_status', label: 'Marital Status' },
        { key: 'current_address', label: 'Current Address' },
        { key: 'permanent_address', label: 'Permanent Address' },
        { key: 'qualification', label: 'Qualification' },
        { key: 'work_experience', label: 'Work Experience' },
        { key: 'note', label: 'Note' },
    ];
    //  { key: 'epf_no', label: 'EPF No' },
    //  { key: 'basic_salary', label: 'Basic Salary' },
    //  { key: 'contract_type', label: 'Contract Type' },
    //  { key: 'work_shift', label: 'Work Shift' },
    //  { key: 'work_location', label: 'Work Location' },
    //  { key: 'bank_account_title', label: 'Bank Account Title' },
    //  { key: 'bank_account_number', label: 'Bank Account Number' },
    // { key: 'bank_name', label: 'Bank Name' },
    // { key: 'ifsc_code', label: 'IFSC Code' },
    // { key: 'bank_branch_name', label: 'Bank Branch Name' },
    // { key: 'facebook_url', label: 'Facebook URL' },
    // { key: 'twitter_url', label: 'Twitter URL' },
    // { key: 'linkedin_url', label: 'LinkedIn URL' },
    // { key: 'instagram_url', label: 'Instagram URL' }

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar sessionYear={sessionYear} />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-book"></i> Staff
                    </h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-info" style={{ padding: '5px' }}>
                                <div className="box-header with-border">
                                    <h3 className="box-title">Staff Import</h3>
                                    <div className="pull-right box-tools">
                                        <a href="https://newlayout.wisibles.com/admin/staff/exportformat" target="_blank" rel="noopener noreferrer">
                                            <button className="btn btn-primary btn-sm"><i className="fa fa-download"></i> Download Sample Import File</button>
                                        </a>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <br />
                                    1. Your CSV data should be in the format below. The first line of your CSV file should be the column headers as in the table example. Also make sure that your file is UTF-8 to avoid unnecessary encoding problems.<br />
                                    2. If the column you are trying to import is date make sure that is formatted in format YYYY-MM-DD (2018-06-06).<br />
                                    <hr />
                                </div>
                                <div className="box-body table-responsive" style={{ overflowX: 'auto' }}>
                                    <table className="table table-striped table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                {sampleFields.map(field => (
                                                    <th key={field.key} style={{ whiteSpace: 'nowrap' }}>
                                                        {field.label} {field.required && <span className="text-red">*</span>}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                {sampleFields.map(field => (
                                                    <td key={field.key}>XYZ</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <hr />
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Role</label><small className="req"> *</small>
                                                    <select name="role" className="form-control" value={formData.role} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {roles.map(r => (
                                                            <option key={r.id} value={r.id}>{r.name || r.type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Designation</label>
                                                    <select name="designation" className="form-control" value={formData.designation} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        {designations.map(d => (
                                                            <option key={d.id} value={d.id}>{d.designation}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Department</label>
                                                    <select name="department" className="form-control" value={formData.department} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        {departments.map(d => (
                                                            <option key={d.id} value={d.id}>{d.department_name || d.department}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Select CSV File</label><small className="req"> *</small>
                                                    <input
                                                        className="dropify"
                                                        type="file"
                                                        name="file"
                                                        id="file"
                                                        data-height="92"
                                                        accept=".csv"
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6" style={{ paddingTop: '20px' }}>
                                                <button type="submit" className="btn btn-info pull-right">
                                                    Staff Import
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Import Summary */}
                                {importSummary && (
                                    <div className="box-body">
                                        <div className="alert alert-info" style={{ marginBottom: 0 }}>
                                            <h4 style={{ marginTop: 0 }}><i className="fa fa-info-circle"></i> Import Summary</h4>
                                            <table className="table table-bordered" style={{ background: '#fff', marginTop: '10px' }}>
                                                <tbody>
                                                    <tr>
                                                        <th>Total Records</th>
                                                        <td>{importSummary.total ?? 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Imported</th>
                                                        <td><span className="text-success"><strong>{importSummary.imported ?? 0}</strong></span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>Skipped</th>
                                                        <td><span className="text-danger"><strong>{importSummary.skipped ?? 0}</strong></span></td>
                                                    </tr>
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

export default StaffImport;
