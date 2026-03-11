import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const PermissionContext = createContext({
    permissionList: [],
    permissionsLoaded: false,
    refreshPermissions: () => {},
});

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
    const [permissionList, setPermissionList] = useState([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    const userRole = useMemo(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                return parsed.role || '';
            }
        } catch (e) { /* ignore */ }
        return '';
    }, []);

    const isSuperAdmin = userRole === 'Super Admin';

    const fetchPermissions = useCallback(async () => {
        if (isSuperAdmin) {
            setPermissionsLoaded(true);
            return;
        }
        try {
            const data = await api.getModulePermissions();
            setPermissionList(data.permissionList || []);
        } catch (err) {
            console.error('Failed to fetch module permissions:', err);
        } finally {
            setPermissionsLoaded(true);
        }
    }, [isSuperAdmin]);

    // Fetch once on app load
    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const value = useMemo(() => ({
        permissionList,
        permissionsLoaded,
        isSuperAdmin,
        refreshPermissions: fetchPermissions,
    }), [permissionList, permissionsLoaded, isSuperAdmin, fetchPermissions]);

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export default PermissionContext;
