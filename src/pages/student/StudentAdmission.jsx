import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SiblingModal from '../../components/SiblingModal';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://newlayout.wisibles.com/uploads/student_images/no_image.png';
    return `https://newlayout.wisibles.com/${imagePath}`;
};

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
        image: null,
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

        // Sibling Details
        sibling_id: '',
        sibling_name: '',

        // Fees
        fee_session_group_id: [],
        fees_discount: '0',

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
    const [categories, setCategories] = useState([]);
    const [siblings, setSiblings] = useState([]);
    const [hostelRooms, setHostelRooms] = useState([]);
    const [schSetting, setSchSetting] = useState(null);
    const [feeGroups, setFeeGroups] = useState([]);
    const [transportFeesList, setTransportFeesList] = useState([]);
    const [vehRoutes, setVehRoutes] = useState({});
    const [hostels, setHostels] = useState([]);
    const [pickupPoints, setPickupPoints] = useState([]);
    const [bloodGroups, setBloodGroups] = useState([]);
    const [houses, setHouses] = useState([]);
    const [feeSearchTerm, setFeeSearchTerm] = useState('');
    const [isFeeDropdownOpen, setIsFeeDropdownOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

    // Fetch classes and sections on component mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const response = await api.getStudentCreatePreData();
                if (response && response.status === 'success' && response.data) {
                    const data = response.data;
                    if (Array.isArray(data.classlist)) {
                        setClasses(data.classlist);
                    }
                    if (Array.isArray(data.categorylist)) {
                        setCategories(data.categorylist);
                    }
                    if (data.sch_setting) {
                        setSchSetting(data.sch_setting);
                    }
                    if (Array.isArray(data.feesessiongroup_model)) {
                        setFeeGroups(data.feesessiongroup_model);
                    }
                    if (Array.isArray(data.transport_fees)) {
                        setTransportFeesList(data.transport_fees);
                    }
                    if (data.vehroutelist) {
                        setVehRoutes(data.vehroutelist);
                    }
                    if (Array.isArray(data.hostelList)) {
                        setHostels(data.hostelList);
                    }
                    if (data.bloodgroupList) {
                        setBloodGroups(Object.values(data.bloodgroupList));
                    }
                    if (Array.isArray(data.houseList)) {
                        setHouses(data.houseList);
                    }
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

            // Trigger hostel room fetch if hostel changes
            if (name === 'hostel') {
                setHostelRooms([]);
                setFormData(prev => ({ ...prev, room_no: '' }));

                if (value) {
                    try {
                        const response = await api.getHostelRooms(value);
                        if (response && response.data) {
                            setHostelRooms(response.data);
                        }
                    } catch (error) {
                        console.error('Error fetching hostel rooms:', error);
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

            // Convert YYYY-MM-DD → DD/MM/YYYY for date fields the API expects
            const dateFields = ['dob', 'admission_date', 'measurement_date'];
            const formatDate = (val) => {
                if (!val) return val;
                const parts = val.split('-');
                if (parts.length === 3 && parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return val;
            };

            // Append all fields from state
            Object.keys(formData).forEach(key => {
                const value = formData[key];

                // Only append if value is not empty (null, undefined, empty string, or empty array)
                const isEmpty = (val) => {
                    if (val === null || val === undefined) return true;
                    if (typeof val === 'string' && val.trim() === '') return true;
                    if (Array.isArray(val) && val.length === 0) return true;
                    return false;
                };

                if (!isEmpty(value)) {
                    // For files, only append if it's a File object
                    if (value instanceof File) {
                        data.append(key, value);
                    } else if (Array.isArray(value)) {
                        // Handle arrays
                        if (key === 'fee_session_group_id') {
                            value.forEach(val => data.append('fee_session_group_id[]', val));
                        } else {
                            value.forEach(val => data.append(`${key}[]`, val));
                        }
                    } else {
                        // Mapping logic
                        if (key === 'national_identification_no') {
                            data.append('adhar_no', value);
                            return;
                        }
                        if (key === 'local_identification_no') {
                            data.append('samagra_id', value);
                            return;
                        }
                        if (key === 'route_list') {
                            data.append('vehroute_id', value);
                            return;
                        }
                        if (key === 'hostel') {
                            data.append('hostel_id', value);
                            return;
                        }

                        // Convert date fields from YYYY-MM-DD to DD/MM/YYYY
                        const processedValue = dateFields.includes(key) ? formatDate(value) : value;
                        data.append(key, processedValue);
                    }
                }
            });

            const response = await api.createStudent(data);

            toast.success('Student saved successfully');
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
                image: null,
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
                sibling_id: '',
                sibling_name: '',
                fee_session_group_id: [],
                fees_discount: '0',
                first_title: '', first_doc: null,
                second_title: '', second_doc: null,
                fourth_title: '', fourth_doc: null,
                fifth_title: '', fifth_doc: null
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

            // Check for specific validation errors from API
            if (error.response && error.response.errors) {
                setFormErrors(prev => ({ ...prev, ...error.response.errors }));
                const firstError = Object.values(error.response.errors)[0];
                const msg = firstError || 'Validation failed';
                setErrorMessage(msg);
                toast.error(msg);
            } else {
                const msg = error.message || 'Failed to create student';
                setErrorMessage(msg);
                toast.error(msg);
            }

            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSibling = (siblingData) => {
        console.log('Sibling DataReceived:', siblingData);
        if (!siblingData) return;

        // Add to siblings list for display
        setSiblings(prev => [...prev, siblingData]);

        setFormData(prev => {
            const updatedData = {
                ...prev,
                religion: siblingData.religion || '',
                cast: siblingData.cast || '',
                blood_group: siblingData.blood_group || '',
                category_id: siblingData.category_id || '',
                father_name: siblingData.father_name || '',
                father_phone: siblingData.father_phone || siblingData.guardian_phone || '',
                father_occupation: siblingData.father_occupation || '',
                mother_name: siblingData.mother_name || '',
                mother_phone: siblingData.mother_phone || '',
                mother_occupation: siblingData.mother_occupation || '',
                guardian_is: siblingData.guardian_is || (siblingData.guardian_relation ? siblingData.guardian_relation.toLowerCase() : 'father'),
                guardian_name: siblingData.guardian_name || '',
                guardian_relation: siblingData.guardian_relation || '',
                guardian_phone: siblingData.guardian_phone || '',
                guardian_occupation: siblingData.guardian_occupation || '',
                guardian_email: siblingData.guardian_email || '',
                guardian_address: siblingData.guardian_address || '',
                current_address: siblingData.current_address || '',
                permanent_address: siblingData.permanent_address || '',
                bank_account_no: siblingData.bank_account_no || '',
                bank_name: siblingData.bank_name || '',
                ifsc_code: siblingData.ifsc_code || '',
                national_identification_no: siblingData.adhar_no || '',
                local_identification_no: siblingData.samagra_id || '',
                sibling_id: siblingData.id || '',
                sibling_name: `${siblingData.firstname} ${siblingData.lastname}`.trim()
            };
            console.log('Updated Form Data (Sibling):', updatedData);
            return updatedData;
        });
        toast.success(`Parent details populated from sibling: ${siblingData.firstname}`);
    };

    const handleRemoveSibling = (siblingId) => {
        setSiblings(prev => prev.filter(s => String(s.id) !== String(siblingId)));
        if (String(formData.sibling_id) === String(siblingId)) {
            setFormData(prev => ({
                ...prev,
                sibling_id: '',
                sibling_name: ''
            }));
        }
        toast.success('Sibling removed from this record');
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
                                        <div className="box-tools pull-right impbtntitle" style={{ position: 'relative' }}>
                                            <button onClick={() => navigate('/student/import')} className="btn btn-primary btn-sm"><i className="fa fa-upload"></i> Import Student</button>
                                            <div className="btn-group pull-right mml15">
                                                <button onClick={() => navigate('/student/search')} className="btn btn-primary btn-sm"><i className="fa fa-arrow-left"></i> Back</button>
                                            </div>
                                        </div>
                                    </div>
                                    <form id="form1" className="" method="post" acceptCharset="utf-8" encType="multipart/form-data" onSubmit={handleSubmit}>
                                        <div className="box-body">


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
                                                {schSetting && schSetting.roll_no === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Roll Number</label>
                                                            <input name="roll_no" type="text" className="form-control" value={formData.roll_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Class</label><small className="req"> *</small>
                                                        <select
                                                            id="class_id"
                                                            name="class_id"
                                                            className={`form-control ${formErrors.class_id ? 'border-danger' : ''}`}
                                                            value={formData.class_id}
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                                        </select>
                                                        {formErrors.class_id && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.class_id}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Section</label><small className="req"> *</small>
                                                        <select
                                                            id="section_id"
                                                            name="section_id"
                                                            className={`form-control ${formErrors.section_id ? 'border-danger' : ''}`}
                                                            value={formData.section_id}
                                                            onChange={handleInputChange}
                                                        >
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
                                                {schSetting && schSetting.lastname === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input name="lastname" type="text" className="form-control" value={formData.lastname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
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
                                                {schSetting && schSetting.category === '1' && (
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Category</label>
                                                            <select name="category_id" className="form-control" value={formData.category_id} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat.id} value={cat.id}>{cat.category}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.religion === '1' && (
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Religion</label>
                                                            <input name="religion" type="text" className="form-control" value={formData.religion} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.cast === '1' && (
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Caste</label>
                                                            <input name="cast" type="text" className="form-control" value={formData.cast} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.mobile_no === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mobile Number</label>
                                                            <input name="mobileno" type="text" className="form-control" value={formData.mobileno} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.student_email === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Email</label>
                                                            <input name="email" type="text" className="form-control" value={formData.email} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="row">
                                                {schSetting && schSetting.admission_date === '1' && (
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Admission Date</label>
                                                            <input name="admission_date" type="date" className="form-control" value={formData.admission_date} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Class Of Admission</label>
                                                        <input name="class_of_admission" type="text" className="form-control" value={formData.class_of_admission} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                {schSetting && schSetting.student_photo === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Student Photo</label>
                                                            <input className="dropify" type='file' name='image' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.is_blood_group === '1' && (
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Blood Group</label>
                                                            <select className="form-control" name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {bloodGroups.map(bg => (
                                                                    <option key={bg} value={bg}>{bg}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.is_student_house === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>House</label>
                                                            <select className="form-control" name="house" value={formData.house} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {houses.map(house => (
                                                                    <option key={house.id} value={house.id}>{house.house_name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="row">
                                                {schSetting && schSetting.student_height === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Height</label>
                                                            <input name="height" type="text" className="form-control" value={formData.height} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.student_weight === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Weight</label>
                                                            <input name="weight" type="text" className="form-control" value={formData.weight} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.measurement_date === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Measurement Date</label>
                                                            <input name="measurement_date" type="date" className="form-control" value={formData.measurement_date} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-md-3" style={{ display: 'none' }}>
                                                    <div className="form-group">
                                                        <label>Fees Discount</label>
                                                        <input name="fees_discount" type="text" className="form-control" value={formData.fees_discount} onChange={handleInputChange} />
                                                    </div>
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

                                            {siblings && siblings.length > 0 && (
                                                <div className="row" style={{ marginTop: '20px' }}>
                                                    <div className="col-md-12">
                                                        <h4 className="pagetitleh2" style={{ marginTop: '0' }}>Existing Siblings</h4>
                                                        <div className="row">
                                                            {siblings.map((sibling, index) => (
                                                                <div className="col-md-4" key={sibling.id || sibling.student_session_id || index}>
                                                                    <div className="box box-widget widget-user-2" style={{ border: '1px solid #eee', marginBottom: '15px', borderRadius: '4px' }}>
                                                                        <div className="widget-user-header bg-gray-light" style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
                                                                            <div className="widget-user-image" style={{ marginRight: '15px', flexShrink: 0 }}>
                                                                                <img
                                                                                    className="img-circle"
                                                                                    src={getImageUrl(sibling.image)}
                                                                                    alt="Sibling"
                                                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid #fff' }}
                                                                                />
                                                                            </div>
                                                                            <div className="widget-user-details" style={{ flexGrow: 1, overflow: 'hidden' }}>
                                                                                <div className="pull-right">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-default btn-xs text-red"
                                                                                        title="Remove"
                                                                                        onClick={() => handleRemoveSibling(sibling.id)}
                                                                                        style={{ border: "none", background: "transparent" }}
                                                                                    >
                                                                                        <i className="fa fa-trash-o" style={{ fontSize: "16px" }}></i>
                                                                                    </button>
                                                                                </div>
                                                                                <h5 style={{ margin: '0', fontSize: '12px', color: '#888', fontWeight: '600' }}>
                                                                                    {sibling.class} ({sibling.section})
                                                                                </h5>
                                                                                <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                    {sibling.firstname} {sibling.lastname}
                                                                                </h4>
                                                                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#555' }}>
                                                                                    Adm No: <strong>{sibling.admission_no}</strong>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="row">
                                                <div className="col-md-12">
                                                </div>
                                            </div>



                                            {/* Fees Details Section */}
                                            <div className="tshadow mb25 bozero mainstudent">
                                                <h4 className="pagetitleh2">Fees Details
                                                    <span className="float-right bmedium total_fees_alloted">
                                                        {feeGroups
                                                            .filter(g => formData.fee_session_group_id.includes(g.id))
                                                            .reduce((sum, g) => sum + g.feetypes.reduce((s, f) => s + parseFloat(f.amount || 0), 0), 0)
                                                            .toFixed(2)}
                                                    </span>
                                                </h4>
                                                <div className="row around10">
                                                    <div className="col-md-12">
                                                        {/* Search Bar */}
                                                        <div className="form-group mb10" style={{ position: 'relative' }}>
                                                            <div className="input-group" style={{
                                                                display: 'flex',
                                                                flexWrap: 'wrap',
                                                                alignItems: 'center',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px',
                                                                padding: '2px 5px',
                                                                background: '#fff',
                                                                minHeight: '34px'
                                                            }}>
                                                                <span style={{ padding: '0 10px', color: '#555' }}><i className="fa fa-search"></i></span>

                                                                {/* Chips inside Search Bar */}
                                                                {feeGroups
                                                                    .filter(g => formData.fee_session_group_id.includes(g.id))
                                                                    .map(group => (
                                                                        <span key={group.id} className="label label-info" style={{
                                                                            margin: '2px',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            fontSize: '11px',
                                                                            padding: '4px 8px',
                                                                            borderRadius: '12px'
                                                                        }}>
                                                                            {group.group_name}
                                                                            <i className="fa fa-times" style={{ marginLeft: '5px', cursor: 'pointer' }}
                                                                                onClick={() => {
                                                                                    setFormData(prev => ({
                                                                                        ...prev,
                                                                                        fee_session_group_id: prev.fee_session_group_id.filter(id => id !== group.id)
                                                                                    }));
                                                                                }}></i>
                                                                        </span>
                                                                    ))
                                                                }

                                                                <input
                                                                    type="text"
                                                                    style={{
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        flex: 1,
                                                                        minWidth: '150px',
                                                                        height: '28px',
                                                                        padding: '0 5px'
                                                                    }}
                                                                    placeholder={formData.fee_session_group_id.length === 0 ? "Search Fee Group..." : ""}
                                                                    value={feeSearchTerm}
                                                                    onChange={(e) => {
                                                                        setFeeSearchTerm(e.target.value);
                                                                        setIsFeeDropdownOpen(true);
                                                                    }}
                                                                    onFocus={() => setIsFeeDropdownOpen(true)}
                                                                />
                                                            </div>
                                                            {isFeeDropdownOpen && (
                                                                <div className="fee-search-dropdown shadow no-scrollbar" style={{
                                                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                                                                    background: '#fff', border: '1px solid #ccc', maxHeight: '200px',
                                                                    overflowY: 'auto', borderRadius: '0 0 4px 4px',
                                                                    msOverflowStyle: 'none', scrollbarWidth: 'none'
                                                                }}>
                                                                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                                                                    {feeGroups
                                                                        .filter(g => !feeSearchTerm || g.group_name.toLowerCase().includes(feeSearchTerm.toLowerCase()))
                                                                        .map(g => (
                                                                            <div key={g.id} className="search-item" style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                                                                onMouseDown={() => {
                                                                                    setFormData(prev => {
                                                                                        const current = [...prev.fee_session_group_id];
                                                                                        if (!current.includes(g.id)) current.push(g.id);
                                                                                        return { ...prev, fee_session_group_id: current };
                                                                                    });
                                                                                    setFeeSearchTerm('');
                                                                                    setIsFeeDropdownOpen(false);
                                                                                }}>
                                                                                {g.group_name}
                                                                            </div>
                                                                        ))}
                                                                    {feeGroups.filter(g => !feeSearchTerm || g.group_name.toLowerCase().includes(feeSearchTerm.toLowerCase())).length === 0 && (
                                                                        <div style={{ padding: '8px 12px', color: '#888' }}>No matching fee groups</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {/* Backdrop to close dropdown */}
                                                            {isFeeDropdownOpen && (
                                                                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 999 }} onClick={() => setIsFeeDropdownOpen(false)} />
                                                            )}
                                                        </div>


                                                        <div className="table-responsive border0">
                                                            <table className="table mb0">
                                                                <tbody>
                                                                    {feeGroups.filter(g => formData.fee_session_group_id.includes(g.id)).map(group => (
                                                                        <tr key={group.id}>
                                                                            <td colSpan="3" className="mailbox-name white-space-nowrap border0">
                                                                                <div className="panel-group1 mb0">
                                                                                    <div className="panel panel-default1">
                                                                                        <div className="panel-heading pt5 pb5">
                                                                                            <h6 className="panel-title panel-title1 overflow-hidden">
                                                                                                <input className="fee_group_chk vertical-middle" type="checkbox" name="fee_session_group_id[]" value={group.id} onChange={(e) => {
                                                                                                    const checked = e.target.checked;
                                                                                                    setFormData(prev => {
                                                                                                        const current = [...prev.fee_session_group_id];
                                                                                                        if (checked) {
                                                                                                            if (!current.includes(group.id)) current.push(group.id);
                                                                                                        } else {
                                                                                                            return { ...prev, fee_session_group_id: current.filter(id => id !== group.id) };
                                                                                                        }
                                                                                                        return { ...prev, fee_session_group_id: current };
                                                                                                    });
                                                                                                }} checked={formData.fee_session_group_id.includes(group.id)} />
                                                                                                <a className={`display-inline box-plus-panel ${formData.fee_session_group_id.includes(group.id) ? '' : 'collapsed'}`} data-toggle="collapse" href={`#collapse_fees_${group.id}`} aria-expanded={formData.fee_session_group_id.includes(group.id)}>
                                                                                                    <span className="font14"> {group.group_name}</span>
                                                                                                </a>
                                                                                                <span className="float-right bmedium pt3 fee_group_total">
                                                                                                    {group.feetypes.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0).toFixed(2)}
                                                                                                </span>
                                                                                            </h6>
                                                                                        </div>
                                                                                        <div id={`collapse_fees_${group.id}`} className={`panel-collapse collapse ${formData.fee_session_group_id.includes(group.id) ? 'in' : ''}`}>
                                                                                            <div className="p10">
                                                                                                <table className="table table-hover table-condensed mb0">
                                                                                                    <thead>
                                                                                                        <tr className="bg-light">
                                                                                                            <th className="pl-65" style={{ width: '40%', borderTop: 'none' }}>Fees Type</th>
                                                                                                            <th style={{ width: '30%', borderTop: 'none' }}>Due Date</th>
                                                                                                            <th className="text-right" style={{ width: '30%', borderTop: 'none', paddingRight: '20px' }}>Amount ({schSetting?.currency_symbol || '$'})</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {group.feetypes.map(fee => (
                                                                                                            <tr key={fee.id}>
                                                                                                                <td className="pl-65" style={{ verticalAlign: 'middle' }}>{fee.type} ({fee.code})</td>
                                                                                                                <td style={{ verticalAlign: 'middle' }}>
                                                                                                                    <span className="text-muted"><i className="fa fa-calendar-o"></i> {fee.due_date || '0000-00-00'}</span>
                                                                                                                </td>
                                                                                                                <td className="text-right" style={{ verticalAlign: 'middle', paddingRight: '20px', fontWeight: 'bold' }}>
                                                                                                                    {fee.amount}
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        ))}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Transport Details */}
                                            {schSetting && schSetting.route_list === '1' && (
                                                <div className="tshadow mb25 bozero">
                                                    <h4 className="pagetitleh2">Transport Details</h4>
                                                    <div className="row around10">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Route List</label>
                                                                <select className="form-control" name="route_list" value={formData.route_list} onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    // Reset pickup points when route changes
                                                                    setPickupPoints([]);
                                                                    // In a real scenario, you'd fetch pickup points for the selected route/vehicle here
                                                                }}>
                                                                    <option value="">Select</option>
                                                                    {Object.values(vehRoutes).map(route => (
                                                                        <optgroup key={route.id} label={route.route_title}>
                                                                            {route.vehicles && route.vehicles.map(vehicle => (
                                                                                <option key={vehicle.vec_route_id} value={vehicle.vec_route_id}>
                                                                                    {vehicle.vehicle_no} ({vehicle.vehicle_model})
                                                                                </option>
                                                                            ))}
                                                                        </optgroup>
                                                                    ))}
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
                                                                <div className={`dropdown ${isMonthDropdownOpen ? 'open' : ''}`} style={{ position: 'relative' }}>
                                                                    <div
                                                                        className="form-control"
                                                                        onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                                                                        style={{ cursor: 'pointer', height: 'auto', minHeight: '34px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                                                                    >
                                                                        {formData.fees_month.length > 0
                                                                            ? formData.fees_month.join(', ')
                                                                            : 'Select Months'}
                                                                        <span className="caret pull-right" style={{ marginTop: '7px' }}></span>
                                                                    </div>
                                                                    {isMonthDropdownOpen && (
                                                                        <div className="dropdown-menu" style={{ display: 'block', width: '100%', maxHeight: '200px', overflowY: 'auto', padding: '10px' }}>
                                                                            {transportFeesList.map(tf => (
                                                                                <div key={tf.id} className="checkbox" style={{ margin: '5px 0' }}>
                                                                                    <label style={{ width: '100%', cursor: 'pointer' }}>
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            value={tf.month}
                                                                                            checked={formData.fees_month.includes(tf.month)}
                                                                                            onChange={(e) => {
                                                                                                const { checked, value } = e.target;
                                                                                                setFormData(prev => {
                                                                                                    const nextMonths = checked
                                                                                                        ? [...prev.fees_month, value]
                                                                                                        : prev.fees_month.filter(m => m !== value);
                                                                                                    return { ...prev, fees_month: nextMonths };
                                                                                                });
                                                                                            }}
                                                                                        />
                                                                                        {tf.month}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                            {transportFeesList.length === 0 && <div style={{ padding: '5px' }}>No months available</div>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {/* Close dropdown when clicking outside (not fully implemented in simple state, but will work for basic UX) */}
                                                                {isMonthDropdownOpen && <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 9 }} onClick={() => setIsMonthDropdownOpen(false)} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hostel Details */}
                                            {schSetting && schSetting.hostel_id === '1' && (
                                                <div className="tshadow mb25 bozero">
                                                    <h4 className="pagetitleh2">Hostel Details</h4>
                                                    <div className="row around10">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Hostel</label>
                                                                <select className="form-control" name="hostel" value={formData.hostel} onChange={handleInputChange}>
                                                                    <option value="">Select</option>
                                                                    {hostels.map(hostel => (
                                                                        <option key={hostel.id} value={hostel.id}>
                                                                            {hostel.hostel_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Room No</label>
                                                                <select className="form-control" name="room_no" value={formData.room_no} onChange={handleInputChange}>
                                                                    <option value="">Select</option>
                                                                    {hostelRooms.map(room => (
                                                                        <option key={room.id} value={room.id}>{room.room_no}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}


                                            {/* Parent Guardian Detail */}
                                            <h4 className="pagetitleh2">Parent Guardian Details</h4>
                                            <div className="row">
                                                {/* Father */}
                                                {schSetting && schSetting.father_name === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Name</label>
                                                            <input name="father_name" type="text" className="form-control" value={formData.father_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.father_phone === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Phone</label>
                                                            <input name="father_phone" type="text" className="form-control" value={formData.father_phone} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.father_occupation === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Occupation</label>
                                                            <input name="father_occupation" type="text" className="form-control" value={formData.father_occupation} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.father_pic === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Photo</label>
                                                            <input className="dropify" data-height="92" type='file' name='father_pic' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="row">
                                                {/* Mother */}
                                                {schSetting && schSetting.mother_name === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Name</label>
                                                            <input name="mother_name" type="text" className="form-control" value={formData.mother_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.mother_phone === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Phone</label>
                                                            <input name="mother_phone" type="text" className="form-control" value={formData.mother_phone} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.mother_occupation === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Occupation</label>
                                                            <input name="mother_occupation" type="text" className="form-control" value={formData.mother_occupation} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.mother_pic === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Photo</label>
                                                            <input className="dropify" data-height="92" type='file' name='mother_pic' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
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
                                                {schSetting && schSetting.guardian_name === '1' && (
                                                    <div className="col-md-6">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Guardian Name <small className="req"> *</small></label>
                                                                    <input name="guardian_name" type="text" className={`form-control ${formErrors.guardian_name ? 'border-danger' : ''}`} value={formData.guardian_name} onChange={handleInputChange} />
                                                                    {formErrors.guardian_name && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.guardian_name}</span>}
                                                                </div>
                                                            </div>
                                                            {schSetting && schSetting.guardian_relation === '1' && (
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Guardian Relation</label>
                                                                        <input name="guardian_relation" type="text" className="form-control" value={formData.guardian_relation} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="row">
                                                            {schSetting && schSetting.guardian_phone === '1' && (
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Guardian Phone <small className="req"> *</small></label>
                                                                        <input name="guardian_phone" type="text" className={`form-control ${formErrors.guardian_phone ? 'border-danger' : ''}`} value={formData.guardian_phone} onChange={handleInputChange} />
                                                                        {formErrors.guardian_phone && <span className="field-error" style={{ color: '#f44336', fontSize: '11px' }}>{formErrors.guardian_phone}</span>}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {schSetting && schSetting.guardian_occupation === '1' && (
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Guardian Occupation</label>
                                                                        <input name="guardian_occupation" type="text" className="form-control" value={formData.guardian_occupation} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {schSetting && schSetting.guardian_email === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Guardian Email</label>
                                                            <input name="guardian_email" type="text" className="form-control" value={formData.guardian_email} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.guardian_pic === '1' && (
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Guardian Photo</label>
                                                            <input className="dropify" data-height="92" type='file' name='guardian_pic' onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                )}
                                                {schSetting && schSetting.guardian_address === '1' && (
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Guardian Address</label>
                                                            <textarea name="guardian_address" className="form-control" rows="2" value={formData.guardian_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                )}
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
                                                    <div className="tshadow mb25 bozero">
                                                        <h4 className="pagetitleh2">Student Address Details</h4>
                                                        <div className="row around10">
                                                            {schSetting && schSetting.current_address === '1' && (
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
                                                            )}
                                                            {schSetting && schSetting.permanent_address === '1' && (
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
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Miscellaneous Details */}
                                                    {(schSetting && (schSetting.bank_account_no === '1' || schSetting.bank_name === '1' || schSetting.ifsc_code === '1' || schSetting.national_identification_no === '1' || schSetting.local_identification_no === '1' || schSetting.rte === '1' || schSetting.previous_school_details === '1' || schSetting.student_note === '1')) && (
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Miscellaneous Details</h4>
                                                            <div className="row around10">
                                                                {(schSetting.bank_account_no === '1' || schSetting.bank_name === '1' || schSetting.ifsc_code === '1') && (
                                                                    <>
                                                                        {schSetting.bank_account_no === '1' && (
                                                                            <div className="col-md-4">
                                                                                <div className="form-group">
                                                                                    <label>Bank Account Number</label>
                                                                                    <input name="bank_account_no" type="text" className="form-control" value={formData.bank_account_no} onChange={handleInputChange} />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {schSetting.bank_name === '1' && (
                                                                            <div className="col-md-4">
                                                                                <div className="form-group">
                                                                                    <label>Bank Name</label>
                                                                                    <input name="bank_name" type="text" className="form-control" value={formData.bank_name} onChange={handleInputChange} />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {schSetting.ifsc_code === '1' && (
                                                                            <div className="col-md-4">
                                                                                <div className="form-group">
                                                                                    <label>IFSC Code</label>
                                                                                    <input name="ifsc_code" type="text" className="form-control" value={formData.ifsc_code} onChange={handleInputChange} />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="row around10">
                                                                {schSetting.national_identification_no === '1' && (
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label>National Identification Number</label>
                                                                            <input name="national_identification_no" type="text" className="form-control" value={formData.national_identification_no} onChange={handleInputChange} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {schSetting.local_identification_no === '1' && (
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label>Local Identification Number</label>
                                                                            <input name="local_identification_no" type="text" className="form-control" value={formData.local_identification_no} onChange={handleInputChange} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {schSetting.rte === '1' && (
                                                                    <div className="col-md-4">
                                                                        <div className="form-group">
                                                                            <label>RTE</label>
                                                                            <select className="form-control" name="rte" value={formData.rte} onChange={handleInputChange}>
                                                                                <option value="Yes">Yes</option>
                                                                                <option value="No">No</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {schSetting.previous_school_details === '1' && (
                                                                    <div className="col-md-6">
                                                                        <div className="form-group">
                                                                            <label>Previous School Details</label>
                                                                            <textarea className="form-control" rows="3" name="previous_school" value={formData.previous_school} onChange={handleInputChange}></textarea>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {schSetting.student_note === '1' && (
                                                                    <div className="col-md-6">
                                                                        <div className="form-group">
                                                                            <label>Note</label>
                                                                            <textarea className="form-control" rows="3" name="note" value={formData.note} onChange={handleInputChange}></textarea>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Upload Documents */}
                                                    {schSetting && schSetting.upload_documents === '1' && (
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
                                                                                        <td><input type="text" name='fourth_title' className="form-control" value={formData.fourth_title} onChange={handleInputChange} /></td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type='file' name='fourth_doc' onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>4.</td>
                                                                                        <td><input type="text" name='fifth_title' className="form-control" value={formData.fifth_title} onChange={handleInputChange} /></td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type='file' name='fifth_doc' onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
            {isSiblingModalOpen && <SiblingModal isOpen={isSiblingModalOpen} onClose={() => setIsSiblingModalOpen(false)} onAddSibling={handleAddSibling} />}
        </div>
    );
};

export default StudentAdmission;
