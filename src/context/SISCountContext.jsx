import React, { createContext, useContext, useState, useCallback } from 'react';

export const SISCountContext = createContext();

export const useSISCounts = () => {
    const context = useContext(SISCountContext);
    if (!context) {
        // Fallback to no-op if used outside provider (prevents crash)
        return { counts: {}, updateCount: () => {} };
    }
    return context;
};

// Module-level cache to persist counts across mounts
let _cachedCounts = {
    totalStudents: '...',
    onlineAdmissions: '...',
    disabledStudents: '...',
    bulkCount: '...',
    disableReasons: '...'
};

export const SISCountProvider = ({ children }) => {
    const [counts, setCounts] = useState(_cachedCounts);

    const updateCount = useCallback((tab, count) => {
        const tabMap = {
            details: 'totalStudents',
            online: 'onlineAdmissions',
            disabled: 'disabledStudents',
            bulk: 'bulkCount',
            reason: 'disableReasons'
        };

        const key = tabMap[tab];
        if (key) {
            setCounts(prev => {
                const next = { ...prev, [key]: count };
                _cachedCounts = next;
                return next;
            });
        }
    }, []);

    return (
        <SISCountContext.Provider value={{ counts, updateCount }}>
            {children}
        </SISCountContext.Provider>
    );
};
