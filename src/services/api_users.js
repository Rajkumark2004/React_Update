export const API_BASE = 'https://newlayout.wisibles.com/api_admin';

export const api_users = {
    userLogin: async (username, password) => {
        try {
            const response = await fetch(`${API_BASE}/site/userlogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (!response.ok || data.status === 0 || data.status === false) {
                throw new Error(data.error || data.message || 'Login failed');
            }
            return data;
        } catch (error) {
            console.error('User Login API Error:', error);
            throw error;
        }
    },

    // User Dashboard API
    getUserDashboard: async () => {
        console.log('API Request: Get User Dashboard Data');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/user/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('User Dashboard Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch user dashboard data');
            }
            return data;
        } catch (error) {
            console.error('User Dashboard API Error:', error);
            throw error;
        }
    },

    // User Profile API
    getUserProfile: async () => {
        console.log('API Request: Get User Profile Data');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('User Profile Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch user profile data');
            }
            return data;
        } catch (error) {
            console.error('User Profile API Error:', error);
            throw error;
        }
    },

    // Get Fees API
    getFees: async () => {
        console.log('API Request: Get Fees Data');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/user/getfees`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Fees Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch fees data');
            }
            return data;
        } catch (error) {
            console.error('Get Fees API Error:', error);
            throw error;
        }
    },

    // User Attendance API
    getUserAttendance: async () => {
        console.log('API Request: Get User Attendance Data');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/Attendence/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('User Attendance Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch attendance data');
            }
            return data;
        } catch (error) {
            console.error('User Attendance API Error:', error);
            throw error;
        }
    },

    // Get Attendance Events (with date range)
    getAttendance: async (start, end) => {
        console.log('API Request: Get Attendance Events', { start, end });
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/Attendence/getAttendance?start=${start}&end=${end}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Attendance Events Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch attendance events');
            }
            return data;
        } catch (error) {
            console.error('Get Attendance Events API Error:', error);
            throw error;
        }
    }
};
