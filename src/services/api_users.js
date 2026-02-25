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
    }
};
