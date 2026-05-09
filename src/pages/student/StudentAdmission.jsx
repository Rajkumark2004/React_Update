import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import SISLayout from './SISLayout';
import SiblingModal from '../../components/SiblingModal';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';
import './StudentSearch.css';

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
            const file = files[0];
            if (IMAGE_FIELDS.includes(name)) {
                const error = validateImageFile(file, name);
                if (error) {
                    setImageErrors(prev => ({ ...prev, [name]: error }));
                    e.target.value = '';
                    setFormData(prev => ({ ...prev, [name]: null }));
                    // Reset dropify preview if applicable
                    const $ = window.jQuery;
                    if ($ && $.fn && typeof $.fn.dropify === 'function') {
                        const dropify = $(e.target).data('dropify');
                        if (dropify) {
                            dropify.resetPreview();
                            dropify.clearElement();
                        }
                    }
                    return;
                }
                setImageErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
            }
            setFormData(prev => ({ ...prev, [name]: file }));
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
    const [imageErrors, setImageErrors] = useState({});

    const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
    const MIN_IMAGE_SIZE = 30 * 1024;
    const MAX_IMAGE_SIZE = 200 * 1024;
    const IMAGE_FIELDS = ['image', 'father_pic', 'mother_pic', 'guardian_pic'];

    const validateImageFile = (file, fieldName) => {
        if (!file) return null;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return 'Invalid format. Only PNG, JPG and JPEG are allowed.';
        }
        if (file.size < MIN_IMAGE_SIZE) {
            return `Minimum size is 30 KB. Selected file is ${(file.size / 1024).toFixed(1)} KB.`;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return `Maximum size is 200 KB. Selected file is ${(file.size / 1024).toFixed(1)} KB.`;
        }
        return null;
    };

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
                        if (key === 'room_no') {
                            data.append('hostel_room_id', value);
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
        <SISLayout activeTab="none">
            {initialLoading ? (
                <Loader />
            ) : (
                <div className="sis-content-container">
                    <form id="form1" method="post" acceptCharset="utf-8" encType="multipart/form-data" onSubmit={handleSubmit}>
                        
                        {errorMessage && (
                            <div className="alert alert-danger alert-dismissible" style={{ borderRadius: '12px', marginBottom: '24px', border: 'none', background: '#fef2f2', color: '#991b1b' }}>
                                <button type="button" className="close" onClick={() => setErrorMessage('')} style={{ opacity: 0.5 }}>×</button>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}><i className="icon fa fa-ban"></i> Error!</h4>
                                {errorMessage}
                            </div>
                        )}                        {/* Unified Form Card */}
                        <div className="sis-form-card" style={{ padding: '0 32px' }}>
                            {/* 1. Academic Details Section */}
                            <div className="sis-form-section" style={{ borderTop: 'none', paddingTop: '32px' }}>
                                <div className="sis-section-header">
                                    <i className="fa fa-graduation-cap"></i>
                                    <h4>Academic Details</h4>
                                </div>
                                <div className="sis-form-grid">
                                    <div className="sis-field-group">
                                        <label>Admission No <small className="req">*</small></label>
                                        <input autoFocus="" name="admission_no" type="text" className={formErrors.admission_no ? 'border-danger' : ''} value={formData.admission_no} onChange={handleInputChange} placeholder="Enter Admission No" />
                                        {formErrors.admission_no && <span className="sis-field-error">{formErrors.admission_no}</span>}
                                    </div>
                                    {schSetting && schSetting.roll_no === '1' && (
                                        <div className="sis-field-group">
                                            <label>Roll Number</label>
                                            <input name="roll_no" type="text" value={formData.roll_no} onChange={handleInputChange} placeholder="Enter Roll Number" />
                                        </div>
                                    )}
                                    <div className="sis-field-group">
                                        <label>Class <small className="req">*</small></label>
                                        <select
                                            id="class_id"
                                            name="class_id"
                                            className={formErrors.class_id ? 'border-danger' : ''}
                                            value={formData.class_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                        </select>
                                        {formErrors.class_id && <span className="sis-field-error">{formErrors.class_id}</span>}
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Section <small className="req">*</small></label>
                                        <select
                                            id="section_id"
                                            name="section_id"
                                            className={formErrors.section_id ? 'border-danger' : ''}
                                            value={formData.section_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Section</option>
                                            {sections.map(sec => <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>)}
                                        </select>
                                        {formErrors.section_id && <span className="sis-field-error">{formErrors.section_id}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Personal Details Section */}
                            <div className="sis-form-section">
                                <div className="sis-section-header">
                                    <i className="fa fa-user"></i>
                                    <h4>Personal Details</h4>
                                </div>
                                <div className="sis-form-grid">
                                    <div className="sis-field-group">
                                        <label>First Name <small className="req">*</small></label>
                                        <input name="firstname" type="text" className={formErrors.firstname ? 'border-danger' : ''} value={formData.firstname} onChange={handleInputChange} placeholder="First Name" />
                                        {formErrors.firstname && <span className="sis-field-error">{formErrors.firstname}</span>}
                                    </div>
                                    {schSetting && schSetting.lastname === '1' && (
                                        <div className="sis-field-group">
                                            <label>Last Name</label>
                                            <input name="lastname" type="text" value={formData.lastname} onChange={handleInputChange} placeholder="Last Name" />
                                        </div>
                                    )}
                                    <div className="sis-field-group">
                                        <label>Gender <small className="req">*</small></label>
                                        <select className={formErrors.gender ? 'border-danger' : ''} name="gender" value={formData.gender} onChange={handleInputChange}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        {formErrors.gender && <span className="sis-field-error">{formErrors.gender}</span>}
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Date Of Birth <small className="req">*</small></label>
                                        <input name="dob" type="date" className={formErrors.dob ? 'border-danger' : ''} value={formData.dob} onChange={handleInputChange} />
                                        {formErrors.dob && <span className="sis-field-error">{formErrors.dob}</span>}
                                    </div>

                                    {schSetting && schSetting.category === '1' && (
                                        <div className="sis-field-group">
                                            <label>Category</label>
                                            <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
                                                <option value="">Select Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.category}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {schSetting && schSetting.religion === '1' && (
                                        <div className="sis-field-group">
                                            <label>Religion</label>
                                            <input name="religion" type="text" value={formData.religion} onChange={handleInputChange} placeholder="Religion" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.cast === '1' && (
                                        <div className="sis-field-group">
                                            <label>Caste</label>
                                            <input name="cast" type="text" value={formData.cast} onChange={handleInputChange} placeholder="Caste" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.mobile_no === '1' && (
                                        <div className="sis-field-group">
                                            <label>Mobile Number</label>
                                            <input name="mobileno" type="text" value={formData.mobileno} onChange={handleInputChange} placeholder="Mobile Number" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.student_email === '1' && (
                                        <div className="sis-field-group">
                                            <label>Email</label>
                                            <input name="email" type="text" value={formData.email} onChange={handleInputChange} placeholder="Email Address" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.admission_date === '1' && (
                                        <div className="sis-field-group">
                                            <label>Admission Date</label>
                                            <input name="admission_date" type="date" value={formData.admission_date} onChange={handleInputChange} />
                                        </div>
                                    )}
                                    <div className="sis-field-group">
                                        <label>Class Of Admission</label>
                                        <input name="class_of_admission" type="text" value={formData.class_of_admission} onChange={handleInputChange} placeholder="Class of Admission" />
                                    </div>
                                    {schSetting && schSetting.is_blood_group === '1' && (
                                        <div className="sis-field-group">
                                            <label>Blood Group</label>
                                            <select name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                                <option value="">Select Blood Group</option>
                                                {bloodGroups.map(bg => (
                                                    <option key={bg} value={bg}>{bg}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {schSetting && schSetting.is_student_house === '1' && (
                                        <div className="sis-field-group">
                                            <label>House</label>
                                            <select name="house" value={formData.house} onChange={handleInputChange}>
                                                <option value="">Select House</option>
                                                {houses.map(house => (
                                                    <option key={house.id} value={house.id}>{house.house_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {schSetting && schSetting.student_height === '1' && (
                                        <div className="sis-field-group">
                                            <label>Height</label>
                                            <input name="height" type="text" value={formData.height} onChange={handleInputChange} placeholder="Height" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.student_weight === '1' && (
                                        <div className="sis-field-group">
                                            <label>Weight</label>
                                            <input name="weight" type="text" value={formData.weight} onChange={handleInputChange} placeholder="Weight" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.measurement_date === '1' && (
                                        <div className="sis-field-group">
                                            <label>Measurement Date</label>
                                            <input name="measurement_date" type="date" value={formData.measurement_date} onChange={handleInputChange} />
                                        </div>
                                    )}
                                    <div className="sis-field-group">
                                        <label>Child ID <small className="req">*</small></label>
                                        <input name="child_id" type="text" className={formErrors.child_id ? 'border-danger' : ''} value={formData.child_id} onChange={handleInputChange} placeholder="Child ID" />
                                        {formErrors.child_id && <span className="sis-field-error">{formErrors.child_id}</span>}
                                    </div>
                                </div>

                                {/* Student Photo and Sibling Toggle */}
                                <div className="row" style={{ marginTop: '32px' }}>
                                    {schSetting && schSetting.student_photo === '1' && (
                                        <div className="col-md-6">
                                            <div className="sis-field-group">
                                                <label>Student Photo</label>
                                                <input className="dropify" type='file' name='image' accept=".png,.jpg,.jpeg" onChange={handleInputChange} />
                                                {imageErrors.image && <span className="sis-field-error" style={{ display: 'block', marginTop: '4px' }}>{imageErrors.image}</span>}
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-md-6" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                                        <button type="button" className="btn btn-default" onClick={() => setIsSiblingModalOpen(true)} style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '600', color: '#7c3aed', border: '1px solid #7c3aed', background: '#f5f3ff' }}>
                                            <i className="fa fa-plus"></i> Add Sibling
                                        </button>
                                    </div>
                                </div>

                                {siblings && siblings.length > 0 && (
                                    <div className="sis-sibling-list" style={{ marginTop: '24px' }}>
                                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Added Siblings</h5>
                                        <div className="row">
                                            {siblings.map((sibling, index) => (
                                                <div className="col-md-4" key={sibling.id || sibling.student_session_id || index}>
                                                    <div className="sis-sibling-item">
                                                        <div className="sis-sibling-info">
                                                            <i className="fa fa-user-circle"></i>
                                                            <div className="sis-sibling-name">
                                                                {sibling.firstname} {sibling.lastname}
                                                                <div style={{ fontSize: '12px', color: '#64748b' }}>Adm No: {sibling.admission_no}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-link text-danger p-0"
                                                            onClick={() => handleRemoveSibling(sibling.id)}
                                                        >
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. Fees Details Section */}
                            <div className="sis-form-section">
                                <div className="sis-section-header">
                                    <i className="fa fa-money"></i>
                                    <h4>Fees Details</h4>
                                    <div style={{ marginLeft: 'auto', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                        {schSetting?.currency_symbol || '₹'} {feeGroups
                                            .filter(g => formData.fee_session_group_id.includes(g.id))
                                            .reduce((sum, g) => sum + g.feetypes.reduce((s, f) => s + parseFloat(f.amount || 0), 0), 0)
                                            .toFixed(2)}
                                    </div>
                                </div>
                                
                                <div className="sis-field-group" style={{ marginBottom: '20px' }}>
                                    <div className="sis-search-main-input-wrapper" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <i className="fa fa-search sis-search-icon"></i>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1, alignItems: 'center' }}>
                                            {feeGroups
                                                .filter(g => formData.fee_session_group_id.includes(g.id))
                                                .map(group => (
                                                    <span key={group.id} style={{ background: '#7c3aed', color: '#ffffff', fontSize: '12px', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {group.group_name}
                                                        <i className="fa fa-times" style={{ cursor: 'pointer', fontSize: '10px' }} onClick={() => {
                                                            setFormData(prev => ({ ...prev, fee_session_group_id: prev.fee_session_group_id.filter(id => id !== group.id) }));
                                                        }}></i>
                                                    </span>
                                                ))
                                            }
                                            <input
                                                type="text"
                                                className="sis-search-input"
                                                placeholder={formData.fee_session_group_id.length === 0 ? "Search and assign fee groups..." : ""}
                                                value={feeSearchTerm}
                                                onChange={(e) => {
                                                    setFeeSearchTerm(e.target.value);
                                                    setIsFeeDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsFeeDropdownOpen(true)}
                                                style={{ minWidth: '200px', background: 'transparent' }}
                                            />
                                        </div>
                                        {isFeeDropdownOpen && (
                                            <div className="shadow" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                                {feeGroups
                                                    .filter(g => !feeSearchTerm || g.group_name.toLowerCase().includes(feeSearchTerm.toLowerCase()))
                                                    .map(g => (
                                                        <div key={g.id} className="p-2" style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}
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
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {feeGroups.filter(g => formData.fee_session_group_id.includes(g.id)).length > 0 && (
                                    <div className="table-responsive" style={{ border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                                        <table className="table table-hover mb-0">
                                            <thead style={{ background: '#f8fafc' }}>
                                                <tr>
                                                    <th style={{ width: '40%' }}>Group Name / Fee Type</th>
                                                    <th style={{ width: '30%' }}>Due Date</th>
                                                    <th className="text-right" style={{ width: '30%' }}>Amount ({schSetting?.currency_symbol || '₹'})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {feeGroups.filter(g => formData.fee_session_group_id.includes(g.id)).map(group => (
                                                    <React.Fragment key={group.id}>
                                                        <tr style={{ background: '#f5f3ff' }}>
                                                            <td colSpan="2" style={{ fontWeight: '600', color: '#7c3aed' }}>
                                                                <i className="fa fa-folder-open-o" style={{ marginRight: '8px' }}></i> {group.group_name}
                                                            </td>
                                                            <td className="text-right" style={{ fontWeight: '700', color: '#7c3aed' }}>
                                                                {group.feetypes.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                        {group.feetypes.map(fee => (
                                                            <tr key={fee.id}>
                                                                <td style={{ paddingLeft: '40px', fontSize: '13px' }}>{fee.type} ({fee.code})</td>
                                                                <td style={{ fontSize: '13px', color: '#64748b' }}>
                                                                    <i className="fa fa-calendar-o" style={{ marginRight: '6px' }}></i> {fee.due_date || '0000-00-00'}
                                                                </td>
                                                                <td className="text-right" style={{ fontSize: '13px', fontWeight: '500' }}>{fee.amount}</td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* 4. Parent/Guardian Details Section */}
                            <div className="sis-form-section">
                                <div className="sis-section-header">
                                    <i className="fa fa-users"></i>
                                    <h4>Parent/Guardian Details</h4>
                                </div>
                                
                                {/* Father/Mother section */}
                                <div className="sis-form-grid" style={{ marginBottom: '32px' }}>
                                    {schSetting && schSetting.father_name === '1' && (
                                        <div className="sis-field-group">
                                            <label>Father Name</label>
                                            <input name="father_name" type="text" value={formData.father_name} onChange={handleInputChange} placeholder="Father Name" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.father_phone === '1' && (
                                        <div className="sis-field-group">
                                            <label>Father Phone</label>
                                            <input name="father_phone" type="text" value={formData.father_phone} onChange={handleInputChange} placeholder="Father Phone" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.father_occupation === '1' && (
                                        <div className="sis-field-group">
                                            <label>Father Occupation</label>
                                            <input name="father_occupation" type="text" value={formData.father_occupation} onChange={handleInputChange} placeholder="Occupation" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.father_pic === '1' && (
                                        <div className="sis-field-group">
                                            <label>Father Photo</label>
                                            <input className="dropify" data-height="27" type='file' name='father_pic' accept=".png,.jpg,.jpeg" onChange={handleInputChange} />
                                        </div>
                                    )}

                                    {schSetting && schSetting.mother_name === '1' && (
                                        <div className="sis-field-group">
                                            <label>Mother Name</label>
                                            <input name="mother_name" type="text" value={formData.mother_name} onChange={handleInputChange} placeholder="Mother Name" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.mother_phone === '1' && (
                                        <div className="sis-field-group">
                                            <label>Mother Phone</label>
                                            <input name="mother_phone" type="text" value={formData.mother_phone} onChange={handleInputChange} placeholder="Mother Phone" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.mother_occupation === '1' && (
                                        <div className="sis-field-group">
                                            <label>Mother Occupation</label>
                                            <input name="mother_occupation" type="text" value={formData.mother_occupation} onChange={handleInputChange} placeholder="Occupation" />
                                        </div>
                                    )}
                                    {schSetting && schSetting.mother_pic === '1' && (
                                        <div className="sis-field-group">
                                            <label>Mother Photo</label>
                                            <input className="dropify" data-height="27" type='file' name='mother_pic' accept=".png,.jpg,.jpeg" onChange={handleInputChange} />
                                        </div>
                                    )}
                                </div>

                                {/* Guardian Selection */}
                                <div className="sis-field-group" style={{ marginBottom: '24px' }}>
                                    <label style={{ marginBottom: '12px' }}>If Guardian Is <small className="req">*</small></label>
                                    <div className="sis-radio-group-row">
                                        <div className="sis-radio-item">
                                            <input type="radio" id="g_father" name="guardian_is" value="father" checked={formData.guardian_is === 'father'} onChange={handleGuardianChange} />
                                            <label htmlFor="g_father">Father</label>
                                        </div>
                                        <div className="sis-radio-item">
                                            <input type="radio" id="g_mother" name="guardian_is" value="mother" checked={formData.guardian_is === 'mother'} onChange={handleGuardianChange} />
                                            <label htmlFor="g_mother">Mother</label>
                                        </div>
                                        <div className="sis-radio-item">
                                            <input type="radio" id="g_other" name="guardian_is" value="other" checked={formData.guardian_is === 'other'} onChange={handleGuardianChange} />
                                            <label htmlFor="g_other">Other</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="sis-form-grid">
                                    <div className="sis-field-group">
                                        <label>Guardian Name <small className="req">*</small></label>
                                        <input name="guardian_name" type="text" className={formErrors.guardian_name ? 'border-danger' : ''} value={formData.guardian_name} onChange={handleInputChange} placeholder="Guardian Name" />
                                        {formErrors.guardian_name && <span className="sis-field-error">{formErrors.guardian_name}</span>}
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Guardian Relation</label>
                                        <input name="guardian_relation" type="text" value={formData.guardian_relation} onChange={handleInputChange} placeholder="Relation" />
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Guardian Phone <small className="req">*</small></label>
                                        <input name="guardian_phone" type="text" className={formErrors.guardian_phone ? 'border-danger' : ''} value={formData.guardian_phone} onChange={handleInputChange} placeholder="Phone Number" />
                                        {formErrors.guardian_phone && <span className="sis-field-error">{formErrors.guardian_phone}</span>}
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Guardian Email</label>
                                        <input name="guardian_email" type="text" value={formData.guardian_email} onChange={handleInputChange} placeholder="Email" />
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Guardian Occupation</label>
                                        <input name="guardian_occupation" type="text" value={formData.guardian_occupation} onChange={handleInputChange} placeholder="Occupation" />
                                    </div>
                                    <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Guardian Address</label>
                                        <textarea name="guardian_address" rows="1" value={formData.guardian_address} onChange={handleInputChange} placeholder="Full Address"></textarea>
                                    </div>
                                    <div className="sis-field-group">
                                        <label>Guardian Photo</label>
                                        <input className="dropify" data-height="27" type='file' name='guardian_pic' accept=".png,.jpg,.jpeg" onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* More Details Toggle */}
                            <div className="sis-details-toggle" onClick={() => setShowMoreDetails(!showMoreDetails)}>
                                <span>
                                    <i className={`fa ${showMoreDetails ? 'fa-minus-circle' : 'fa-plus-circle'}`}></i>
                                    {showMoreDetails ? 'Hide Additional Details' : 'Add More Details (Address, Transport, Hostel, Misc, Documents)'}
                                </span>
                            </div>

                            {showMoreDetails && (
                                <div className="sis-more-details-container">
                                    
                                    {/* 5. Address Details Section */}
                                    <div className="sis-form-section">
                                        <div className="sis-section-header">
                                            <i className="fa fa-map-marker"></i>
                                            <h4>Address Details</h4>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="sis-checkbox-group">
                                                    <input type="checkbox" id="autofill_current" checked={autofillCurrent} onChange={handleAutofillGuardianAddress} />
                                                    <label htmlFor="autofill_current">Same as Guardian Address</label>
                                                </div>
                                                <div className="sis-field-group">
                                                    <label>Current Address</label>
                                                    <textarea name="current_address" rows="3" value={formData.current_address} onChange={handleInputChange} placeholder="Enter Current Address"></textarea>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="sis-checkbox-group">
                                                    <input type="checkbox" id="autofill_permanent" checked={autofillPermanent} onChange={handleAutofillPermanentAddress} />
                                                    <label htmlFor="autofill_permanent">Same as Current Address</label>
                                                </div>
                                                <div className="sis-field-group">
                                                    <label>Permanent Address</label>
                                                    <textarea name="permanent_address" rows="3" value={formData.permanent_address} onChange={handleInputChange} placeholder="Enter Permanent Address"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Transport & Hostel Details Section */}
                                    {(schSetting?.route_list === '1' || schSetting?.hostel_id === '1') && (
                                        <div className="sis-form-section">
                                            <div className="sis-section-header">
                                                <i className="fa fa-bus"></i>
                                                <h4>Transport & Hostel</h4>
                                            </div>
                                            <div className="sis-form-grid">
                                                {schSetting?.route_list === '1' && (
                                                    <>
                                                        <div className="sis-field-group">
                                                            <label>Route List</label>
                                                            <select name="route_list" value={formData.route_list} onChange={(e) => {
                                                                handleInputChange(e);
                                                                setPickupPoints([]);
                                                            }}>
                                                                <option value="">Select Route</option>
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
                                                        <div className="sis-field-group">
                                                            <label>Pickup Point</label>
                                                            <select name="pickup_point" value={formData.pickup_point} onChange={handleInputChange}>
                                                                <option value="">Select Point</option>
                                                                <option value="Point A">Point A</option>
                                                                <option value="Point B">Point B</option>
                                                            </select>
                                                        </div>
                                                        <div className="sis-field-group">
                                                            <label>Fees Month</label>
                                                            <div className="dropdown" style={{ position: 'relative' }}>
                                                                <div className="form-control" onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)} style={{ cursor: 'pointer', height: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                                                                    <span style={{ fontSize: '14px', color: formData.fees_month.length > 0 ? '#1e293b' : '#94a3b8' }}>
                                                                        {formData.fees_month.length > 0 ? formData.fees_month.join(', ') : 'Select Months'}
                                                                    </span>
                                                                    <i className="fa fa-caret-down"></i>
                                                                </div>
                                                                {isMonthDropdownOpen && (
                                                                    <div className="shadow" style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 1000, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', padding: '8px' }}>
                                                                        {transportFeesList.map(tf => (
                                                                            <div key={tf.id} className="sis-checkbox-group" style={{ margin: '4px 0' }}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`month_${tf.id}`}
                                                                                    value={tf.month}
                                                                                    checked={formData.fees_month.includes(tf.month)}
                                                                                    onChange={(e) => {
                                                                                        const { checked, value } = e.target;
                                                                                        setFormData(prev => ({
                                                                                            ...prev,
                                                                                            fees_month: checked ? [...prev.fees_month, value] : prev.fees_month.filter(m => m !== value)
                                                                                        }));
                                                                                    }}
                                                                                />
                                                                                <label htmlFor={`month_${tf.id}`}>{tf.month}</label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {isMonthDropdownOpen && <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 999 }} onClick={() => setIsMonthDropdownOpen(false)} />}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {schSetting?.hostel_id === '1' && (
                                                    <>
                                                        <div className="sis-field-group">
                                                            <label>Hostel</label>
                                                            <select name="hostel" value={formData.hostel} onChange={handleInputChange}>
                                                                <option value="">Select Hostel</option>
                                                                {hostels.map(hostel => <option key={hostel.id} value={hostel.id}>{hostel.hostel_name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="sis-field-group">
                                                            <label>Room No</label>
                                                            <select name="room_no" value={formData.room_no} onChange={handleInputChange}>
                                                                <option value="">Select Room</option>
                                                                {hostelRooms.map(room => <option key={room.id} value={room.id}>{room.room_no}</option>)}
                                                            </select>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 7. Miscellaneous Details Section */}
                                    <div className="sis-form-section">
                                        <div className="sis-section-header">
                                            <i className="fa fa-th-large"></i>
                                            <h4>Miscellaneous</h4>
                                        </div>
                                        <div className="sis-form-grid">
                                            {schSetting?.bank_account_no === '1' && (
                                                <div className="sis-field-group">
                                                    <label>Bank Account Number</label>
                                                    <input name="bank_account_no" type="text" value={formData.bank_account_no} onChange={handleInputChange} placeholder="Bank Account No" />
                                                </div>
                                            )}
                                            {schSetting?.bank_name === '1' && (
                                                <div className="sis-field-group">
                                                    <label>Bank Name</label>
                                                    <input name="bank_name" type="text" value={formData.bank_name} onChange={handleInputChange} placeholder="Bank Name" />
                                                </div>
                                            )}
                                            {schSetting?.ifsc_code === '1' && (
                                                <div className="sis-field-group">
                                                    <label>IFSC Code</label>
                                                    <input name="ifsc_code" type="text" value={formData.ifsc_code} onChange={handleInputChange} placeholder="IFSC Code" />
                                                </div>
                                            )}
                                            {schSetting?.national_identification_no === '1' && (
                                                <div className="sis-field-group">
                                                    <label>National ID No</label>
                                                    <input name="national_identification_no" type="text" value={formData.national_identification_no} onChange={handleInputChange} placeholder="National ID" />
                                                </div>
                                            )}
                                            {schSetting?.local_identification_no === '1' && (
                                                <div className="sis-field-group">
                                                    <label>Local ID No</label>
                                                    <input name="local_identification_no" type="text" value={formData.local_identification_no} onChange={handleInputChange} placeholder="Local ID" />
                                                </div>
                                            )}
                                            {schSetting?.rte === '1' && (
                                                <div className="sis-field-group">
                                                    <label>RTE</label>
                                                    <select name="rte" value={formData.rte} onChange={handleInputChange}>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Previous School Details</label>
                                                <textarea name="previous_school" rows="1" value={formData.previous_school} onChange={handleInputChange} placeholder="Previous School info"></textarea>
                                            </div>
                                            <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Note</label>
                                                <textarea name="note" rows="1" value={formData.note} onChange={handleInputChange} placeholder="Additional Notes"></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 8. Upload Documents Section */}
                                    {schSetting?.upload_documents === '1' && (
                                        <div className="sis-form-section">
                                            <div className="sis-section-header">
                                                <i className="fa fa-file-text-o"></i>
                                                <h4>Upload Documents</h4>
                                            </div>
                                            <div className="row">
                                                {[
                                                    { num: 1, titleKey: 'first_title', docKey: 'first_doc' },
                                                    { num: 2, titleKey: 'second_title', docKey: 'second_doc' },
                                                    { num: 3, titleKey: 'third_title', docKey: 'third_doc' },
                                                    { num: 4, titleKey: 'fourth_title', docKey: 'fourth_doc' }
                                                ].map((doc, idx) => (
                                                    <div className="col-md-3" key={idx}>
                                                        <div className="sis-field-group" style={{ marginBottom: '16px' }}>
                                                            <label>Doc {doc.num} Title</label>
                                                            <input type="text" name={doc.titleKey} value={formData[doc.titleKey]} onChange={handleInputChange} placeholder="Document Title" />
                                                        </div>
                                                        <input className="dropify" data-height="80" type='file' name={doc.docKey} onChange={handleInputChange} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        <div className="sis-form-footer">
                            <Link to="/student/search" className="btn btn-default" style={{ borderRadius: '8px', padding: '12px 24px', fontWeight: '600' }}>Cancel</Link>
                            <button type="submit" className="btn-premium-save" disabled={loading}>
                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Saving Record...</> : 'Save Student Admission'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {isSiblingModalOpen && <SiblingModal isOpen={isSiblingModalOpen} onClose={() => setIsSiblingModalOpen(false)} onAddSibling={handleAddSibling} />}
        </SISLayout>
    );
};

export default StudentAdmission;
