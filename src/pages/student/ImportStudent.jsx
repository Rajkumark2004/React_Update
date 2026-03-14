import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const ImportStudent = () => {
    const navigate = useNavigate();
    const [initialLoading, setInitialLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        file: null
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await api.getImportStudentDetails();
            if (response.data && response.data.classlist) {
                setClassList(response.data.classlist);
            }
            setInitialLoading(false);
        } catch (error) {
            console.error('Error fetching import details:', error);
            setInitialLoading(false);
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
    }, [initialLoading]);

    const handleClassChange = async (classId) => {
        setFormData({ ...formData, class_id: classId, section_id: '' });
        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response.data) {
                    setSectionList(response.data);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        } else {
            setSectionList([]);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.file) {
            toast.error('Please select a CSV file');
            return;
        }

        const data = new FormData();
        data.append('file', formData.file);
        // Include class and section if selected, although Postman only showed 'file'
        if (formData.class_id) data.append('class_id', formData.class_id);
        if (formData.section_id) data.append('section_id', formData.section_id);

        const loadingToast = toast.loading('Importing students...');
        try {
            const response = await api.importStudent(data);
            toast.dismiss(loadingToast);

            if (response.status) {
                toast.success(response.message || 'Students imported successfully');
                // total_records: response.total_records, imported_records: response.imported_records
                if (response.imported_records !== undefined) {
                    toast.success(`Imported: ${response.imported_records} / ${response.total_records}`);
                }
            } else {
                toast.error(response.message || 'Failed to import students');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Import Error:', error);
            toast.error(error.message || 'An error occurred during import');
        }
    };

    const fields = [
        { label: 'Admission No', key: 'admission_no', required: true },
        { label: 'Roll No', key: 'roll_no' },
        { label: 'First Name', key: 'firstname', required: true },
        { label: 'Last Name', key: 'lastname' },
        { label: 'Gender', key: 'gender', required: true },
        { label: 'Date Of Birth', key: 'dob', required: true },
        { label: 'Category', key: 'category_id' },
        { label: 'Religion', key: 'religion' },
        { label: 'Caste', key: 'cast' },
        { label: 'Mobile No', key: 'mobileno' },
        { label: 'Email', key: 'email' },
        { label: 'Admission Date', key: 'admission_date' },
        { label: 'Blood Group', key: 'blood_group' },
        { label: 'Student House', key: 'school_house_id' },
        { label: 'Height', key: 'height' },
        { label: 'Weight', key: 'weight' },
        { label: 'As On Date', key: 'as_on_date' },
        { label: 'Father Name', key: 'father_name' },
        { label: 'Father Phone', key: 'father_phone' },
        { label: 'Father Occupation', key: 'father_occupation' },
        { label: 'Mother Name', key: 'mother_name' },
        { label: 'Mother Phone', key: 'mother_phone' },
        { label: 'Mother Occupation', key: 'mother_occupation' },
        { label: 'Guardian Is', key: 'guardian_is', required: true },
        { label: 'Guardian Name', key: 'guardian_name', required: true },
        { label: 'Guardian Relation', key: 'guardian_relation' },
        { label: 'Guardian Email', key: 'guardian_email' },
        { label: 'Guardian Phone', key: 'guardian_phone', required: true },
        { label: 'Guardian Occupation', key: 'guardian_occupation' },
        { label: 'Guardian Address', key: 'guardian_address' },
        { label: 'Current Address', key: 'current_address' },
        { label: 'Permanent Address', key: 'permanent_address' },
        { label: 'Bank Account No', key: 'bank_account_no' },
        { label: 'Bank Name', key: 'bank_name' },
        { label: 'IFSC Code', key: 'ifsc_code' },
        { label: 'National Identification No', key: 'adhar_no' },
        { label: 'Local Identification No', key: 'samagra_id' },
        { label: 'RTE', key: 'rte' },
        { label: 'Previous School Details', key: 'previous_school' },
        { label: 'Note', key: 'note' }
    ];

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper">
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-info" style={{ padding: '5px' }}>
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                        <div className="pull-right box-tools">
                                            <a href="https://newlayout.wisibles.com/student/exportformat">
                                                <button className="btn btn-primary btn-sm"><i className="fa fa-download"></i> Download Sample Import File</button>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <br />
                                        1. Your CSV data should be in the format below. The first line of your CSV file should be the column headers as in the table example. Also make sure that your file is UTF-8 to avoid unnecessary encoding problems.
                                        <br />
                                        2. If the column you are trying to import is date make sure that is formatted in format Y-m-d (2018-06-06).
                                        <br />
                                        3. Duplicate Admission Number (unique) rows will not be imported.
                                        <br />
                                        4. For student Gender use Male, Female value.
                                        <br />
                                        5. For student Blood Group use O+, A+, B+, AB+, O-, A-, B-, AB- value.
                                        <br />
                                        6. For RTE use Yes, No value.
                                        <br />
                                        7. For Guardian Is if user is father,mother,other use Father, Mother, Other value.
                                        <br />
                                        8. For Category use values from Category (Unique) list.
                                        <br />
                                        9. For Student House use values from House (Unique) list.
                                        <hr />
                                    </div>
                                    <div className="box-body table-responsive">
                                        <table className="table table-striped table-bordered table-hover" id="sampledata">
                                            <thead>
                                                <tr>
                                                    {fields.map((field, index) => (
                                                        <th key={index}>
                                                            {field.required && <span className="text-red">*</span>}
                                                            <span>{field.label}</span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {fields.map((_, index) => (
                                                        <td key={index}>Sample Data</td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <hr />
                                    <form onSubmit={handleSubmit}>
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Class</label>
                                                        <select
                                                            autoFocus
                                                            className="form-control"
                                                            value={formData.class_id}
                                                            onChange={(e) => handleClassChange(e.target.value)}
                                                        >
                                                            <option value="">Select</option>
                                                            {classList.map((cls) => (
                                                                <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Section</label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.section_id}
                                                            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                                                        >
                                                            <option value="">Select</option>
                                                            {sectionList.map((sec) => (
                                                                <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Select CSV File</label><small className="req"> *</small>
                                                        <input
                                                            className="dropify"
                                                            type="file"
                                                            name="file"
                                                            data-height="92"
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6 pt20">
                                                    <button type="submit" className="btn btn-info pull-right">Import Student</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default ImportStudent;
