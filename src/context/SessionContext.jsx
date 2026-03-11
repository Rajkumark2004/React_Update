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

    // Initialize from backend API on mount instead of localStorage
    useEffect(() => {
        let isMounted = true;
        const initFromBackend = async () => {
            try {
                if (localStorage.getItem('isLoggedIn') === 'true') {
                    console.log('SessionContext: User is logged in, fetching sessions...');
                    const response = await api.getSessions();
                    console.log('SessionContext: FULL getSessions response:', JSON.stringify(response, null, 2));
                    
                    const sessionList = response.data || [];
                    console.log('SessionContext: Session list count:', sessionList.length);
                    
                    if (isMounted && sessionList.length > 0) {
                        setSessions(sessionList);
                        
                        // User's plan: "make the one with active: field not zero as default"
                        console.log('SessionContext: Searching for default session (active !== "0")...');
                        sessionList.forEach(s => {
                            console.log(`SessionContext: Checking session ID: ${s.id}, Year: ${s.session}, Active: ${s.active}`);
                        });

                        const defaultObj = sessionList.find(s => s.active !== "0");
                        console.log('SessionContext: DEFINITIVE backend default object found:', defaultObj);

                        // Check if we have a manually selected session in storage
                        const storedSession = localStorage.getItem('activeSession');
                        console.log('SessionContext: localStorage activeSession string:', storedSession);
                        
                        if (storedSession) {
                            try {
                                const parsed = JSON.parse(storedSession);
                                console.log('SessionContext: Parsed stored session:', parsed);
                                const exists = sessionList.find(s => String(s.id) === String(parsed.id));
                                console.log('SessionContext: Does stored session exist in current list?', !!exists);
                                if (exists) {
                                    console.log('SessionContext: SUCCESS - Using manually selected session from localStorage:', exists);
                                    setCurrentSessionState(exists);
                                    setLoading(false);
                                    return;
                                } else {
                                    console.log('SessionContext: Stored session ID no longer exists in backend list.');
                                }
                            } catch (e) {
                                console.error('SessionContext: Failed to parse stored activeSession:', e);
                            }
                        }

                        // If no stored session or it's invalid, use the backend default
                        if (defaultObj) {
                            console.log('SessionContext: SETTING session to backend default:', defaultObj.session, `(ID: ${defaultObj.id})`);
                            setCurrentSessionState(defaultObj);
                            localStorage.setItem('activeSession', JSON.stringify(defaultObj));
                            localStorage.setItem('activeSessionId', defaultObj.id);
                        } else {
                            console.warn('SessionContext: WARNING - No non-zero "active" session found in response data!');
                            if (sessionList.length > 0) {
                                console.log('SessionContext: Falling back to first session in list:', sessionList[0]);
                                setCurrentSessionState(sessionList[0]);
                            }
                        }
                    } else {
                        console.warn('SessionContext: Received empty session list from backend.');
                    }
                } else {
                    console.log('SessionContext: User is NOT logged in (isLoggedIn !== true).');
                }
            } catch (e) {
                console.error('Failed to initialize session from backend:', e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        initFromBackend();
        return () => { isMounted = false; };
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

    // Set the current session and update localStorage cache for api.js
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

    // Initialize default session from backend API after login
    const initDefaultSession = useCallback(async () => {
        try {
            console.log('SessionContext: initDefaultSession called');
            const response = await api.getSessions();
            console.log('SessionContext: initDefaultSession Raw Response:', JSON.stringify(response, null, 2));
            const sessionList = response.data || [];
            
            if (sessionList.length > 0) {
                setSessions(sessionList);
                
                // Use the backend's "active" indicator for fresh login
                console.log('SessionContext: initDefaultSession searching for (active !== "0")...');
                sessionList.forEach(s => {
                    console.log(`SessionContext: post-login check - ID: ${s.id}, Year: ${s.session}, Active: ${s.active}`);
                });

                const defaultObj = sessionList.find(s => s.active !== "0");
                console.log('SessionContext: initDefaultSession determined default:', defaultObj);
                
                if (defaultObj) {
                    setCurrentSessionState(defaultObj);
                    localStorage.setItem('activeSession', JSON.stringify(defaultObj));
                    localStorage.setItem('activeSessionId', defaultObj.id);
                    console.log('SessionContext: Initialized backend default session:', defaultObj.session);
                    return defaultObj;
                }
            }
        } catch (error) {
            console.error('Failed to initialize default session from backend:', error);
        }
        return null;
    }, []);

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
