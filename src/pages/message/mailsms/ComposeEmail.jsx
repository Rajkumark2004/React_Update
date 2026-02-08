import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ComposeEmail = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('group');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        templateId: '', title: '', message: '',
        sendType: 'send_now', scheduleDateTime: ''
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSections, setSelectedSections] = useState([]);

    // State for API data
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [classList, setClassList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [sections, setSections] = useState([]);
    const [birthdayList, setBirthdayList] = useState({ students: [], staff: [] });
    const [messageToOptions, setMessageToOptions] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedSearchResult, setSelectedSearchResult] = useState(null);
    const [selectedTableFilter, setSelectedTableFilter] = useState('');

    // Fetch compose data on mount
    useEffect(() => {
        const fetchComposeData = async () => {
            try {
                const response = await api.getMailSMSCompose();
                if (response && response.status === true) {
                    const data = response.data || {};
                    setClassList(data.classlist || []);
                    setRoles(data.roles || []);
                    setEmailTemplates(data.email_template_list || []);
                    setBirthdayList({
                        students: data.birthDaysList?.students || [],
                        staff: data.birthDaysList?.staff || []
                    });

                    // Build messageToOptions: Students, Guardians + all roles (same as Group tab)
                    const options = [
                        { id: 'student', name: 'Students' },
                        { id: 'parent', name: 'Guardians' },
                        ...(data.roles || []).map(r => ({ id: r.id, name: r.name }))
                    ];
                    setMessageToOptions(options);
                }
            } catch (error) {
                console.error('Error fetching compose data:', error);
            }
        };
        fetchComposeData();
    }, []);

    // Live search on keystroke in Individual tab
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery && searchCategory) {
                setSearchLoading(true);
                try {
                    const response = await api.searchMailSMS(searchQuery, searchCategory);
                    if (response && response.status === true) {
                        setSearchResults(response.data || []);
                    } else {
                        setSearchResults([]);
                    }
                } catch (error) {
                    console.error('Error searching:', error);
                    setSearchResults([]);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        };
        performSearch();
    }, [searchQuery, searchCategory]);

    // Fetch sections when class is selected
    useEffect(() => {
        const fetchSections = async () => {
            if (selectedClassId) {
                try {
                    const response = await api.getSectionsByClass(selectedClassId);
                    if (response && (response.status === 'success' || response.status === true)) {
                        setSections(response.data || []);
                    } else {
                        setSections([]);
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    setSections([]);
                }
            } else {
                setSections([]);
            }
        };
        fetchSections();
    }, [selectedClassId]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserCheckbox = (value) => {
        setSelectedUsers(prev => prev.includes(value) ? prev.filter(u => u !== value) : [...prev, value]);
    };

    const handleSectionCheckbox = (sectionId) => {
        setSelectedSections(prev => prev.includes(sectionId) ? prev.filter(s => s !== sectionId) : [...prev, sectionId]);
    };

    // Handle selecting a recipient from search results
    const handleSelectRecipient = (result) => {
        // Build display name based on category
        let displayName = '';
        if (searchCategory === 'student') {
            displayName = `${result.firstname || result.name || ''} ${result.lastname || ''} (${result.admission_no || ''})`;
        } else if (searchCategory === 'parent') {
            displayName = `${result.guardian_name || result.name || ''} (${result.guardian_phone || ''})`;
        } else {
            displayName = `${result.name || result.firstname || ''} ${result.lastname || ''}`;
        }

        // Store recipient with all required fields for API
        const newRecipient = {
            id: result.id,
            name: displayName.trim(),
            category: searchCategory,
            record_id: result.id,
            email: result.email || '',
            guardianEmail: result.guardian_email || '',
            mobileno: result.mobileno || ''
        };

        setSelectedRecipients(prev => {
            const exists = prev.some(r => r.id === result.id && r.category === searchCategory);
            if (!exists) {
                return [...prev, newRecipient];
            }
            return prev;
        });
        setSearchQuery(''); // Clear search after selection
        setSearchResults([]); // Clear results
    };

    // Get display name for search result
    const getResultDisplayName = (result) => {
        if (searchCategory === 'student') {
            return `${result.firstname || result.name || ''} ${result.lastname || ''} (${result.admission_no || ''})`.trim();
        } else if (searchCategory === 'parent') {
            return `${result.guardian_name || result.name || ''} (${result.guardian_phone || ''})`;
        } else {
            return `${result.name || result.firstname || ''} ${result.lastname || ''}`.trim();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error('Title and Message are required');
            return;
        }

        setLoading(true);

        try {
            if (activeTab === 'individual') {
                // Validate recipients
                if (selectedRecipients.length === 0) {
                    toast.error('Please select at least one recipient');
                    setLoading(false);
                    return;
                }

                // Build user_list payload
                const userList = {};
                selectedRecipients.forEach(r => {
                    const key = `${r.category}-${r.record_id}`;
                    userList[key] = [{
                        category: r.category,
                        record_id: r.record_id,
                        email: r.email,
                        guardianEmail: r.guardianEmail,
                        mobileno: r.mobileno
                    }];
                });

                const payload = {
                    individual_title: formData.title,
                    individual_message: formData.message,
                    individual_send_by: 'email',
                    individual_send_type: formData.sendType === 'send_now' ? 'send_now' : 'schedule',
                    user_list: userList
                };

                if (formData.sendType === 'schedule' && formData.scheduleDateTime) {
                    // Format: DD/MM/YYYY hh:mm am/pm
                    const dt = new Date(formData.scheduleDateTime);
                    const day = String(dt.getDate()).padStart(2, '0');
                    const month = String(dt.getMonth() + 1).padStart(2, '0');
                    const year = dt.getFullYear();
                    let hours = dt.getHours();
                    const ampm = hours >= 12 ? 'pm' : 'am';
                    hours = hours % 12 || 12;
                    const mins = String(dt.getMinutes()).padStart(2, '0');
                    payload.schedule_date_time = `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
                }

                await api.sendIndividualEmail(payload);
                toast.success('Email sent successfully!');
                // Reset form
                setFormData({ templateId: '', title: '', message: '', sendType: 'send_now', scheduleDateTime: '' });
                setSelectedRecipients([]);
            } else if (activeTab === 'group') {
                // Validate selected users
                if (selectedUsers.length === 0) {
                    toast.error('Please select at least one group');
                    setLoading(false);
                    return;
                }

                // Build user array - 'student', 'parent', or role IDs (as strings)
                const userArray = selectedUsers.map(u => String(u));

                const payload = {
                    send_type: formData.sendType === 'send_now' ? 'send_now' : 'schedule',
                    group_title: formData.title,
                    group_message: formData.message,
                    group_send_by: 'email',
                    user: userArray
                };

                if (formData.sendType === 'schedule' && formData.scheduleDateTime) {
                    // Format: DD/MM/YYYY hh:mm am/pm
                    const dt = new Date(formData.scheduleDateTime);
                    const day = String(dt.getDate()).padStart(2, '0');
                    const month = String(dt.getMonth() + 1).padStart(2, '0');
                    const year = dt.getFullYear();
                    let hours = dt.getHours();
                    const ampm = hours >= 12 ? 'pm' : 'am';
                    hours = hours % 12 || 12;
                    const mins = String(dt.getMinutes()).padStart(2, '0');
                    payload.schedule_date_time = `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
                }

                await api.sendGroupEmail(payload);
                toast.success('Email sent successfully!');
                // Reset form
                setFormData({ templateId: '', title: '', message: '', sendType: 'send_now', scheduleDateTime: '' });
                setSelectedUsers([]);
            } else if (activeTab === 'class') {
                // Validate class and sections
                if (!selectedClassId) {
                    toast.error('Please select a class');
                    setLoading(false);
                    return;
                }
                if (selectedSections.length === 0) {
                    toast.error('Please select at least one section');
                    setLoading(false);
                    return;
                }

                // Build FormData payload
                const formDataPayload = new FormData();
                formDataPayload.append('class_send_type', formData.sendType === 'send_now' ? 'send_now' : 'schedule');
                formDataPayload.append('class_title', formData.title);
                formDataPayload.append('class_message', formData.message);
                formDataPayload.append('class_id', selectedClassId);
                selectedSections.forEach(sectionId => {
                    formDataPayload.append('user[]', sectionId);
                });
                formDataPayload.append('class_send_by', 'email');
                formDataPayload.append('template_id', formData.templateId || '');

                if (formData.sendType === 'schedule' && formData.scheduleDateTime) {
                    // Format: DD/MM/YYYY hh:mm am/pm
                    const dt = new Date(formData.scheduleDateTime);
                    const day = String(dt.getDate()).padStart(2, '0');
                    const month = String(dt.getMonth() + 1).padStart(2, '0');
                    const year = dt.getFullYear();
                    let hours = dt.getHours();
                    const ampm = hours >= 12 ? 'pm' : 'am';
                    hours = hours % 12 || 12;
                    const mins = String(dt.getMinutes()).padStart(2, '0');
                    formDataPayload.append('schedule_date_time', `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`);
                }

                await api.sendClassEmail(formDataPayload);
                toast.success('Email sent successfully!');
                // Reset form
                setFormData({ templateId: '', title: '', message: '', sendType: 'send_now', scheduleDateTime: '' });
                setSelectedClassId('');
                setSelectedSections([]);
            } else {
                toast.success('Email sent successfully!');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(error.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Sidebar />
            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="nav-tabs-custom">
                                <ul className="nav nav-tabs">
                                    <li className="pull-left header">Send Email</li>
                                    <li className="pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginTop: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </li>
                                    {['class', 'individual', 'group'].map(tab => (
                                        <li key={tab} className={`pull-right ${activeTab === tab ? 'active' : ''}`}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}>
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <div className="tab-content">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label>Email Template</label>
                                                    <select name="templateId" className="form-control" value={formData.templateId} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Title <small className="text-danger">*</small></label>
                                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Attachment</label>
                                                    <input type="file" className="form-control" multiple />
                                                </div>
                                                <div className="form-group">
                                                    <label>Message <small className="text-danger">*</small></label>
                                                    <textarea className="form-control" rows="10" name="message" value={formData.message} onChange={handleInputChange}></textarea>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <label>Message To <small className="text-danger">*</small></label>
                                                {activeTab === 'group' && (
                                                    <div className="well" style={{ minHeight: '300px' }}>
                                                        <div className="checkbox"><label><input type="checkbox" checked={selectedUsers.includes('student')} onChange={() => handleUserCheckbox('student')} /> <b>Students</b></label></div>
                                                        <div className="checkbox"><label><input type="checkbox" checked={selectedUsers.includes('parent')} onChange={() => handleUserCheckbox('parent')} /> <b>Guardians</b></label></div>
                                                        {roles.map(r => <div key={r.id} className="checkbox"><label><input type="checkbox" checked={selectedUsers.includes(r.id)} onChange={() => handleUserCheckbox(r.id)} /> <b>{r.name}</b></label></div>)}
                                                    </div>
                                                )}
                                                {activeTab === 'individual' && (
                                                    <>
                                                        <div className="form-group">
                                                            <select className="form-control" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                                                <option value="">Select</option>
                                                                {messageToOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="input-group">
                                                            <input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                                            <span className="input-group-btn"><button className="btn btn-primary" type="button" onClick={() => { if (selectedSearchResult) { handleSelectRecipient(selectedSearchResult); setSelectedSearchResult(null); } }}>Add</button></span>
                                                        </div>
                                                        {(searchLoading || searchQuery) && (
                                                            <div className="well" style={{ minHeight: '150px', maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                                                                {searchLoading && <div className="text-center"><i className="fa fa-spinner fa-spin"></i> Searching...</div>}
                                                                {!searchLoading && searchResults.length === 0 && searchQuery && <div className="text-muted">No results found</div>}
                                                                {!searchLoading && searchResults.length > 0 && (
                                                                    <ul className="list-group">
                                                                        {searchResults.map((r, i) => (
                                                                            <li key={i}
                                                                                className={`list-group-item ${selectedSearchResult?.id === r.id ? 'active' : ''}`}
                                                                                style={{ cursor: 'pointer' }}
                                                                                onClick={() => setSelectedSearchResult(r)}>
                                                                                {getResultDisplayName(r)}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* Selected Recipients Table */}
                                                        <div style={{ marginTop: '15px' }}>
                                                            <b>Selected Recipients ({selectedRecipients.length})</b>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Filter selected..."
                                                                value={selectedTableFilter}
                                                                onChange={(e) => setSelectedTableFilter(e.target.value)}
                                                                style={{ marginTop: '5px', marginBottom: '5px' }}
                                                            />
                                                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                                <table className="table table-bordered table-striped table-condensed">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>#</th>
                                                                            <th>Name</th>
                                                                            <th>Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {selectedRecipients
                                                                            .filter(r => r.name.toLowerCase().includes(selectedTableFilter.toLowerCase()))
                                                                            .map((r, i) => (
                                                                                <tr key={i}>
                                                                                    <td>{i + 1}</td>
                                                                                    <td>{r.name}</td>
                                                                                    <td>
                                                                                        <button type="button" className="btn btn-xs btn-danger" onClick={() => setSelectedRecipients(prev => prev.filter((_, idx) => idx !== i))}>
                                                                                            <i className="fa fa-remove"></i>
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        {selectedRecipients.length === 0 && (
                                                                            <tr><td colSpan="3" className="text-center text-muted">No recipients selected</td></tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {activeTab === 'class' && (
                                                    <>
                                                        <select className="form-control mb-2" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                                                            <option value="">Select</option>
                                                            {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                        </select>
                                                        <div className="well" style={{ minHeight: '260px' }}>
                                                            <b>Section</b>
                                                            {sections.map(s => <div key={s.section_id} className="checkbox"><label><input type="checkbox" checked={selectedSections.includes(s.section_id)} onChange={() => handleSectionCheckbox(s.section_id)} /> {s.section}</label></div>)}
                                                        </div>
                                                    </>
                                                )}
                                                {activeTab === 'birthday' && (
                                                    <div className="well" style={{ minHeight: '300px' }}>
                                                        <h4>Students</h4>
                                                        {birthdayList.students.map(s => <div key={s.id} className="checkbox"><label><input type="checkbox" defaultChecked /> <b>{s.name} ({s.admission_no})</b></label></div>)}
                                                        <h4>Staff</h4>
                                                        {birthdayList.staff.map(s => <div key={s.id} className="checkbox"><label><input type="checkbox" defaultChecked /> <b>{s.name} ({s.employee_id})</b></label></div>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <div className="pull-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                {activeTab !== 'birthday' && (
                                                    <>
                                                        <label className="radio-inline" style={{ marginRight: '10px' }}><input type="radio" name="sendType" value="send_now" checked={formData.sendType === 'send_now'} onChange={handleInputChange} /> Send Now</label>
                                                        <label className="radio-inline" style={{ marginRight: '10px' }}><input type="radio" name="sendType" value="schedule" checked={formData.sendType === 'schedule'} onChange={handleInputChange} /> Schedule</label>
                                                        {formData.sendType === 'schedule' && <input type="datetime-local" className="form-control" style={{ display: 'inline-block', width: 'auto' }} name="scheduleDateTime" value={formData.scheduleDateTime} onChange={handleInputChange} />}
                                                    </>
                                                )}
                                                <button type="submit" className="btn btn-primary" disabled={loading}><i className="fa fa-envelope-o"></i> {loading ? 'Sending...' : 'Submit'}</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default ComposeEmail;
