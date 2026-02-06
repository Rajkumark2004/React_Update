import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import toast from 'react-hot-toast';

const ComposeSMS = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('group');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        templateId: '', title: '', message: '', templateIdField: '',
        sendType: 'send_now', scheduleDateTime: '', sendBy: []
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Mock data
    const smsTemplates = [{ id: '1', title: 'Reminder SMS' }, { id: '2', title: 'Alert SMS' }];
    const classList = [{ id: '1', class: 'Class 1' }, { id: '2', class: 'Class 2' }];
    const roles = [{ id: '1', name: 'Teacher' }, { id: '2', name: 'Accountant' }];
    const sections = [{ id: '1', section: 'A' }, { id: '2', section: 'B' }];
    const sendThroughList = { sms: 'SMS', whatsapp: 'WhatsApp', notification: 'Notification' };
    const birthdayList = {
        students: [{ id: '1', name: 'John Doe', admission_no: 'STU001', contact_no: '9876543210' }],
        staff: [{ id: '1', name: 'Jane Smith', employee_id: 'EMP001', contact_no: '9876543211' }]
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendByChange = (value) => {
        setFormData(prev => ({
            ...prev,
            sendBy: prev.sendBy.includes(value) ? prev.sendBy.filter(s => s !== value) : [...prev.sendBy, value]
        }));
    };

    const handleUserCheckbox = (value) => {
        setSelectedUsers(prev => prev.includes(value) ? prev.filter(u => u !== value) : [...prev, value]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error('Title and Message are required');
            return;
        }
        if (formData.sendBy.length === 0) {
            toast.error('Please select at least one send method');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            toast.success('SMS sent successfully!');
            setLoading(false);
        }, 1000);
    };

    const charCount = formData.message.length;

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
                                    <li className="pull-left header">Send SMS</li>
                                    {['group', 'individual', 'class', 'birthday'].map(tab => (
                                        <li key={tab} className={activeTab === tab ? 'active' : ''}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}>
                                                {tab === 'birthday' ? "Today's Birthday" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </a>
                                        </li>
                                    ))}
                                    <li className="pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </li>
                                </ul>
                                <div className="tab-content">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label>SMS Template</label>
                                                    <select name="templateId" className="form-control" value={formData.templateId} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        {smsTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Title <small className="text-danger">*</small></label>
                                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Send Through <small className="text-danger">*</small></label>
                                                    <div>
                                                        {Object.entries(sendThroughList).map(([key, val]) => (
                                                            <label key={key} className="checkbox-inline">
                                                                <input type="checkbox" checked={formData.sendBy.includes(key)} onChange={() => handleSendByChange(key)} /> {val}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Template ID</label> (Required only for Indian SMS Gateway)
                                                    <input type="text" className="form-control" name="templateIdField" value={formData.templateIdField} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Message <small className="text-danger">*</small></label>
                                                    <textarea className="form-control" rows="10" name="message" value={formData.message} onChange={handleInputChange}></textarea>
                                                    <span className="text-muted pull-right">Character Count: {charCount}</span>
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
                                                        <div className="input-group mb-2">
                                                            <select className="form-control" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                                                <option value="">Select</option>
                                                                <option value="student">Students</option>
                                                                <option value="parent">Guardians</option>
                                                                <option value="staff">Staff</option>
                                                            </select>
                                                            <input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                                            <span className="input-group-btn"><button className="btn btn-primary" type="button">Add</button></span>
                                                        </div>
                                                        <div className="well" style={{ minHeight: '260px' }}><ul className="list-group">{selectedRecipients.map((r, i) => <li key={i} className="list-group-item">{r.name}</li>)}</ul></div>
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
                                                            {sections.map(s => <div key={s.id} className="checkbox"><label><input type="checkbox" /> {s.section}</label></div>)}
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
                                            <div className="pull-right">
                                                {activeTab !== 'birthday' && (
                                                    <>
                                                        <label className="radio-inline"><input type="radio" name="sendType" value="send_now" checked={formData.sendType === 'send_now'} onChange={handleInputChange} /> Send Now</label>
                                                        <label className="radio-inline"><input type="radio" name="sendType" value="schedule" checked={formData.sendType === 'schedule'} onChange={handleInputChange} /> Schedule</label>
                                                        {formData.sendType === 'schedule' && <input type="datetime-local" className="form-control" style={{ display: 'inline-block', width: 'auto', marginRight: '10px' }} name="scheduleDateTime" value={formData.scheduleDateTime} onChange={handleInputChange} />}
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

export default ComposeSMS;
