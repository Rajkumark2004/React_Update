import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import api from "../../../services/api";
import "../../../utils/include_files.js";
import "../../../pages/dashboard/dashboard_test.css";

// Theme options with preview images
const THEME_OPTIONS = [
    { key: 'default', image: 'default.png' },
    { key: 'developer', image: 'developer.png' },
    { key: 'developer2', image: 'developer2.png' },
    { key: 'developer3', image: 'developer3.png' },
    { key: 'developer4', image: 'developer4.png' },
    { key: 'developer5', image: 'developer5.png' },
];

// Language options
const LANGUAGE_OPTIONS = [
    { id: '1', language: 'English' },
    { id: '2', language: 'Hindi' },
    { id: '3', language: 'Telugu' },
];

const FrontCMSSettings = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        id: '1',
        is_active_front_cms: false,
        is_active_sidebar: false,
        is_active_rtl: false,
        sidebar_options: [],
        sch_lang_id: '',
        contact_us_email: '',
        complain_form_email: '',
        logo: '',
        fav_icon: '',
        footer_text: '',
        cookie_consent: '',
        google_analytics: '',
        whatsapp_url: '',
        fb_url: '',
        twitter_url: '',
        youtube_url: '',
        google_plus: '',
        linkedin_url: '',
        instagram_url: '',
        pinterest_url: '',
        theme: 'default',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Layout data
    const appName = 'School Management System';
    const sessionYear = '2024-25';
    const pendingTasks = [];

    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
        }
    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search submitted');
    };

    // Sidebar menus


    const mobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '/admin/admin/dashboard' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '/studentfee' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/admin/stuattendence' },
        { id: 4, icon: 'settings.png', label: 'More', url: '/admin/admin/sidebar_menus' },
        { id: 5, icon: 'logout', label: 'Logout', url: '/site/logout' }
    ];

    // File input refs for Dropify
    const logoInputRef = useRef(null);
    const faviconInputRef = useRef(null);

    // Initialize Dropify on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    $('.dropify').dropify();
                } else {
                    console.warn('jQuery or Dropify plugin not loaded');
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [isLoading]);

    // Load saved settings from localStorage on mount
    useEffect(() => {
        const loadSavedSettings = () => {
            const savedSettings = localStorage.getItem('frontCMSSettings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    setFormData(prev => ({ ...prev, ...parsed }));
                    console.log('Loaded FrontCMS settings from localStorage:', parsed);
                } catch (e) {
                    console.error('Failed to parse saved FrontCMS settings:', e);
                }
            }
            setIsLoading(false);
        };

        loadSavedSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'sidebar_options[]') {
            // Handle checkbox array
            setFormData(prev => {
                const currentOptions = [...prev.sidebar_options];
                if (checked) {
                    currentOptions.push(value);
                } else {
                    const index = currentOptions.indexOf(value);
                    if (index > -1) currentOptions.splice(index, 1);
                }
                return { ...prev, sidebar_options: currentOptions };
            });
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThemeChange = (themeKey) => {
        setFormData(prev => ({ ...prev, theme: themeKey }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        // Store to localStorage
        localStorage.setItem('frontCMSSettings', JSON.stringify(formData));
        console.log('Saved FrontCMS settings:', formData);

        try {
            // Attempt API call (may not work if endpoint doesn't exist)
            const response = await api.postWithSession('/frontcms', formData);
            setMessage({ type: 'success', text: response.message || 'Front CMS settings updated successfully' });
        } catch (error) {
            // Even if API fails, localStorage has the data
            setMessage({ type: 'success', text: 'Front CMS settings saved locally' });
            console.error('FrontCMS API Error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    if (isLoading) {
        return (
            <div className="wrapper">
                <Header appName={appName} userData={userData} pendingTasks={pendingTasks} handleLogout={handleLogout} />
                <Sidebar mobileNavItems={mobileNavItems} handleSearch={handleSearch} sessionYear={sessionYear} />
                <div className="content-wrapper">
                    <section className="content">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-body text-center">
                                        <p>Loading...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wrapper">
            <Header appName={appName} userData={userData} pendingTasks={pendingTasks} handleLogout={handleLogout} />
            <Sidebar mobileNavItems={mobileNavItems} handleSearch={handleSearch} sessionYear={sessionYear} />
            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Front CMS Setting</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={handleBack} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <div className="">
                                    <form role="form" id="custom" className="form-horizontal form-horizontal2" onSubmit={handleSave}>
                                        <div className="box-body">
                                            {message.text && (
                                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                                    {message.text}
                                                </div>
                                            )}

                                            <div className="row">
                                                <div className="box-body">
                                                    {/* Left Column */}
                                                    <div className="col-md-6 col-sm-12">
                                                        {/* Front CMS Toggle */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Front CMS</label>
                                                            <div className="col-sm-7">
                                                                <div className="material-switch">
                                                                    <input
                                                                        id="enable_frontcms"
                                                                        name="is_active_front_cms"
                                                                        type="checkbox"
                                                                        className="chk"
                                                                        checked={formData.is_active_front_cms}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <label htmlFor="enable_frontcms" className="label-success"></label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sidebar Toggle */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Sidebar</label>
                                                            <div className="col-sm-7">
                                                                <div className="material-switch">
                                                                    <input
                                                                        id="enable_sidebar"
                                                                        name="is_active_sidebar"
                                                                        type="checkbox"
                                                                        className="chk"
                                                                        checked={formData.is_active_sidebar}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <label htmlFor="enable_sidebar" className="label-success"></label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* RTL Toggle */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Language RTL Text Mode</label>
                                                            <div className="col-sm-7">
                                                                <div className="material-switch">
                                                                    <input
                                                                        id="enable_rtl"
                                                                        name="is_active_rtl"
                                                                        type="checkbox"
                                                                        className="chk"
                                                                        checked={formData.is_active_rtl}
                                                                        onChange={handleChange}
                                                                    />
                                                                    <label htmlFor="enable_rtl" className="label-success"></label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sidebar Options */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Sidebar Option</label>
                                                            <div className="col-sm-7">
                                                                <label className="checkbox-inline">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="sidebar_options[]"
                                                                        value="news"
                                                                        checked={formData.sidebar_options.includes('news')}
                                                                        onChange={handleChange}
                                                                    /> News
                                                                </label>
                                                                <label className="checkbox-inline">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="sidebar_options[]"
                                                                        value="complain"
                                                                        checked={formData.sidebar_options.includes('complain')}
                                                                        onChange={handleChange}
                                                                    /> Complain
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {/* Language Select */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Language</label>
                                                            <div className="col-sm-7">
                                                                <select
                                                                    id="language_id"
                                                                    name="sch_lang_id"
                                                                    className="form-control"
                                                                    value={formData.sch_lang_id}
                                                                    onChange={handleChange}
                                                                >
                                                                    <option value="">--Select--</option>
                                                                    {LANGUAGE_OPTIONS.map(lang => (
                                                                        <option key={lang.id} value={lang.id}>{lang.language}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Logo Upload */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Logo (369px X 76px)</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="file"
                                                                    className="dropify"
                                                                    name="logo"
                                                                    accept="image/*"
                                                                    data-height="100"
                                                                    data-allowed-file-extensions="jpg jpeg png gif"
                                                                    data-max-file-size="2M"
                                                                    ref={logoInputRef}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Favicon Upload */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Favicon (32px X 32px)</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="file"
                                                                    className="dropify"
                                                                    name="fav_icon"
                                                                    accept="image/*"
                                                                    data-height="50"
                                                                    data-allowed-file-extensions="ico png gif"
                                                                    data-max-file-size="1M"
                                                                    ref={faviconInputRef}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Footer Text */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Footer Text</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="footer_text"
                                                                    value={formData.footer_text}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Cookie Consent */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Cookie Consent</label>
                                                            <div className="col-sm-7">
                                                                <textarea
                                                                    className="form-control"
                                                                    name="cookie_consent"
                                                                    rows="5"
                                                                    value={formData.cookie_consent}
                                                                    onChange={handleChange}
                                                                ></textarea>
                                                            </div>
                                                        </div>

                                                        {/* Google Analytics */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Google Analytics</label>
                                                            <div className="col-sm-7">
                                                                <textarea
                                                                    className="form-control"
                                                                    name="google_analytics"
                                                                    rows="5"
                                                                    value={formData.google_analytics}
                                                                    onChange={handleChange}
                                                                ></textarea>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column - Social Media URLs */}
                                                    <div className="col-md-5 col-md-offset-1 col-sm-12">
                                                        {/* WhatsApp URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">WhatsApp URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="whatsapp_url"
                                                                    value={formData.whatsapp_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Facebook URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Facebook URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="fb_url"
                                                                    value={formData.fb_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Twitter URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Twitter URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="twitter_url"
                                                                    value={formData.twitter_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* YouTube URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">YouTube URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="youtube_url"
                                                                    value={formData.youtube_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Google Plus URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Google Plus URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="google_plus"
                                                                    value={formData.google_plus}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* LinkedIn URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">LinkedIn URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="linkedin_url"
                                                                    value={formData.linkedin_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Instagram URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Instagram URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="instagram_url"
                                                                    value={formData.instagram_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Pinterest URL */}
                                                        <div className="form-group">
                                                            <label className="col-sm-5 control-label">Pinterest URL</label>
                                                            <div className="col-sm-7">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="pinterest_url"
                                                                    value={formData.pinterest_url}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="clearfix"></div>
                                            <hr />

                                            {/* Theme Selection */}
                                            <div>
                                                <label htmlFor="input-type">Current Theme</label>
                                                <div id="input-type" className="mediarow">
                                                    <div className="row">
                                                        {THEME_OPTIONS.map(theme => (
                                                            <div key={theme.key} className="col-md-2 col-sm-4 col-xs-6 img_div_modal">
                                                                <label className="radio-img w-100">
                                                                    <input
                                                                        name="theme"
                                                                        value={theme.key}
                                                                        type="radio"
                                                                        checked={formData.theme === theme.key}
                                                                        onChange={() => handleThemeChange(theme.key)}
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '80px',
                                                                            backgroundColor: '#f0f0f0',
                                                                            border: formData.theme === theme.key ? '3px solid #3c8dbc' : '1px solid #ddd',
                                                                            borderRadius: '4px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <span style={{ fontSize: '12px', color: '#666' }}>{theme.key}</span>
                                                                    </div>
                                                                    <span className="radiotext">{theme.key}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="box-footer">
                                            <button type="submit" id="submitbtn" className="btn btn-primary pull-right" disabled={isSaving}>
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default FrontCMSSettings;
