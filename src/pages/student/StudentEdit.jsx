import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import SISLayout from './SISLayout';
import SiblingModal from '../../components/SiblingModal';
import '../../utils/include_files';
import './StudentSearch.css';

const StudentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [houses, setHouses] = useState([]);
    const [bloodGroups, setBloodGroups] = useState([]);
    const [hostelList, setHostelList] = useState([]);
    const [hostelRooms, setHostelRooms] = useState([]);
    const [vehRoutes, setVehRoutes] = useState([]);
    const [pickupPoints, setPickupPoints] = useState([]);
    const [transportFeesList, setTransportFeesList] = useState([]);
    const [feeGroups, setFeeGroups] = useState([]);
    const [schSetting, setSchSetting] = useState(null);
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [autofillCurrent, setAutofillCurrent] = useState(false);
    const [autofillPermanent, setAutofillPermanent] = useState(false);
    const [isSiblingModalOpen, setIsSiblingModalOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        admission_no: '',
        roll_no: '',
        class_id: '',
        section_id: '',
        firstname: '',
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
        school_house_id: '',
        height: '',
        weight: '',
        measurement_date: '',
        as_on_date: '',
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
        guardian_pic: null,
        guardian_address: '',
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
        vehroute_id: '',
        route_pickup_point_id: '',
        hostel_id: '',
        hostel_room_id: '',
        fees_month: [],
        fee_session_group_id: [],
        child_id: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [initialPhotoUrls, setInitialPhotoUrls] = useState({
        student_photo: '',
        father_pic: '',
        mother_pic: '',
        guardian_pic: ''
    });

    const [siblings, setSiblings] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, preDataRes] = await Promise.all([
                    api.getStudentEditDetails(id),
                    api.getStudentCreatePreData()
                ]);

                if (preDataRes && preDataRes.status === 'success' && preDataRes.data) {
                    const d = preDataRes.data;
                    setClasses(d.classlist || []);
                    setCategories(d.categorylist || []);
                    setHouses(d.houseList || d.houselist || []);
                    setBloodGroups(d.bloodgroupList ? (Array.isArray(d.bloodgroupList) ? d.bloodgroupList : Object.values(d.bloodgroupList)) : []);
                    setHostelList(d.hostellist ? (Array.isArray(d.hostellist) ? d.hostellist : Object.values(d.hostellist)) : []);
                    setVehRoutes(d.vehroutelist ? (Array.isArray(d.vehroutelist) ? d.vehroutelist : Object.values(d.vehroutelist)) : []);
                    setTransportFeesList(d.transport_fees || []);
                    setFeeGroups(d.feesessiongroup_model ? (Array.isArray(d.feesessiongroup_model) ? d.feesessiongroup_model : Object.values(d.feesessiongroup_model)) : []);
                    setSchSetting(d.sch_setting || null);
                }

                if (studentRes && studentRes.student_data) {
                    const s = studentRes.student_data.student;
                    const sibs = studentRes.student_data.siblings || [];
                    setSiblings(sibs);

                    // Fetch sections for current class
                    if (s.class_id) {
                        const secRes = await api.getSectionsByClass(s.class_id);
                        setSections(secRes.data || secRes || []);
                    }

                    // Fetch pickup points for current route
                    if (s.vehroute_id) {
                        const ppRes = await api.getPickupPointsByRoute(s.vehroute_id);
                        setPickupPoints(ppRes.data || ppRes || []);
                    }

                    // Fetch hostel rooms for current hostel
                    if (s.hostel_id) {
                        const roomRes = await api.getHostelRooms(s.hostel_id);
                        setHostelRooms(roomRes.data || roomRes || []);
                    }

                    setFormData(prev => ({
                        ...prev,
                        ...s,
                        national_identification_no: s.adhar_no || s.national_identification_no || '',
                        local_identification_no: s.samagra_id || s.local_identification_no || '',
                        fees_month: s.fees_month ? (Array.isArray(s.fees_month) ? s.fees_month : String(s.fees_month).split(',')) : [],
                        fee_session_group_id: s.fee_session_group_id ? (Array.isArray(s.fee_session_group_id) ? s.fee_session_group_id : String(s.fee_session_group_id).split(',')) : []
                    }));

                    setInitialPhotoUrls({
                        student_photo: s.image ? `${api.baseHost}/${s.image}` : '',
                        father_pic: s.father_pic ? `${api.baseHost}/${s.father_pic}` : '',
                        mother_pic: s.mother_pic ? `${api.baseHost}/${s.mother_pic}` : '',
                        guardian_pic: s.guardian_pic ? `${api.baseHost}/${s.guardian_pic}` : ''
                    });
                }
            } catch (err) {
                toast.error('Failed to load student details');
                console.error(err);
            } finally {
                setLoading(false);
                // Initialize Dropify after data is loaded and DOM is updated
                setTimeout(() => {
                    if (window.$ && window.$.fn.dropify) {
                        window.$('.dropify').dropify();
                    }
                }, 100);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = async (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'class_id') {
            setFormData(prev => ({ ...prev, section_id: '' }));
            if (value) {
                try {
                    const res = await api.getSectionsByClass(value);
                    setSections(res.data || res || []);
                } catch (error) {
                    setSections([]);
                }
            } else {
                setSections([]);
            }
        }

        if (name === 'vehroute_id') {
            setFormData(prev => ({ ...prev, route_pickup_point_id: '' }));
            if (value) {
                try {
                    const res = await api.getPickupPointsByRoute(value);
                    setPickupPoints(res.data || res || []);
                } catch (error) {
                    setPickupPoints([]);
                }
            } else {
                setPickupPoints([]);
            }
        }

        if (name === 'hostel_id') {
            setFormData(prev => ({ ...prev, hostel_room_id: '' }));
            if (value) {
                try {
                    const res = await api.getHostelRooms(value);
                    setHostelRooms(res.data || res || []);
                } catch (error) {
                    setHostelRooms([]);
                }
            } else {
                setHostelRooms([]);
            }
        }
    };

    const handleGuardianChange = (e) => {
        const { value } = e.target;
        setFormData(prev => {
            let updates = { guardian_is: value };
            if (value === 'father') {
                updates.guardian_name = prev.father_name;
                updates.guardian_phone = prev.father_phone;
                updates.guardian_occupation = prev.father_occupation;
                updates.guardian_relation = 'Father';
            } else if (value === 'mother') {
                updates.guardian_name = prev.mother_name;
                updates.guardian_phone = prev.mother_phone;
                updates.guardian_occupation = prev.mother_occupation;
                updates.guardian_relation = 'Mother';
            } else {
                updates.guardian_name = '';
                updates.guardian_phone = '';
                updates.guardian_occupation = '';
                updates.guardian_relation = '';
            }
            return { ...prev, ...updates };
        });
    };

    const handleAutofillGuardianAddress = (e) => {
        setAutofillCurrent(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, current_address: prev.guardian_address }));
        }
    };

    const handleAutofillPermanentAddress = (e) => {
        setAutofillPermanent(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
        }
    };

    const handleAddSibling = (sibling) => {
        setSiblings(prev => {
            if (prev.find(s => s.id === sibling.id)) return prev;
            return [...prev, sibling];
        });
        setFormData(prev => ({ ...prev, child_id: sibling.id }));
    };

    const handleRemoveSibling = (siblingId) => {
        setSiblings(prev => prev.filter(s => s.id !== siblingId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    if (key === 'fees_month') {
                        data.append('fees_month[]', formData[key]);
                    } else if (key === 'fee_session_group_id') {
                        formData[key].forEach(val => data.append('fee_session_group_id[]', val));
                    } else if (['dob', 'admission_date', 'measurement_date'].includes(key) && formData[key]) {
                        // Ensure date is in DD/MM/YYYY for API if it's in YYYY-MM-DD
                        const dateVal = formData[key];
                        if (dateVal.includes('-')) {
                            const [y, m, d] = dateVal.split('-');
                            data.append(key, `${d}/${m}/${y}`);
                        } else {
                            data.append(key, dateVal);
                        }
                    } else if (key === 'national_identification_no') {
                        data.append('adhar_no', formData[key]);
                    } else if (key === 'local_identification_no') {
                        data.append('samagra_id', formData[key]);
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            // Add siblings
            siblings.forEach((sib, index) => {
                data.append(`sibling_id[${index}]`, sib.id || sib.student_session_id);
            });

            const response = await api.updateStudent(id, data);
            if (response.status) {
                toast.success('Student details updated successfully');
                navigate(`/student/view/${id}`);
            } else {
                toast.error(response.message || 'Failed to update student');
            }
        } catch (err) {
            if (err.response && err.response.error) {
                setErrors(err.response.error);
                toast.error('Please fix the errors in the form');
            } else {
                toast.error(err.message || 'An error occurred while updating');
            }
        } finally {
            setSaving(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return '/images/no-image.png';
        if (path.startsWith('http')) return path;
        return `${api.baseHost}/${path}`;
    };

    if (loading) return <Loader />;

    return (
        <SISLayout activeTab="details">
            <div className="sis-content-container">
                <form onSubmit={handleSubmit} className="sis-main-form">
                    <div className="sis-form-card">
                        {/* 1. Academic Details Section */}
                        <div className="sis-form-section">
                            <div className="sis-section-header">
                                <i className="fa fa-university"></i>
                                <h4>Academic Details</h4>
                            </div>
                            <div className="sis-form-grid">
                                <div className={`sis-field-group ${errors.admission_no ? 'sis-field-error' : ''}`}>
                                    <label>Admission No <small className="req"> *</small></label>
                                    <input name="admission_no" type="text" value={formData.admission_no} onChange={handleInputChange} />
                                    {errors.admission_no && <span className="error-msg">{errors.admission_no}</span>}
                                </div>
                                <div className="sis-field-group">
                                    <label>Roll Number</label>
                                    <input name="roll_no" type="text" value={formData.roll_no} onChange={handleInputChange} />
                                </div>
                                <div className={`sis-field-group ${errors.class_id ? 'sis-field-error' : ''}`}>
                                    <label>Class <small className="req"> *</small></label>
                                    <select name="class_id" value={formData.class_id} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                    </select>
                                    {errors.class_id && <span className="error-msg">{errors.class_id}</span>}
                                </div>
                                <div className={`sis-field-group ${errors.section_id ? 'sis-field-error' : ''}`}>
                                    <label>Section <small className="req"> *</small></label>
                                    <select name="section_id" value={formData.section_id} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        {sections.map(sec => <option key={sec.section_id || sec.id} value={sec.section_id || sec.id}>{sec.section}</option>)}
                                    </select>
                                    {errors.section_id && <span className="error-msg">{errors.section_id}</span>}
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
                                <div className={`sis-field-group ${errors.firstname ? 'sis-field-error' : ''}`}>
                                    <label>First Name <small className="req"> *</small></label>
                                    <input name="firstname" type="text" value={formData.firstname} onChange={handleInputChange} />
                                    {errors.firstname && <span className="error-msg">{errors.firstname}</span>}
                                </div>
                                <div className="sis-field-group">
                                    <label>Last Name</label>
                                    <input name="lastname" type="text" value={formData.lastname} onChange={handleInputChange} />
                                </div>
                                <div className={`sis-field-group ${errors.gender ? 'sis-field-error' : ''}`}>
                                    <label>Gender <small className="req"> *</small></label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {errors.gender && <span className="error-msg">{errors.gender}</span>}
                                </div>
                                <div className={`sis-field-group ${errors.dob ? 'sis-field-error' : ''}`}>
                                    <label>Date Of Birth <small className="req"> *</small></label>
                                    <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                                    {errors.dob && <span className="error-msg">{errors.dob}</span>}
                                </div>
                                <div className="sis-field-group">
                                    <label>Category</label>
                                    <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
                                    </select>
                                </div>
                                <div className="sis-field-group">
                                    <label>Religion</label>
                                    <input name="religion" type="text" value={formData.religion} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Caste</label>
                                    <input name="cast" type="text" value={formData.cast} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Mobile Number</label>
                                    <input name="mobileno" type="text" value={formData.mobileno} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Email</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Admission Date</label>
                                    <input name="admission_date" type="date" value={formData.admission_date} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Blood Group</label>
                                    <select name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                                <div className="sis-field-group">
                                    <label>House</label>
                                    <select name="school_house_id" value={formData.school_house_id} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        {houses.map(house => <option key={house.id} value={house.id}>{house.house_name}</option>)}
                                    </select>
                                </div>
                                <div className="sis-field-group">
                                    <label>Height</label>
                                    <input name="height" type="text" value={formData.height} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Weight</label>
                                    <input name="weight" type="text" value={formData.weight} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Measurement Date</label>
                                    <input name="measurement_date" type="date" value={formData.measurement_date} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Child ID <small className="req"> *</small></label>
                                    <input name="child_id" type="text" value={formData.child_id} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Student Photo and Sibling Toggle - Matching StudentAdmission */}
                            <div className="row" style={{ marginTop: '32px' }}>
                                <div className="col-md-3">
                                    <div className="sis-field-group">
                                        <label>Student Photo</label>
                                        <input
                                            type="file"
                                            name="student_photo"
                                            className="dropify sis-dropify-compact"
                                            data-default-file={initialPhotoUrls.student_photo}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-8 d-flex align-items-end">
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        onClick={() => setIsSiblingModalOpen(true)}
                                        style={{ transform: 'translate(40px, 15px)', marginBottom: '10px' }}
                                    >
                                        <i className="fa fa-plus"></i> Add Sibling
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sibling List Section */}
                        {siblings.length > 0 && (
                            <div className="sis-form-section">
                                <div className="sis-section-header">
                                    <i className="fa fa-users"></i>
                                    <h4>Siblings</h4>
                                </div>
                                <div className="sis-sibling-grid">
                                    {siblings.map(sib => (
                                        <div key={sib.id || sib.student_session_id} className="sis-sibling-card">
                                            <img src={getImageUrl(sib.image)} alt="Sibling" />
                                            <div className="sis-sibling-info">
                                                <span className="sib-name">{sib.firstname} {sib.lastname}</span>
                                                <span className="sib-class">{sib.class} ({sib.section})</span>
                                                <span className="sib-adm">Adm No: {sib.admission_no}</span>
                                            </div>
                                            <button type="button" className="sib-remove-btn" onClick={() => handleRemoveSibling(sib.id)}>
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* 3. Parent/Guardian Details Section */}
                        <div className="sis-form-section">
                            <div className="sis-section-header">
                                <i className="fa fa-users"></i>
                                <h4>Parent/Guardian Details</h4>
                            </div>
                            <div className="sis-form-grid">
                                <div className="sis-field-group">
                                    <label>Father Name</label>
                                    <input name="father_name" type="text" value={formData.father_name} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Father Phone</label>
                                    <input name="father_phone" type="text" value={formData.father_phone} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Father Occupation</label>
                                    <input name="father_occupation" type="text" value={formData.father_occupation} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Father Photo</label>
                                    <input
                                        type="file"
                                        name="father_pic"
                                        className="dropify sis-dropify-compact"
                                        data-default-file={initialPhotoUrls.father_pic}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="sis-field-group">
                                    <label>Mother Name</label>
                                    <input name="mother_name" type="text" value={formData.mother_name} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Mother Phone</label>
                                    <input name="mother_phone" type="text" value={formData.mother_phone} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Mother Occupation</label>
                                    <input name="mother_occupation" type="text" value={formData.mother_occupation} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Mother Photo</label>
                                    <input
                                        type="file"
                                        name="mother_pic"
                                        className="dropify sis-dropify-compact"
                                        data-default-file={initialPhotoUrls.mother_pic}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="sis-guardian-is-section mt-4 d-flex align-items-center">
                                <label className="sis-label-primary mb-0" style={{ marginRight: '30px' }}>If Guardian Is <small className="req"> *</small></label>
                                <div className="sis-radio-group-row mb-0" style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingTop: '20px' }}>
                                    <label className="sis-radio-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="radio" name="guardian_is" value="father" checked={formData.guardian_is === 'father'} onChange={handleGuardianChange} style={{ margin: 0 }} />
                                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Father</span>
                                    </label>
                                    <label className="sis-radio-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="radio" name="guardian_is" value="mother" checked={formData.guardian_is === 'mother'} onChange={handleGuardianChange} style={{ margin: 0 }} />
                                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Mother</span>
                                    </label>
                                    <label className="sis-radio-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="radio" name="guardian_is" value="other" checked={formData.guardian_is === 'other'} onChange={handleGuardianChange} style={{ margin: 0 }} />
                                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Other</span>
                                    </label>
                                </div>
                            </div>

                            <div className="sis-form-grid mt-3">
                                <div className={`sis-field-group ${errors.guardian_name ? 'sis-field-error' : ''}`}>
                                    <label>Guardian Name <small className="req"> *</small></label>
                                    <input name="guardian_name" type="text" value={formData.guardian_name} onChange={handleInputChange} />
                                    {errors.guardian_name && <span className="error-msg">{errors.guardian_name}</span>}
                                </div>
                                <div className="sis-field-group">
                                    <label>Guardian Relation</label>
                                    <input name="guardian_relation" type="text" value={formData.guardian_relation} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Guardian Email</label>
                                    <input name="guardian_email" type="email" value={formData.guardian_email} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group">
                                    <label>Guardian Photo</label>
                                    <input
                                        type="file"
                                        name="guardian_pic"
                                        className="dropify sis-dropify-compact"
                                        data-default-file={initialPhotoUrls.guardian_pic}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={`sis-field-group ${errors.guardian_phone ? 'sis-field-error' : ''}`}>
                                    <label>Guardian Phone <small className="req"> *</small></label>
                                    <input name="guardian_phone" type="text" value={formData.guardian_phone} onChange={handleInputChange} />
                                    {errors.guardian_phone && <span className="error-msg">{errors.guardian_phone}</span>}
                                </div>
                                <div className="sis-field-group">
                                    <label>Guardian Occupation</label>
                                    <input name="guardian_occupation" type="text" value={formData.guardian_occupation} onChange={handleInputChange} />
                                </div>
                                <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Guardian Address</label>
                                    <textarea name="guardian_address" rows="2" value={formData.guardian_address} onChange={handleInputChange}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* More Details Toggle */}
                        <div className="sis-details-toggle-container">
                            <button
                                type="button"
                                className="sis-btn-details-toggle"
                                onClick={() => setShowMoreDetails(!showMoreDetails)}
                            >
                                <i className={`fa fa-${showMoreDetails ? 'chevron-up' : 'chevron-down'}`}></i>
                                {showMoreDetails ? 'Show Less Details' : 'Add More Details'}
                            </button>
                        </div>

                        {showMoreDetails && (
                            <div className="sis-collapsible-sections">
                                {/* Address Details */}
                                <div className="sis-form-section">
                                    <div className="sis-section-header">
                                        <i className="fa fa-map-marker"></i>
                                        <h4>Address Details</h4>
                                    </div>
                                    <div className="sis-form-grid">
                                        <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                            <div className="d-flex justify-content-between">
                                                <label>Current Address</label>
                                                <label className="sis-checkbox-mini">
                                                    <input type="checkbox" checked={autofillCurrent} onChange={handleAutofillGuardianAddress} />
                                                    <span>Same as Guardian</span>
                                                </label>
                                            </div>
                                            <textarea name="current_address" rows="3" value={formData.current_address} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                            <div className="d-flex justify-content-between">
                                                <label>Permanent Address</label>
                                                <label className="sis-checkbox-mini">
                                                    <input type="checkbox" checked={autofillPermanent} onChange={handleAutofillPermanentAddress} />
                                                    <span>Same as Current</span>
                                                </label>
                                            </div>
                                            <textarea name="permanent_address" rows="3" value={formData.permanent_address} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="sis-field-group">
                                            <label>City</label>
                                            <input name="city" type="text" value={formData.city} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>State</label>
                                            <input name="state" type="text" value={formData.state} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>Pincode</label>
                                            <input name="pincode" type="text" value={formData.pincode} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>

                                {/* Transport & Hostel Details */}
                                <div className="sis-form-section">
                                    <div className="sis-section-header">
                                        <i className="fa fa-bus"></i>
                                        <h4>Transport & Hostel</h4>
                                    </div>
                                    <div className="sis-form-grid">
                                        <div className="sis-field-group">
                                            <label>Route</label>
                                            <select name="vehroute_id" value={formData.vehroute_id} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {vehRoutes.map(route => (
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
                                            <select name="route_pickup_point_id" value={formData.route_pickup_point_id} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {pickupPoints.map(pp => <option key={pp.id} value={pp.id}>{pp.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="sis-field-group">
                                            <label>Hostel</label>
                                            <select name="hostel_id" value={formData.hostel_id} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {hostelList.map(h => <option key={h.id} value={h.id}>{h.hostel_name}</option>)}
                                            </select>
                                        </div>
                                        <div className="sis-field-group">
                                            <label>Room No</label>
                                            <select name="hostel_room_id" value={formData.hostel_room_id} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {hostelRooms.map(r => <option key={r.id} value={r.id}>{r.room_no} ({r.room_type})</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Miscellaneous Details */}
                                <div className="sis-form-section">
                                    <div className="sis-section-header">
                                        <i className="fa fa-list-alt"></i>
                                        <h4>Miscellaneous</h4>
                                    </div>
                                    <div className="sis-form-grid">
                                        <div className="sis-field-group">
                                            <label>Bank Account Number</label>
                                            <input name="bank_account_no" type="text" value={formData.bank_account_no} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>Bank Name</label>
                                            <input name="bank_name" type="text" value={formData.bank_name} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>IFSC Code</label>
                                            <input name="ifsc_code" type="text" value={formData.ifsc_code} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>Aadhar Number</label>
                                            <input name="national_identification_no" type="text" value={formData.national_identification_no} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>Samagra ID</label>
                                            <input name="local_identification_no" type="text" value={formData.local_identification_no} onChange={handleInputChange} />
                                        </div>
                                        <div className="sis-field-group">
                                            <label>RTE</label>
                                            <select name="rte" value={formData.rte} onChange={handleInputChange}>
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                        <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                            <label>Previous School Details</label>
                                            <textarea name="previous_school" rows="2" value={formData.previous_school} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="sis-field-group" style={{ gridColumn: 'span 2' }}>
                                            <label>Note</label>
                                            <textarea name="note" rows="2" value={formData.note} onChange={handleInputChange}></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="sis-form-footer">
                            <button type="button" className="btn btn-default" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn-premium-save" disabled={saving}>
                                {saving ? <><i className="fa fa-spinner fa-spin"></i> Updating...</> : <><i className="fa fa-check"></i> Update Student</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {isSiblingModalOpen && (
                <SiblingModal
                    isOpen={isSiblingModalOpen}
                    onClose={() => setIsSiblingModalOpen(false)}
                    onAddSibling={handleAddSibling}
                />
            )}
        </SISLayout>
    );
};

export default StudentEdit;
