import React, { useState, useEffect } from 'react';
import SettingsMenu from "../../../components/SettingsMenu";
import api from "../../../services/api";
import "../../../utils/include_files.js";
import { useSession } from "../../../context/SessionContext";
import Loader from "../../../components/Loader";

const GeneralSettings = () => {
    // Get sessions from context
    const { sessions } = useSession();

    // Form Data - starts with defaults, but will be overwritten by saved values
    const [formData, setFormData] = useState({
        sch_id: '1', // Default ID
        sch_session_id: '9', // Default to 2024-25 (ID 9)
        sch_name: 'Wisibles',
        sch_dise_code: '28221301607',
        sch_address: 'Hyderabad, Telangana',
        sch_phone: '9963526670',
        sch_email: 'admin@wibiles.com',
        sch_start_month: '4',
        sch_date_format: 'd/m/Y',
        sch_timezone: 'Asia/Kolkata',
        sch_start_week: 'Monday',
        currency_format: '#,###.##',
        currency_place: 'after_number',
        base_url: 'https://newlayout.wisibles.com/',
        folder_path: '/home/hostsbds/public_html/newlayout.wisibles.com/'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(true);

    // Load saved settings from localStorage on mount
    useEffect(() => {
        const loadSavedSettings = () => {
            // Load each setting from localStorage if it exists
            const savedSettings = localStorage.getItem('generalSettings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    setFormData(prev => ({ ...prev, ...parsed }));
                    console.log('Loaded settings from localStorage:', parsed);
                } catch (e) {
                    console.error('Failed to parse saved settings:', e);
                }
            } else {
                // At minimum, load the default session ID if available
                const savedSessionId = localStorage.getItem('defaultSessionId');
                if (savedSessionId) {
                    setFormData(prev => ({ ...prev, sch_session_id: savedSessionId }));
                    console.log('Loaded default session ID:', savedSessionId);
                }
            }
            setIsLoading(false);
        };

        loadSavedSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        // Store all settings to localStorage for persistence
        localStorage.setItem('generalSettings', JSON.stringify(formData));
        localStorage.setItem('defaultSessionId', formData.sch_session_id);
        console.log('Saved settings to localStorage:', formData);
        console.log('Saved defaultSessionId:', formData.sch_session_id);

        try {
            const response = await api.updateGeneralSettings(formData);
            if (response.id) {
                localStorage.setItem('generalSettingsId', response.id);
                console.log('Saved generalSettingsId:', response.id);
            }
            setMessage({ type: 'success', text: response.message || 'General settings updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update general settings' });
        } finally {
            setIsSaving(false);
        }
    };

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const dateFormats = [
        { value: 'd/m/Y', label: 'dd/mm/yyyy' },
        { value: 'd-m-Y', label: 'dd-mm-yyyy' },
        { value: 'm/d/Y', label: 'mm/dd/yyyy' },
        { value: 'Y-m-d', label: 'yyyy-mm-dd' }
    ];

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const currencyFormats = [
        { value: '#,###.##', label: 'Indian (#,###.##)' },
        { value: '#,##0.00', label: 'Standard (#,##0.00)' }
    ];

    const currencyPlaces = [
        { value: 'before_number', label: 'Before Number' },
        { value: 'after_number', label: 'After Number' }
    ];

    return (
        <SettingsMenu>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="box box-primary">
                    <div className="box-header ptbnull">
                        <h3 className="box-title titlefix">General Setting</h3>
                    </div>
                    {/* ... content ... */}
                    <div className="box-body">
                        <div className="alert alert-info">Note: After saving General Setting please once logout then relogin so changes will be come in effect.</div>

                        {message.text && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                {message.text}
                            </div>
                        )}

                        <form role="form" onSubmit={handleSave}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4">School Name<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" name="sch_name" value={formData.sch_name} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4 text-lg-end">School Code</label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" name="sch_dise_code" value={formData.sch_dise_code} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-2">Address<small className="req"> *</small></label>
                                        <div className="col-sm-10">
                                            <input type="text" className="form-control" name="sch_address" value={formData.sch_address} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Phone<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" name="sch_phone" value={formData.sch_phone} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4 text-lg-end">Email<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <input type="email" className="form-control" name="sch_email" value={formData.sch_email} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="settinghr"></div>
                                    <h4 className="session-head">Academic Session</h4>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Session<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <select className="form-control" name="sch_session_id" value={formData.sch_session_id} onChange={handleChange} required>
                                                <option value="">Select Session</option>
                                                {sessions.map(s => (
                                                    <option key={s.id} value={s.id}>{s.session}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4 text-lg-end">Session Start Month<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <select className="form-control" name="sch_start_month" value={formData.sch_start_month} onChange={handleChange}>
                                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="settinghr"></div>
                                    <h4 className="session-head">Date Time</h4>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Date Format<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <select className="form-control" name="sch_date_format" value={formData.sch_date_format} onChange={handleChange}>
                                                {dateFormats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group row">
                                        <label className="col-sm-4 text-lg-end">Timezone<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <select className="form-control" name="sch_timezone" value={formData.sch_timezone} onChange={handleChange}>
                                                <option value="Asia/Kolkata">(UTC+05:30) Asia/Kolkata</option>
                                                <option value="UTC">(UTC+00:00) UTC</option>
                                                <option value="America/New_York">(UTC-05:00) America/New_York</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group row">
                                        <label className="col-sm-5 text-lg-end">Start Day of Week<small className="req"> *</small></label>
                                        <div className="col-sm-7">
                                            <select className="form-control" name="sch_start_week" value={formData.sch_start_week} onChange={handleChange}>
                                                {weekDays.map(day => <option key={day} value={day}>{day}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="settinghr"></div>
                                    <h4 className="session-head">Currency</h4>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Currency Format<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <select className="form-control" name="currency_format" value={formData.currency_format} onChange={handleChange}>
                                                {currencyFormats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4 text-lg-end">Currency Place<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <select className="form-control" name="currency_place" value={formData.currency_place} onChange={handleChange}>
                                                {currencyPlaces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="settinghr"></div>
                                    <h4 className="session-head">File Upload Path</h4>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Base Url<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" name="base_url" value={formData.base_url} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group row">
                                        <label className="col-sm-4 text-lg-end">File Upload Path<small className="req"> *</small></label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control" name="folder_path" value={formData.folder_path} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="box-footer">
                                <button type="submit" className="btn btn-primary pull-right" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SettingsMenu>
    );
};

export default GeneralSettings;
