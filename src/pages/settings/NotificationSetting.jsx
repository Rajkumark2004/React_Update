import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsMenu from "../../components/SettingsMenu";
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const NotificationSetting = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notificationList, setNotificationList] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.getNotificationSetting();

            if (response && response.status === 'success' && response.notificationlist) {
                // Map API data to state structure, ensuring numbers for boolean checks
                const mappedData = response.notificationlist.map(item => ({
                    ...item,
                    is_mail: parseInt(item.is_mail || 0),
                    is_sms: parseInt(item.is_sms || 0),
                    is_notification: parseInt(item.is_notification || 0),
                    display_sms: parseInt(item.display_sms || 0),
                    display_notification: parseInt(item.display_notification || 0),
                    is_student_recipient: parseInt(item.is_student_recipient || 0),
                    is_guardian_recipient: parseInt(item.is_guardian_recipient || 0),
                    is_staff_recipient: parseInt(item.is_staff_recipient || 0),
                    display_student_recipient: item.display_student_recipient === null ? 0 : parseInt(item.display_student_recipient),
                    display_guardian_recipient: item.display_guardian_recipient === null ? 0 : parseInt(item.display_guardian_recipient),
                    display_staff_recipient: item.display_staff_recipient === null ? 0 : parseInt(item.display_staff_recipient),
                }));
                setNotificationList(mappedData);
            }
        } catch (error) {
            console.error("Failed to fetch notification settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format event name
    const formatEventName = (name) => {
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleCheckboxChange = (id, field) => {
        setNotificationList(prevList => prevList.map(item => {
            if (item.id === id) {
                return { ...item, [field]: item[field] === 1 ? 0 : 1 };
            }
            return item;
        }));
    };

    const handleEditTemplate = (item) => {
        setCurrentTemplate({ ...item });
        setShowModal(true);
    };

    const handleSaveTemplate = (e) => {
        e.preventDefault();
        // Optimistic update
        setNotificationList(prevList => prevList.map(item => {
            if (item.id === currentTemplate.id) {
                return { ...currentTemplate };
            }
            return item;
        }));
        setShowModal(false);

        // TODO: Call API to save template
        // api.saveNotificationTemplate(currentTemplate);
        toast.success('Template updated locally (API pending)');
    };

    const handleSaveSettings = () => {
        // Here we would construct the payload similar to PHP:
        // ids[], mail_{id}, sms_{id}, notification_{id}, etc.
        console.log('Saving settings:', notificationList);
        // TODO: Call API to save settings
        toast.success('Settings saved (Mock)');
    };

    return (
        <SettingsMenu hideSidebars={true}>
            <div className="row">
                <div className="col-md-12">
                    <div className="box box-primary">
                        <div className="box-header with-border">
                            <h3 className="box-title"><i className="fa fa-commenting-o"></i> Notification Setting</h3>
                            <div className="box-tools pull-right">
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/settings')}>
                                    <i className="fa fa-arrow-left"></i> Back
                                </button>
                            </div>
                        </div>

                        <div className="box-body">
                            {/* Button to Trigger Modal - Hidden/Not needed as main interaction is table */}
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Destination</th>
                                            <th>Recipient</th>
                                            <th>Template ID</th>
                                            <th>Sample Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notificationList.map((note, index) => (
                                            <React.Fragment key={note.id}>
                                                {index > 0 && (
                                                    <tr style={{ height: '1px', padding: 0 }}>
                                                        <td colSpan="5" style={{ padding: 0, borderTop: '1px solid #f4f4f4' }}></td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td width="15%">
                                                        {formatEventName(note.type)}
                                                    </td>
                                                    <td width="15%">
                                                        <div style={{ display: 'block' }}>
                                                            <div style={{ marginBottom: '5px' }}>
                                                                <label className="checkbox-inline" style={{ paddingLeft: '20px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={note.is_mail === 1}
                                                                        onChange={() => handleCheckboxChange(note.id, 'is_mail')}
                                                                    /> Email
                                                                </label>
                                                            </div>
                                                            {note.display_sms === 1 && (
                                                                <div style={{ marginBottom: '5px' }}>
                                                                    <label className="checkbox-inline" style={{ paddingLeft: '20px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={note.is_sms === 1}
                                                                            onChange={() => handleCheckboxChange(note.id, 'is_sms')}
                                                                        /> SMS
                                                                    </label>
                                                                </div>
                                                            )}
                                                            {note.display_notification === 1 && (
                                                                <div style={{ marginBottom: '5px' }}>
                                                                    <label className="checkbox-inline" style={{ paddingLeft: '20px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={note.is_notification === 1}
                                                                            onChange={() => handleCheckboxChange(note.id, 'is_notification')}
                                                                        /> Mobile App
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td width="15%">
                                                        <div style={{ display: 'block' }}>
                                                            {note.display_student_recipient === 1 && (
                                                                <div style={{ marginBottom: '5px' }}>
                                                                    <label className="checkbox-inline" style={{ paddingLeft: '20px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={note.is_student_recipient === 1}
                                                                            onChange={() => handleCheckboxChange(note.id, 'is_student_recipient')}
                                                                        /> Student
                                                                    </label>
                                                                </div>
                                                            )}
                                                            {note.display_guardian_recipient === 1 && (
                                                                <div style={{ marginBottom: '5px' }}>
                                                                    <label className="checkbox-inline" style={{ paddingLeft: '20px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={note.is_guardian_recipient === 1}
                                                                            onChange={() => handleCheckboxChange(note.id, 'is_guardian_recipient')}
                                                                        /> Guardian
                                                                    </label>
                                                                </div>
                                                            )}
                                                            {note.display_staff_recipient === 1 && (
                                                                <div style={{ marginBottom: '5px' }}>
                                                                    <label className="checkbox-inline" style={{ paddingLeft: '20px' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={note.is_staff_recipient === 1}
                                                                            onChange={() => handleCheckboxChange(note.id, 'is_staff_recipient')}
                                                                        /> Staff
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td width="10%">
                                                        {note.template_id}
                                                    </td>
                                                    <td>
                                                        {note.template}
                                                        <br />
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-xs mt-2"
                                                            title="Edit"
                                                            onClick={() => handleEditTemplate(note)}
                                                        >
                                                            <i className="fa fa-pencil-square-o"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="box-footer">
                            <button type="button" className="btn btn-primary pull-right" onClick={handleSaveSettings}>Save</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            {showModal && currentTemplate && (
                <div className="modal fade in" style={{ display: 'block' }} role="dialog">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleSaveTemplate}>
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                    <h4 className="modal-title">Template</h4>
                                </div>
                                <div className="modal-body template_modal_body">
                                    <h4 style={{ marginTop: 0 }}>{formatEventName(currentTemplate.type)}</h4>

                                    <div className="form-group">
                                        <label>Subject <small className="text-danger">*</small></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={currentTemplate.subject || ''}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Template ID <small>(This field is required Only For Indian SMS Gateway)</small></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={currentTemplate.template_id || ''}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, template_id: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Template <small className="text-danger">*</small></label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={currentTemplate.template || ''}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, template: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label>You Can Use Variables</label>
                                        <p className="help-block">
                                            {currentTemplate.variables}
                                        </p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right" style={{ backgroundColor: '#7B1FA2', borderColor: '#7B1FA2' }}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Backdrop */}
            {showModal && <div className="modal-backdrop fade in"></div>}

        </SettingsMenu>
    );
};

export default NotificationSetting;
