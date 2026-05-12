import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const HelpdeskCountContext = createContext();

export const HelpdeskCountProvider = ({ children }) => {
    const [counts, setCounts] = useState({
        totalEnquiries: 0,
        totalSources: 0,
        totalReferences: 0,
        totalVisitors: 0,
        totalCalls: 0,
        totalComplaints: 0
    });

    const [activeMetric, setActiveMetric] = useState('source');

    const updateCount = (key, value) => {
        setCounts(prev => ({
            ...prev,
            [key]: typeof value === 'number' ? value : 0
        }));
    };

    // Pre-fetch counts to avoid starting at 0
    const fetchInitialCounts = async () => {
        try {
            // Fetch multiple counts in parallel
            const [enquiryRes, sourceRes, referenceRes] = await Promise.all([
                api.getEnquiryList(),
                api.getSourceList(),
                api.getReferenceList()
            ]);

            const enquiryCount = (enquiryRes?.data?.enquiry_list || enquiryRes?.enquiry_list || []).length;
            const sourceCount = (sourceRes?.data || sourceRes || []).length;
            const referenceCount = (referenceRes?.data || referenceRes || []).length;

            setCounts(prev => ({
                ...prev,
                totalEnquiries: enquiryCount,
                totalSources: sourceCount,
                totalReferences: referenceCount
            }));
        } catch (error) {
            console.error('Error fetching initial helpdesk counts:', error);
        }
    };

    useEffect(() => {
        fetchInitialCounts();
    }, []);

    return (
        <HelpdeskCountContext.Provider value={{ counts, updateCount, activeMetric, setActiveMetric }}>
            {children}
        </HelpdeskCountContext.Provider>
    );
};

export const useHelpdeskCounts = () => {
    const context = useContext(HelpdeskCountContext);
    if (!context) {
        throw new Error('useHelpdeskCounts must be used within a HelpdeskCountProvider');
    }
    return context;
};
