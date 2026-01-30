import React, { useState } from 'react';
import api from "../../../services/api";
import SettingsMenu from "../../../components/SettingsMenu";
import "../../../utils/include_files.js";

const MobileAppSettings = () => {
    const [formData, setFormData] = useState({
        sch_id: '1', // Default
        mobile_api_url: '',
        app_primary_color_code: '#424242',
        app_secondary_color_code: '#424242',
        admin_mobile_api_url: '',
        admin_app_primary_color_code: '',
        admin_app_secondary_color_code: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load saved settings from localStorage on mount
    React.useEffect(() => {
        // 1. Try to load general settings to get sch_id
        const generalSettings = localStorage.getItem('generalSettings');
        let schIdFromStorage = null;
        if (generalSettings) {
            try {
                const parsedGen = JSON.parse(generalSettings);
                if (parsedGen.sch_id) {
                    schIdFromStorage = parsedGen.sch_id;
                    console.log('Found sch_id in generalSettings:', schIdFromStorage);
                }
            } catch (e) { console.error(e); }
        }

        // 2. Load mobile settings
        const savedSettings = localStorage.getItem('mobileAppSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setFormData(prev => ({
                    ...prev,
                    ...parsed,
                    // If we found a sch_id in general settings, force use it over whatever was in mobile settings
                    // incase general settings changed.
                    ...(schIdFromStorage ? { sch_id: schIdFromStorage } : {})
                }));
                console.log('Loaded mobile settings from localStorage');
            } catch (e) {
                console.error('Failed to parse saved mobile settings:', e);
            }
        } else if (schIdFromStorage) {
            // If no mobile settings but we have sch_id, update state
            setFormData(prev => ({ ...prev, sch_id: schIdFromStorage }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default if called from form submit
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        // Save to localStorage immediately
        localStorage.setItem('mobileAppSettings', JSON.stringify(formData));

        try {
            const response = await api.saveMobileAppSettings(formData);
            setMessage({ type: 'success', text: response.message || 'Settings saved successfully' });

            // Update state with returned data if available
            if (response.data) {
                const data = response.data;
                const updatedData = {
                    ...formData, // Keep existing locally
                    ...data // Overwrite with server response
                };
                setFormData(updatedData);
                // Update localStorage with server response too
                localStorage.setItem('mobileAppSettings', JSON.stringify(updatedData));
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SettingsMenu>
            <div className="box box-primary">
                <div className="box-header ptbnull">
                    <h3 className="box-title titlefix">Mobile App</h3>
                </div>
                <div className="">
                    {message.text && (
                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible`} style={{ margin: '15px' }}>
                            <button type="button" className="close" onClick={() => setMessage({ type: '', text: '' })}>×</button>
                            {message.text}
                        </div>
                    )}
                    <form role="form" onSubmit={handleSubmit}>
                        <div className="box-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <h4 className="session-head">User Mobile App</h4>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Mobile App API URL</label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                name="mobile_api_url"
                                                className="form-control"
                                                value={formData.mobile_api_url}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Mobile App Primary Color Code</label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                name="app_primary_color_code"
                                                className="form-control"
                                                value={formData.app_primary_color_code}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-4">Mobile App Secondary Color Code</label>
                                        <div className="col-sm-8">
                                            <input
                                                type="text"
                                                name="app_secondary_color_code"
                                                className="form-control"
                                                value={formData.app_secondary_color_code}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="box-footer">
                            <button
                                type="submit"
                                className="btn btn-primary pull-right"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SettingsMenu>
    );
};

export default MobileAppSettings;
