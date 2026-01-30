import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';

const FeeReminderSetting = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // Stats/Session info
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const pendingTasks = [];

    // Data State
    const [feeReminderList, setFeeReminderList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Flash message state
    const [flashMessage, setFlashMessage] = useState(null);

    // Reminder type labels mapping
    const reminderTypeLabels = {
        'before': 'Before Due Date',
        'on': 'On Due Date',
        'after': 'After Due Date',
        'before_due_date': 'Before Due Date',
        'on_due_date': 'On Due Date',
        'after_due_date': 'After Due Date',
        'second_reminder': 'Second Reminder',
        'third_reminder': 'Third Reminder'
    };

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getFeeReminders();
                if (response && response.feereminderlist) {
                    // Sort by ID to maintain order if needed, or by logic
                    // Ensure is_active is boolean or handled correctly
                    const mappedList = response.feereminderlist.map(item => ({
                        ...item,
                        is_active: String(item.is_active) === '1'
                    }));
                    setFeeReminderList(mappedList);
                }
            } catch (error) {
                console.error("Error fetching fee reminders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle checkbox change
    const handleActiveChange = (id) => {
        setFeeReminderList(prevList =>
            prevList.map(item =>
                item.id === id ? { ...item, is_active: !item.is_active } : item
            )
        );
    };

    // Handle days change
    const handleDaysChange = (id, value) => {
        setFeeReminderList(prevList =>
            prevList.map(item =>
                item.id === id ? { ...item, day: value } : item
            )
        );
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct payload in the requested format
        const payload = {
            ids: feeReminderList.map(item => item.id),
        };

        feeReminderList.forEach(item => {
            // Only add isactive if true (as is typical for checkboxes or specific API request)
            if (item.is_active) {
                payload[`isactive_${item.id}`] = 1;
            }
            // Add days regardless of active state (based on example)
            payload[`days${item.id}`] = item.day;
        });

        console.log('Saving fee reminder settings:', payload);

        try {
            const response = await api.updateFeeReminders(payload);
            setFlashMessage({ type: 'success', message: 'Fee reminder settings saved successfully!' });
        } catch (error) {
            console.error("Error updating fee reminders:", error);
            setFlashMessage({ type: 'danger', message: error.message || 'Failed to save fee reminder settings.' });
        }

        setTimeout(() => {
            setFlashMessage(null);
        }, 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        clearSession();
        navigate('/login');
    };

    const handleSidebarSearch = (e) => {
        e.preventDefault();
        console.log('Searching...');
    };

    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar
                handleSearch={handleSidebarSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/feereminder/setting"
            />

            <div className="content-wrapper" style={{ minHeight: '710px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-gears"></i> Fees Reminder
                    </h1>
                </section>

                <section className="content" style={{ marginTop: '18px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <form id="form1" onSubmit={handleSubmit} name="feereminder" method="post" acceptCharset="utf-8">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"> Fees Reminder</h3>
                                        <div className="btn-group pull-right">
                                            <Link to="/studentfee" className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        {flashMessage && (
                                            <div className={`alert alert-${flashMessage.type}`}>
                                                {flashMessage.message}
                                            </div>
                                        )}

                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Action</th>
                                                    <th>Reminder Type</th>
                                                    <th>Days</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center">
                                                            <i className="fa fa-spinner fa-spin"></i> Loading...
                                                        </td>
                                                    </tr>
                                                ) : feeReminderList.map((noteValue) => (
                                                    <tr key={noteValue.id}>
                                                        <td width="15%">
                                                            <label className="checkbox-inline">
                                                                <input
                                                                    type="checkbox"
                                                                    name={`isactive_${noteValue.id}`}
                                                                    value="1"
                                                                    checked={noteValue.is_active}
                                                                    onChange={() => handleActiveChange(noteValue.id)}
                                                                /> Active
                                                            </label>
                                                        </td>
                                                        <td width="15%">
                                                            <input
                                                                type="hidden"
                                                                name="ids[]"
                                                                value={noteValue.id}
                                                            />
                                                            {reminderTypeLabels[noteValue.reminder_type] || noteValue.reminder_type}
                                                        </td>
                                                        <td width="20%">
                                                            <input
                                                                type="number"
                                                                name={`days${noteValue.id}`}
                                                                value={noteValue.day}
                                                                onChange={(e) => handleDaysChange(noteValue.id, e.target.value)}
                                                                className="form-control"
                                                                style={{ width: '100px' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default FeeReminderSetting;
