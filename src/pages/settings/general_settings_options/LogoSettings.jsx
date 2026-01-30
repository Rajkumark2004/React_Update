import React, { useState, useEffect, useRef } from 'react';
import SettingsMenu from "../../../components/SettingsMenu";
import "../../../utils/include_files.js";
import api from "../../../services/api";
import { useLogo } from "../../../context/LogoContext";

// Default images (fallbacks if API doesn't return logos)
const defaultImage = '/wisibles_printlogo.jpeg';
const defaultAdminLogo = '/images/wisibles_logo.png';
const defaultSmallLogo = '/images/wisibles_logo.png';
const defaultAppLogo = '/App_Logo.png';

const LogoSettings = () => {
    // Get logo context for updating header logo
    const { logos: contextLogos, updateLogo } = useLogo();

    const [activeModal, setActiveModal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // State for logo URLs - initialized from context or defaults
    const [logos, setLogos] = useState({
        print_logo: contextLogos.print_logo || defaultImage,
        admin_logo: contextLogos.admin_logo || defaultAdminLogo,
        admin_small_logo: contextLogos.admin_small_logo || defaultSmallLogo,
        app_logo: contextLogos.app_logo || defaultAppLogo
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
            // Map modal type to API logo type
            let logoType = activeModal;
            if (activeModal === 'small_logo') logoType = 'admin_small_logo';

            // Map modal type to state key
            const stateKeyMap = {
                'print_logo': 'print_logo',
                'admin_logo': 'admin_logo',
                'small_logo': 'admin_small_logo',
                'app_logo': 'app_logo'
            };
            const stateKey = stateKeyMap[activeModal] || activeModal;

            const id = localStorage.getItem('generalSettingsId') || '1';
            const response = await api.uploadSchoolLogo(file, logoType, id);
            console.log('Upload response:', response);
            console.log('Full response keys:', Object.keys(response));

            setMessage({ type: 'success', text: response.message || 'Logo updated successfully!' });

            // Try multiple possible field names for the image URL
            // Different endpoints may return different field names
            const possibleFields = ['image', 'image_url', 'logo', 'print_logo', 'admin_logo', 'admin_small_logo', 'app_logo', 'filename', 'url', 'file_url'];
            let imageUrl = null;

            // Log all values for debugging
            console.log('Response values:', {
                image: response.image,
                image_url: response.image_url,
                logo: response.logo
            });

            for (const field of possibleFields) {
                if (response[field]) {
                    imageUrl = response[field];
                    console.log(`Found image URL in field '${field}':`, imageUrl);
                    break;
                }
            }

            // Also check nested result object
            if (!imageUrl && response.result) {
                for (const field of possibleFields) {
                    if (response.result[field]) {
                        imageUrl = response.result[field];
                        console.log(`Found image URL in result.${field}:`, imageUrl);
                        break;
                    }
                }
            }

            if (imageUrl) {
                // Normalize the URL to resolve /../ path segments
                // The API returns URLs like: https://domain.com/api_admin/../uploads/...
                // Convert to: https://domain.com/uploads/...
                try {
                    const normalizedUrl = new URL(imageUrl).href;
                    console.log('Normalized URL:', normalizedUrl);
                    imageUrl = normalizedUrl;
                } catch (e) {
                    console.warn('Could not normalize URL:', imageUrl);
                }

                // Update local state
                setLogos(prev => ({
                    ...prev,
                    [stateKey]: imageUrl
                }));

                // Update global context (updates header logo)
                updateLogo(stateKey, imageUrl);
            } else {
                console.warn('No image URL found in response. Available keys:', Object.keys(response));
            }

            // Force refresh key for cache busting
            setRefreshKey(Date.now());

            setTimeout(() => {
                handleCloseModal();
            }, 1500);

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload logo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (activeModal) {
            case 'print_logo': return 'Edit Print Logo';
            case 'admin_logo': return 'Edit Admin Logo';
            case 'small_logo': return 'Edit Admin Small Logo';
            case 'app_logo': return 'Edit App Logo';
            default: return 'Edit Logo';
        }
    };

    return (
        <SettingsMenu>
            <div className="box box-primary">
                <div className="box-body">
                    <div className="row">
                        {/* Print Logo */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="card-body-logo">
                                <h4 className="box-title">Print Logo</h4>
                                <div className="text-center">
                                    <div className="card-body-logo-img">
                                        <img key={refreshKey} src={`${logos.print_logo}?t=${refreshKey}`} className="" alt="Print Logo" width="304" height="236" />
                                    </div>
                                    <p className="bolds ptt10">(170px X 184px)</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClick('print_logo')}>Update</button>
                            </div>
                        </div>

                        {/* Admin Logo */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="card-body-logo">
                                <h4 className="box-title">Admin Logo</h4>
                                <div className="text-center">
                                    <div className="card-body-logo-img">
                                        <img key={refreshKey} src={`${logos.admin_logo}?t=${refreshKey}`} className="" alt="Admin Logo" width="204" height="60" />
                                    </div>
                                    <p className="bolds ptt10">(290px X 51px)</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClick('admin_logo')}>Update</button>
                            </div>
                        </div>

                        {/* Admin Small Logo */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="card-body-logo">
                                <h4 className="box-title">Admin Small Logo</h4>
                                <div className="text-center">
                                    <div className="card-body-logo-img" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                                        <img key={refreshKey} src={`${logos.admin_small_logo}?t=${refreshKey}`} width="32" height="32" alt="Admin Small Logo" />
                                    </div>
                                    <p className="bolds ptt10">(32px X 32px)</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClick('small_logo')}>Update</button>
                            </div>
                        </div>

                        {/* App Logo */}
                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <div className="card-body-logo">
                                <h4 className="box-title">App Logo</h4>
                                <div className="text-center">
                                    <div className="card-body-logo-img">
                                        <img key={refreshKey} src={`${logos.app_logo}?t=${refreshKey}`} className="" alt="App Logo" width="290" height="51" />
                                    </div>
                                    <p className="bolds ptt10">(290px X 51px)</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClick('app_logo')}>Update</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reusable Modal */}
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
                                        <input type="file" className="dropify" data-height="100" ref={fileInputRef} />
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

export default LogoSettings;
