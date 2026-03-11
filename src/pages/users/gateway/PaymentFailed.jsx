import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../user_components/Header_user';
import Sidebar from '../user_components/Sidebar_user';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api_users } from '../../../services/api_users';

const PaymentFailed = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const userData = {
        name: "Student",
        role: "Student",
        id: "",
        avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
        adminLogoUrl: ""
    };

    const handleLogout = async () => {
        try { await api_users.userLogout(); } catch (e) { }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        navigate('/user/login');
    };

    return (
        <div className="wrapper theme-white-skin">
            <style>{`
                .sessionul, .search-form2, .search-form { display: none !important; }
                .navbar-custom-menu { overflow: visible !important; }
                .navbar-custom-menu .nav { overflow: visible !important; }
                .navbar-custom-menu .nav > li:not(.user-menu) { display: none !important; }
                .navbar-custom-menu .nav > li.user-menu { display: block !important; overflow: visible !important; }
                .dropdown-user { display: none; z-index: 9999 !important; position: absolute !important; right: 0 !important; top: 100% !important; }
                .user-menu.open .dropdown-user { display: block !important; }
                .content-wrapper, .main-footer { margin-left: 80px !important; }
                .sidebar { height: calc(100vh - 50px) !important; overflow-y: auto !important; overflow-x: hidden !important; padding-bottom: 20px !important; }
                .sidebar::-webkit-scrollbar { width: 5px; }
                .sidebar::-webkit-scrollbar-track { background: transparent; }
                .sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .sidebar-menu > li > a { padding: 12px 5px !important; text-align: center !important; }
                .sidebar-menu li img { filter: brightness(0) invert(1) !important; width: 24px !important; margin: 0 auto !important; }
                .sidebar-menu > li > a span { color: #ffffff !important; font-weight: 500 !important; margin-top: 5px !important; display: block !important; font-size: 10px !important; line-height: 1.2 !important; }
                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a { background: rgba(255, 255, 255, 0.1) !important; }
                .fixedmenu { display: none !important; }
                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                }
            `}</style>
            <Header userData={userData} handleLogout={handleLogout} sessionYear={sessionYear} headerLogoUrl={userData.adminLogoUrl} />
            <Sidebar sessionYear={sessionYear} currentUrl="/user/getfees" />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-6 col-md-offset-3" style={{ marginTop: '80px' }}>
                            <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center', padding: '40px 30px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e53935', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa fa-times" style={{ fontSize: '40px', color: '#fff' }}></i>
                                </div>
                                <h3 style={{ color: '#333', marginBottom: '10px' }}>Payment Failed</h3>
                                <p style={{ color: '#777', fontSize: '14px' }}>We were unable to process your payment. Please try again or contact your school administration for assistance.</p>
                                <div style={{ marginTop: '30px' }}>
                                    <button className="btn" style={{ backgroundColor: '#9854cb', color: '#fff', border: 'none', marginRight: '10px' }} onClick={() => navigate('/user/getfees')}>
                                        <i className="fa fa-refresh"></i> Try Again
                                    </button>
                                    <button className="btn" style={{ backgroundColor: '#9854cb', color: '#fff', border: 'none' }} onClick={() => navigate('/user/dashboard')}>
                                        <i className="fa fa-home"></i> Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentFailed;
