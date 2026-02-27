import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SiblingModal from '../../components/SiblingModal';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import '../../utils/include_files';

const StudentAdmission = () => {
    const navigate = useNavigate();
    const [isSiblingModalOpen, setIsSiblingModalOpen] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        admission_no: '',
        roll_no: '',
        class_id: '',
        section_id: '',
        firstname: '',
        middlename: '',
        lastname: '',
        gender: '',
        dob: '',
        category_id: '',
        religion: '',
        cast: '',
        mobileno: '',
        email: '',
        admission_date: '',
        student_photo: null,
        blood_group: '',
        house: '',
        height: '',
        weight: '',
        measurement_date: '',
        class_of_admission: '',

        // Parent Details
        father_name: '',
        father_phone: '',
        father_occupation: '',
        father_pic: null,
        mother_name: '',
        mother_phone: '',
        mother_occupation: '',
        mother_pic: null,

        // Guardian Details
        guardian_is: 'father',
        guardian_name: '',
        guardian_relation: '',
        guardian_phone: '',
        guardian_occupation: '',
        guardian_email: '',
        guardian_address: '',
        guardian_pic: null,

        // Address
        current_address: '',
        permanent_address: '',

        // Miscellaneous
        bank_account_no: '',
        bank_name: '',
        ifsc_code: '',
        national_identification_no: '',
        local_identification_no: '',
        rte: 'No',
        previous_school: '',
        note: '',

        // Transport & Hostel
        route_list: '',
        pickup_point: '',
        fees_month: [],
        hostel: '',
        room_no: '',

        // Child ID
        child_id: '',

        // Upload Documents
        first_title: '', first_doc: null,
        second_title: '', second_doc: null,
        third_title: '', third_doc: null,
        fourth_title: '', fourth_doc: null
    });

    const [autofillCurrent, setAutofillCurrent] = useState(false);
    const [autofillPermanent, setAutofillPermanent] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Fetch classes and sections on component mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const response = await api.getStudentCreatePreData();
                if (response && response.status === 'success' && response.data && Array.isArray(response.data.classlist)) {
                    setClasses(response.data.classlist);
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchDropdownData();
    }, []);

    const handleInputChange = async (e) => {
        const { name, value, type, files } = e.target;
        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            // Trigger section fetch if class changes
            if (name === 'class_id') {
                setSections([]); // Clear sections
                setFormData(prev => ({ ...prev, section_id: '' })); // Reset section selection

                if (value) {
                    try {
                        const response = await api.getSectionsByClass(value);
                        if (response && response.data) {
                            setSections(response.data);
                        } else if (response && Array.isArray(response)) {
                            setSections(response);
                        }
                    } catch (error) {
                        console.error('Error fetching sections by class:', error);
                    }
                }
            }
        }
    };

    const handleGuardianChange = (e) => {
        const val = e.target.value;
        setFormData(prev => {
            let newData = { ...prev, guardian_is: val };
            if (val === 'father') {
                newData.guardian_name = prev.father_name;
                newData.guardian_phone = prev.father_phone;
                newData.guardian_occupation = prev.father_occupation;
                newData.guardian_relation = 'Father';
            } else if (val === 'mother') {
                newData.guardian_name = prev.mother_name;
                newData.guardian_phone = prev.mother_phone;
                newData.guardian_occupation = prev.mother_occupation;
                newData.guardian_relation = 'Mother';
            } else {
                newData.guardian_name = '';
                newData.guardian_phone = '';
                newData.guardian_occupation = '';
                newData.guardian_relation = '';
            }
            return newData;
        });
    };

    const handleAutofillGuardianAddress = (e) => {
        const checked = e.target.checked;
        setAutofillCurrent(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, current_address: prev.guardian_address }));
        }
    };

    const handleAutofillPermanentAddress = (e) => {
        const checked = e.target.checked;
        setAutofillPermanent(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
        }
    };

    // Update addresses if autofill is checked and source changes
    useEffect(() => {
        if (autofillCurrent) {
            setFormData(prev => ({ ...prev, current_address: prev.guardian_address }));
        }
    }, [formData.guardian_address, autofillCurrent]);

    useEffect(() => {
        if (autofillPermanent) {
            setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
        }
    }, [formData.current_address, autofillPermanent]);

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    // Initialize Dropify
                    const drEvent = $('.dropify').dropify();

                    // Handle file changes from Dropify
                    drEvent.on('change', function (event, element) {
                        // We need to manually trigger React state update because Dropify might not trigger synthetic onChange
                        // However, usually the underlying input change triggers it.
                        // If not, we might need a ref approach.
                        // Let's rely on the native change event bubbling first.
                        // If that fails, we can capture the file from the element.
                    });
                } else {
                    console.warn('jQuery or Dropify plugin not loaded');
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500); // 500ms delay to ensure DOM is ready

        return () => clearTimeout(timer);
    }, [showMoreDetails, initialLoading]);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [createdStudent, setCreatedStudent] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate mandatory fields
        const errors = {};
        if (!formData.admission_no.trim()) errors.admission_no = 'Admission No is required';
        if (!formData.class_id) errors.class_id = 'Class is required';
        if (!formData.section_id) errors.section_id = 'Section is required';
        if (!formData.firstname.trim()) errors.firstname = 'First Name is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        if (!formData.dob) errors.dob = 'Date of Birth is required';
        if (!formData.child_id.trim()) errors.child_id = 'Child ID is required';
        if (!formData.guardian_name.trim()) errors.guardian_name = 'Guardian Name is required';
        if (!formData.guardian_phone.trim()) errors.guardian_phone = 'Guardian Phone is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            // Scroll to first error
            const firstErrorField = document.querySelector('.field-error');
            if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setFormErrors({});
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
        setCreatedStudent(null);

        try {
            const data = new FormData();

            // Append all fields from state
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    // For files, only append if it's a File object
                    if (formData[key] instanceof File) {
                        data.append(key, formData[key]);
                    } else if (typeof formData[key] === 'object' && formData[key] !== null && !Array.isArray(formData[key])) {
                        // Skip non-file objects if any ( shouldn't be based on init state)
                    } else if (Array.isArray(formData[key])) {
                        // Handle arrays (like fees_month)
                        formData[key].forEach(val => data.append(`${key}[]`, val));
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            const response = await api.createStudent(data);

            setSuccessMessage(response.message || 'Student created successfully!');
            if (response.data) {
                setCreatedStudent(response.data);
            }

            // Scroll to top
            window.scrollTo(0, 0);

            // Reset form
            setFormData({
                admission_no: '',
                roll_no: '',
                class_id: '',
                section_id: '',
                firstname: '',
                middlename: '',
                lastname: '',
                gender: '',
                dob: '',
                category_id: '',
                religion: '',
                cast: '',
                mobileno: '',
                email: '',
                admission_date: '',
                student_photo: null,
                blood_group: '',
                house: '',
                height: '',
                weight: '',
                measurement_date: '',
                class_of_admission: '',
                father_name: '',
                father_phone: '',
                father_occupation: '',
                father_pic: null,
                mother_name: '',
                mother_phone: '',
                mother_occupation: '',
                mother_pic: null,
                guardian_is: 'father',
                guardian_name: '',
                guardian_relation: '',
                guardian_phone: '',
                guardian_occupation: '',
                guardian_email: '',
                guardian_address: '',
                guardian_pic: null,
                current_address: '',
                permanent_address: '',
                bank_account_no: '',
                bank_name: '',
                ifsc_code: '',
                national_identification_no: '',
                local_identification_no: '',
                rte: 'No',
                previous_school: '',
                note: '',
                route_list: '',
                pickup_point: '',
                fees_month: [],
                hostel: '',
                room_no: '',
                child_id: '',
                first_title: '', first_doc: null,
                second_title: '', second_doc: null,
                third_title: '', third_doc: null,
                fourth_title: '', fourth_doc: null
            });
            setAutofillCurrent(false);
            setAutofillPermanent(false);
            const $ = window.jQuery;
            if ($ && $.fn && typeof $.fn.dropify === 'function') {
                const dropifyElements = $('.dropify');
                dropifyElements.each(function () {
                    const dropify = $(this).data('dropify');
                    if (dropify) {
                        dropify.resetPreview();
                        dropify.clearElement();
                    }
                });
            }

        } catch (error) {
            console.error('Submission Error:', error);
            setErrorMessage(error.message || 'Failed to create student');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSibling = (siblingData) => {
        console.log("Sibling added:", siblingData);
        // Implement logic to fetch and fill sibling's parent/address data here
    };

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
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Student Admission</h3>
                                        <div className="box-tools pull-right impbtntitle" style={{ zIndex: 1000, position: 'relative' }}>
                                            <div className="btn-group pull-right mml15">
                                                <button onClick={() => navigate('/student/search')} className="btn btn-primary btn-sm"><i className="fa fa-arrow-left"></i> Back</button>
                                            </div>
                                        </div>
                                    </div>
                                    <form id="form1" className="" method="post" acceptCharset="utf-8" encType="multipart/form-data" onSubmit={handleSubmit}>
                                        <div className="box-body">
                                            {successMessage && (
                                                <div className="alert alert-success alert-dismissible">
                                                    <button
                                                        type="button"
                                                        className="close"
                                                        onClick={() => setSuccessMessage('')}
                                                    >
                                                        ×
                                                    </button>

                                                    <h4>
                                                        <i className="icon fa fa-check"></i> Success!
                                                    </h4>

                                                    <p>{successMessage}</p>

                                                    {createdStudent && (
                                                        <div style={{ marginTop: '10px' }}>
                                                            <p>
                                                                <strong>Name:</strong> {createdStudent.firstname} {createdStudent.lastname}
                                                            </p>
                                                            <p>
                                                                <strong>Admission No:</strong> {createdStudent.admission_no}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {errorMessage && (
                                                <div className="alert alert-danger alert-dismissible">
                                                    <button type="button" className="close" onClick={() => setErrorMessage('')}>×</button>
                                                    <h4><i className="icon fa fa-ban"></i> Error!</h4>
                                                    {errorMessage}
                                                </div>
                                            )}

                                            <p style={{ color: '#f44336', fontSize: '12px', marginBottom: '15px' }}>
                                                <small className="req"> *</small> Fields marked with (<small className="req">*</small>) are mandatory
                                            </p>

                                            {/* Core Profile */}
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Admission No <small className="req"> *</small></label>
                                                        <input autoFocus="" name="admission_no" type="text" className={`form-control ${formErrors.admission_no ? 'border-danger' : ''}`} value={formData.admission_no} onChange={handleInputChange} />
                                                        {formErrors.admission_no && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.admission_no}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Roll Number</label>
                                                        <input name="roll_no" type="text" className="form-control" value={formData.roll_no} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Class <small className="req"> *</small></label>
                                                        <select name="class_id" className={`form-control ${formErrors.class_id ? 'border-danger' : ''}`} value={formData.class_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                                        </select>
                                                        {formErrors.class_id && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.class_id}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Section <small className="req"> *</small></label>
                                                        <select name="section_id" className={`form-control ${formErrors.section_id ? 'border-danger' : ''}`} value={formData.section_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {sections.map(sec => <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>)}
                                                        </select>
                                                        {formErrors.section_id && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.section_id}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>First Name <small className="req"> *</small></label>
                                                        <input name="firstname" type="text" className={`form-control ${formErrors.firstname ? 'border-danger' : ''}`} value={formData.firstname} onChange={handleInputChange} />
                                                        {formErrors.firstname && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.firstname}</span>}
                                                    </div>
                                                </div>
                                                {/* Middle name removed as per request, but keeping state if needed later or if it was optional in PHP.
                                                Actually user asked to remove it. */}
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Last Name</label>
                                                        <input name="lastname" type="text" className="form-control" value={formData.lastname} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Gender <small className="req"> *</small></label>
                                                        <select className={`form-control ${formErrors.gender ? 'border-danger' : ''}`} name="gender" value={formData.gender} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                        {formErrors.gender && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.gender}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Date Of Birth <small className="req"> *</small></label>
                                                        <input name="dob" type="date" className={`form-control ${formErrors.dob ? 'border-danger' : ''}`} value={formData.dob} onChange={handleInputChange} />
                                                        {formErrors.dob && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.dob}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Category</label>
                                                        <select name="category_id" className="form-control" value={formData.category_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="1">General</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Religion</label>
                                                        <input name="religion" type="text" className="form-control" value={formData.religion} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Caste</label>
                                                        <input name="cast" type="text" className="form-control" value={formData.cast} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Mobile Number</label>
                                                        <input name="mobileno" type="text" className="form-control" value={formData.mobileno} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input name="email" type="text" className="form-control" value={formData.email} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Admission Date</label>
                                                        <input name="admission_date" type="date" className="form-control" value={formData.admission_date} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Class Of Admission</label>
                                                        <input name="class_of_admission" type="text" className="form-control" value={formData.class_of_admission} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Student Photo</label>
                                                        <input className="dropify" type='file' name='student_photo' onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Blood Group</label>
                                                        <select className="form-control" name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="A+">A+</option>
                                                            <option value="A-">A-</option>
                                                            <option value="B+">B+</option>
                                                            <option value="B-">B-</option>
                                                            <option value="O+">O+</option>
                                                            <option value="O-">O-</option>
                                                            <option value="AB+">AB+</option>
                                                            <option value="AB-">AB-</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>House</label>
                                                        <select className="form-control" name="house" value={formData.house} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="Red">Red</option>
                                                            <option value="Blue">Blue</option>
                                                            <option value="Green">Green</option>
                                                            <option value="Yellow">Yellow</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Height</label>
                                                        <input name="height" type="text" className="form-control" value={formData.height} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Weight</label>
                                                        <input name="weight" type="text" className="form-control" value={formData.weight} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Measurement Date</label>
                                                        <input name="measurement_date" type="date" className="form-control" value={formData.measurement_date} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Child ID <small className="req"> *</small></label>
                                                            <input name="child_id" type="text" className={`form-control ${formErrors.child_id ? 'border-danger' : ''}`} value={formData.child_id} onChange={handleInputChange} />
                                                            {formErrors.child_id && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.child_id}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 pt25">
                                                        <button type="button" className="btn btn-sm mysiblings anchorbtn" onClick={() => setIsSiblingModalOpen(true)}>
                                                            <i className="fa fa-plus"></i> Add Sibling
                                                        </button>
                                                    </div>
                                                </div>



                                                {/* Fees Details Accordion 
                                            <h4 className="pagetitleh2">Fees Details
                                                <span className="float-right bmedium total_fees_alloted">0.00</span>
                                            </h4>
                                            <div className="row around10">
                                                <div className="col-md-12">
                                                    <div className="table-responsive border0">
                                                        <table className="table mb0">
                                                            <tbody>
                                                                <tr>
                                                                    <td colSpan="3" className="mailbox-name white-space-nowrap border0">
                                                                        <div className="panel-group1 mb0">
                                                                            <div className="panel panel-default1">
                                                                                <div className="panel-heading pt5 pb5">
                                                                                    <h6 className="panel-title panel-title1 overflow-hidden">
                                                                                        <input className="fee_group_chk vertical-middle" type="checkbox" name="fee_session_group_id[]" value="1" />
                                                                                        <a className="display-inline collapsed box-plus-panel" data-toggle="collapse" href="#collapse_fees_1">
                                                                                            <span className="font14"> Class 1 General Fees</span>
                                                                                        </a>
                                                                                        <span className="float-right bmedium pt3 fee_group_total" data-amount="1000">1,000.00</span>
                                                                                    </h6>
                                                                                </div>
                                                                                <div id="collapse_fees_1" className="panel-collapse collapse">
                                                                                    <ul className="list-group student_fee_list">
                                                                                        <li className="list-group-item">
                                                                                            <div className="displayinline stfirstdiv bmedium font14 pl-65">Fees Type</div>
                                                                                            <div className="due_date bmedium font14">Due Date</div>
                                                                                            <div className="tools bmedium font14">Amount ($)</div>
                                                                                        </li>
                                                                                        <li className="list-group-item">
                                                                                            <div className="displayinline stfirstdiv pl-65">Admission Fees (ADM001)</div>
                                                                                            <small className="due_date"><i className="fa fa-calendar"></i> 01/04/2026</small>
                                                                                            <div className="tools">500.00</div>
                                                                                        </li>
                                                                                        <li className="list-group-item">
                                                                                            <div className="displayinline stfirstdiv pl-65">Tuition Fees (TUT001)</div>
                                                                                            <small className="due_date"><i className="fa fa-calendar"></i> 01/04/2026</small>
                                                                                            <div className="tools">500.00</div>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            //transport
                                            <h4 className="pagetitleh2">Transport Details</h4>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Route List</label>
                                                        <select className="form-control" name="route_list" value={formData.route_list} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <optgroup label="Route A">
                                                                <option value="VH001">Vehicle 1 (VH001)</option>
                                                                <option value="VH002">Vehicle 2 (VH002)</option>
                                                            </optgroup>
                                                            <optgroup label="Route B">
                                                                <option value="VH003">Vehicle 3 (VH003)</option>
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Pickup Point</label>
                                                        <select className="form-control" name="pickup_point" value={formData.pickup_point} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="Point A">Point A</option>
                                                            <option value="Point B">Point B</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Fees Month</label>
                                                        <select className="form-control" name="fees_month" value={formData.fees_month} onChange={handleInputChange} multiple={true}>
                                                            <option value="January">January</option>
                                                            <option value="February">February</option>
                                                            <option value="March">March</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            //hostel details
                                            <h4 className="pagetitleh2">Hostel Details</h4>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Hostel</label>
                                                        <select className="form-control" name="hostel" value={formData.hostel} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="Hostel A">Hostel A</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Room No</label>
                                                        <select className="form-control" name="room_no" value={formData.room_no} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="101">101 (AC)</option>
                                                            <option value="102">102 (Non-AC)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>*/}

                                                {/* Parent Guardian Detail */}
                                                <h4 className="pagetitleh2">Parent Guardian Detail</h4>
                                                <div className="row">
                                                    {/* Father */}
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Name</label>
                                                            <input name="father_name" type="text" className="form-control" value={formData.father_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Phone</label>
                                                            <input name="father_phone" type="text" className="form-control" value={formData.father_phone} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Occupation</label>
                                                            <input name="father_occupation" type="text" className="form-control" value={formData.father_occupation} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Photo</label>
                                                            <input className="dropify" type='file' name='father_pic' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    {/* Mother */}
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Name</label>
                                                            <input name="mother_name" type="text" className="form-control" value={formData.mother_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Phone</label>
                                                            <input name="mother_phone" type="text" className="form-control" value={formData.mother_phone} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Occupation</label>
                                                            <input name="mother_occupation" type="text" className="form-control" value={formData.mother_occupation} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Photo</label>
                                                            <input className="dropify" type='file' name='mother_pic' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="form-group col-md-12">
                                                        <label>If Guardian Is <small className="req"> *</small>&nbsp;&nbsp;&nbsp;</label>
                                                        <label className="radio-inline">
                                                            <input type="radio" name="guardian_is" value="father" checked={formData.guardian_is === 'father'} onChange={handleGuardianChange} /> Father
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input type="radio" name="guardian_is" value="mother" checked={formData.guardian_is === 'mother'} onChange={handleGuardianChange} /> Mother
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input type="radio" name="guardian_is" value="other" checked={formData.guardian_is === 'other'} onChange={handleGuardianChange} /> Other
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Guardian Name <small className="req"> *</small></label>
                                                                    <input name="guardian_name" type="text" className={`form-control ${formErrors.guardian_name ? 'border-danger' : ''}`} value={formData.guardian_name} onChange={handleInputChange} />
                                                                    {formErrors.guardian_name && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.guardian_name}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Guardian Relation</label>
                                                                    <input name="guardian_relation" type="text" className="form-control" value={formData.guardian_relation} onChange={handleInputChange} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Guardian Phone <small className="req"> *</small></label>
                                                                    <input name="guardian_phone" type="text" className={`form-control ${formErrors.guardian_phone ? 'border-danger' : ''}`} value={formData.guardian_phone} onChange={handleInputChange} />
                                                                    {formErrors.guardian_phone && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.guardian_phone}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Guardian Occupation</label>
                                                                    <input name="guardian_occupation" type="text" className="form-control" value={formData.guardian_occupation} onChange={handleInputChange} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Guardian Email</label>
                                                            <input name="guardian_email" type="text" className="form-control" value={formData.guardian_email} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Guardian Photo</label>
                                                            <input className="dropify" type='file' name='guardian_pic' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Guardian Address</label>
                                                            <textarea name="guardian_address" className="form-control" rows="2" value={formData.guardian_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Add More Details Toggle */}
                                                <div className="box-group">
                                                    <div className="panel box border0 mb0">
                                                        <div className="addmoredetail-title">
                                                            <button
                                                                type="button"
                                                                className="btn btn-link boxplus"
                                                                onClick={() => setShowMoreDetails(!showMoreDetails)}
                                                                style={{ textDecoration: 'none', color: '#444', fontWeight: 'bold' }}
                                                            >
                                                                <i className={`fa fa-fw ${showMoreDetails ? 'fa-minus' : 'fa-plus'}`}></i>
                                                                {showMoreDetails ? ' Hide More Details' : ' Add More Details'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {showMoreDetails && (
                                                    <div className="show-more-details-section">
                                                        <h4 className="pagetitleh2">Student Address Details</h4>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" checked={autofillCurrent} onChange={handleAutofillGuardianAddress} /> If Guardian Address is Current Address
                                                                    </label>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Current Address</label>
                                                                    <textarea name="current_address" rows="2" className="form-control" value={formData.current_address} onChange={handleInputChange}></textarea>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="checkbox">
                                                                    <label>
                                                                        <input type="checkbox" checked={autofillPermanent} onChange={handleAutofillPermanentAddress} /> If Permanent Address is Current Address
                                                                    </label>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Permanent Address</label>
                                                                    <textarea name="permanent_address" rows="2" className="form-control" value={formData.permanent_address} onChange={handleInputChange}></textarea>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Miscellaneous Details */}
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Miscellaneous Details</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Account Number</label>
                                                                        <input name="bank_account_no" type="text" className="form-control" value={formData.bank_account_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Name</label>
                                                                        <input name="bank_name" type="text" className="form-control" value={formData.bank_name} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>IFSC Code</label>
                                                                        <input name="ifsc_code" type="text" className="form-control" value={formData.ifsc_code} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>National Identification Number</label>
                                                                        <input name="national_identification_no" type="text" className="form-control" value={formData.national_identification_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Local Identification Number</label>
                                                                        <input name="local_identification_no" type="text" className="form-control" value={formData.local_identification_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                {/*<div className="col-md-4">
                                                        <label>RTE</label>
                                                        <div className="radio" style={{ marginTop: '2px' }}>
                                                            <label><input className="radio-inline" type="radio" name="rte" value="Yes" checked={formData.rte === 'Yes'} onChange={handleInputChange} /> Yes</label>
                                                            <label><input className="radio-inline" type="radio" name="rte" value="No" checked={formData.rte === 'No'} onChange={handleInputChange} /> No</label>
                                                        </div>
                                                    </div>*/}
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Previous School Details</label>
                                                                        <textarea className="form-control" rows="3" name="previous_school" value={formData.previous_school} onChange={handleInputChange}></textarea>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Note</label>
                                                                        <textarea className="form-control" rows="3" name="note" value={formData.note} onChange={handleInputChange}></textarea>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Upload Documents */}
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="tshadow bozero">
                                                                    <h4 className="pagetitleh2">Upload Documents</h4>
                                                                    <div className="row around10">
                                                                        <div className="col-md-6">
                                                                            <table className="table">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <th style={{ width: '10px' }}>#</th>
                                                                                        <th>Title</th>
                                                                                        <th>Documents</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>1.</td>
                                                                                        <td><input type="text" name='first_title' className="form-control" value={formData.first_title} onChange={handleInputChange} /></td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type='file' name='first_doc' onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>2.</td>
                                                                                        <td><input type="text" name='second_title' className="form-control" value={formData.second_title} onChange={handleInputChange} /></td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type='file' name='second_doc' onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <table className="table">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <th style={{ width: '10px' }}>#</th>
                                                                                        <th>Title</th>
                                                                                        <th>Documents</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>3.</td>
                                                                                        <td><input type="text" name='third_title' className="form-control" value={formData.third_title} onChange={handleInputChange} /></td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type='file' name='third_doc' onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>4.</td>
                                                                                        <td><input type="text" name='fourth_title' className="form-control" value={formData.fourth_title} onChange={handleInputChange} /></td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type='file' name='fourth_doc' onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Saving...</> : 'Save'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
            <SiblingModal isOpen={isSiblingModalOpen} onClose={() => setIsSiblingModalOpen(false)} onAddSibling={handleAddSibling} />
        </div>

    );
};

export default StudentAdmission;
