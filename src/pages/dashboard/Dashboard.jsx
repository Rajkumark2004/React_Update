import React from 'react';
import './Dashboard.css';
import {
    Search,
    Calendar,
    CheckSquare,
    MessageCircle,
    User,
    Menu,
    LayoutDashboard,
    Users,
    CreditCard,
    ClipboardList,
    GraduationCap,
    Bus,
    Settings,
    Pencil,
    CheckCircle2,
    Plus,
    LayoutGrid,
    IndianRupee,
    UserCheck,
    BookOpen,
    Library,
    NotebookPen,
    UserCog,
    FileDown,
    Award,
    Wallet,
    Building,
    BarChart3
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export default function Dashboard() {
    const { currentSession } = useSession();

    return (
        <div className="dashboard-container">
            {/* TOP HEADER (Full Width Loop) */}
            <header className="top-header">
                <div className="header-left">
                    <div className="header-logo-container">
                        <img src="/images/wisibles_logo.png" alt="Logo" className="header-logo-img" />
                    </div>
                </div>

                <div className="header-right">
                    <div className="search-bar-container">
                        <input type="text" className="search-input" placeholder="Search By Student Name" />
                        <Search size={18} color="#555" />
                    </div>

                    <div className="header-actions">
                        <div className="header-icon" data-tooltip="Calendar"><Calendar size={20} color="#444" /></div>
                        <div className="header-icon" data-tooltip="Tasks"><CheckSquare size={20} color="#444" /></div>
                        <div className="header-icon" data-tooltip="Messages"><MessageCircle size={20} color="#444" /></div>
                        <div className="header-icon" data-tooltip="Profile">
                            <div className="profile-circle-small">
                                <User size={16} color="#555" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* DASHBOARD BODY (Sidebar + Widgets) */}
            <div className="dashboard-body">
                {/* SIDEBAR */}
                <aside className="dashboard-sidebar">
                    <div className="session-info-top">
                        <div className="session-label">Session:</div>
                        <div className="session-year">{currentSession?.session || '---'}</div>
                    </div>

                    <ul className="dashboard-sidebar-menu">
                        <li className="dashboard-sidebar-item">
                            <LayoutGrid size={24} strokeWidth={1.5} />
                            <span>Help Desk</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <User size={24} strokeWidth={1.5} />
                            <span>SIS</span>
                        </li>
                        <li className="dashboard-sidebar-item active">
                            <IndianRupee size={24} strokeWidth={1.5} />
                            <span>Fees</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <UserCheck size={24} strokeWidth={1.5} />
                            <span>Attendance</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <GraduationCap size={24} strokeWidth={1.5} />
                            <span>Academics</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <BookOpen size={24} strokeWidth={1.5} />
                            <span>State Examination</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <Library size={24} strokeWidth={1.5} />
                            <span>Courses</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <NotebookPen size={24} strokeWidth={1.5} />
                            <span>Homework</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <Bus size={24} strokeWidth={1.5} />
                            <span>Transport</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <MessageCircle size={24} strokeWidth={1.5} />
                            <span>Messages</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <UserCog size={24} strokeWidth={1.5} />
                            <span>Human Resource</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <FileDown size={24} strokeWidth={1.5} />
                            <span>Download Center</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <Award size={24} strokeWidth={1.5} />
                            <span>Certificate</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <Wallet size={24} strokeWidth={1.5} />
                            <span>Income</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <BookOpen size={24} strokeWidth={1.5} />
                            <span>Expenses</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <Building size={24} strokeWidth={1.5} />
                            <span>Hostel</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <BarChart3 size={24} strokeWidth={1.5} />
                            <span>Reports</span>
                        </li>
                        <li className="dashboard-sidebar-item">
                            <Settings size={24} strokeWidth={1.5} />
                            <span>Settings</span>
                        </li>
                    </ul>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="main-content">
                    {/* DASHBOARD WIDGETS */}
                    <div className="dashboard-content">

                        <div className="dashboard-row">
                            {/* LEFT COLUMN (MAIN) */}
                            <div className="col-main">

                                {/* CONTENT SEARCH BAR */}
                                <div className="content-search-bar">
                                    <input type="text" className="search-input-large" placeholder="Search By Student Name" />
                                    <Search size={14} color="#555" className="search-icon-large" />
                                </div>

                                {/* WELCOME BANNER */}
                                <div className="welcome-card">
                                    <div className="welcome-text">
                                        <h3>Hello Super Admin</h3>
                                        <p>Check your daily fee statements</p>
                                        <button className="btn-check-now">Check Now</button>
                                    </div>
                                    <div className="welcome-image">
                                        {/* Illustration Placeholder */}
                                        <img src="/images/dash_illustration.png" alt="Dashboard Illustration" className="welcome-illustration" />
                                    </div>
                                </div>

                                {/* STATS CARDS ROW */}
                                <div className="dashboard-row" style={{ gap: '15px' }}>
                                    {/* STUDENT ATTENDANCE */}
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-date">Jan 9, 2026</div>
                                            <div className="stat-title">Student Attendance</div>
                                            <div className="stat-subtitle">Today</div>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: '0%', background: '#d32f2f' }}></div>
                                        </div>
                                        <div className="progress-text">
                                            <span>Progress</span>
                                            <span>0.00%</span>
                                        </div>
                                        <div className="stat-avatars">
                                            <div className="stat-avatar"></div>
                                            <div className="stat-avatar"></div>
                                            <div className="icon-circle-add"><Plus size={14} /></div>
                                            <div className="stat-badge-count">0/54</div>
                                        </div>
                                    </div>

                                    {/* STAFF ATTENDANCE */}
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-date">Jan 9, 2026</div>
                                            <div className="stat-title">Staff Attendance</div>
                                            <div className="stat-subtitle">Today</div>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: '0%', background: '#1976d2' }}></div>
                                        </div>
                                        <div className="progress-text">
                                            <span>Progress</span>
                                            <span>0.00%</span>
                                        </div>
                                        <div className="stat-avatars">
                                            <div className="stat-avatar"></div>
                                            <div className="icon-circle-add" style={{ background: '#1976d2' }}><Plus size={14} /></div>
                                            <div className="stat-badge-count blue">0/11</div>
                                        </div>
                                    </div>

                                    {/* FEE COLLECTION */}
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-date">Jan 9, 2026</div>
                                            <div className="stat-title">Fee Collection</div>
                                            <div className="stat-subtitle">Today</div>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: '10%', background: '#ff9800' }}></div>
                                        </div>
                                        <div className="progress-text">
                                            <span>Progress</span>
                                            <span>9.72%</span>
                                        </div>
                                        <div className="stat-avatars">
                                            <div className="stat-avatar"></div>
                                            <div className="icon-circle-add" style={{ background: '#ff9800' }}><Plus size={14} /></div>
                                            <div className="stat-badge-count orange">7/72</div>
                                        </div>
                                    </div>

                                </div>

                                {/* ADMISSIONS TABLE */}
                                <div className="admissions-card">
                                    <h3 className="card-title">Admissions Intake</h3>
                                    <table className="table-custom">
                                        <thead>
                                            <tr>
                                                <th>Class</th>
                                                <th>Section</th>
                                                <th>Intake</th>
                                                <th>Admissions</th>
                                                <th>Vacancies</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Nursery</td>
                                                <td>A</td>
                                                <td>30</td>
                                                <td>7</td>
                                                <td>23</td>
                                            </tr>
                                            <tr>
                                                <td>LKG</td>
                                                <td>A</td>
                                                <td>40</td>
                                                <td>5</td>
                                                <td>35</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            {/* RIGHT COLUMN (SIDE) */}
                            <div className="col-side">

                                {/* PROFILE CARD */}
                                <div className="profile-card">
                                    <div className="edit-icon"><Pencil size={14} /></div>
                                    <div className="profile-info">
                                        <h3>Super Admin</h3>
                                        <h2>Super Admin</h2>
                                        <a href="#" className="view-profile-link">View Profile <CheckCircle2 size={12} /></a>
                                    </div>
                                    <div className="profile-avatar-large">
                                        <User size={36} color="#d4a017" />
                                    </div>
                                </div>

                                {/* FEE SUMMARY */}
                                <div className="fee-summary-container">
                                    <h3 className="card-title" style={{ fontSize: '16px', marginBottom: '20px' }}>Fee Summary</h3>

                                    <div className="fee-summary-item">
                                        <div className="fee-icon-box purple">
                                            <GraduationCap size={24} />
                                        </div>
                                        <div className="fee-text">
                                            <span className="fee-label">TOTAL STUDENTS FEES</span>
                                            <span className="fee-amount">Rs. 252,200.00</span>
                                        </div>
                                    </div>

                                    <div className="fee-summary-item">
                                        <div className="fee-icon-box pink">
                                            <CheckSquare size={24} />
                                        </div>
                                        <div className="fee-text">
                                            <span className="fee-label">TOTAL PAID FEES</span>
                                            <span className="fee-amount">Rs. 32,100.00</span>
                                        </div>
                                    </div>

                                    <div className="fee-summary-item">
                                        <div className="fee-icon-box green">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="fee-text">
                                            <span className="fee-label">TOTAL BALANCE FEES</span>
                                            <span className="fee-amount">Rs. 220,100.00</span>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
