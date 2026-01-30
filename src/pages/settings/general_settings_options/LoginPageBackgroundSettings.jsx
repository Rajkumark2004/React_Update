import React, { useState, useEffect, useRef } from 'react';
import api from "../../../services/api";
import SettingsMenu from "../../../components/SettingsMenu";
import "../../../utils/include_files.js";

// Default background images
const defaultAdminImage = '/Wisibles_BG.png';
const defaultUserImage = '/Wisibles_BG.png';

const LoginPageBackgroundSettings = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // State for background URLs
    const [backgrounds, setBackgrounds] = useState({
        admin_logo: defaultAdminImage,
        user_logo: defaultUserImage
    });

    // Key to force re-render of images (cache busting)
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const handleUpdateClick = (type) => {
        setActiveModal(type);
        setMessage({ type: '', text: '' });
    };

    const handleCloseModal = () => {
        setActiveModal(null);
        setIsLoading(false);
        setMessage({ type: '', text: '' });
    };

    // Initialize Dropify when modal opens
    useEffect(() => {
        if (activeModal) {
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
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [activeModal]);

    const handleSave = async () => {
        const file = fileInputRef.current?.files[0];

        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file to upload.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const id = localStorage.getItem('generalSettingsId') || '1';
            const response = await api.uploadLoginBackground(file, activeModal, id);
            console.log('Upload response:', response);

            setMessage({ type: 'success', text: response.message || 'Background updated successfully!' });

            // Use the 'image' field from API response (contains full URL)
            if (response.image) {
                console.log('Using image URL from response:', response.image);
                setBackgrounds(prev => ({
                    ...prev,
                    [activeModal]: response.image
                }));
            }

            // Force refresh key for cache busting
            setRefreshKey(Date.now());

            setTimeout(() => {
                handleCloseModal();
            }, 1500);

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload background.' });
        } finally {
            setIsLoading(false);
        }
    };

    const getModalTitle = () => {
        return activeModal === 'admin_logo' ? 'Edit Admin Panel Background' : 'Edit User Panel Background';
    };

    return (
        <SettingsMenu>
            <div className="box box-primary">
                <div className="box-body">
                    <div className="row">
                        {/* Admin Panel Background */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="card-body-logo h-290">
                                <h4 className="box-title">Admin Panel</h4>
                                <div className="text-center">
                                    <div className="card-h-hidden">
                                        <div className="card-body-logo-img">
                                            <img key={refreshKey} src={`${backgrounds.admin_logo}?t=${refreshKey}`} className="" alt="Admin Panel Background" width="304" height="236" />
                                        </div>
                                    </div>
                                    <p className="bolds ptt10">(1460px X 1080px)</p>
                                </div>
                                <button className="btn btn-primary btn-sm upload_logo" onClick={() => handleUpdateClick('admin_logo')}>Update</button>
                            </div>
                        </div>

                        {/* User Panel Background */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="card-body-logo h-290">
                                <h4 className="box-title">User Panel</h4>
                                <div className="text-center">
                                    <div className="card-h-hidden">
                                        <div className="card-body-logo-img">
                                            <img key={refreshKey} src={`${backgrounds.user_logo}?t=${refreshKey}`} className="" alt="User Panel Background" width="304" height="236" />
                                        </div>
                                    </div>
                                    <p className="bolds ptt10">(1460px X 1080px)</p>
                                </div>
                                <button className="btn btn-primary btn-sm user_login" onClick={() => handleUpdateClick('user_logo')}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reusable Upload Modal */}
            {activeModal && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '15px' }}>
                    <div className="modal-dialog" style={{ position: 'relative', zIndex: 1050 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={handleCloseModal}>&times;</button>
                                <h4 className="modal-title">{getModalTitle()}</h4>
                            </div>
                            <div className="modal-body">
                                {message.text && (
                                    <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <form>
                                    <div className="form-group">
                                        <label>Background Image</label>
                                        <input
                                            type="file"
                                            className="dropify"
                                            data-height="100"
                                            data-allowed-file-extensions="jpg jpeg png"
                                            ref={fileInputRef}
                                        />
                                        <small className="help-block">Allowed formats: jpg, jpeg, png</small>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={handleCloseModal}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? 'Uploading...' : 'Save changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in" style={{ zIndex: 1040 }} onClick={handleCloseModal}></div>
                </div>
            )}
        </SettingsMenu>
    );
};

export default LoginPageBackgroundSettings;
