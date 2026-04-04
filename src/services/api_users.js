export const API_BASE = 'https://newlayout.wisibles.com/api_admin';

const api_users = {
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

    // User Logout API
    userLogout: async () => {
        console.log('API Request: User Logout');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/site/logout`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('User Logout Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Logout failed');
            }
            return data;
        } catch (error) {
            console.error('User Logout API Error:', error);
            // Return failure seamlessly so local cleanup still works
            return { status: false, message: error.message };
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
    },

    // Get User Notifications
    getNotifications: async () => {
        console.log('API Request: Get User Notifications');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/notification/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Notifications Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch notifications');
            }
            return data;
        } catch (error) {
            console.error('Get Notifications API Error:', error);
            throw error;
        }
    },

    // Get Student Diary List API
    getStudentDiaryList: async () => {
        console.log('API Request: Get Student Diary List');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/Studentdairy/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Student Diary Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch student diary list');
            }
            return data;
        } catch (error) {
            console.error('Get Student Diary API Error:', error);
            throw error;
        }
    },

    getTransportRoute: async () => {
        console.log('API Request: Get Transport Route');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/route/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Transport Route Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch transport route');
            }
            return data;
        } catch (error) {
            console.error('Get Transport Route API Error:', error);
            throw error;
        }
    },

    // Get Hostel Rooms
    getHostelRooms: async () => {
        console.log('API Request: Get Hostel Rooms');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/hostelroom/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Hostel Rooms Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch hostel rooms');
            }
            return data;
        } catch (error) {
            console.error('Get Hostel Rooms API Error:', error);
            throw error;
        }
    },

    // Get Student Timetable
    getTimetable: async () => {
        console.log('API Request: Get Student Timetable');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/timetable`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Timetable Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch timetable');
            }
            return data;
        } catch (error) {
            console.error('Get Timetable API Error:', error);
            throw error;
        }
    },

    // Get Student Homework
    getHomework: async () => {
        console.log('API Request: Get Student Homework');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/homework/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Homework Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch homework');
            }
            return data;
        } catch (error) {
            console.error('Get Homework API Error:', error);
            throw error;
        }
    },

    // Get Daily Assignment
    getDailyAssignment: async () => {
        console.log('API Request: Get Daily Assignment');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/homework/dailyassignment`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Daily Assignment Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to fetch daily assignment');
            }
            return data;
        } catch (error) {
            console.error('Get Daily Assignment API Error:', error);
            throw error;
        }
    },

    // Get Syllabus Index (Lesson Plan)
    getSyllabusIndex: async () => {
        console.log('API Request: Get Syllabus Index');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/syllabus/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            if (!response.ok || !data.status) throw new Error(data.message || 'Failed to fetch syllabus index');
            return data;
        } catch (error) {
            console.error('Get Syllabus Index Error:', error);
            throw error;
        }
    },

    // Get Syllabus Week Dates
    getSyllabusWeekDates: async (date) => {
        console.log('API Request: Get Syllabus Week Dates', date);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/syllabus/get_weekdates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                },
                body: JSON.stringify({ date })
            });
            const data = await response.json();
            if (!response.ok || !data.status) throw new Error(data.message || 'Failed to fetch week dates');
            return data;
        } catch (error) {
            console.error('Get Syllabus Week Dates Error:', error);
            throw error;
        }
    },
    // Get Syllabus Status
    getSyllabusStatus: async () => {
        console.log('API Request: Get Syllabus Status');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/syllabus/get_status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            if (!response.ok || !data.status) throw new Error(data.message || 'Failed to fetch syllabus status');
            return data;
        } catch (error) {
            console.error('Get Syllabus Status Error:', error);
            throw error;
        }
    },

    // Get Student Session Classes (for Switch Class)
    getStudentSessionClasses: async () => {
        console.log('API Request: Get Student Session Classes');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/common/getStudentSessionClasses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            // This API returns {status: true, data: {studentclasses: [...]}}
            if (!response.ok) throw new Error(data.message || 'Failed to fetch session classes');
            return data;
        } catch (error) {
            console.error('Get Student Session Classes Error:', error);
            throw error;
        }
    },

    // Update Student Class (for Switch Class)
    updateStudentClass: async (studentSessionId, studentId) => {
        console.log('API Request: Update Student Class (Switch Class)', { studentSessionId, studentId });
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;

            const response = await fetch(`${API_BASE}/common/getStudentClass`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                },
                body: JSON.stringify({
                    student_session_id: studentSessionId,
                    student_id: studentId
                })
            });
            const data = await response.json();
            if (!response.ok || data.status === 0 || data.status === '0' || data.status === false) {
                throw new Error(data.message || 'Failed to update student class');
            }
            return data;
        } catch (error) {
            console.error('Update Student Class Error:', error);
            throw error;
        }
    },
    getOnlineCourses: async () => {
        console.log('API Request: Get Online Courses');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/onlinecourse/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Online Courses Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch online courses');
            }
            return data;
        } catch (error) {
            console.error('Get Online Courses API Error:', error);
            throw error;
        }
    },
    // Get Online Course List
    getOnlineCourseList: async (categoryId) => {
        console.log('API Request: Get Online Course List', { categoryId });
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/onlinecourse/list/${categoryId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Online Course List Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch online course list');
            }
            return data;
        } catch (error) {
            console.error('Get Online Course List API Error:', error);
            throw error;
        }
    },

    // Get Visitors
    getVisitors: async () => {
        console.log('API Request: Get Visitors');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/visitors/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Visitors Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch visitors');
            }
            return data;
        } catch (error) {
            console.error('Get Visitors API Error:', error);
            throw error;
        }
    },

    // Get Content List
    getContentList: async () => {
        console.log('API Request: Get Content List');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/content/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Content List Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch content list');
            }
            return data;
        } catch (error) {
            console.error('Get Content List API Error:', error);
            throw error;
        }
    },

    // Get Content Detail
    getContentDetail: async (id) => {
        console.log('API Request: Get Content Detail', id);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/content/view/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Content Detail Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch content detail');
            }
            return data;
        } catch (error) {
            console.error('Get Content Detail API Error:', error);
            throw error;
        }
    },


    // Get State Exam Result
    getExamResult: async () => {
        console.log('API Request: Get Exam Result');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/cbse/exam/result`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Exam Result Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch exam result');
            }
            return data;
        } catch (error) {
            console.error('Get Exam Result API Error:', error);
            throw error;
        }
    },

    // Get Apply Leave
    getApplyLeave: async () => {
        console.log('API Request: Get Apply Leave');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/apply_leave/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });
            const data = await response.json();
            console.log('Get Apply Leave Response:', data);

            if (!response.ok || !data.status) {
                if (data && data.data) return data;
                throw new Error(data.message || 'Failed to fetch apply leave');
            }
            return data;
        } catch (error) {
            console.error('Get Apply Leave API Error:', error);
            throw error;
        }
    },

    // Apply / Edit Leave
    addApplyLeave: async (leaveData) => {
        console.log('API Request: Add Apply Leave', leaveData);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;

            // Using FormData as requested
            const formData = new FormData();
            formData.append('student_session_id', leaveData.student_session_id || '');
            formData.append('apply_date', leaveData.apply_date || '');
            formData.append('from_date', leaveData.from_date || '');
            formData.append('to_date', leaveData.to_date || '');
            formData.append('message', leaveData.message || '');

            if (leaveData.Leave_id) {
                formData.append('Leave_id', leaveData.Leave_id);
            }
            if (leaveData.leave_id) {
                formData.append('leave_id', leaveData.leave_id);
            }

            // Also attach file if present
            const fileToUpload = leaveData.files || leaveData.file || leaveData.docs;
            if (fileToUpload) {
                formData.append('files', fileToUpload);
            }

            const response = await fetch(`${API_BASE}/user/apply_leave/add`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? token : ''
                },
                body: formData
            });

            const data = await response.json();
            console.log('Add Apply Leave Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to add apply leave');
            }
            return data;
        } catch (error) {
            console.error('Add Apply Leave API Error:', error);
            throw error;
        }
    },

    // Apply Leave Get Details
    getApplyLeaveDetails: async (id) => {
        console.log(`API Request: Get Apply Leave Details for ID ${id}`);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;

            const response = await fetch(`${API_BASE}/user/apply_leave/get_details/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });

            const data = await response.json();
            console.log('Get Apply Leave Details Response:', data);

            // The API doesn't always wrap in true/false status for single objects, 
            // but we'll return the data anyway
            return data;
        } catch (error) {
            console.error('Get Apply Leave Details API Error:', error);
            throw error;
        }
    },

    // Apply Leave Delete
    deleteApplyLeave: async (id) => {
        console.log(`API Request: Delete Apply Leave for ID ${id}`);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;

            const response = await fetch(`${API_BASE}/user/apply_leave/remove_leave/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
            });

            const data = await response.json();
            console.log('Delete Apply Leave Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to delete apply leave');
            }
            return data;
        } catch (error) {
            console.error('Delete Apply Leave API Error:', error);
            throw error;
        }
    },

    // Initiate CCAvenue Payment (handles both Group Pay and Single Pay)
    initiateCCAvenuePayment: async (paymentData, isSingle) => {
        console.log(`API Request: Initiate CCAvenue Payment (${isSingle ? 'Single' : 'Group'})`, paymentData);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const endpoint = isSingle ? `${API_BASE}/user/gateway/payment/pay` : `${API_BASE}/user/gateway/payment/grouppay`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                },
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            console.log(`Initiate CCAvenue Payment Response (${isSingle ? 'Single' : 'Group'}):`, data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to initiate payment');
            }
            return data;
        } catch (error) {
            console.error('CCAvenue Payment API Error:', error);
            throw error;
        }
    },

    // Print Individual Fee by Name/Invoice
    printFeesByName: async (dataToPrint) => {
        console.log('API Request: Print Fees By Name', dataToPrint);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/user/printFeesByName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                },
                body: JSON.stringify(dataToPrint)
            });
            const data = await response.json();
            console.log('Print Fees By Name Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to get print details');
            }
            return data;
        } catch (error) {
            console.error('Print Fees By Name API Error:', error);
            throw error;
        }
    },

    // Print Multiple Selected Fees
    printFeesByGroupArray: async (payload) => {
        console.log('API Request: Print Fees By Group Array', payload);
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/user/user/printFeesByGroupArray`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log('Print Fees By Group Array Response:', data);

            if (!response.ok || !data.status) {
                throw new Error(data.message || 'Failed to get print details');
            }
            return data;
        } catch (error) {
            console.error('Print Fees By Group Array API Error:', error);
            throw error;
        }
    },

    // Get Module Permissions (for sidebar visibility)
    getModulePermissions: async () => {
        console.log('API Request: Get Module Permissions (User)');
        try {
            const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`${API_BASE}/admin/module/index`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? token : ''
                }
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
    }
};

export { api_users, api_users as default };
