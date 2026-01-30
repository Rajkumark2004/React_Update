import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

/**
 * Common hook for handling logo/background image uploads
 * Used by LogoSettings and LoginPageBackgroundSettings
 * 
 * Uses the 'image' field from API response to get the uploaded image URL
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.uploadType - 'logo' or 'background' to determine which API to use
 * @param {string} options.baseUrl - Base URL for constructing full image URLs
 * @param {Object} options.defaultLogos - Default logo URLs for fallback
 */
const useLogoUpload = (options = {}) => {
    const {
        uploadType = 'logo', // 'logo' or 'background'
        baseUrl = 'https://newlayout.wisibles.com/backend/uploads/school_content/logo/',
        defaultLogos = {}
    } = options;

    const [activeModal, setActiveModal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [logos, setLogos] = useState({ ...defaultLogos });
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const fileInputRef = useRef(null);

    /**
     * Open the upload modal for a specific logo type
     */
    const handleUpdateClick = useCallback((type) => {
        setActiveModal(type);
        setMessage({ type: '', text: '' });
    }, []);

    /**
     * Close the upload modal and reset state
     */
    const handleCloseModal = useCallback(() => {
        setActiveModal(null);
        setIsLoading(false);
        setMessage({ type: '', text: '' });
    }, []);

    /**
     * Initialize Dropify plugin when modal opens
     */
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

    /**
     * Handle file upload/save
     * Prioritizes 'image' field from API response for the uploaded URL
     */
    const handleSave = useCallback(async () => {
        const file = fileInputRef.current?.files[0];

        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file to upload.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        const currentModal = activeModal; // Capture current modal before async

        try {
            // Normalize logo type for API
            let logoType = activeModal;
            if (activeModal === 'small_logo') logoType = 'admin_small_logo';
            if (activeModal === 'print_logo') logoType = 'logo'; // API expects 'logo' for print

            const id = localStorage.getItem('generalSettingsId') || '1';

            // Choose API based on upload type
            let response;
            if (uploadType === 'background') {
                response = await api.uploadLoginBackground(file, activeModal, id);
            } else {
                response = await api.uploadSchoolLogo(file, logoType, id);
            }

            console.log('Upload response:', response);

            const successMessage = uploadType === 'background'
                ? 'Background updated successfully!'
                : 'Logo updated successfully!';
            setMessage({ type: 'success', text: response.message || successMessage });

            // PRIORITIZE 'image' field from API response (as per user request)
            // The API returns: { status: true, message: "...", image: "https://..." }
            let finalUrl = null;

            // Check 'image' field first (top priority)
            if (response.image) {
                finalUrl = response.image;
                console.log('Using image URL from response.image:', finalUrl);
            }
            // Then check nested result object
            else if (response.result?.image) {
                finalUrl = response.result.image;
                console.log('Using image URL from response.result.image:', finalUrl);
            }
            // Fallback to other possible fields
            else {
                const fallbackUrl = response.result?.filename || response.filename ||
                    response.logo || response.result?.logo || response.data?.filename;
                if (fallbackUrl) {
                    finalUrl = fallbackUrl.startsWith('http') ? fallbackUrl : `${baseUrl}${fallbackUrl}`;
                    console.log('Using fallback URL:', finalUrl);
                }
            }

            // Update the logo state immediately with the URL
            if (finalUrl) {
                setLogos(prev => ({
                    ...prev,
                    [currentModal]: finalUrl
                }));
            }

            // Force refresh key for cache busting
            setRefreshKey(Date.now());

            // Close modal after delay
            setTimeout(() => {
                handleCloseModal();
            }, 1500);

        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = uploadType === 'background'
                ? 'Failed to upload background.'
                : 'Failed to upload logo.';
            setMessage({ type: 'error', text: error.message || errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [activeModal, uploadType, baseUrl, handleCloseModal]);

    /**
     * Get image URL with cache busting
     */
    const getImageUrl = useCallback((logoKey) => {
        const url = logos[logoKey] || defaultLogos[logoKey] || '';
        if (!url) return '';

        // If it's a blob URL (local preview), don't add cache buster
        if (url.startsWith('blob:')) {
            return url;
        }
        return `${url}?t=${refreshKey}`;
    }, [logos, defaultLogos, refreshKey]);

    return {
        // State
        activeModal,
        isLoading,
        message,
        logos,
        refreshKey,
        fileInputRef,

        // Actions
        handleUpdateClick,
        handleCloseModal,
        handleSave,
        getImageUrl,
        setLogos
    };
};

export default useLogoUpload;
