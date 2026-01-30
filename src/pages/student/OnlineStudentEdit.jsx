import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SiblingModal from '../../components/SiblingModal';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import '../../utils/include_files';

const OnlineStudentEdit = () => {
    const { id } = useParams();
    const [isSiblingModalOpen, setIsSiblingModalOpen] = useState(false);
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

    // Fetch dropdown data and mock student data for editing
    useEffect(() => {
        const fetchData = async () => {
            // Fetch classes
            try {
                const classesRes = await api.getClasses();
                if (classesRes && classesRes.status && classesRes.data) {
                    // Classes are in data.class_sections
                    if (classesRes.data.class_sections && Array.isArray(classesRes.data.class_sections)) {
                        setClasses(classesRes.data.class_sections);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            }

            // Fetch sections
            try {
                const sectionsRes = await api.getSections();
                if (sectionsRes && sectionsRes.status && sectionsRes.data) {
                    setSections(sectionsRes.data);
                }
            } catch (err) {
                console.warn('Failed to fetch sections:', err);
            }

            // Simulating API fetch for student data
            if (id) {
                const mockData = {
                    admission_no: '12345',
                    roll_no: '101',
                    class_id: '1',
                    section_id: '1',
                    firstname: 'John',
                    lastname: 'Doe',
                    gender: 'Male',
                    dob: '2015-05-15',
                    category_id: '1',
                    religion: 'Christian',
                    mobileno: '9876543210',
                    email: 'john.doe@example.com',
                    admission_date: '2023-04-01',
                    guardian_is: 'father',
                    father_name: 'Robert Doe',
                    father_phone: '9876543210',
                    father_occupation: 'Engineer',
                };
                setFormData(prev => ({ ...prev, ...mockData }));
            }
        };
        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
                    $('.dropify').dropify();
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <form id="form1" method="post" acceptCharset="utf-8" encType="multipart/form-data">
                                    <div className="border0">
                                        <div className="bozero">
                                            <h3 className="pagetitleh-whitebg">Edit Online Admission</h3>
                                            <div className="around10">

                                                {/* Core Profile */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Admission No <small className="req"> *</small></label>
                                                            <input autoFocus="" name="admission_no" type="text" className="form-control" value={formData.admission_no} onChange={handleInputChange} />
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
                                                            <select name="class_id" className="form-control" value={formData.class_id} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Section <small className="req"> *</small></label>
                                                            <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.section}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>First Name <small className="req"> *</small></label>
                                                            <input name="firstname" type="text" className="form-control" value={formData.firstname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input name="lastname" type="text" className="form-control" value={formData.lastname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Gender <small className="req"> *</small></label>
                                                            <select className="form-control" name="gender" value={formData.gender} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date Of Birth <small className="req"> *</small></label>
                                                            <input name="dob" type="date" className="form-control" value={formData.dob} onChange={handleInputChange} />
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
                                                    {/* Note: In edit php, student photo is conditional. We keep it standard here. */}
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
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Fees Details Accordion */}
                                    <div className="bozero">
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
                                    </div>

                                    {/* Transport Details */}
                                    <div className="bozero">
                                        <h4 className="pagetitleh2">Transport Details</h4>
                                        <div className="row around10">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Route List</label>
                                                    <select className="form-control" name="route_list" value={formData.route_list} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        <optgroup label="Route A">
                                                            <option value="VH001">Vehicle 1 (VH001)</option>
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
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Fees Month</label>
                                                    <select className="form-control" name="fees_month" value={formData.fees_month} onChange={handleInputChange} multiple={true}>
                                                        <option value="January">January</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hostel Details */}
                                    <div className="bozero">
                                        <h4 className="pagetitleh2">Hostel Details</h4>
                                        <div className="row around10">
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
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent Guardian Detail */}
                                    <div className="bozero">
                                        <h4 className="pagetitleh2">Parent Guardian Detail</h4>
                                        <div className="around10">
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
                                                <div className="col-md-12">
                                                    {/* Guardian details row 1 */}
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Guardian Name <small className="req"> *</small></label>
                                                                <input name="guardian_name" type="text" className="form-control" value={formData.guardian_name} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Guardian Relation</label>
                                                                <input name="guardian_relation" type="text" className="form-control" value={formData.guardian_relation} onChange={handleInputChange} />
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
                                                    </div>
                                                    {/* Guardian details row 2 */}
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Guardian Phone <small className="req"> *</small></label>
                                                                <input name="guardian_phone" type="text" className="form-control" value={formData.guardian_phone} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Guardian Occupation</label>
                                                                <input name="guardian_occupation" type="text" className="form-control" value={formData.guardian_occupation} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Guardian Address</label>
                                                                <textarea name="guardian_address" className="form-control" rows="4" value={formData.guardian_address} onChange={handleInputChange}></textarea>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Details */}
                                    <div className="bozero">
                                        <h3 className="pagetitleh2">Address Details</h3>
                                        <div className="around10">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label>
                                                        <input type="checkbox" checked={autofillCurrent} onChange={handleAutofillGuardianAddress} /> If Guardian Address is Current Address
                                                    </label>
                                                    <div className="form-group">
                                                        <label>Current Address</label>
                                                        <textarea name="current_address" className="form-control" value={formData.current_address} onChange={handleInputChange}></textarea>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label>
                                                        <input type="checkbox" checked={autofillPermanent} onChange={handleAutofillPermanentAddress} /> If Permanent Address is Current Address
                                                    </label>
                                                    <div className="form-group">
                                                        <label>Permanent Address</label>
                                                        <textarea name="permanent_address" className="form-control" value={formData.permanent_address} onChange={handleInputChange}></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Miscellaneous Details */}
                                    <div className="bozero">
                                        <h3 className="pagetitleh2">Miscellaneous Details</h3>
                                        <div className="around10">
                                            <div className="row">
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

                                            <div className="row">
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
                                                <div className="col-md-4">
                                                    <label>RTE</label>
                                                    <div className="radio" style={{ marginTop: '2px' }}>
                                                        <label><input className="radio-inline" type="radio" name="rte" value="Yes" checked={formData.rte === 'Yes'} onChange={handleInputChange} /> Yes</label>
                                                        <label><input className="radio-inline" type="radio" name="rte" value="No" checked={formData.rte === 'No'} onChange={handleInputChange} /> No</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
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
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="pull-right ptt10">
                                                <button type="submit" className="btn btn-info pull-right">Save</button>
                                                <button type="submit" className="btn btn-info pull-right mr-2" style={{ marginRight: '5px' }}>Save and Enroll</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default OnlineStudentEdit;
