import React, { createContext, useState, useContext, useEffect } from 'react';

// Default logo paths
const DEFAULT_LOGOS = {
    print_logo: '/wisibles_printlogo.jpeg',
    admin_logo: '/images/wisibles_logo.png',
    admin_small_logo: '/images/wisibles_logo.png',
    app_logo: '/App_Logo.png'
};

// Storage key for persisting logos
const STORAGE_KEY = 'app_logos';

// Create the context
const LogoContext = createContext(null);

/**
 * LogoProvider - Provides logo state to the entire app
 * Wraps the app at the root level to make logos accessible everywhere
 */
export const LogoProvider = ({ children }) => {
    // Initialize from localStorage if available
    const [logos, setLogos] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_LOGOS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load logos from localStorage:', e);
        }
        return DEFAULT_LOGOS;
    });

    // Persist to localStorage when logos change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
        } catch (e) {
            console.warn('Failed to save logos to localStorage:', e);
        }
    }, [logos]);

    // Update Favicon when admin_small_logo changes
    useEffect(() => {
        if (logos.admin_small_logo) {
            const link = document.querySelector("link[rel~='icon']");
            if (!link) {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = logos.admin_small_logo;
                document.getElementsByTagName('head')[0].appendChild(newLink);
            } else {
                link.href = logos.admin_small_logo;
            }
        }
    }, [logos.admin_small_logo]);

    /**
     * Update a specific logo URL
     * @param {string} logoType - 'print_logo' | 'admin_logo' | 'admin_small_logo' | 'app_logo'
     * @param {string} url - The new logo URL
     */
    const updateLogo = (logoType, url) => {
        console.log(`LogoContext: Updating ${logoType} to ${url}`);
        setLogos(prev => ({
            ...prev,
            [logoType]: url
        }));
    };

    /**
     * Update multiple logos at once
     * @param {Object} newLogos - Object with logo type keys and URL values
     */
    const updateLogos = (newLogos) => {
        console.log('LogoContext: Updating multiple logos:', newLogos);
        setLogos(prev => ({
            ...prev,
            ...newLogos
        }));
    };

    /**
     * Reset logos to defaults
     */
    const resetLogos = () => {
        setLogos(DEFAULT_LOGOS);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <LogoContext.Provider value={{
            logos,
            updateLogo,
            updateLogos,
            resetLogos,
            DEFAULT_LOGOS
        }}>
            {children}
        </LogoContext.Provider>
    );
};

/**
 * Custom hook to access logo context
 * @returns {{ logos: Object, updateLogo: Function, updateLogos: Function, resetLogos: Function, DEFAULT_LOGOS: Object }}
 */
export const useLogo = () => {
    const context = useContext(LogoContext);
    if (!context) {
        console.warn('useLogo must be used within a LogoProvider. Using default logos.');
        return {
            logos: DEFAULT_LOGOS,
            updateLogo: () => { },
            updateLogos: () => { },
            resetLogos: () => { },
            DEFAULT_LOGOS
        };
    }
    return context;
};

export default LogoContext;
