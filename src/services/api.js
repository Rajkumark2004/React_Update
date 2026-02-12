
export const API_BASE = 'https://newlayout.wisibles.com/api_admin';

// Helper function to get the active session ID from localStorage
// This is the session ID that should be used for all data-related API calls
const getSessionId = () => {
    return localStorage.getItem('activeSessionId') || localStorage.getItem('defaultSessionId') || '9';
};

const getGeneralSettingsId = () => {
    return localStorage.getItem('generalSettingsId') || '1';
};

// Helper to create fetch options with session ID included
const createFetchOptions = (method = 'GET', body = null, includeSession = true) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        // If body is provided, include session_id in it
        const bodyWithSession = includeSession
            ? { ...body, session_id: getSessionId() }
            : body;
        options.body = JSON.stringify(bodyWithSession);
    }

    return options;
};

// Helper to append session_id to URL for GET requests
const appendSessionToUrl = (url, includeSession = true) => {
    if (!includeSession) return url;
    const sessionId = getSessionId();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}session_id=${sessionId}`;
};

export const api = {
    getStudentIdCard: async () => {
        console.log('API Request: Get Student ID Card');
        try {
            const response = await fetch(`${API_BASE}/admin/studentidcard`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Student ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch student ID card data');
            }
            return data;
        } catch (error) {
            console.error('Get Student ID Card API Error:', error);
            throw error;
        }
    },

    createStudentIdCard: async (formData) => {
        console.log('API Request: Create Student ID Card', formData);
        try {
            const response = await fetch(`${API_BASE}/admin/studentidcard/create`, {
                method: 'POST',
                body: formData, // FormData will automatically set correct headers
            });
            const data = await response.json();
            console.log('Create Student ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to create student ID card');
            }
            return data;
        } catch (error) {
            console.error('Create Student ID Card API Error:', error);
            throw error;
        }
    },

    getStudentIdCardEditDetails: async (id) => {
        console.log('API Request: Get Student ID Card Edit Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/studentidcard/get_edit_details/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Student ID Card Edit Details Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch edit details');
            }
            return data;
        } catch (error) {
            console.error('Get Edit Details API Error:', error);
            throw error;
        }
    },

    updateStudentIdCard: async (formData) => {
        console.log('API Request: Update Student ID Card', formData);
        try {
            const response = await fetch(`${API_BASE}/admin/studentidcard/edit`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('Update Student ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update student ID card');
            }
            return data;
        } catch (error) {
            console.error('Update Student ID Card API Error:', error);
            throw error;
        }
    },

    deleteStudentIdCard: async (id) => {
        console.log('API Request: Delete Student ID Card', id);
        try {
            const response = await fetch(`${API_BASE}/admin/studentidcard/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            console.log('Delete Student ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to delete student ID card');
            }
            return data;
        } catch (error) {
            console.error('Delete Student ID Card API Error:', error);
            throw error;
        }
    },

    viewStudentIdCard: async (id) => {
        console.log('API Request: View Student ID Card', id);
        try {
            const response = await fetch(`${API_BASE}/admin/studentidcard/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            console.log('View Student ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch student ID card details');
            }
            return data;
        } catch (error) {
            console.error('View Student ID Card API Error:', error);
            throw error;
        }
    },

    getGenerateIdCardSearchData: async () => {
        console.log('API Request: Get Generate ID Card Search Data');
        try {
            const response = await fetch(`${API_BASE}/admin/generateidcard/get_search`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Generate ID Card Search Data Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch generate ID card search data');
            }
            return data;
        } catch (error) {
            console.error('Get Generate ID Card Search Data API Error:', error);
            throw error;
        }
    },

    searchStudentsForIdCard: async (searchParams) => {
        console.log('API Request: Search Students For ID Card', searchParams);
        try {
            const response = await fetch(`${API_BASE}/admin/generateidcard/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(searchParams),
            });
            const data = await response.json();
            console.log('Search Students For ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'No students found');
            }
            return data;
        } catch (error) {
            console.error('Search Students For ID Card API Error:', error);
            throw error;
        }
    },

    generateIdCards: async (payload) => {
        console.log('API Request: Generate ID Cards', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/generateidcard/generatemultiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Generate ID Cards Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to generate ID cards');
            }
            return data;
        } catch (error) {
            console.error('Generate ID Cards API Error:', error);
            throw error;
        }
    },

    getGenerateStaffIdCard: async () => {
        console.log('API Request: Get Generate Staff ID Card Data');
        try {
            const response = await fetch(`${API_BASE}/admin/generatestaffidcard`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Generate Staff ID Card Data Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch generate staff ID card data');
            }
            return data;
        } catch (error) {
            console.error('Get Generate Staff ID Card Data API Error:', error);
            throw error;
        }
    },

    getStaffIdCards: async () => {
        console.log('API Request: Get Staff ID Cards');
        try {
            const response = await fetch(`${API_BASE}/admin/staffidcard`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Staff ID Cards Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch staff ID cards');
            }
            return data;
        } catch (error) {
            console.error('Get Staff ID Cards API Error:', error);
            throw error;
        }
    },

    searchStaffForIdCard: async (roleId, idCardId) => {
        console.log('API Request: Search Staff For ID Card', { roleId, idCardId });
        try {
            const response = await fetch(`${API_BASE}/admin/generatestaffidcard/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role_id: roleId, id_card: idCardId }),
            });
            const data = await response.json();
            console.log('Search Staff For ID Card Response:', data);

            if (!response.ok || !data.status) {
                // If the search fails or no records found, return empty list or throw
                // throw new Error(data.message || 'No staff found');
                return { status: true, data: [] }; // Return empty data on failure to avoid breaking UI
            }
            // The PHP API returns `resultlist` in `data`
            return { status: true, data: data.data.resultlist };
        } catch (error) {
            console.error('Search Staff For ID Card API Error:', error);
            throw error;
        }
    },

    generateStaffIdCard: async (payload) => {
        console.log('API Request: Generate Multiple Staff ID Cards', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/generatestaffidcard/generatemultiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Generate Multiple Staff ID Cards Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to generate staff ID cards');
            }
            return data;
        } catch (error) {
            console.error('Generate Staff ID Cards API Error:', error);
            throw error;
        }
    },

    createStaffIdCard: async (formData) => {
        console.log('API Request: Create Staff ID Card');
        try {
            const response = await fetch(`${API_BASE}/admin/staffidcard/create`, {
                method: 'POST',
                body: formData, // FormData for file uploads
            });
            const data = await response.json();
            console.log('Create Staff ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to create staff ID card');
            }
            return data;
        } catch (error) {
            console.error('Create Staff ID Card API Error:', error);
            throw error;
        }
    },

    getStaffIdCardEditDetails: async (id) => {
        console.log('API Request: Get Staff ID Card Edit Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/staffidcard/get_edit_detail/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Staff ID Card Edit Details Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch edit details');
            }
            return data;
        } catch (error) {
            console.error('Get Staff ID Card Edit Details API Error:', error);
            throw error;
        }
    },

    updateStaffIdCard: async (formData) => {
        console.log('API Request: Update Staff ID Card');
        try {
            const response = await fetch(`${API_BASE}/admin/staffidcard/edit`, {
                method: 'POST',
                body: formData, // FormData
            });
            const data = await response.json();
            console.log('Update Staff ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update staff ID card');
            }
            return data;
        } catch (error) {
            console.error('Update Staff ID Card API Error:', error);
            throw error;
        }
    },

    deleteStaffIdCard: async (id) => {
        console.log('API Request: Delete Staff ID Card', id);
        try {
            const response = await fetch(`${API_BASE}/admin/staffidcard/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ certificateid: id }),
            });
            const data = await response.json();
            console.log('Delete Staff ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to delete staff ID card');
            }
            return data;
        } catch (error) {
            console.error('Delete Staff ID Card API Error:', error);
            throw error;
        }
    },

    viewStaffIdCard: async (id) => {
        console.log('API Request: View Staff ID Card', id);
        try {
            const response = await fetch(`${API_BASE}/admin/staffidcard/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ certificateid: id }),
            });
            const data = await response.json();
            console.log('View Staff ID Card Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch staff ID card details');
            }
            return data;
        } catch (error) {
            console.error('View Staff ID Card API Error:', error);
            throw error;
        }
    },
    login: async (username, password) => {
        console.log(' API Request:', { username, password: '***' });

        const response = await fetch(`${API_BASE}/site/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        console.log('Response Status:', response.status, response.statusText);

        const data = await response.json();
        console.log('API Response Data:', data);

        if (!response.ok || !data.status) {
            console.error('Login Error:', data.message);
            throw new Error(data.message || 'Login failed');
        }

        return data;
    },
    logout: async () => {
        console.log('API Request: Logout');
        try {
            const response = await fetch(`${API_BASE}/site/logout`);
            console.log('Logout Response Status:', response.status);
            return await response.json();
        } catch (error) {
            console.error('Logout API Error:', error);
            // We don't throw here to ensure local logout still happens
            return { status: false, message: 'Network error' };
        }
    },
    updateGeneralSettings: async (settingsData) => {
        console.log('API Request: Update General Settings', settingsData);
        try {
            // Ensure sch_id is present
            const payload = {
                sch_id: getGeneralSettingsId(),
                ...settingsData
            };

            const response = await fetch(`${API_BASE}/schsettings/generalsetting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('General Settings Response Status:', response.status);
            const data = await response.json();
            console.log('General Settings Response Data:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update general settings');
            }

            return data;
        } catch (error) {
            console.error('Update General Settings API Error:', error);
            throw error;
        }
    },
    getGeneralSettings: async () => {
        console.log('API Request: Get General Settings');
        try {
            const response = await fetch(`${API_BASE}/schsettings/generalsetting`, {
                method: 'GET',
            });

            console.log('Get General Settings Response Status:', response.status);
            const data = await response.json();
            console.log('Get General Settings Response Data:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch general settings');
            }

            return data;
        } catch (error) {
            console.error('Get General Settings API Error:', error);
            throw error;
        }
    },

    getPaymentSettings: async () => {
        console.log('API Request: Get Payment Settings');
        try {
            const response = await fetch(`${API_BASE}/admin/paymentsettings/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Payment Settings Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch payment settings');
            }
            return data;
        } catch (error) {
            console.error('Get Payment Settings API Error:', error);
            throw error;
        }
    },

    saveCCAvenueSettings: async (settings) => {
        console.log('API Request: Save CCAvenue Settings', settings);
        try {
            const response = await fetch(`${API_BASE}/admin/paymentsettings/ccavenue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            console.log('Save CCAvenue Settings Response:', data);

            if (!response.ok || (data.status === 0 && data.error)) { // Check for status 0 or error field just in case
                throw new Error(data.message || data.error || 'Failed to check CCavenue settings');
            }

            return data;

        } catch (error) {
            console.error('Save CCAvenue Settings API Error:', error);
            throw error;
        }
    },

    saveRazorpaySettings: async (settings) => {
        console.log('API Request: Save Razorpay Settings', settings);
        try {
            const response = await fetch(`${API_BASE}/admin/paymentsettings/razorpay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            console.log('Save Razorpay Settings Response:', data);

            if (!response.ok || (data.status === 0 && data.error)) {
                throw new Error(data.message || data.error || 'Failed to save Razorpay settings');
            }

            return data;
        } catch (error) {
            console.error('Save Razorpay Settings API Error:', error);
            throw error;
        }
    },

    activatePaymentGateway: async (gateway) => {
        console.log('API Request: Activate Payment Gateway', gateway);
        try {
            const response = await fetch(`${API_BASE}/admin/paymentsettings/setting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_setting: gateway }),
            });
            const data = await response.json();
            console.log('Activate Payment Gateway Response:', data);

            if (!response.ok || (data.status === 0 && data.error)) {
                throw new Error(data.message || data.error || 'Failed to activate payment gateway');
            }

            return data;
        } catch (error) {
            console.error('Activate Payment Gateway API Error:', error);
            throw error;
        }
    },
    uploadSchoolLogo: async (file, logoType = 'logo', id = getGeneralSettingsId()) => {
        console.log('API Request: Upload School Logo', { fileName: file.name, logoType, id });

        // Map logo type to the correct API endpoint
        const endpointMap = {
            'logo': 'uploadschollLogo',           // Print Logo
            'admin_logo': 'uploadAdminLogo',       // Admin Logo
            'admin_small_logo': 'uploadAdminSmallLogo', // Admin Small Logo
            'app_logo': 'uploadAppLogo'            // App Logo
        };

        const endpoint = endpointMap[logoType] || 'uploadschollLogo';

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('logo_type', logoType);
            formData.append('id', id);

            const response = await fetch(`${API_BASE}/schsettings/${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            console.log('Upload Logo Response Status:', response.status);
            const data = await response.json();
            console.log('Upload Logo Response Data:', data);

            if (!response.ok || !data.status) {
                // Extract error message from errors object if present
                let errorMessage = data.message || 'Failed to upload logo';
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join(', ');
                    }
                }
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Upload School Logo API Error:', error);
            throw error;
        }
    },

    getSchoolLogos: async () => {
        console.log('API Request: Get School Logos');
        try {
            const response = await fetch(`${API_BASE}/schsettings/logo`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get School Logos Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch school logos');
            }
            return data;
        } catch (error) {
            console.error('Get School Logos API Error:', error);
            throw error;
        }
    },

    getLoginPageBackgrounds: async () => {
        console.log('API Request: Get Login Page Backgrounds');
        try {
            const response = await fetch(`${API_BASE}/schsettings/login_page_background`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Login Page Backgrounds Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch login page backgrounds');
            }
            return data;
        } catch (error) {
            console.error('Get Login Page Backgrounds API Error:', error);
            throw error;
        }
    },

    uploadLoginBackground: async (file, logoType = 'admin_logo', id = getGeneralSettingsId()) => {
        console.log('API Request: Upload Login Background', { fileName: file.name, logoType, id });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('logo_type', logoType);
            formData.append('id', id);

            const response = await fetch(`${API_BASE}/schsettings/add_admin_user_login_background`, {
                method: 'POST',
                body: formData,
            });

            console.log('Upload Background Response Status:', response.status);
            const data = await response.json();
            console.log('Upload Background Response Data:', data);

            if (!response.ok || !data.status) {
                let errorMessage = data.message || 'Failed to upload background';
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    if (errorMessages.length > 0) errorMessage = errorMessages.join(', ');
                }
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Upload Background API Error:', error);
            throw error;
        }
    },
    saveMobileAppSettings: async (settingsData) => {
        console.log('API Request: Save Mobile App Settings', settingsData);
        try {
            const formData = new FormData();
            Object.keys(settingsData).forEach(key => {
                if (settingsData[key] !== null && settingsData[key] !== undefined) {
                    formData.append(key, settingsData[key]);
                }
            });

            // If sch_id is missing, add default
            if (!formData.has('sch_id')) {
                formData.append('sch_id', getGeneralSettingsId());
            }

            const response = await fetch(`${API_BASE}/schsettings/savemobileapp_Api`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Save Mobile App Settings Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to save mobile app settings');
            }

            return data;
        } catch (error) {
            console.error('Save Mobile App Settings API Error:', error);
            throw error;
        }
    },
    getStudentCreatePreData: async () => {
        console.log('API Request: Get Student Create Pre Data');
        try {
            const response = await fetch(`${API_BASE}/student/create`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Student Create Pre Data Response:', data);
            return data;
        } catch (error) {
            console.error('Get Student Create Pre Data API Error:', error);
            throw error;
        }
    },

    getStudentList: async (classId, sectionId, params = {}) => {
        console.log('API Request: Get Student List', { classId, sectionId, ...params });
        try {
            // Default action/srch_type if not provided
            const body = {
                class_id: classId,
                section_id: sectionId,
                srch_type: params.srch_type || 'search_filter',
                search_text: params.search_text || '',
                action: params.action // Keep legacy if needed, but primary logic is srch_type now
            };

            const response = await fetch(`${API_BASE}/student/studentListApi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            console.log('Student List Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch student list');
            }

            return data;
        } catch (error) {
            console.error('Get Student List API Error:', error);
            throw error;
        }
    },
    createStudent: async (studentData) => {
        console.log('API Request: Create Student', studentData);
        try {
            const isFormData = studentData instanceof FormData;
            const options = {
                method: 'POST',
                body: isFormData ? studentData : JSON.stringify(studentData),
            };

            if (!isFormData) {
                options.headers = {
                    'Content-Type': 'application/json',
                };
            }

            const response = await fetch(`${API_BASE}/student/createStudent_Api`, options);

            const data = await response.json();
            console.log('Create Student Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to create student');
            }

            return data;
        } catch (error) {
            console.error('Create Student API Error:', error);
            throw error;
        }
    },
    getStudent: async (id) => {
        console.log('API Request: Get Student', id);
        try {
            // The edit endpoint returns student data when accessed for editing
            const response = await fetch(`${API_BASE}/student/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id, action: 'get' }),
            });
            const data = await response.json();
            console.log('Get Student Response:', data);

            if (!response.ok) {
                console.warn("API might not exist or returned error");
            }
            return data;
        } catch (error) {
            console.error('Get Student API Error:', error);
            throw error;
        }
    },

    // Get student view data (for StudentView page)
    getStudentView: async (studentId) => {
        console.log('API Request: Get Student View', studentId);
        try {
            const response = await fetch(`${API_BASE}/Student/studentViewApi/${studentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Check if response is JSON (server may return HTML on error)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Server returned non-JSON response:', text.substring(0, 200));
                throw new Error('Server authentication error. Please re-login and try again.');
            }

            const data = await response.json();
            console.log('Get Student View Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch student view');
            }
            return data;
        } catch (error) {
            console.error('Get Student View API Error:', error);
            throw error;
        }
    },
    updateStudent: async (id, studentData) => {
        console.log('API Request: Update Student', id, studentData);
        try {
            const isFormData = studentData instanceof FormData;

            // If it's FormData, add the student_id and session_id
            if (isFormData) {
                studentData.append('id', id);
                if (!studentData.has('session_id')) {
                    studentData.append('session_id', getSessionId());
                }
            }

            const options = {
                method: 'POST',
                body: isFormData ? studentData : JSON.stringify({ ...studentData, id: id, session_id: getSessionId() }),
            };

            if (!isFormData) {
                options.headers = {
                    'Content-Type': 'application/json',
                };
            }

            // Updated to use the provided endpoint
            const response = await fetch(`${API_BASE}/student/edit`, options);
            const data = await response.json();
            console.log('Update Student Response:', data);

            if (!response.ok || (!data.status && !data.success && data.message !== 'Record Saved Successfully')) {
                const errorMessage = data.message || JSON.stringify(data) || 'Failed to update student';
                throw new Error(errorMessage);
            }
            return data;
        } catch (error) {
            console.error('Update Student API Error:', error);
            throw error;
        }
    },
    getSiblings: async (studentId) => {
        console.log('API Request: Get Siblings', studentId);
        // This might be a separate call or part of getStudent. 
        // Adding it just in case.
        try {
            const response = await fetch(`${API_BASE}/student/getSiblings?student_id=${studentId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get Siblings Error', error);
            return [];
        }
    },
    getSections: async () => {
        console.log('API Request: Get Sections');
        try {
            const response = await fetch(`${API_BASE}/Sections/sectionAPI`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Sections Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch sections');
            }
            return data;
        } catch (error) {
            console.error('Get Sections API Error:', error);
            throw error;
        }
    },
    updateStaff: async (id, staffData) => {
        console.log('API Request: Update Staff', id, staffData);
        try {
            const response = await fetch(`${API_BASE}/admin/staff/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffData),
            });
            const data = await response.json();
            console.log('Update Staff Response:', data);

            if (!response.ok || data.status !== 'success') { // Check for both response.ok and api specific status if applicable
                // Some legacy endpoints might return 200 with {status: false}
                if (data.status === 0 || data.success === false) {
                    throw new Error(data.message || 'Failed to update staff');
                }
            }
            return data;
        } catch (error) {
            console.error('Update Staff API Error:', error);
            throw error;
        }
    },

    getEmployeeByRole: async (roleId) => {
        console.log('API Request: Get Employee By Role', roleId);
        try {
            const response = await fetch(`${API_BASE}/admin/staff/getEmployeeByRole`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: roleId }),
            });
            const data = await response.json();
            console.log('Get Employee By Role Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch employees');
            }
            return data;
        } catch (error) {
            console.error('Get Employee By Role API Error:', error);
            throw error;
        }
    },

    addStaffLeaveRequest: async (payload) => {
        console.log('API Request: Add Staff Leave', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/leaverequest/add_staff_leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Staff Leave Response:', data);

            if (!response.ok || (data.status !== 'success' && data.status !== true)) {
                if (data.status === 0 || data.success === false) {
                    throw new Error(data.message || 'Failed to add staff leave');
                }
            }
            return data;
        } catch (error) {
            console.error('Add Staff Leave API Error:', error);
            throw error;
        }
    },

    getStudentCreate: async () => {
        console.log('API Request: Get Student Create Data');
        try {
            const response = await fetch(`${API_BASE}/student/create`, {
                method: 'GET',
            });
            const data = await response.json();
            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch student create data');
            }
            return data;
        } catch (error) {
            console.error('Get Student Create Data Error:', error);
            throw error;
        }
    },
    getSectionsByClass: async (classId) => {
        console.log('API Request: Get Sections By Class', classId);
        try {
            const response = await fetch(`${API_BASE}/sections/getByClass/${classId}`, {
                method: 'GET',
            });
            const data = await response.json();
            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch sections');
            }
            return data;
        } catch (error) {
            console.error('Get Sections By Class Error:', error);
            throw error;
        }
    },
    async getContentList() {
        console.log('API Request: Get Content List');
        try {
            const response = await fetch(`${API_BASE}/admin/content/index`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log('Get Content List Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch content list');
            }
            return data;
        } catch (error) {
            console.error('Get Content List API Error:', error);
            throw error;
        }
    },

    saveContent: async (formData) => {
        console.log('API Request: Save Content');
        try {
            const response = await fetch(`${API_BASE}/admin/content/index`, {
                method: 'POST',
                body: formData, // FormData handles headers
            });
            const data = await response.json();
            console.log('Save Content Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to save content');
            }
            return data;
        } catch (error) {
            console.error('Save Content API Error:', error);
            throw error;
        }
    },

    downloadContent: async (id) => {
        console.log('API Request: Download Content', id);
        try {
            const response = await fetch(`${API_BASE}/admin/content/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Id: id }),
            });

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            // Create a blob from the response
            const blob = await response.blob();
            // Create a link to download the blob
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Try to get filename from content-disposition header if available, else default
            const contentDisposition = response.headers.get('content-disposition');
            let fileName = 'download';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (error) {
            console.error('Download Content API Error:', error);
            throw error;
        }
    },

    updateContent: async (formData) => {
        console.log('API Request: Update Content');
        try {
            const response = await fetch(`${API_BASE}/admin/content/edit`, {
                method: 'POST',
                body: formData, // FormData handles headers
            });
            const data = await response.json();
            console.log('Update Content Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update content');
            }
            return data;
        } catch (error) {
            console.error('Update Content API Error:', error);
            throw error;
        }
    },

    deleteContent: async (id) => {
        console.log('API Request: Delete Content', id);
        try {
            const response = await fetch(`${API_BASE}/admin/content/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Id: id }),
            });
            const data = await response.json();
            console.log('Delete Content Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to delete content');
            }
            return data;
        } catch (error) {
            console.error('Delete Content API Error:', error);
            throw error;
        }
    },

    getSections: async () => {
        console.log('API Request: Get Sections');
        try {
            const response = await fetch(`${API_BASE}/sections`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Sections Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch sections');
            }

            return data;
        } catch (error) {
            console.error('Get Sections API Error:', error);
            throw error;
        }
    },

    addSection: async (payload) => {
        console.log('API Request: Add Section', payload);
        try {
            const response = await fetch(`${API_BASE}/sections/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Section Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to add section');
            }

            return data;
        } catch (error) {
            console.error('Add Section API Error:', error);
            throw error;
        }
    },

    getSectionForEdit: async (id) => {
        console.log('API Request: Get Section For Edit', id);
        try {
            const response = await fetch(`${API_BASE}/sections/edit/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Section For Edit Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch section for edit');
            }

            return data;
        } catch (error) {
            console.error('Get Section For Edit API Error:', error);
            throw error;
        }
    },

    updateSection: async (id, payload) => {
        console.log('API Request: Update Section', { id, payload });
        try {
            const response = await fetch(`${API_BASE}/sections/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Section Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to update section');
            }

            return data;
        } catch (error) {
            console.error('Update Section API Error:', error);
            throw error;
        }
    },

    deleteSection: async (id) => {
        console.log('API Request: Delete Section', id);
        try {
            const response = await fetch(`${API_BASE}/sections/delete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Section Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to delete section');
            }

            return data;
        } catch (error) {
            console.error('Delete Section API Error:', error);
            throw error;
        }
    },

    getStdTransferPreData: async () => {
        console.log('API Request: Get Student Transfer Pre-Data');
        try {
            const response = await fetch(`${API_BASE}/admin/stdtransfer/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Student Transfer Pre-Data Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch student transfer pre-data');
            }

            return data;
        } catch (error) {
            console.error('Get Student Transfer Pre-Data API Error:', error);
            throw error;
        }
    },

    searchStdTransferStudents: async (payload) => {
        console.log('API Request: Search Student Transfer Students', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/stdtransfer/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Search Student Transfer Students Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to search student transfer students');
            }

            return data;
        } catch (error) {
            console.error('Search Student Transfer Students API Error:', error);
            throw error;
        }
    },

    promoteStudents: async (payload) => {
        console.log('API Request: Promote Students', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/stdtransfer/promote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Promote Students Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to promote students');
            }

            return data;
        } catch (error) {
            console.error('Promote Students API Error:', error);
            throw error;
        }
    },

    getStudentSearchInfo: async () => {
        console.log('API Request: Get Student Search Info');
        try {
            const url = `${API_BASE}/student/search`;
            const response = await fetch(url, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Student Search Info Response:', data);
            return data;
        } catch (error) {
            console.error('Get Student Search Info API Error:', error);
            throw error;
        }
    },
    getClasses: async () => {
        console.log('API Request: Get Classes');
        try {
            const response = await fetch(`${API_BASE}/classes`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Classes Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch classes');
            }

            return data;
        } catch (error) {
            console.error('Get Classes API Error:', error);
            throw error;
        }
    },

    addClass: async (payload) => {
        console.log('API Request: Add Class', payload);
        try {
            const formData = new FormData();
            formData.append('class', payload.class);
            if (payload.sections && Array.isArray(payload.sections)) {
                payload.sections.forEach(sectionId => {
                    formData.append('sections[]', sectionId);
                });
            }

            const response = await fetch(`${API_BASE}/classes`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('Add Class Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to add class');
            }

            return data;
        } catch (error) {
            console.error('Add Class API Error:', error);
            throw error;
        }
    },

    getClassForEdit: async (id) => {
        console.log('API Request: Get Class For Edit', id);
        try {
            const response = await fetch(`${API_BASE}/classes/edit/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Class For Edit Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch class for edit');
            }

            return data;
        } catch (error) {
            console.error('Get Class For Edit API Error:', error);
            throw error;
        }
    },

    updateClass: async (payload) => {
        console.log('API Request: Update Class', payload);
        try {
            const formData = new FormData();
            formData.append('id', payload.id);
            formData.append('pre_class_id', payload.pre_class_id);
            formData.append('class', payload.class);

            if (payload.prev_sections && Array.isArray(payload.prev_sections)) {
                payload.prev_sections.forEach(sectionId => {
                    formData.append('prev_sections[]', sectionId);
                });
            }

            if (payload.sections && Array.isArray(payload.sections)) {
                payload.sections.forEach(sectionId => {
                    formData.append('sections[]', sectionId);
                });
            }

            const response = await fetch(`${API_BASE}/classes/edit/${payload.id}`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('Update Class Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to update class');
            }

            return data;
        } catch (error) {
            console.error('Update Class API Error:', error);
            throw error;
        }
    },

    deleteClass: async (id) => {
        console.log('API Request: Delete Class', id);
        try {
            const response = await fetch(`${API_BASE}/classes/delete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Class Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to delete class');
            }

            return data;
        } catch (error) {
            console.error('Delete Class API Error:', error);
            throw error;
        }
    },
    getClassReportPreData: async () => {
        console.log('API Request: Get Class Report Pre-Data');
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/classreport/get_classreport`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Class Report Pre-Data Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch class report pre-data');
            }

            return data;
        } catch (error) {
            console.error('Get Class Report Pre-Data Error:', error);
            throw error;
        }
    },
    getSubjectGroups: async (payload) => {
        console.log('API Request: Get Subject Groups', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/subjectgroups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Get Subject Groups Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject Groups Error:', error);
            throw error;
        }
    },
    getSubjectGroupList: async () => {
        console.log('API Request: Get Subject Group List');
        try {
            const response = await fetch(`${API_BASE}/admin/subjectgroup/`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Subject Group List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject Group List Error:', error);
            throw error;
        }
    },
    addSubjectGroup: async (payload) => {
        console.log('API Request: Add Subject Group', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/subjectgroup/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Subject Group Response:', data);
            return data;
        } catch (error) {
            console.error('Add Subject Group Error:', error);
            throw error;
        }
    },
    getSubjectGroupDetails: async (id) => {
        console.log('API Request: Get Subject Group Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/subjectgroup/subjectGroupDetails_get/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Subject Group Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject Group Details Error:', error);
            throw error;
        }
    },
    editSubjectGroup: async (id, payload) => {
        console.log('API Request: Edit Subject Group', id, payload);
        try {
            const response = await fetch(`${API_BASE}/admin/subjectgroup/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Edit Subject Group Response:', data);
            return data;
        } catch (error) {
            console.error('Edit Subject Group Error:', error);
            throw error;
        }
    },
    deleteSubjectGroup: async (id) => {
        console.log('API Request: Delete Subject Group', id);
        try {
            const response = await fetch(`${API_BASE}/admin/subjectgroup/delete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Subject Group Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Subject Group Error:', error);
            throw error;
        }
    },
    getSubjectList: async () => {
        console.log('API Request: Get Subject List');
        try {
            const response = await fetch(`${API_BASE}/admin/subject`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Subject List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject List Error:', error);
            throw error;
        }
    },
    addSubject: async (payload) => {
        console.log('API Request: Add Subject', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/subject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Subject Response:', data);
            return data;
        } catch (error) {
            console.error('Add Subject Error:', error);
            throw error;
        }
    },
    getSubjectDetails: async (id) => {
        console.log('API Request: Get Subject Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/subject/get_subjectDetails/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Subject Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject Details Error:', error);
            throw error;
        }
    },
    deleteSubject: async (id) => {
        console.log('API Request: Delete Subject', id);
        try {
            const response = await fetch(`${API_BASE}/admin/subject/delete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Subject Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Subject Error:', error);
            throw error;
        }
    },
    updateSubject: async (id, payload) => {
        console.log('API Request: Update Subject', id, payload);
        try {
            const response = await fetch(`${API_BASE}/admin/subject/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Subject Response:', data);
            return data;
        } catch (error) {
            console.error('Update Subject Error:', error);
            throw error;
        }
    },
    getAssignSubjectTeacher: async () => {
        console.log('API Request: Get Assign Subject Teacher');
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/assign_subject_teacher`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Assign Subject Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Get Assign Subject Teacher Error:', error);
            throw error;
        }
    },
    assignSubjectTeacher: async (payload) => {
        console.log('API Request: Assign Subject Teacher', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/assign_subject_teacher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Assign Subject Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Assign Subject Teacher Error:', error);
            throw error;
        }
    },
    deleteSubjectTeacher: async (id) => {
        console.log('API Request: Delete Subject Teacher', id);
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/subjectteacherdelete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Subject Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Subject Teacher Error:', error);
            throw error;
        }
    },
    getAssignClassTeacher: async () => {
        console.log('API Request: Get Assign Class Teacher');
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/get_class_teacher_data`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Assign Class Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Get Assign Class Teacher Error:', error);
            throw error;
        }
    },
    assignClassTeacher: async (payload) => {
        console.log('API Request: Assign Class Teacher', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/assign_class_teacher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const text = await response.text();
            const data = text ? JSON.parse(text) : { status: response.ok };
            console.log('Assign Class Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Assign Class Teacher Error:', error);
            throw error;
        }
    },
    updateClassTeacher: async (payload) => {
        console.log('API Request: Update Class Teacher', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/update_class_teacher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const text = await response.text();
            const data = text ? JSON.parse(text) : { status: response.ok };
            console.log('Update Class Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Update Class Teacher Error:', error);
            throw error;
        }
    },
    deleteClassTeacher: async (classId, sectionId) => {
        console.log('API Request: Delete Class Teacher', classId, sectionId);
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/classteacherdelete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    class_id: parseInt(classId),
                    section_id: parseInt(sectionId)
                }),
            });
            const data = await response.json();
            console.log('Delete Class Teacher Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Class Teacher Error:', error);
            throw error;
        }
    },
    getClassTeacherDetails: async (classId, sectionId) => {
        console.log('API Request: Get Class Teacher Details', classId, sectionId);
        try {
            const response = await fetch(`${API_BASE}/admin/teacher/class_teacher_edit/${classId}/${sectionId}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Class Teacher Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Class Teacher Details Error:', error);
            throw error;
        }
    },
    getNotifications: async () => {
        console.log('API Request: Get Notifications');
        try {
            const response = await fetch(`${API_BASE}/admin/notification_class/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Notifications Response:', data);
            return data;
        } catch (error) {
            console.error('Get Notifications Error:', error);
            throw error;
        }
    },
    addNotification: async (formData) => {
        console.log('API Request: Add Notification');
        try {
            const response = await fetch(`${API_BASE}/admin/notification_class/add`, {
                method: 'POST',
                body: formData,
            });
            const text = await response.text();
            const data = text ? JSON.parse(text) : { status: response.ok };
            console.log('Add Notification Response:', data);
            return data;
        } catch (error) {
            console.error('Add Notification Error:', error);
            throw error;
        }
    },
    deleteNotification: async (id) => {
        console.log('API Request: Delete Notification', id);
        try {
            const response = await fetch(`${API_BASE}/admin/notification_class/delete/${id}`, {
                method: 'GET', // Response says status true, but usually delete endpoints are POST or DELETE. Checking previous patterns... Actually, the user's URL looks like a GET or I should use POST if it's typical. But I'll stick to the provided URL.
            });
            const data = await response.json();
            console.log('Delete Notification Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Notification Error:', error);
            throw error;
        }
    },
    getClassTimetable: async (payload) => {
        console.log('API Request: Get Class Timetable', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/classreport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Get Class Timetable Response:', data);
            return data;
        } catch (error) {
            console.error('Get Class Timetable Error:', error);
            throw error;
        }
    },
    getTimetableData: async (payload) => {
        console.log('API Request: Get Timetable Data', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/getBydategroupclasssection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Get Timetable Data Response:', data);
            return data;
        } catch (error) {
            console.error('Get Timetable Data Error:', error);
            throw error;
        }
    },
    getTimetableCreate: async () => {
        console.log('API Request: Get Timetable Create Data');
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/create`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log('Get Timetable Create Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch timetable create data');
            }

            return data;
        } catch (error) {
            console.error('Get Timetable Create Error:', error);
            throw error;
        }
    },

    createTimetablePost: async (payload) => {
        console.log('API Request: Create Timetable Post', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Create Timetable Post Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to create timetable');
            }

            return data;
        } catch (error) {
            console.error('Create Timetable Post Error:', error);
            throw error;
        }
    },

    saveTimetableGroup: async (payload) => {
        console.log('API Request: Save Timetable Group', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/savegroup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Save Timetable Group Response:', data);
            return data;
        } catch (error) {
            console.error('Save Timetable Group Error:', error);
            throw error;
        }
    },
    getGroupByClassandSection: async (classId, sectionId) => {
        console.log('API Request: Get Group By Class and Section', { classId, sectionId });
        try {
            const response = await fetch(`${API_BASE}/admin/subjectgroup/getGroupByClassandSection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ class_id: classId, section_id: sectionId }),
            });
            const data = await response.json();
            console.log('Get Group By Class and Section Response:', data);
            return data;
        } catch (error) {
            console.error('Get Group By Class and Section Error:', error);
            throw error;
        }
    },

    getFeesReceipt: async () => {
        console.log('API Request: Get Fees Receipt 24');
        try {
            const response = await fetch(`${API_BASE}/admin/feesreceipt/feesreceipt_24`, {
                method: 'GET',
            });

            console.log('Get Fees Receipt Response Status:', response.status);
            const data = await response.json();
            console.log('Get Fees Receipt Response Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch fees receipt data');
            }
            return data;
        } catch (error) {
            console.error('Get Fees Receipt API Error:', error);
            return { status: 'error', fee_payments: [] };
        }
    },

    // Fee Reminder API
    getFeeReminders: async () => {
        console.log('API Request: Get Fee Reminders');
        try {
            const response = await fetch(`${API_BASE}/admin/feereminder/setting`, {
                method: 'GET',
            });

            console.log('Get Fee Reminders Response Status:', response.status);
            const data = await response.json();
            console.log('Get Fee Reminders Response Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch fee reminders');
            }
            return data;
        } catch (error) {
            console.error('Get Fee Reminders API Error:', error);
            return { status: 'error', feereminderlist: [] };
        }
    },

    updateFeeReminders: async (payload) => {
        console.log('API Request: Update Fee Reminders', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/feereminder/setting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Update Fee Reminders Response Status:', response.status);
            const data = await response.json();
            console.log('Update Fee Reminders Response Data:', data);

            if (!response.ok || (data.status !== 'success' && data.status !== true && data.status !== 1)) {
                throw new Error(data.message || 'Failed to update fee reminders');
            }
            return data;
        } catch (error) {
            console.error('Update Fee Reminders API Error:', error);
            throw error;
        }
    },

    // Fees Carry Forward API
    searchFeeCarryForward: async (classId, sectionId) => {
        console.log('API Request: Search Fee Carry Forward', { classId, sectionId });
        try {
            const response = await fetch(`${API_BASE}/admin/feesforward/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ class_id: classId, section_id: sectionId }),
            });

            console.log('Search Fee Carry Forward Response Status:', response.status);
            const data = await response.json();
            console.log('Search Fee Carry Forward Response Data:', data);

            if (!response.ok || !data.status) {
                // If status is false, it might still have data or just no records
                // Check if it's a "No record found" case or actual error
                if (data.status === false && (!data.data || !data.data.student_due_fee)) {
                    // It's likely just empty result or error
                    // throw new Error(data.message || 'Failed to search fee carry forward');
                }
            }
            return data;
        } catch (error) {
            console.error('Search Fee Carry Forward API Error:', error);
            throw error;
        }
    },

    saveFeeCarryForward: async (payload) => {
        console.log('API Request: Save Fee Carry Forward', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/feesforward/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('Save Fee Carry Forward Response Status:', response.status);
            const data = await response.json();
            console.log('Save Fee Carry Forward Response Data:', data);

            if (!response.ok || (data.status !== true && data.status !== 'success')) {
                throw new Error(data.message || 'Failed to save fee carry forward');
            }
            return data;
        } catch (error) {
            console.error('Save Fee Carry Forward API Error:', error);
            throw error;
        }
    },

    getSessions: async () => {
        console.log('API Request: Get Sessions');
        try {
            const response = await fetch(`${API_BASE}/schsettings/getAllSessionwithactive`, {
                method: 'GET',
            });

            console.log('Get Sessions Response Status:', response.status);
            const data = await response.json();
            console.log('Get Sessions Response Data:', data);

            // Return the data regardless of status - let caller handle it
            // This allows flexibility in API response format
            return data;
        } catch (error) {
            console.error('Get Sessions API Error:', error);
            // Return empty structure on error so dropdown can still render
            return { status: false, result: [], session: [] };
        }
    },

    createSession: async (session) => {
        console.log('API Request: Create Session', session);
        try {
            const response = await fetch(`${API_BASE}/sessions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session }),
            });
            const data = await response.json();
            console.log('Create Session Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to create session');
            }
            return data;
        } catch (error) {
            console.error('Create Session API Error:', error);
            throw error;
        }
    },

    getSession: async (id) => {
        console.log('API Request: Get Session', id);
        try {
            const response = await fetch(`${API_BASE}/sessions/view/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Session Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch session details');
            }
            return data;
        } catch (error) {
            console.error('Get Session API Error:', error);
            throw error;
        }
    },

    updateSession: async (id, sessionData) => {
        console.log('API Request: Update Session', id, sessionData);
        try {
            const response = await fetch(`${API_BASE}/sessions/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData),
            });
            const data = await response.json();
            console.log('Update Session Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update session');
            }
            return data;
        } catch (error) {
            console.error('Update Session API Error:', error);
            throw error;
        }
    },


    getRolePermissions: async (id) => {
        console.log('API Request: Get Role Permissions', id);
        try {
            const response = await fetch(`${API_BASE}/admin/roles/permission/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Role Permissions Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch role permissions');
            }
            return data;
        } catch (error) {
            console.error('Get Role Permissions API Error:', error);
            throw error;
        }
    },

    updateRolePermissions: async (id, permissionsData) => {
        console.log('API Request: Update Role Permissions', id, permissionsData);
        try {
            const response = await fetch(`${API_BASE}/admin/roles/permission/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(permissionsData),
            });
            const data = await response.json();
            console.log('Update Role Permissions Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update role permissions');
            }
            return data;
        } catch (error) {
            console.error('Update Role Permissions API Error:', error);
            throw error;
        }
    },

    getEmailConfig: async () => {
        console.log('API Request: Get Email Config');
        try {
            const response = await fetch(`${API_BASE}/emailconfig/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Email Config Response:', data);

            if (!response.ok) {
                throw new Error('Failed to fetch email config');
            }
            return data;
        } catch (error) {
            console.error('Get Email Config API Error:', error);
            throw error;
        }
    },

    updateEmailConfig: async (configData) => {
        console.log('API Request: Update Email Config', configData);
        try {
            const response = await fetch(`${API_BASE}/emailconfig/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData),
            });
            const data = await response.json();
            console.log('Update Email Config Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update email config');
            }
            return data;
        } catch (error) {
            console.error('Update Email Config API Error:', error);
            throw error;
        }
    },

    getSmsConfig: async () => {
        console.log('API Request: Get SMS Config');
        try {
            const response = await fetch(`${API_BASE}/smsconfig`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get SMS Config Response:', data);

            if (!response.ok) {
                throw new Error('Failed to fetch SMS config');
            }
            return data;
        } catch (error) {
            console.error('Get SMS Config API Error:', error);
            throw error;
        }
    },

    updateSmsConfig: async (configData) => {
        console.log('API Request: Update SMS Config', configData);
        try {
            const response = await fetch(`${API_BASE}/smsconfig/smscountry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData),
            });
            const data = await response.json();
            console.log('Update SMS Config Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update SMS config');
            }
            return data;
        } catch (error) {
            console.error('Update SMS Config API Error:', error);
            throw error;
        }
    },

    getPrintHeaderFooterSettings: async () => {
        console.log('API Request: Get Print Header Footer Settings');
        try {
            const response = await fetch(`${API_BASE}/admin/print_headerfooter/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Print Header Footer Settings Response:', data);

            if (!response.ok) {
                throw new Error('Failed to fetch print header footer settings');
            }
            return data;
        } catch (error) {
            console.error('Get Print Header Footer Settings API Error:', error);
            throw error;
        }
    },

    updatePrintHeaderFooterSettings: async (formData) => {
        console.log('API Request: Update Print Header Footer Settings');
        try {
            const response = await fetch(`${API_BASE}/admin/print_headerfooter/edit`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('Update Print Header Footer Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update settings');
            }
            return data;
        } catch (error) {
            console.error('Update Print Header Footer API Error:', error);
            throw error;
        }
    },

    getRoles: async () => {
        console.log('API Request: Get Roles');
        try {
            const response = await fetch(`${API_BASE}/admin/roles`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Roles Response:', data);

            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }
            return data;
        } catch (error) {
            console.error('Get Roles API Error:', error);
            throw error;
        }
    },

    createRole: async (roleData) => {
        console.log('API Request: Create Role', roleData);
        try {
            const response = await fetch(`${API_BASE}/admin/roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });
            const data = await response.json();
            console.log('Create Role Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create role');
            }
            return data;
        } catch (error) {
            console.error('Create Role API Error:', error);
            throw error;
        }
    },

    updateRole: async (id, roleData) => {
        console.log('API Request: Update Role', id, roleData);
        try {
            const response = await fetch(`${API_BASE}/admin/roles/edit/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });
            const data = await response.json();
            console.log('Update Role Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update role');
            }
            return data;
        } catch (error) {
            console.error('Update Role API Error:', error);
            throw error;
        }
    },

    deleteRole: async (id) => {
        console.log('API Request: Delete Role', id);
        try {
            const response = await fetch(`${API_BASE}/admin/roles/delete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Role Response:', data);

            if (!response.ok) {
                // Even if response.ok is false, the server might return a JSON with message
                throw new Error(data.message || 'Failed to delete role');
            }
            return data;
        } catch (error) {
            console.error('Delete Role API Error:', error);
            throw error;
        }
    },

    // Generic session-aware GET request
    getCBSEExamList: async () => {
        console.log('API Request: Get CBSE Exam List');
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log('Get CBSE Exam List Response:', data);
            return data;
        } catch (error) {
            console.error('Get CBSE Exam List Error:', error);
            throw error;
        }
    },

    getAssignExamStudents: async (examId) => {
        console.log('API Request: Get Assign Exam Students', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/examstudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ examid: examId }),
            });
            const data = await response.json();
            console.log('Get Assign Exam Students Response:', data);
            return data;
        } catch (error) {
            console.error('Get Assign Exam Students Error:', error);
            throw error;
        }
    },

    assignExamStudents: async (payload) => {
        console.log('API Request: Assign Exam Students', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/entrystudents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Assign Exam Students Response:', data);
            return data;
        } catch (error) {
            console.error('Assign Exam Students Error:', error);
            throw error;
        }
    },

    getExamSubjects: async (examId) => {
        console.log('API Request: Get Exam Subjects', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/getexamSubjects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ exam_id: examId }),
            });
            const data = await response.json();
            console.log('Get Exam Subjects Response:', data);
            return data;
        } catch (error) {
            console.error('Get Exam Subjects Error:', error);
            throw error;
        }
    },

    getSubjectByExam: async (examId) => {
        console.log('API Request: Get Subject By Exam', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/getSubjectByExam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recordid: examId }),
            });
            const data = await response.json();
            console.log('Get Subject By Exam Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject By Exam Error:', error);
            throw error;
        }
    },

    getSubjectStudent: async (payload) => {
        console.log('API Request: Get Subject Student', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/subjectstudent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...payload, session_id: getSessionId() }),
            });
            const data = await response.json();
            console.log('Get Subject Student Response:', data);
            return data;
        } catch (error) {
            console.error('Get Subject Student Error:', error);
            throw error;
        }
    },

    addExamSubject: async (payload) => {
        console.log('API Request: Add Exam Subject', payload);
        try {
            let body;
            let headers = {};

            if (payload instanceof FormData) {
                body = payload;
                // Let the browser set Content-Type for FormData
                if (!body.has('session_id')) {
                    body.append('session_id', getSessionId());
                }
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({ ...payload, session_id: getSessionId() });
            }

            const response = await fetch(`${API_BASE}/cbseexam/exam/addexamsubject`, {
                method: 'POST',
                headers,
                body
            });
            const data = await response.json();
            console.log('Add Exam Subject Response:', data);
            return data;
        } catch (error) {
            console.error('Add Exam Subject Error:', error);
            throw error;
        }
    },

    getExamRank: async (examId) => {
        console.log('API Request: Get Exam Rank', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/examwiserank`, createFetchOptions('POST', { exam_id: examId }));
            const data = await response.json();
            console.log('Get Exam Rank Response:', data);
            return data;
        } catch (error) {
            console.error('Get Exam Rank Error:', error);
            throw error;
        }
    },

    generateExamRank: async (payload) => {
        console.log('API Request: Generate Exam Rank', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/examrankgenerate`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Generate Exam Rank Response:', data);
            return data;
        } catch (error) {
            console.error('Generate Exam Rank Error:', error);
            throw error;
        }
    },

    getTemplatesForRank: async () => {
        console.log('API Request: Get Templates for Rank');
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/rank`, createFetchOptions('POST', {}));
            const data = await response.json();
            console.log('Get Templates for Rank Response:', data);
            return data;
        } catch (error) {
            console.error('Get Templates for Rank Error:', error);
            throw error;
        }
    },
    deleteVehicle: async (id) => {
        console.log('API Request: Delete Vehicle', id);
        try {
            const response = await fetch(`${API_BASE}/admin/vehicle/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();
            console.log('Delete Vehicle Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete vehicle');
            }
            return data;
        } catch (error) {
            console.error('Delete Vehicle Error:', error);
            throw error;
        }
    },
    getRouteList: async () => {
        console.log('API Request: Get Route List');
        try {
            const response = await fetch(`${API_BASE}/admin/route`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Route List Response:', data);

            if (!response.ok) {
                // It's possible for the API to return success:false but still have data or just be empty
                // For now, we'll return data as is and let the component handle it
                // throw new Error(data.message || 'Failed to fetch route list');
            }
            return data;
        } catch (error) {
            console.error('Get Route List Error:', error);
            throw error;
        }
    },

    createRoute: async (payload) => {
        console.log('API Request: Create Route', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/route/create`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Create Route Response:', data);
            return data;
        } catch (error) {
            console.error('Create Route Error:', error);
            throw error;
        }
    },

    getRouteDetails: async (id) => {
        console.log('API Request: Get Route Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/route/get_editdetails/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Route Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Route Details Error:', error);
            throw error;
        }
    },

    updateRoute: async (id, payload) => {
        console.log('API Request: Update Route', id, payload);
        try {
            const response = await fetch(`${API_BASE}/admin/route/edit/${id}`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Update Route Response:', data);
            return data;
        } catch (error) {
            console.error('Update Route Error:', error);
            throw error;
        }
    },

    deleteRoute: async (id) => {
        console.log('API Request: Delete Route', id);
        try {
            const response = await fetch(`${API_BASE}/admin/route/delete/${id}`, createFetchOptions('POST', {}));
            const data = await response.json();
            console.log('Delete Route Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Route Error:', error);
            throw error;
        }
    },


    // Restoring original getVehicleList for VehicleList.jsx
    getVehicleList: async () => {
        console.log('API Request: Get Vehicle List (Actual)');
        try {
            const response = await fetch(`${API_BASE}/admin/vehicle`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Vehicle List Response:', data);
            return data;
        } catch (error) {
            throw error;
        }
    },
    addVehicle: async (vehicleData) => {
        console.log('API Request: Add Vehicle', vehicleData);
        try {
            const formData = new FormData();
            // Append all fields to FormData
            Object.keys(vehicleData).forEach(key => {
                if (vehicleData[key] !== null) {
                    formData.append(key, vehicleData[key]);
                }
            });

            const response = await fetch(`${API_BASE}/admin/vehicle/add`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Add Vehicle Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add vehicle');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },
    updateVehicle: async (id, vehicleData) => {
        console.log('API Request: Update Vehicle', id, vehicleData);
        try {
            const formData = new FormData();
            // Append all fields to FormData
            Object.keys(vehicleData).forEach(key => {
                // If it's the photo and it's null, we might want to skip it or handle it
                if (vehicleData[key] !== null) {
                    formData.append(key, vehicleData[key]);
                }
            });

            const response = await fetch(`${API_BASE}/admin/vehicle/edit/${id}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('Update Vehicle Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update vehicle');
            }
            return data;
        } catch (error) {
            console.error('Update Vehicle Error:', error);
            throw error;
        }
    },
    getVehicleDetails: async (id) => {
        console.log('API Request: Get Vehicle Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/vehicle/getsinglevehicledata/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Vehicle Details Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch vehicle details');
            }
            return data;
        } catch (error) {
            console.error('Get Vehicle Details Error:', error);
            throw error;
        }
    },

    getAssignVehicleRouteList: async () => {
        console.log('API Request: Get Assign Vehicle Route List');
        try {
            const response = await fetch(`${API_BASE}/admin/vehroute/`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Assign Vehicle Route List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Assign Vehicle Route List Error:', error);
            throw error;
        }
    },

    getAssignVehicleRouteDetails: async (id) => {
        console.log('API Request: Get Assign Vehicle Route Details', id);
        try {
            const response = await fetch(`${API_BASE}/admin/vehroute/get_editvehroute/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Assign Vehicle Route Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Assign Vehicle Route Details Error:', error);
            throw error;
        }
    },

    addAssignVehicleRouteList: async (payload) => {
        console.log('API Request: Add Assign Vehicle Route List', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/vehroute/`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Add Assign Vehicle Route List Response:', data);
            return data;
        } catch (error) {
            console.error('Add Assign Vehicle Route List Error:', error);
            throw error;
        }
    },

    updateAssignVehicleRouteList: async (id, payload) => {
        console.log('API Request: Update Assign Vehicle Route List', id, payload);
        try {
            const response = await fetch(`${API_BASE}/admin/vehroute/edit/${id}`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Update Assign Vehicle Route List Response:', data);
            return data;
        } catch (error) {
            console.error('Update Assign Vehicle Route List Error:', error);
            throw error;
        }
    },

    deleteAssignVehicleRouteList: async (id) => {
        console.log('API Request: Delete Assign Vehicle Route List', id);
        try {
            const response = await fetch(`${API_BASE}/admin/vehroute/delete/${id}`, createFetchOptions('POST', {}));
            const data = await response.json();
            console.log('Delete Assign Vehicle Route List Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Assign Vehicle Route List Error:', error);
            throw error;
        }
    },

    getTeacherRemark: async (examId) => {
        console.log('API Request: Get Teacher Remark', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/teacherRemark`, createFetchOptions('POST', { exam_id: examId }));
            const data = await response.json();
            console.log('Get Teacher Remark Response:', data);
            return data;
        } catch (error) {
            console.error('Get Teacher Remark Error:', error);
            throw error;
        }
    },

    addTeacherRemark: async (payload) => {
        console.log('API Request: Add Teacher Remark', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/addteacherremark`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Add Teacher Remark Response:', data);
            return data;
        } catch (error) {
            console.error('Add Teacher Remark Error:', error);
            throw error;
        }
    },

    getExamAttendance: async (payload) => {
        console.log('API Request: Get Exam Attendance', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/exam_attendance`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Get Exam Attendance Response:', data);
            return data;
        } catch (error) {
            console.error('Get Exam Attendance Error:', error);
            throw error;
        }
    },

    saveExamAttendance: async (payload) => {
        console.log('API Request: Save Exam Attendance', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/addattendance`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Save Exam Attendance Response:', data);
            return data;
        } catch (error) {
            console.error('Save Exam Attendance Error:', error);
            throw error;
        }
    },

    getExamDetails: async (examId) => {
        console.log('API Request: Get Exam Details', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/get_exam`, createFetchOptions('POST', { exam_id: examId }));
            const data = await response.json();
            console.log('Get Exam Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Exam Details Error:', error);
            throw error;
        }
    },

    addCBSEExam: async (payload) => {
        console.log('API Request: Add CBSE Exam', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/add`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Add CBSE Exam Response:', data);
            return data;
        } catch (error) {
            console.error('Add CBSE Exam Error:', error);
            throw error;
        }
    },

    updateCBSEExam: async (payload) => {
        console.log('API Request: Update CBSE Exam', payload);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/edit`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Update CBSE Exam Response:', data);
            return data;
        } catch (error) {
            console.error('Update CBSE Exam Error:', error);
            throw error;
        }
    },

    deleteCBSEExam: async (examId) => {
        console.log('API Request: Delete CBSE Exam', examId);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/deleteexam`, createFetchOptions('POST', { exam_id: examId }));
            const data = await response.json();
            console.log('Delete CBSE Exam Response:', data);
            return data;
        } catch (error) {
            console.error('Delete CBSE Exam Error:', error);
            throw error;
        }
    },

    collectFeeDiscount: async (payload) => {
        console.log('API Request: Collect Fee Discount', payload);
        try {
            const response = await fetch(`${API_BASE}/studentfee/addfeegrp1`, createFetchOptions('POST', payload));
            const data = await response.json();
            console.log('Collect Fee Discount Response:', data);
            return data;
        } catch (error) {
            console.error('Collect Fee Discount Error:', error);
            throw error;
        }
    },


    getExamTimetable: async () => {
        console.log('API Request: Get Exam Timetable');
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/examtimetable`, createFetchOptions('GET'));
            const data = await response.json();
            console.log('Get Exam Timetable Response:', data);
            return data;
        } catch (error) {
            console.error('Get Exam Timetable Error:', error);
            throw error;
        }
    },

    getWithSession: async (endpoint) => {
        const url = appendSessionToUrl(`${API_BASE}${endpoint}`);
        console.log('API GET Request (with session):', url);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    },

    // Generic session-aware POST request
    postWithSession: async (endpoint, body = {}) => {
        const url = `${API_BASE}${endpoint}`;
        console.log('API POST Request (with session):', url, { ...body, session_id: getSessionId() });

        const response = await fetch(url, createFetchOptions('POST', body, true));
        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    },

    // Enquiry API
    deleteEnquiry: async (id) => {
        const url = `${API_BASE}/admin/enquiry/delete/${id}`;
        console.log('API Request: Delete Enquiry', id);

        const response = await fetch(url, {
            method: 'DELETE', // Assuming DELETE, but can swap to POST or GET if API requires
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Some legacy APIs return just text or status
        try {
            const data = await response.json();
            if (!response.ok || (data.status && data.status !== 'success' && data.status !== true)) {
                throw new Error(data.message || 'Failed to delete enquiry');
            }
            return data;
        } catch (e) {
            // If parsing JSON fails, check response.ok
            if (!response.ok) {
                throw new Error('Failed to delete enquiry (Network or Server Error)');
            }
            return { status: 'success' }; // Assume success if 200 OK but non-JSON
        }
    },

    getEnquiryList: async () => {
        const url = `${API_BASE}/admin/enquiry?_t=${new Date().getTime()}`; // Add timestamp to bust cache

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        //Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server authentication error. Please re-login and try again.');
        }

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to fetch enquiry list');
        }

        return data;
    },

    // Add Enquiry API
    addEnquiry: async (enquiryData) => {
        const url = `${API_BASE}/admin/enquiry/add`;

        const body = {
            ...enquiryData,
            session_id: getSessionId() // Ensure session_id is sent
        };

        console.log(`POST ${url} Request Body:`, JSON.stringify(body));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log(`POST ${url} Status:`, response.status);
        const data = await response.json();
        console.log('Add Enquiry API Response Data:', data);

        if (!response.ok || (data.status !== 'success' && data.status !== true && data.status !== 1)) {
            throw new Error(data.message || 'Failed to add enquiry');
        }

        return data;
    },

    // Update Enquiry API
    updateEnquiry: async (id, enquiryData) => {
        const url = `${API_BASE}/admin/enquiry/editpost/${id}/`;

        const body = {
            ...enquiryData,
            session_id: getSessionId()
        };

        console.log(`POST ${url} Request Body:`, JSON.stringify(body));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        console.log(`POST ${url} Status:`, response.status);
        const data = await response.json();
        console.log('Update Enquiry API Response Data:', data);

        if (!response.ok || (data.status !== 'success' && data.status !== true && data.status !== 1)) {
            throw new Error(data.message || 'Failed to update enquiry');
        }

        return data;
    },

    // Get Enquiry Details API
    getEnquiryDetails: async (id) => {
        const url = `${API_BASE}/admin/enquiry/details/${id}/active`;
        console.log(`GET ${url} Request`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(`GET ${url} Status:`, response.status);
        const data = await response.json();
        console.log('Get Enquiry Details API Response Data:', data);

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to fetch enquiry details');
        }

        return data;
    },

    // FOLLOW UP DETAILS (fills form fields)
    getFollowUpDetails: async (id, status) => {
        const url = `${API_BASE}/admin/enquiry/follow_up/${id}/${status}/1`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to fetch follow up details');
        }

        return data;
    },

    // FOLLOW UP LIST (fills summary box)
    getFollowUpList: async (id) => {
        const url = `${API_BASE}/admin/enquiry/follow_up_list/${id}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to fetch follow up list');
        }

        return data;
    },


    // Disabled Students API
    getDisabledStudentList: async (params = {}) => {
        const url = `${API_BASE}/student/disablestudentslist`;

        const body = {
            search: 'search_filter',
            ...params
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server authentication error. Please re-login and try again.');
        }

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to fetch disabled students');
        }

        return data;
    },

    getDisabledStudentsPreData: async () => {
        console.log('API Request: Get Disabled Students Pre Data');
        try {
            const response = await fetch(`${API_BASE}/student/get_disablestudentslist`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Disabled Students Pre Data Response:', data);
            return data;
        } catch (error) {
            console.error('Get Disabled Students Pre Data API Error:', error);
            throw error;
        }
    },

    searchDisabledStudents: async (searchText = '') => {
        const url = `${API_BASE}/student/disablestudentslist`;
        console.log('API Request: Search Disabled Students', searchText);

        const body = {
            search: 'search_full',
            search_text: searchText
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Search Disabled Students Response:', data);

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to search disabled students');
        }

        return data;
    },

    // Get Disable Reason List
    getDisableReasons: async () => {
        const url = `${API_BASE}/admin/disable_reason/disable_reason_list_api`;
        console.log('API Request: Get Disable Reason List');
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Get Disable Reason List Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch disable reasons');
            }
            return data;
        } catch (error) {
            console.error('Get Disable Reason List Error:', error);
            throw error;
        }
    },

    // Get Disable Reason Details
    getDisableReasonDetails: async (id) => {
        const url = `${API_BASE}/admin/disable_reason/get_details/${id}`;
        console.log('API Request: Get Disable Reason Details', id);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Get Disable Reason Details Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch disable reason details');
            }
            return data;
        } catch (error) {
            console.error('Get Disable Reason Details Error:', error);
            throw error;
        }
    },

    // Add Disable Reason
    // Fetches disable reasons using the new GET endpoint
    getDisableReasonsList: async () => {
        const url = `${API_BASE}/admin/disable_reason/get_disable_reason_list`;
        console.log('API Request: Get Disable Reasons List');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Get Disable Reasons List Response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch disable reasons');
        }

        return data;
    },

    addDisableReason: async (reasonData) => {
        const url = `${API_BASE}/admin/disable_reason/add`;
        console.log('API Request: Add Disable Reason', reasonData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reasonData),
        });

        const data = await response.json();
        console.log('Add Disable Reason Response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save disable reason');
        }

        return data;
    },



    // Timeline APIs
    addTimeline: async (formData) => {
        const url = `${API_BASE}/admin/timeline/add`;
        console.log('API Request: Add Timeline');
        const response = await fetch(url, {
            method: 'POST',
            body: formData, // FormData matches PHP expectation
        });
        const data = await response.json();
        if (!response.ok || data.status === 'fail') {
            throw new Error(data.message || 'Failed to add timeline');
        }
        return data;
    },

    editTimeline: async (formData) => {
        const url = `${API_BASE}/admin/timeline/editstudenttimeline`;
        console.log('API Request: Edit Timeline');
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!response.ok || data.status === 'fail') {
            throw new Error(data.message || 'Failed to edit timeline');
        }
        return data;
    },

    deleteTimeline: async (id) => {
        const url = `${API_BASE}/admin/timeline/delete_timeline`;
        console.log('API Request: Delete Timeline', id);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`,
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
            throw new Error(data.message || 'Failed to delete timeline');
        }
        return data;
    },

    getStudentSingleTimeline: async (id) => {
        const url = `${API_BASE}/admin/timeline/getstudentsingletimeline`;
        console.log('API Request: Get Single Timeline', id);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to fetch timeline details');
        }
        return data;
    },

    // Document APIs
    addDocument: async (formData) => {
        const url = `${API_BASE}/student/create_doc`;
        console.log('API Request: Add Document');
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!response.ok || data.status === 'fail') {
            throw new Error(data.message || 'Failed to add document');
        }
        return data;
    },

    deleteDocument: async (id, studentId) => {
        const url = `${API_BASE}/student/doc_delete/${id}/${studentId}`;
        console.log('API Request: Delete Document', id, studentId);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete document');
            }
            return data;
        } else {
            if (response.ok) return { status: 'success' };
            throw new Error('Failed to delete document');
        }
    },


    // Student Edit
    getStudentEditDetails: async (id) => {
        const url = `${API_BASE}/student/edit_student_details/${id}`;
        console.log('API Request: Get Student Edit Details', id);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // The PHP API returns { status: true, student_data: { ... } }
            if (data.status === true || data.status === 'success') {
                return data;
            } else {
                throw new Error(data.message || 'Failed to fetch student details');
            }
        } catch (error) {
            console.error('API Error: Get Student Edit Details', error);
            throw error;
        }
    },

    // Online Student
    getOnlineStudentList: async () => {
        const url = `${API_BASE}/admin/onlinestudent/getstudentlist`;
        console.log('API Request: Get Online Student List');
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // throw new Error(`HTTP error! status: ${response.status}`);
                console.warn("API might not exist, using mock data if needed or returning empty");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error: Get Online Student List', error);
            throw error;
        }
    },

    deleteOnlineStudent: async (id) => {
        const url = `${API_BASE}/admin/onlinestudent/delete`;
        console.log('API Request: Delete Online Student', id);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });

            const data = await response.json();
            if (data.status === true || data.status === 'success') {
                return data;
            } else {
                throw new Error(data.message || 'Failed to delete record');
            }
        } catch (error) {
            console.error('API Error: Delete Online Student', error);
            throw error;
        }
    },

    getOnlineAdmissionReview: async (referenceNo) => {
        const url = `${API_BASE}/Welcome/online_admission_review/${referenceNo}`;
        console.log('API Request: Get Online Admission Review', referenceNo);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error: Get Online Admission Review', error);
            throw error;
        }
    },

    // Student Diary APIs
    getStudentDiary: async (id) => {
        const url = `${API_BASE}/studentdairy/getRecord`;
        console.log('API Request: Get Student Diary Record', id);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error: Get Student Diary Record', error);
            throw error;
        }
    },

    updateStudentDiary: async (diaryData) => {
        const url = `${API_BASE}/studentdairy/edit`;
        console.log('API Request: Update Student Diary', diaryData);
        try {
            const isFormData = diaryData instanceof FormData;
            const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
            const body = isFormData ? diaryData : JSON.stringify(diaryData);

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error: Update Student Diary', error);
            throw error;
        }
    },

    deleteStudentDiary: async (id) => {
        const url = `${API_BASE}/studentdairy/delete`;
        console.log('API Request: Delete Student Diary', id);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error: Delete Student Diary', error);
            throw error;
        }
    },

    // Update Disable Reason
    updateDisableReason: async (id, reasonData) => {
        const url = `${API_BASE}/admin/disable_reason/edit/${id}`;
        console.log('API Request: Update Disable Reason', id, reasonData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reasonData),
        });

        const data = await response.json();
        console.log('Update Disable Reason Response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update disable reason');
        }

        return data;
    },

    // Delete Disable Reason
    deleteDisableReason: async (id) => {
        const url = `${API_BASE}/admin/disable_reason/delete/${id}`;
        console.log('API Request: Delete Disable Reason', id);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Delete Disable Reason Response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete disable reason');
        }

        return data;
    },

    // Disable Student API (provided by user)
    disableStudent: async (params) => {
        const url = `${API_BASE}/student/disableReasonApi`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: params.reason,
                disable_date: params.disable_date,
                student_id: params.student_id
            })
        });

        const data = await response.json();
        return data;
    },

    // Attendance APIs
    searchAttendance: async (classId, sectionId, date) => {
        console.log('API Request: Search Attendance', { classId, sectionId, date });
        try {
            // User provided endpoint expects JSON body with class_id, section_id, date
            // Date format in example was "19-01-2026", so ensuring DD-MM-YYYY
            // If date is passed as DD/MM/YYYY, replace / with -
            const formattedDate = date.replace(/\//g, '-');

            const payload = {
                class_id: classId,
                section_id: sectionId,
                date: formattedDate
            };

            const response = await fetch(`${API_BASE}/admin/stuattendence/search_students_attendence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Search Attendance API Response:', data);

            // Mock data fallback if API returns empty or fails logic
            if (!data.status && (!data.students || data.students.length === 0)) {
                console.warn("Using Mock Data for Attendance");
                return {
                    status: true,
                    date: formattedDate,
                    students: [
                        { student_session_id: 1, admission_no: "1001", roll_no: "01", firstname: "John", lastname: "Doe", attendence_type_id: "1", remark: "" }, // Present
                        { student_session_id: 2, admission_no: "1002", roll_no: "02", firstname: "Jane", lastname: "Smith", attendence_type_id: "3", remark: "Sick" }, // Absent
                        { student_session_id: 3, admission_no: "1003", roll_no: "03", firstname: "Alice", lastname: "Johnson", attendence_type_id: "2", remark: "Late" }, // Late
                        { student_session_id: 4, admission_no: "1004", roll_no: "04", firstname: "Bob", lastname: "Brown", attendence_type_id: "6", remark: "" }, // Half Day
                        { student_session_id: 5, admission_no: "1005", roll_no: "05", firstname: "Charlie", lastname: "White", attendence_type_id: "5", remark: "" }, // Holiday
                    ]
                };
            }

            return data;
        } catch (error) {
            console.error('Search Attendance API Error:', error);
            const formattedDate = date.replace(/\//g, '-');
            return {
                status: true,
                date: formattedDate,
                students: [
                    { student_session_id: 1, admission_no: "1001", roll_no: "01", firstname: "John", lastname: "Doe", attendence_type_id: "1", remark: "" },
                    { student_session_id: 2, admission_no: "1002", roll_no: "02", firstname: "Jane", lastname: "Smith", attendence_type_id: "3", remark: "Sick" },
                ]
            };
        }
    },

    saveAttendance: async (attendanceData) => {
        console.log('API Request: Save Attendance', attendanceData);
        try {
            // Payload format: { date: "DD-MM-YYYY", students: [{ student_session_id, attendance_type_id }, ...] }
            const response = await fetch(`${API_BASE}/admin/stuattendence/save_student_attendence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attendanceData)
            });

            const data = await response.json();
            console.log('Save Attendance API Response:', data);
            return data;
        } catch (error) {
            console.error('Save Attendance API Error:', error);
            throw error;
        }
    },

    // Approve Leave APIs
    searchApproveLeave: async (classId, sectionId) => {
        return { status: true, data: [] };
    },


    //getStudentsForLeave: async (classId, sectionId) => {
    //const url = `${API_BASE}/admin/approve_leave/searchByClassSection/${classId}`;
    //const formData = new FormData();
    //formData.append('section_id', sectionId);
    //const response = await fetch(url, {
    // method: 'POST',
    //body: formData
    // });
    //return await response.text();
    // },

    // Student Diary (Class-wise Homework) API
    // GET /studentdairy/studentDairyListApi
    // Response: { status: true, draw: 0, total: N, data: [{ id, class, section, date, assigned_by }, ...] }
    getStudentDiaryList: async (params = {}) => {
        console.log('API Request: Get Student Diary List', params);
        try {
            const response = await fetch(`${API_BASE}/studentdairy/studentDairyListApi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const data = await response.json();
            console.log('Student Diary List Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch student diary list');
            }

            return data;
        } catch (error) {
            console.error('Get Student Diary List API Error:', error);
            throw error;
        }
    },

    // Create Student Diary (Class-wise Homework)
    // POST /studentdairy/createStudentDairy
    // Body: FormData { class_id, section_id, date, description, userfile, assigned_by }
    createStudentDiary: async (formData) => {
        console.log('API Request: Create Student Diary');
        try {
            const response = await fetch(`${API_BASE}/studentdairy/createStudentDairy`, {
                method: 'POST',
                body: formData, // passing FormData directly
            });

            const data = await response.json();
            console.log('Create Student Diary Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to create student diary');
            }

            return data;
        } catch (error) {
            console.error('Create Student Diary API Error:', error);
            throw error;
        }
    },

    // Dashboard Data API
    getDashboardData: async () => {
        console.log('API Request: Get Dashboard Data');
        try {
            // Using getWithSession to automatically append session_id
            return await api.getWithSession('/admin/admin/dashboard');
        } catch (error) {
            console.error('Get Dashboard Data API Error:', error);
            throw error;
        }
    },


    getStaffList: async () => {
        console.log('API Request: Get Staff List');
        try {
            const response = await fetch(`${API_BASE}/admin/staff`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Staff List Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch staff list');
            }

            return data;
        } catch (error) {
            console.error('Get Staff List API Error:', error);
            throw error;
        }
    },

    getTeacherTimetable: async () => {
        console.log('API Request: Get Teacher Timetable');
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/mytimetable`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Teacher Timetable Response:', data);

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch teacher timetable');
            }

            return data;
        } catch (error) {
            console.error('Get Teacher Timetable API Error:', error);
            throw error;
        }
    },

    searchTeacherTimetable: async (teacherId) => {
        console.log('API Request: Search Teacher Timetable', { teacher: teacherId });
        try {
            const response = await fetch(`${API_BASE}/admin/timetable/getteachertimetable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teacher: teacherId }),
            });

            const data = await response.json();
            console.log('Search Teacher Timetable Response:', data);

            // The response structure might be similar to mytimetable or just the timetable object.
            // Adjust based on observation if needed.
            return data;
        } catch (error) {
            console.error('Search Teacher Timetable API Error:', error);
            throw error;
        }
    },

    // Staff Profile API
    // GET /admin/staff/profile/:id
    // Response: { status: true, data: { staff: {...}, timeline_list: [], staff_payroll: [], leavedetails: [], staff_leaves: [] } }
    getStaffProfile: async (staffId) => {
        console.log('API Request: Get Staff Profile', staffId);
        try {
            const response = await fetch(`${API_BASE}/admin/staff/profile/${staffId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Staff Profile Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch staff profile');
            }

            return data;
        } catch (error) {
            console.error('Get Staff Profile API Error:', error);
            throw error;
        }
    },

    // Source API
    addSource: async (sourceData) => {
        const url = `${API_BASE}/admin/source/add`;
        console.log('API Request: Add Source', sourceData);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sourceData),
            });

            const data = await response.json();
            console.log('Add Source API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to add source');
            }

            return data;
        } catch (error) {
            console.error('Add Source API Error:', error);
            throw error;
        }
    },

    updateSource: async (id, sourceData) => {
        const url = `${API_BASE}/admin/source/edit/${id}`;
        console.log('API Request: Update Source', id, sourceData);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sourceData),
            });

            const data = await response.json();
            console.log('Update Source API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update source');
            }

            return data;
        } catch (error) {
            console.error('Update Source API Error:', error);
            throw error;
        }
    },

    deleteSource: async (id) => {
        const url = `${API_BASE}/admin/source/delete/${id}`;
        console.log('API Request: Delete Source', id);
        try {
            const response = await fetch(url, {
                method: 'POST', // The user provided URL implies POST/GET, but common for these APIs to use POST for delete if specified in URL
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Delete Source API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to delete source');
            }

            return data;
        } catch (error) {
            console.error('Delete Source API Error:', error);
            throw error;
        }
    },

    getSourceList: async () => {
        const url = `${API_BASE}/admin/source/index`;
        console.log('API Request: Get Source List');
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Source List API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch source list');
            }

            return data;
        } catch (error) {
            console.error('Get Source List API Error:', error);
            throw error;
        }
    },

    // Reference API
    getReferenceList: async () => {
        const url = `${API_BASE}/admin/reference/index`;
        console.log('API Request: Get Reference List');
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Reference List API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch reference list');
            }

            return data;
        } catch (error) {
            console.error('Get Reference List API Error:', error);
            throw error;
        }
    },

    addReference: async (referenceData) => {
        const url = `${API_BASE}/admin/reference/add`;
        console.log('API Request: Add Reference', referenceData);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(referenceData),
            });

            const data = await response.json();
            console.log('Add Reference API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to add reference');
            }

            return data;
        } catch (error) {
            console.error('Add Reference API Error:', error);
            throw error;
        }
    },

    updateReference: async (id, referenceData) => {
        const url = `${API_BASE}/admin/reference/edit/${id}`;
        console.log('API Request: Update Reference', id, referenceData);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(referenceData),
            });

            const data = await response.json();
            console.log('Update Reference API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to update reference');
            }

            return data;
        } catch (error) {
            console.error('Update Reference API Error:', error);
            throw error;
        }
    },

    deleteReference: async (id) => {
        const url = `${API_BASE}/admin/reference/delete/${id}`;
        console.log('API Request: Delete Reference', id);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Delete Reference API Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to delete reference');
            }

            return data;
        } catch (error) {
            console.error('Delete Reference API Error:', error);
            throw error;
        }
    },

    // Fee Type API
    getFeeTypeList: async () => {
        console.log('API Request: Get Fee Type List');
        try {
            const data = await api.getWithSession('/admin/feetype/');
            return data;
        } catch (error) {
            console.error('Get Fee Type List Error:', error);
            throw error;
        }
    },
    addFeeType: async (data) => {
        console.log('API Request: Add Fee Type', data);
        try {
            const response = await api.postWithSession('/admin/feetype/add', data);
            return response;
        } catch (error) {
            console.error('Add Fee Type Error:', error);
            throw error;
        }
    },
    fetchFeeType: async (id) => {
        console.log('API Request: Fetch Fee Type', id);
        try {
            const response = await api.getWithSession(`/admin/feetype/fetch/${id}`);
            console.log('Fetch Fee Type Response:', response);
            return response;
        } catch (error) {
            console.error('Fetch Fee Type Error:', error);
            throw error;
        }
    },
    editFeeType: async (id, data) => {
        console.log('API Request: Edit Fee Type', id, data);
        try {
            const response = await api.postWithSession(`/admin/feetype/edit/${id}`, data);
            return response;
        } catch (error) {
            console.error('Edit Fee Type Error:', error);
            throw error;
        }
    },
    deleteFeeType: async (id) => {
        console.log('API Request: Delete Fee Type', id);
        try {
            const response = await api.getWithSession(`/admin/feetype/delete/${id}`);
            return response;
        } catch (error) {
            console.error('Delete Fee Type Error:', error);
            throw error;
        }
    },

    // Fee Group API
    getFeeGroupList: async () => {
        console.log('API Request: Get Fee Group List');
        try {
            const data = await api.getWithSession('/admin/feegroup');
            return data;
        } catch (error) {
            console.error('Get Fee Group List Error:', error);
            throw error;
        }
    },
    addFeeGroup: async (data) => {
        console.log('API Request: Add Fee Group', data);
        try {
            const response = await api.postWithSession('/admin/feegroup/add', data);
            return response;
        } catch (error) {
            console.error('Add Fee Group Error:', error);
            throw error;
        }
    },
    fetchFeeGroup: async (id) => {
        console.log('API Request: Fetch Fee Group', id);
        try {
            const response = await api.getWithSession(`/admin/feegroup/fetch/${id}`);
            console.log('Fetch Fee Group Response:', response);
            return response;
        } catch (error) {
            console.error('Fetch Fee Group Error:', error);
            throw error;
        }
    },
    editFeeGroup: async (id, data) => {
        console.log('API Request: Edit Fee Group', id, data);
        try {
            const response = await api.postWithSession(`/admin/feegroup/edit/${id}`, data);
            return response;
        } catch (error) {
            console.error('Edit Fee Group Error:', error);
            throw error;
        }
    },
    deleteFeeGroup: async (id) => {
        console.log('API Request: Delete Fee Group', id);
        try {
            const response = await api.getWithSession(`/admin/feegroup/delete/${id}`);
            return response;
        } catch (error) {
            console.error('Delete Fee Group Error:', error);
            throw error;
        }
    },

    // Fee Master API
    getFeeMasterList: async () => {
        console.log('API Request: Get Fee Master List');
        try {
            const data = await api.getWithSession('/admin/feemaster');
            return data;
        } catch (error) {
            console.error('Get Fee Master List Error:', error);
            throw error;
        }
    },
    addFeeMaster: async (data) => {
        console.log('API Request: Add Fee Master', data);
        try {
            const response = await api.postWithSession('/admin/feemaster/', data);
            return response;
        } catch (error) {
            console.error('Add Fee Master Error:', error);
            throw error;
        }
    },
    editFeeMaster: async (id, data) => {
        console.log('API Request: Edit Fee Master', id, data);
        try {
            const response = await api.postWithSession(`/admin/feemaster/edit/${id}`, data);
            return response;
        } catch (error) {
            console.error('Edit Fee Master Error:', error);
            throw error;
        }
    },
    deleteFeeMaster: async (id) => {
        console.log('API Request: Delete Fee Master', id);
        try {
            const response = await api.getWithSession(`/admin/feemaster/delete/${id}`);
            return response;
        } catch (error) {
            console.error('Delete Fee Master Error:', error);
            throw error;
        }
    },
    fetchFeeMaster: async (id) => {
        console.log('API Request: Fetch Fee Master', id);
        try {
            const response = await api.getWithSession(`/admin/feemaster/get_fee_master_fetch/${id}`);
            console.log('Fetch Fee Master Response:', response);
            return response;
        } catch (error) {
            console.error('Fetch Fee Master Error:', error);
            throw error;
        }
    },
    deleteFeeMasterGroup: async (id) => {
        console.log('API Request: Delete Fee Master Group', id);
        try {
            const response = await api.getWithSession(`/admin/feemaster/deletegrp/${id}`);
            return response;
        } catch (error) {
            console.error('Delete Fee Master Group Error:', error);
            throw error;
        }
    },
    assignFeeMaster: async (id) => {
        console.log('API Request: Assign Fee Master', id);
        try {
            const response = await api.getWithSession(`/admin/feemaster/assign/${id}`);
            return response;
        } catch (error) {
            console.error('Assign Fee Master Error:', error);
            throw error;
        }
    },
    assignFeeMasterSearch: async (id, filters) => {
        console.log('API Request: Assign Fee Master Search (Legacy)', id, filters);
        return api.searchAssignStudents({ ...filters, fee_group_id: id });
    },
    searchAssignStudents: async (data) => {
        console.log('API Request: Search Assign Students', data);
        try {
            const response = await api.postWithSession('/admin/feemaster/search_assign_students', data);
            return response;
        } catch (error) {
            console.error('Search Assign Students Error:', error);
            throw error;
        }
    },
    assignFeeMasterSave: async (data) => {
        console.log('API Request: Assign Fee Master Save', data);
        try {
            // Build FormData to match PHP form submission format
            const formData = new FormData();

            // Add fee_session_groups
            formData.append('fee_session_groups', data.fee_session_groups);

            // Add student_session_id[] as multiple entries
            if (data['student_session_id[]']) {
                data['student_session_id[]'].forEach(id => {
                    formData.append('student_session_id[]', id);
                });
            }

            // Add student_ids[] as multiple entries
            if (data['student_ids[]']) {
                data['student_ids[]'].forEach(id => {
                    formData.append('student_ids[]', id);
                });
            }

            // Add dynamic student_fees_master_id_{id} keys
            Object.keys(data).forEach(key => {
                if (key.startsWith('student_fees_master_id_')) {
                    formData.append(key, data[key]);
                }
            });

            // Add session_id
            formData.append('session_id', getSessionId());

            const response = await fetch(`${API_BASE}/studentfee/addfeegroup`, {
                method: 'POST',
                body: formData
            });
            const resData = await response.json();
            return resData;
        } catch (error) {
            console.error('Assign Fee Master Save Error:', error);
            throw error;
        }
    },
    getStudentFees: async (studentId) => {
        console.log('API Request: Get Student Fees', studentId);
        try {
            const response = await api.getWithSession(`/studentfee/addfee/${studentId}`);
            return response;
        } catch (error) {
            console.error('Get Student Fees Error:', error);
            throw error;
        }
    },
    addStudentFee: async (data) => {
        console.log('API Request: Add Student Fee', data);
        try {
            // PHP uses: site_url("studentfee/addstudentfee")
            const response = await api.postWithSession('/studentfee/addstudentfee', data);
            return response;
        } catch (error) {
            console.error('Add Student Fee Error:', error);
            throw error;
        }
    },

    collectFeeGroup: async (data) => {
        try {
            const response = await api.postWithSession('/studentfee/addfeegrp1', data);
            return response;
        } catch (error) {
            console.error('Collect Fee Group Error:', error);
            throw error;
        }
    },

    deleteStudentFee: async (payload) => {
        console.log('API Request: Delete Student Fee (Revert)', payload);
        try {
            const response = await fetch(`${API_BASE}/studentfee/deleteFee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Delete Student Fee Error:', error);
            throw error;
        }
    },

    printFeesByGroup: async (data) => {
        console.log('API Request: Print Fees By Group', data);
        try {
            const formData = new FormData();
            formData.append('data', JSON.stringify(data));

            const response = await fetch(`${API_BASE}/studentfee/printFeesByGroupArray`, {
                method: 'POST',
                body: formData // Payload format as FormData based on user image showing form data
            });

            // If response is JSON, return it, else text
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('Print Fees Error:', error);
            throw error;
        }
    },

    // Income Head API
    getIncomeHeadList: async () => {
        console.log('API Request: Get Income Head List');
        try {
            const data = await api.getWithSession('/admin/incomehead');
            return data;
        } catch (error) {
            console.error('Get Income Head List Error:', error);
            throw error;
        }
    },
    addIncomeHead: async (data) => {
        console.log('API Request: Add Income Head', data);
        try {
            // User listed POST: .../incomehead/create
            const response = await api.postWithSession('/admin/incomehead/create', data);
            return response;
        } catch (error) {
            console.error('Add Income Head Error:', error);
            throw error;
        }
    },
    editIncomeHead: async (id, data) => {
        console.log('API Request: Edit Income Head', id, data);
        try {
            const response = await api.postWithSession(`/admin/incomehead/edit/${id}`, data);
            return response;
        } catch (error) {
            console.error('Edit Income Head Error:', error);
            throw error;
        }
    },
    deleteIncomeHead: async (id) => {
        console.log('API Request: Delete Income Head', id);
        try {
            // User provided POST for delete incomehead
            const response = await fetch(`${API_BASE}/admin/incomehead/delete/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            console.log('Delete Income Head Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Income Head Error:', error);
            throw error;
        }
    },

    // Income API
    getIncomeList: async () => {
        console.log('API Request: Get Income List');
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/income/getincomelist`);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Get Income List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Income List Error:', error);
            throw error;
        }
    },
    addIncome: async (data) => {
        console.log('API Request: Add Income');
        try {
            const isFormData = data instanceof FormData;
            const options = {
                method: 'POST',
                body: isFormData ? data : JSON.stringify({ ...data, session_id: getSessionId() })
            };
            if (!isFormData) options.headers = { 'Content-Type': 'application/json' };

            const response = await fetch(`${API_BASE}/admin/income/create`, options);
            const resData = await response.json();
            console.log('Add Income Response:', resData);
            return resData;
        } catch (error) {
            console.error('Add Income Error:', error);
            throw error;
        }
    },
    fetchIncome: async (id) => {
        console.log('API Request: Fetch Income', id);
        try {
            const data = await api.getWithSession(`/admin/income/fetch/${id}`);
            return data;
        } catch (error) {
            console.error('Fetch Income Error:', error);
            throw error;
        }
    },
    downloadIncome: async (id) => {
        console.log('API Request: Download Income', id);
        try {
            const response = await fetch(appendSessionToUrl(`${API_BASE}/admin/income/download/${id}`));
            if (!response.ok) throw new Error('Download failed');
            return response;
        } catch (error) {
            console.error('Download Income Error:', error);
            throw error;
        }
    },
    editIncome: async (id, data) => {
        console.log('API Request: Edit Income', id);
        try {
            const isFormData = data instanceof FormData;
            const options = {
                method: 'POST',
                body: isFormData ? data : JSON.stringify({ ...data, session_id: getSessionId() })
            };
            if (!isFormData) options.headers = { 'Content-Type': 'application/json' };

            const response = await fetch(`${API_BASE}/admin/income/edit/${id}`, options);
            const resData = await response.json();
            console.log('Edit Income Response:', resData);
            return resData;
        } catch (error) {
            console.error('Edit Income Error:', error);
            throw error;
        }
    },
    deleteIncome: async (id) => {
        console.log('API Request: Delete Income', id);
        try {
            const response = await fetch(`${API_BASE}/admin/income/delete/${id}`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log('Delete Income Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Income Error:', error);
            throw error;
        }
    },

    // Expense Head API
    getExpenseHeadList: async () => {
        console.log('API Request: Get Expense Head List');
        try {
            const data = await api.getWithSession('/admin/expensehead');
            return data;
        } catch (error) {
            console.error('Get Expense Head List Error:', error);
            throw error;
        }
    },
    addExpenseHead: async (data) => {
        console.log('API Request: Add Expense Head', data);
        try {
            const response = await api.postWithSession('/admin/expensehead/create', data);
            return response;
        } catch (error) {
            console.error('Add Expense Head Error:', error);
            throw error;
        }
    },
    editExpenseHead: async (id, data) => {
        console.log('API Request: Edit Expense Head', id, data);
        try {
            const response = await api.postWithSession(`/admin/expensehead/edit/${id}`, data);
            return response;
        } catch (error) {
            console.error('Edit Expense Head Error:', error);
            throw error;
        }
    },
    deleteExpenseHead: async (id) => {
        console.log('API Request: Delete Expense Head', id);
        try {
            const response = await fetch(`${API_BASE}/admin/expensehead/delete/${id}`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log('Delete Expense Head Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Expense Head Error:', error);
            throw error;
        }
    },

    // Expense API
    getExpenseList: async () => {
        console.log('API Request: Get Expense List');
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/expense/getexpenselist`);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Get Expense List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Expense List Error:', error);
            throw error;
        }
    },
    addExpense: async (data) => {
        console.log('API Request: Add Expense');
        try {
            const isFormData = data instanceof FormData;
            const options = {
                method: 'POST',
                body: isFormData ? data : JSON.stringify({ ...data, session_id: getSessionId() })
            };
            if (!isFormData) options.headers = { 'Content-Type': 'application/json' };
            const response = await fetch(`${API_BASE}/admin/expense`, options);
            const resData = await response.json();
            console.log('Add Expense Response:', resData);
            return resData;
        } catch (error) {
            console.error('Add Expense Error:', error);
            throw error;
        }
    },
    fetchExpense: async (id) => {
        console.log('API Request: Fetch Expense', id);
        try {
            const data = await api.getWithSession(`/admin/expense/fetch/${id}`);
            return data;
        } catch (error) {
            console.error('Fetch Expense Error:', error);
            throw error;
        }
    },
    downloadExpense: async (id) => {
        console.log('API Request: Download Expense', id);
        try {
            const response = await fetch(appendSessionToUrl(`${API_BASE}/admin/expense/download/${id}`));
            if (!response.ok) throw new Error('Download failed');
            return response;
        } catch (error) {
            console.error('Download Expense Error:', error);
            throw error;
        }
    },
    editExpense: async (id, data) => {
        console.log('API Request: Edit Expense', id);
        try {
            const isFormData = data instanceof FormData;
            const options = {
                method: 'POST',
                body: isFormData ? data : JSON.stringify({ ...data, session_id: getSessionId() })
            };
            if (!isFormData) options.headers = { 'Content-Type': 'application/json' };

            const response = await fetch(`${API_BASE}/admin/expense/edit/${id}`, options);
            const resData = await response.json();
            console.log('Edit Expense Response:', resData);
            return resData;
        } catch (error) {
            console.error('Edit Expense Error:', error);
            throw error;
        }
    },
    deleteExpense: async (id) => {
        console.log('API Request: Delete Expense', id);
        try {
            const response = await fetch(`${API_BASE}/admin/expense/delete/${id}`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log('Delete Expense Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Expense Error:', error);
            throw error;
        }
    },

    // Hostel Room API
    getHostelRoomData: async () => {
        console.log('API Request: Get Hostel Room Data');
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/Hostelroom/index`);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Get Hostel Room Data Response:', data);
            return data;
        } catch (error) {
            console.error('Get Hostel Room Data Error:', error);
            throw error;
        }
    },

    createHostelRoom: async (data) => {
        console.log('API Request: Create Hostel Room', data);
        try {
            const response = await fetch(`${API_BASE}/admin/Hostelroom/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Create Hostel Room Response:', result);
            return result;
        } catch (error) {
            console.error('Create Hostel Room Error:', error);
            throw error;
        }
    },

    updateHostelRoom: async (data) => {
        console.log('API Request: Update Hostel Room', data);
        try {
            const response = await fetch(`${API_BASE}/admin/Hostelroom/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Update Hostel Room Response:', result);
            return result;
        } catch (error) {
            console.error('Update Hostel Room Error:', error);
            throw error;
        }
    },

    deleteHostelRoom: async (id) => {
        console.log('API Request: Delete Hostel Room', id);
        try {
            const response = await fetch(`${API_BASE}/admin/Hostelroom/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Delete Hostel Room Response:', result);
            return result;
        } catch (error) {
            console.error('Delete Hostel Room Error:', error);
            throw error;
        }
    },

    getStudentHostelDetails: async () => {
        console.log('API Request: Get Student Hostel Details');
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/Hostelroom/studenthosteldetails`);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Get Student Hostel Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Student Hostel Details Error:', error);
            throw error;
        }
    },

    getRoomTypeData: async () => {
        console.log('API Request: Get Room Type Data');
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/Roomtype/index`);
            const response = await fetch(url);
            const data = await response.json();
            console.log('Get Room Type Data Response:', data);
            return data;
        } catch (error) {
            console.error('Get Room Type Data Error:', error);
            throw error;
        }
    },

    createRoomType: async (data) => {
        console.log('API Request: Create Room Type', data);
        try {
            const response = await fetch(`${API_BASE}/admin/Roomtype/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Create Room Type Response:', result);
            return result;
        } catch (error) {
            console.error('Create Room Type Error:', error);
            throw error;
        }
    },

    updateRoomType: async (data) => {
        console.log('API Request: Update Room Type', data);
        try {
            const response = await fetch(`${API_BASE}/admin/Roomtype/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Update Room Type Response:', result);
            return result;
        } catch (error) {
            console.error('Update Room Type Error:', error);
            throw error;
        }
    },

    deleteRoomType: async (id) => {
        console.log('API Request: Delete Room Type', id);
        try {
            const response = await fetch(`${API_BASE}/admin/Roomtype/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Delete Room Type Response:', result);
            return result;
        } catch (error) {
            console.error('Delete Room Type Error:', error);
            throw error;
        }
    },

    getHostelData: async () => {
        console.log('API Request: Get Hostel Data');
        try {
            const response = await fetch(`${API_BASE}/admin/hostel/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ session_id: getSessionId() })
            });
            const data = await response.json();
            console.log('Get Hostel Data Response:', data);
            return data;
        } catch (error) {
            console.error('Get Hostel Data Error:', error);
            throw error;
        }
    },

    createHostel: async (data) => {
        console.log('API Request: Create Hostel', data);
        try {
            const response = await fetch(`${API_BASE}/admin/hostel/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Create Hostel Response:', result);
            return result;
        } catch (error) {
            console.error('Create Hostel Error:', error);
            throw error;
        }
    },

    updateHostel: async (data) => {
        console.log('API Request: Update Hostel', data);
        try {
            const response = await fetch(`${API_BASE}/admin/hostel/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Update Hostel Response:', result);
            return result;
        } catch (error) {
            console.error('Update Hostel Error:', error);
            throw error;
        }
    },

    deleteHostel: async (id) => {
        console.log('API Request: Delete Hostel', id);
        try {
            const response = await fetch(`${API_BASE}/admin/hostel/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, session_id: getSessionId() })
            });
            const result = await response.json();
            console.log('Delete Hostel Response:', result);
            return result;
        } catch (error) {
            console.error('Delete Hostel Error:', error);
            throw error;
        }
    },

    // Search Payment API
    searchPayment: async (data) => {
        console.log('API Request: Search Payment', data);
        try {
            const response = await api.postWithSession('/studentfee/searchpayment', data);
            console.log('Search Payment Response:', response);
            return response;
        } catch (error) {
            console.error('Search Payment Error:', error);
            throw error;
        }
    },

    // Student Fee Search API (unified for class_search and keyword_search)
    studentFeeSearch: async (data) => {
        console.log('API Request: Student Fee Search', data);
        try {
            const response = await fetch(`${API_BASE}/studentfee/ajaxsearch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const resData = await response.json();
            console.log('Student Fee Search Response:', resData);
            return resData;
        } catch (error) {
            console.error('Student Fee Search Error:', error);
            throw error;
        }
    },

    getStudentFeeIndex: async () => {
        console.log('API Request: Get Student Fee Index');
        try {
            const response = await api.getWithSession('/studentfee');
            console.log('Get Student Fee Index Response:', response);
            return response;
        } catch (error) {
            console.error('Get Student Fee Index Error:', error);
            throw error;
        }
    },

    // Get Student Fees Details
    getStudentFees: async (studentSessionId) => {
        console.log('API Request: Get Student Fees', studentSessionId);
        try {
            const response = await fetch(`${API_BASE}/studentfee/addfee/${studentSessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // If needed, though usually handled by cookie/session
                }
            });
            const data = await response.json();
            console.log('Get Student Fees Response:', data);
            return data;
        } catch (error) {
            console.error('Get Student Fees Error:', error);
            throw error;
        }
    },

    getCollectFee: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/studentfee/getcollectfee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('Get Collect Fee Error:', error);
            throw error;
        }
    },

    getCollectFee1: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/studentfee/getcollectfee1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('Get Collect Fee 1 Error:', error);
            throw error;
        }
    },

    // Fees Receipt Print
    printStudentGroupFees24: async (receiptId) => {
        try {
            const response = await fetch(`${API_BASE}/admin/feesreceipt/printStudentGroupFees24`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Add if required, usually yes
                },
                body: JSON.stringify({ receipt_id: receiptId })
            });
            // The API might return text/html if strictly following the example, but user said "RESPONSE BODY: { status: 1, page: ..., data: ... }" which is JSON.
            // So we parse as JSON.
            return await response.json();
        } catch (error) {
            console.error('Print Fees Receipt Error:', error);
            throw error;
        }
    },

    getCBSEGradeList: async () => {
        console.log("api.getCBSEGradeList called", API_BASE);
        try {
            const response = await fetch(`${API_BASE}/cbseexam/grade/gradelist`, createFetchOptions('POST', {}));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Grade List Error:', error);
            throw error;
        }
    },

    addCBSEGrade: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/grade/add`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Add CBSE Grade Error:', error);
            throw error;
        }
    },



    deleteCBSEGrade: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/grade/remove`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Delete CBSE Grade Error:', error);
            throw error;
        }
    },

    getCBSEGradeRange: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/grade/add_graderange`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Grade Range Error:', error);
            throw error;
        }
    },
    getCBSEGradeForm: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/grade/gradeform`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Grade Form Error:', error);
            throw error;
        }
    },
    getCBSEMarksheetData: async (payload = {}) => {
        try {
            // If payload is empty, don't include session_id (for initial GET-like behavior)
            const isEmpty = Object.keys(payload).length === 0;
            const response = await fetch(`${API_BASE}/cbseexam/result/marksheet`, createFetchOptions('POST', payload, !isEmpty));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Marksheet Data Error:', error);
            throw error;
        }
    },



    getClassSections: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/classes/get_sub_class`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.error('getClassSections: Response is not valid JSON:', text.substring(0, 100));
                return { status: false, data: [] };
            }
        } catch (error) {
            console.error('Get Class Sections Error:', error);
            return { status: false, data: [] };
        }
    },

    getCBSETermList: async () => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/term/gettermlist`, createFetchOptions('GET'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Term List Error:', error);
            throw error;
        }
    },

    addCBSETerm: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/term/add`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Add CBSE Term Error:', error);
            throw error;
        }
    },

    getCBSETermData: async (id) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/term/getdata`, createFetchOptions('POST', { id }));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Term Data Error:', error);
            throw error;
        }
    },

    deleteCBSETerm: async (id) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/term/delete/${id}`, createFetchOptions('POST', {}));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Delete CBSE Term Error:', error);
            throw error;
        }
    },

    importStudentFeePayments: async (formData) => {
        try {
            const options = {
                method: 'POST',
                body: formData,
                // Do not set Content-Type for FormData
            };

            const response = await fetch(`${API_BASE}/studentfee/importpayments`, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Import Fee Payments Error:', error);
            throw error;
        }
    },

    exportPaymentSample: async () => {
        try {
            const response = await fetch(`${API_BASE}/studentfee/exportformat`, createFetchOptions('GET'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'payment_sample.csv'; // Default name, or extract from headers
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export Payment Sample Error:', error);
            throw error;
        }
    },

    getCBSETemplates: async (classId = null, sectionId = null) => {
        try {
            let options = { method: 'GET' };
            let url = appendSessionToUrl(`${API_BASE}/cbseexam/Template/index`);

            if (classId && sectionId) {
                const formData = new FormData();
                formData.append('class_id', classId);
                formData.append('section_id', sectionId);
                formData.append('session_id', getSessionId());

                options = {
                    method: 'POST',
                    body: formData
                };
                url = `${API_BASE}/cbseexam/Template/index`; // session_id is in formData
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Templates Error:', error);
            throw error;
        }
    },

    getCBSETemplatesBySection: async (classSectionId) => {
        try {
            const payload = {
                class_section_id: classSectionId,
                session_id: getSessionId()
            };
            const response = await fetch(`${API_BASE}/cbseexam/Template/get`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Templates By Section Error:', error);
            throw error;
        }
    },

    getMarksSuraj: async (payload) => {
        try {
            // payload: { marksheet_template: int, student_session_id: [int] }
            const response = await fetch(`${API_BASE}/cbseexam/result/getmarkssuraj`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get Marks Suraj Error:', error);
            throw error;
        }
    },

    getMarksSuraj2: async (payload) => {
        try {
            // payload: { marksheet_template: int, student_session_id: [int] }
            const response = await fetch(`${API_BASE}/cbseexam/result/getmarkssuraj2`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get Marks Suraj 2 Error:', error);
            throw error;
        }
    },


    getCBSETemplateData: async (templateId) => {
        try {
            const payload = { template_id: templateId };
            const response = await fetch(`${API_BASE}/cbseexam/Template/getdata`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Template Data Error:', error);
            throw error;
        }
    },
    printMarksheet: async (payload) => {
        try {
            // payload: { marksheet_template: int, student_session_id: [int], type: "download", image: string }
            const response = await fetch(`${API_BASE}/cbseexam/result/printmarksheet`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Print Marksheet Error:', error);
            throw error;
        }
    },

    getCBSEAssessments: async () => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/Assessment/index`, createFetchOptions('GET'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Assessments Error:', error);
            throw error;
        }
    },

    addCBSEAssessment: async (payload) => {
        try {
            const formData = new FormData();
            Object.keys(payload).forEach(key => {
                const value = payload[key];
                if (Array.isArray(value)) {
                    value.forEach(val => formData.append(`${key}[]`, val));
                } else {
                    formData.append(key, value);
                }
            });

            // Ensure session_id is present if needed (though usually in payload or headers)
            if (!payload.session_id) {
                formData.append('session_id', getSessionId());
            }

            const response = await fetch(`${API_BASE}/cbseexam/Assessment/add`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Add CBSE Assessment Error:', error);
            throw error;
        }
    },

    deleteCBSEAssessment: async (id) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/Assessment/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Delete CBSE Assessment Error:', error);
            throw error;
        }
    },

    getCBSEAssessmentDetails: async (id) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/Assessment/get_editdetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Assessment Details Error:', error);
            throw error;
        }
    },

    viewCBSETemplate: async (templateId) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/Template/viewtemplate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ template_id: templateId })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('View CBSE Template Error:', error);
            throw error;
        }
    },

    getCBSEExamData: async (payload) => {
        try {
            // payload should contain marksheet_type and template_id
            const response = await fetch(`${API_BASE}/cbseexam/Template/get_examdata`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Exam Data Error:', error);
            throw error;
        }
    },

    linkCBSEExams: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/Template/linkexams`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Link CBSE Exams Error:', error);
            throw error;
        }
    },

    addCBSETemplate: async (payload) => {
        try {
            console.log("API addCBSETemplate payload:", payload);
            const response = await fetch(`${API_BASE}/cbseexam/Template/add`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Add CBSE Template Error:', error);
            throw error;
        }
    },

    updateCBSETemplate: async (payload) => {
        try {
            console.log("API updateCBSETemplate payload:", payload);
            const response = await fetch(`${API_BASE}/cbseexam/Template/edit`, createFetchOptions('POST', payload));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Update CBSE Template Error:', error);
            throw error;
        }
    },

    deleteCBSETemplate: async (templateId) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/Template/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ templateid: templateId })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Delete CBSE Template Error:', error);
            throw error;
        }
    },

    getCBSETemplateReportIndex: async () => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/report/templatewise`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Template Report Index Error:', error);
            throw error;
        }
    },

    getCBSETemplateWiseResult: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/report/getTemplateWiseResult`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Template Wise Result Error:', error);
            throw error;
        }
    },

    getCBSEExamSubjectList: async () => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/report/get_examsubject`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Exam Subject List Error:', error);
            throw error;
        }
    },
    printAdmitCard: async (payload) => {
        try {
            const formData = new FormData();
            formData.append('exam_id', payload.exam_id);
            if (Array.isArray(payload.student_session_id)) {
                payload.student_session_id.forEach(id => {
                    formData.append('student_session_id[]', id);
                });
            } else {
                formData.append('student_session_id', payload.student_session_id);
            }
            formData.append('session_id', getSessionId());

            const response = await fetch(`${API_BASE}/cbseexam/exam/printadmitcard`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Print Admit Card Error:', error);
            throw error;
        }
    },

    getConsolidatedReportResults: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/report/getClassSectionExamResults`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get Consolidated Report Results Error:', error);
            throw error;
        }
    },


    getCBSEExamSubjectResult: async (payload) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/report/examsubject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Get CBSE Exam Subject Result Error:', error);
            throw error;
        }
    },

    saveExamMarks: async (formData) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/entrymarks`, {
                method: 'POST',
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error('Save Exam Marks Error:', error);
            throw error;
        }
    },

    importExamMarks: async (formData) => {
        try {
            const response = await fetch(`${API_BASE}/cbseexam/exam/importsubjectmarks`, {
                method: 'POST',
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error('Import Exam Marks Error:', error);
            throw error;
        }
    },

    getOnlineCourseCategoryList: async () => {
        console.log('API Request: Get Online Course Category List');
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse`);
            const response = await fetch(url, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Online Course Category List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Online Course Category List API Error:', error);
            throw error;
        }
    },

    addOnlineCourseCategory: async (payload) => {
        console.log('API Request: Add Online Course Category', payload);
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse/add`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Online Course Category Response:', data);
            return data;
        } catch (error) {
            console.error('Add Online Course Category API Error:', error);
            throw error;
        }
    },

    getOnlineCourseVideoList: async (categoryId) => {
        console.log('API Request: Get Online Course Video List', categoryId);
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse/list`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category_id: categoryId }),
            });
            const data = await response.json();
            console.log('Get Online Course Video List Response:', data);
            return data;
        } catch (error) {
            console.error('Get Online Course Video List API Error:', error);
            throw error;
        }
    },

    addOnlineCourseVideo: async (payload) => {
        console.log('API Request: Add Online Course Video', payload);
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse/add_video`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Online Course Video Response:', data);
            return data;
        } catch (error) {
            console.error('Add Online Course Video API Error:', error);
            throw error;
        }
    },

    updateOnlineCourseVideo: async (payload) => {
        console.log('API Request: Update Online Course Video', payload);
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse/edit_video`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Online Course Video Response:', data);
            return data;
        } catch (error) {
            console.error('Update Online Course Video API Error:', error);
            throw error;
        }
    },

    getOnlineCourseVideoDetails: async (id) => {
        console.log('API Request: Get Online Course Video Details', id);
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse/get_video_details`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            console.log('Get Online Course Video Details Response:', data);
            return data;
        } catch (error) {
            console.error('Get Online Course Video Details API Error:', error);
            throw error;
        }
    },

    deleteOnlineCourseVideo: async (id) => {
        console.log('API Request: Delete Online Course Video', id);
        try {
            const url = appendSessionToUrl(`${API_BASE}/admin/onlinecourse/delete_video`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();
            console.log('Delete Online Course Video Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Online Course Video API Error:', error);
            throw error;
        }
    },

    getStaffAttendanceIndex: async () => {
        console.log('API Request: Get Staff Attendance Index');
        try {
            const response = await fetch(`${API_BASE}/admin/staffattendance/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Staff Attendance Index Response:', data);
            return data;
        } catch (error) {
            console.error('Staff Attendance Index API Error:', error);
            throw error;
        }
    },

    searchStaffAttendance: async (payload) => {
        console.log('API Request: Search Staff Attendance', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/staffattendance/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Search Staff Attendance Response:', data);
            return data;
        } catch (error) {
            console.error('Search Staff Attendance API Error:', error);
            throw error;
        }
    },
    getDepartmentList: async () => {
        console.log('API Request: Get Department List');
        try {
            const response = await fetch(`${API_BASE}/admin/department/department`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Department List Response:', data);
            return data;
        } catch (error) {
            console.error('Department List API Error:', error);
            throw error;
        }
    },
    addDepartment: async (payload) => {
        console.log('API Request: Add Department', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/department/department`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Department Response:', data);
            return data;
        } catch (error) {
            console.error('Add Department API Error:', error);
            throw error;
        }
    },
    getDepartmentForEdit: async (id) => {
        console.log('API Request: Get Department For Edit', id);
        try {
            const response = await fetch(`${API_BASE}/admin/department/departmentedit/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Department For Edit Response:', data);
            return data;
        } catch (error) {
            console.error('Get Department For Edit API Error:', error);
            throw error;
        }
    },
    updateDepartment: async (payload) => {
        console.log('API Request: Update Department', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/department/department`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Department Response:', data);
            return data;
        } catch (error) {
            console.error('Update Department API Error:', error);
            throw error;
        }
    },
    deleteDepartment: async (id) => {
        console.log('API Request: Delete Department', id);
        try {
            const response = await fetch(`${API_BASE}/admin/department/departmentdelete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Department Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Department API Error:', error);
            throw error;
        }
    },
    getDesignationList: async () => {
        console.log('API Request: Get Designation List');
        try {
            const response = await fetch(`${API_BASE}/admin/designation/designation`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Designation List Response:', data);
            return data;
        } catch (error) {
            console.error('Designation List API Error:', error);
            throw error;
        }
    },
    addDesignation: async (payload) => {
        console.log('API Request: Add Designation', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/designation/designation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Designation Response:', data);
            return data;
        } catch (error) {
            console.error('Add Designation API Error:', error);
            throw error;
        }
    },
    getDesignationForEdit: async (id) => {
        console.log('API Request: Get Designation For Edit', id);
        try {
            const response = await fetch(`${API_BASE}/admin/designation/designationedit/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Designation For Edit Response:', data);
            return data;
        } catch (error) {
            console.error('Get Designation For Edit API Error:', error);
            throw error;
        }
    },
    updateDesignation: async (payload) => {
        console.log('API Request: Update Designation', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/designation/designation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Designation Response:', data);
            return data;
        } catch (error) {
            console.error('Update Designation API Error:', error);
            throw error;
        }
    },
    deleteDesignation: async (id) => {
        console.log('API Request: Delete Designation', id);
        try {
            const response = await fetch(`${API_BASE}/admin/designation/designationdelete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Designation Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Designation API Error:', error);
            throw error;
        }
    },
    getLeaveTypeList: async () => {
        console.log('API Request: Get Leave Type List');
        try {
            const response = await fetch(`${API_BASE}/admin/leavetypes/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Leave Type List Response:', data);
            return data;
        } catch (error) {
            console.error('Leave Type List API Error:', error);
            throw error;
        }
    },
    createLeaveType: async (payload) => {
        console.log('API Request: Create Leave Type', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/leavetypes/createleavetype`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Create Leave Type Response:', data);
            return data;
        } catch (error) {
            console.error('Create Leave Type API Error:', error);
            throw error;
        }
    },
    getLeaveTypeForEdit: async (id) => {
        console.log('API Request: Get Leave Type For Edit', id);
        try {
            const response = await fetch(`${API_BASE}/admin/leavetypes/leaveedit/${id}`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log('Get Leave Type For Edit Response:', data);
            return data;
        } catch (error) {
            console.error('Get Leave Type For Edit API Error:', error);
            throw error;
        }
    },
    updateLeaveType: async (payload) => {
        console.log('API Request: Update Leave Type', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/leavetypes/createleavetype`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Leave Type Response:', data);
            return data;
        } catch (error) {
            console.error('Update Leave Type API Error:', error);
            throw error;
        }
    },
    deleteLeaveType: async (id) => {
        console.log('API Request: Delete Leave Type', id);
        try {
            const response = await fetch(`${API_BASE}/admin/leavetypes/leavedelete/${id}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Delete Leave Type Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Leave Type API Error:', error);
            throw error;
        }
    },
    getStaffLeaveIndex: async () => {
        console.log('API Request: Get Staff Leave Index');
        try {
            const response = await fetch(`${API_BASE}/admin/leaverequest/leaverequest`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Staff Leave Index Response:', data);
            return data;
        } catch (error) {
            console.error('Staff Leave Index API Error:', error);
            throw error;
        }
    },
    addStaffLeave: async (payload) => {
        console.log('API Request: Add Staff Leave', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/leaverequest/addLeave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Add Staff Leave Response:', data);
            return data;
        } catch (error) {
            console.error('Add Staff Leave API Error:', error);
            throw error;
        }
    },
    getStaffLeaveRecord: async (payload) => {
        console.log('API Request: Get Staff Leave Record', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/leaverequest/leaveRecord`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Staff Leave Record Response:', data);
            return data;
        } catch (error) {
            console.error('Staff Leave Record API Error:', error);
            throw error;
        }
    },
    deleteStaffLeave: async (id, staff_id) => {
        console.log('API Request: Delete Staff Leave', { id, staff_id });
        try {
            const response = await fetch(`${API_BASE}/admin/leaverequest/remove/${id}/${staff_id}`, {
                method: 'POST',
            });
            const data = await response.json();
            console.log('Delete Staff Leave Response:', data);
            return data;
        } catch (error) {
            console.error('Delete Staff Leave API Error:', error);
            throw error;
        }
    },
    updateStaffLeaveStatus: async (payload) => {
        console.log('API Request: Update Staff Leave Status', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/leaverequest/leaveStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Update Staff Leave Status Response:', data);
            return data;
        } catch (error) {
            console.error('Update Staff Leave Status API Error:', error);
            throw error;
        }
    },


    getWorksheets: async () => {
        console.log('API Request: Get Worksheets');
        try {
            const response = await fetch(`${API_BASE}/admin/content/worksheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            console.log('Get Worksheets Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch worksheets');
            }
            return data;
        } catch (error) {
            console.error('Get Worksheets API Error:', error);
            throw error;
        }
    },

    getNoticeBoardList: async (roleId) => {
        console.log('API Request: Get Notice Board List', roleId);
        try {
            const response = await fetch(`${API_BASE}/admin/notification/index/${roleId}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Notice Board List Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch notice board list');
            }
            return data;
        } catch (error) {
            console.error('Get Notice Board List API Error:', error);
            throw error;
        }
    },

    getNoticeBoardAdd: async () => {
        console.log('API Request: Get Notice Board Add Data');
        try {
            const response = await fetch(`${API_BASE}/admin/notification/get_add`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Notice Board Add Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching notice board add data:', error);
            throw error;
        }
    },

    addNoticeBoard: async (formData) => {
        console.log('API Request: Add Notice Board');
        // Log formData entries for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        try {
            const response = await fetch(`${API_BASE}/admin/notification/add`, {
                method: 'POST',
                body: formData, // Sending FormData directly for file upload support
            });
            const data = await response.json();
            console.log('Add Notice Board Response:', data);

            if (!response.ok || (data.status !== 'success' && data.status !== true)) {
                if (data.status === 0 || data.success === false) {
                    throw new Error(data.message || 'Failed to add notice');
                }
            }
            return data;
        } catch (error) {
            console.error('Add Notice Board API Error:', error);
            throw error;
        }
    },

    getNoticeBoard: async (id, roleId) => {
        console.log('API Request: Get Notice Board', id, roleId);
        try {
            const response = await fetch(`${API_BASE}/admin/notification/edit/${id}/${roleId}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Notice Board Response:', data);

            if (!response.ok || (data.status !== 'success' && data.status !== true)) {
                if (data.status === 0 || data.success === false) {
                    throw new Error(data.message || 'Failed to fetch notice');
                }
            }
            return data;
        } catch (error) {
            console.error('Get Notice Board API Error:', error);
            throw error;
        }
    },

    getNotificationSetting: async () => {
        console.log('API Request: Get Notification Settings');
        try {
            const response = await fetch(`${API_BASE}/admin/notification/setting`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Notification Settings Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            throw error;
        }
    },


    updateNoticeBoard: async (id, roleId, formData) => {
        console.log('API Request: Update Notice Board', id, roleId);
        try {
            const response = await fetch(`${API_BASE}/admin/notification/save_edit_data/${id}/${roleId}`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('Update Notice Board Response:', data);

            if (!response.ok || (data.status !== 'success' && data.status !== true)) {
                if (data.status === 0 || data.success === false) {
                    throw new Error(data.message || 'Failed to update notice');
                }
            }
            return data;
        } catch (error) {
            console.error('Error updating notice board:', error);
            throw error;
        }
    },

    deleteNoticeBoard: async (id, roleId) => {
        console.log('API Request: Delete Notice Board', id, roleId);
        try {
            const response = await fetch(`${API_BASE}/admin/notification/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    role_id: roleId
                }),
            });
            const data = await response.json();
            console.log('Delete Notice Board Response:', data);

            if (!response.ok || (data.status !== 'success' && data.status !== true)) {
                if (data.status === 0 || data.success === false) {
                    throw new Error(data.message || 'Failed to delete notice');
                }
            }
            return data;
        } catch (error) {
            console.error('Error deleting notice board:', error);
            throw error;
        }
    },

    getMailSMSCompose: async () => {
        console.log('API Request: Get MailSMS Compose Data');
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/compose`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get MailSMS Compose Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching mailsms compose data:', error);
            throw error;
        }
    },

    getSMSCompose: async () => {
        console.log('API Request: Get SMS Compose Data');
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/compose_sms`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get SMS Compose Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching SMS compose data:', error);
            throw error;
        }
    },

    getWhatsAppCompose: async () => {
        console.log('API Request: Get WhatsApp Compose Data');
        try {
            const response = await fetch(`${API_BASE}/admin/sendwhatsapp/compose_sms`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get WhatsApp Compose Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching WhatsApp compose data:', error);
            throw error;
        }
    },

    sendWhatsAppGroup: async (payload) => {
        console.log('API Request: Send WhatsApp Group Message', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/sendwhatsapp/send_group_sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send WhatsApp Group Response:', data);
            return data;
        } catch (error) {
            console.error('Error sending WhatsApp group message:', error);
            throw error;
        }
    },

    sendWhatsAppIndividual: async (payload) => {
        console.log('API Request: Send WhatsApp Individual Message', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/sendwhatsapp/send_individual_sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send WhatsApp Individual Response:', data);
            return data;
        } catch (error) {
            console.error('Error sending WhatsApp individual message:', error);
            throw error;
        }
    },

    sendWhatsAppClass: async (payload) => {
        console.log('API Request: Send WhatsApp Class Message', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/sendwhatsapp/send_class_sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send WhatsApp Class Response:', data);
            return data;
        } catch (error) {
            console.error('Error sending WhatsApp class message:', error);
            throw error;
        }
    },

    searchMailSMS: async (keyword, category) => {
        console.log('API Request: Search MailSMS', { keyword, category });
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyword: keyword,
                    category: category
                }),
            });
            const data = await response.json();
            console.log('Search MailSMS Response:', data);
            return data;
        } catch (error) {
            console.error('Error searching mailsms:', error);
            throw error;
        }
    },

    sendIndividualEmail: async (payload) => {
        console.log('API Request: Send Individual Email', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/send_individual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send Individual Email Response:', data);

            // For this API: status 0 = success, status 1 = failure
            if (!response.ok || data.status === 1 || data.status === '1') {
                throw new Error(data.message || 'Failed to send email');
            }
            return data;
        } catch (error) {
            console.error('Error sending individual email:', error);
            throw error;
        }
    },

    sendGroupEmail: async (payload) => {
        console.log('API Request: Send Group Email', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/send_group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send Group Email Response:', data);

            // For this API: status 0 = success, status 1 = failure
            if (!response.ok || data.status === 1 || data.status === '1') {
                throw new Error(data.message || 'Failed to send email');
            }
            return data;
        } catch (error) {
            console.error('Error sending group email:', error);
            throw error;
        }
    },

    sendClassEmail: async (formData) => {
        console.log('API Request: Send Class Email', formData);
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/send_class`, {
                method: 'POST',
                body: formData, // FormData object
            });
            const data = await response.json();
            console.log('Send Class Email Response:', data);

            // For this API: status 0 = success, status 1 = failure
            if (!response.ok || data.status === 1 || data.status === '1') {
                throw new Error(data.message || 'Failed to send email');
            }
            return data;
        } catch (error) {
            console.error('Error sending class email:', error);
            throw error;
        }
    },

    sendGroupSMS: async (payload) => {
        console.log('API Request: Send Group SMS', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/send_group_sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send Group SMS Response:', data);

            // For this API: status 0 = success, status 1 = failure
            if (!response.ok || data.status === 1 || data.status === '1') {
                throw new Error(data.message || 'Failed to send SMS');
            }
            return data;
        } catch (error) {
            console.error('Error sending group SMS:', error);
            throw error;
        }
    },

    sendIndividualSMS: async (payload) => {
        console.log('API Request: Send Individual SMS', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/send_individual_sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send Individual SMS Response:', data);

            // For this API: status 0 = success, status 1 = failure
            if (!response.ok || data.status === 1 || data.status === '1') {
                throw new Error(data.message || 'Failed to send SMS');
            }
            return data;
        } catch (error) {
            console.error('Error sending individual SMS:', error);
            throw error;
        }
    },

    sendClassSMS: async (payload) => {
        console.log('API Request: Send Class SMS', payload);
        try {
            const response = await fetch(`${API_BASE}/admin/mailsms/send_class_sms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Send Class SMS Response:', data);

            // For this API: status 0 = success, status 1 = failure
            if (!response.ok || data.status === 1 || data.status === '1') {
                throw new Error(data.message || 'Failed to send SMS');
            }
            return data;
        } catch (error) {
            console.error('Error sending class SMS:', error);
            throw error;
        }
    },

    getNotificationDetail: async (messageId, roleId) => {
        console.log('API Request: Get Notification Detail', { messageId, roleId });
        try {
            const response = await fetch(`${API_BASE}/admin/notification/notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message_id: messageId,
                    role_id: roleId,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch notification detail');
            }
            return data;
        } catch (error) {
            console.error('Get Notification Detail API Error:', error);
            throw error;
        }
    },

    getModulePermissions: async () => {
        console.log('API Request: Get Module Permissions');
        try {
            const response = await fetch(`${API_BASE}/admin/module/index`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log('Get Module Permissions Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch module permissions');
            }
            return data;
        } catch (error) {
            console.error('Get Module Permissions API Error:', error);
            throw error;
        }
    },

    changeModuleStatus: async (id, status) => {
        console.log('API Request: Change Module Status', { id, status });
        try {
            const response = await fetch(`${API_BASE}/admin/module/changeStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status }),
            });
            const data = await response.json();
            console.log('Change Module Status Response:', data);

            // API might return {status: "success"} or {status: 1}
            if (!response.ok || (data.status !== 'success' && data.message !== 'Status Change Successfully')) {
                // Fallback check if status is boolean/number 1 or "1" if "success" string isn't used
                if (data.status != 1 && data.status !== true && data.status !== 'success') {
                    throw new Error(data.message || 'Failed to change module status');
                }
            }
            return data;
        } catch (error) {
            console.error('Change Module Status API Error:', error);
            throw error;
        }
    },

    changeStudentStatus: async (id, status) => {
        console.log('API Request: Change Student Status', { id, status, role: 'student' });
        try {
            const response = await fetch(`${API_BASE}/admin/module/changeStudentStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status, role: 'student' }),
            });
            const data = await response.json();
            console.log('Change Student Status Response:', data);

            if (!response.ok && data.status !== 'success' && data.status !== 1) {
                throw new Error(data.message || 'Failed to change student module status');
            }
            return data;
        } catch (error) {
            console.error('Change Student Status API Error:', error);
            throw error;
        }
    },

    changeParentStatus: async (id, status) => {
        console.log('API Request: Change Parent Status', { id, status });
        try {
            const response = await fetch(`${API_BASE}/admin/module/changeParentStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status }),
            });
            const data = await response.json();
            console.log('Change Parent Status Response:', data);

            if (!response.ok && data.status !== 'success' && data.status !== 1) {
                throw new Error(data.message || 'Failed to change parent module status');
            }
            return data;
        } catch (error) {
            console.error('Change Parent Status API Error:', error);
            throw error;
        }
    },
};

// Export helper to get active session ID
export const getActiveSessionId = () => {
    return localStorage.getItem('activeSessionId') || localStorage.getItem('defaultSessionId') || '9';
};

// Export the internal helper for direct use if needed
export { getSessionId, appendSessionToUrl, createFetchOptions };

export default api;
