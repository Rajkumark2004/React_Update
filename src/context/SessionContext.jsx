import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ============================================================================
// SESSION CONTEXT
// Manages the active session (academic year) globally.
// ============================================================================

// ============================================================================
// SESSION CONTEXT
// Manages the active session (academic year) globally.
// ============================================================================

const SessionContext = createContext(null);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    // List of all available sessions (initialize empty)
    const [sessions, setSessions] = useState([]);
    // Currently active session object { id, session }
    const [currentSession, setCurrentSessionState] = useState(null);
    // Loading state
    const [loading, setLoading] = useState(true);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedSession = localStorage.getItem('activeSession');
        if (storedSession) {
            try {
                setCurrentSessionState(JSON.parse(storedSession));
            } catch (e) {
                console.error('Failed to parse stored session:', e);
            }
        }
        setLoading(false);
    }, []);

    // Fetch all sessions from API
    const fetchSessions = useCallback(async () => {
        try {
            const data = await api.getSessions();
            console.log('SessionContext: Raw API response:', data);

            // API may return sessions in various properties
            // Try common patterns: result, session, data, sessions
            let sessionList = [];
            if (Array.isArray(data)) {
                sessionList = data;
            } else if (data.result && Array.isArray(data.result)) {
                sessionList = data.result;
            } else if (data.session && Array.isArray(data.session)) {
                sessionList = data.session;
            } else if (data.sessions && Array.isArray(data.sessions)) {
                sessionList = data.sessions;
            } else if (data.data && Array.isArray(data.data)) {
                sessionList = data.data;
            }

            console.log('SessionContext: Extracted sessions:', sessionList);

            if (sessionList.length > 0) {
                setSessions(sessionList);
                return sessionList;
            }
        } catch (error) {
            console.error('Failed to fetch sessions from API:', error);
        }
        // If API fails or returns no sessions, we have no sessions
        setSessions([]);
        return [];
    }, []);

    // Set the current session and persist to localStorage
    const setCurrentSession = useCallback((session) => {
        setCurrentSessionState(session);
        if (session) {
            localStorage.setItem('activeSession', JSON.stringify(session));
            localStorage.setItem('activeSessionId', session.id);
        } else {
            localStorage.removeItem('activeSession');
            localStorage.removeItem('activeSessionId');
        }
    }, []);

    // Initialize default session after login
    // Called after successful login to set the default session from General Settings
    const initDefaultSession = useCallback(async () => {
        try {
            // Fetch all available sessions
            const fetchedSessions = await fetchSessions();

            // Get default session ID - first try localStorage (set by General Settings save)
            let defaultSessionId = localStorage.getItem('defaultSessionId');
            console.log('Default session ID from localStorage:', defaultSessionId);

            // If not in localStorage, try the API
            if (!defaultSessionId) {
                try {
                    const settingsData = await api.getGeneralSettings();
                    if (settingsData.status && settingsData.result) {
                        defaultSessionId = settingsData.result.sch_session_id;
                        console.log('Default session ID from API:', defaultSessionId);
                    }
                } catch (settingsError) {
                    console.error('Failed to fetch General Settings from API:', settingsError);
                }
            }

            // If still no default, use 2024-25 (ID 9) as the sensible default for first-time users
            if (!defaultSessionId) {
                defaultSessionId = '9'; // 2024-25
                console.log('Using hardcoded default session ID for first-time user:', defaultSessionId);
            }

            if (fetchedSessions.length > 0) {
                let defaultSession;

                if (defaultSessionId) {
                    // Find session matching the General Settings default
                    defaultSession = fetchedSessions.find(s => String(s.id) === String(defaultSessionId));
                    console.log('Found matching session:', defaultSession);
                }

                // Fallback: use session marked as is_active, or first session
                if (!defaultSession) {
                    defaultSession = fetchedSessions.find(s => s.is_active === '1') || fetchedSessions[0];
                    console.log('Using fallback session:', defaultSession);
                }

                setCurrentSession(defaultSession);
                console.log('Initialized session to:', defaultSession);
                return defaultSession;
            }
        } catch (error) {
            console.error('Failed to initialize default session:', error);
        }
        return null;
    }, [fetchSessions, setCurrentSession]);

    // Clear session on logout
    const clearSession = useCallback(() => {
        setCurrentSessionState(null);
        localStorage.removeItem('activeSession');
        localStorage.removeItem('activeSessionId');
    }, []);

    const value = {
        sessions,
        currentSession,
        loading,
        fetchSessions,
        setCurrentSession,
        initDefaultSession,
        clearSession,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
