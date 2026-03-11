import React from 'react';
import { useSession } from '../../../context/SessionContext';

const TopSidebar = ({ sessionYear: propSessionYear }) => {
    // Get current session from context
    const { currentSession } = useSession();

    // Use context session if available, otherwise fall back to prop or default
    const sessionYear = currentSession?.session || propSessionYear || '2024-25';

    return (
        <ul className="sessionul fixedmenu">
            <li className="removehover">
                <a className="current-session-year" data-toggle="modal" data-target="#sessionModal" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: '300' }}>Session:</span>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: '300' }}>{sessionYear}</span>
                        <i className="fa fa-pencil" style={{ marginLeft: '4px', fontSize: '13px' }}></i>
                    </div>
                </a>
            </li>
            <li className="dropdown mega-dropdown">
                {/* 
                   In the PHP logic, this contained a complex mega menu.
                   For the current React conversion, we will keep the structure 
                   ready for the mega menu but currently it might be hidden or 
                   partially implemented depending on the dashboard_test.jsx state.
                   In dashboard_test.jsx it contained static cards.
                */}
                <div className="dropdown-menu verticalmenu side-navbar-vertical">
                    <div className="side-navbar-width scroll-area">
                        <div className="card-columns-sidebar" style={{ color: 'black' }}>
                            {/* Quick Links Cards - Static Demo Data */}
                            <div className="card-sidebar">
                                <h4><i className="fa fa-user"></i> Student Information</h4>
                                <ul>
                                    <li><a href="/student/search"><i className="fa fa-angle-double-right"></i> Student Details</a></li>
                                    <li><a href="/student/admission"><i className="fa fa-angle-double-right"></i> Student Admission</a></li>
                                    <li><a href="/student/category"><i className="fa fa-angle-double-right"></i> Category</a></li>
                                </ul>
                            </div>
                            <div className="card-sidebar">
                                <h4><i className="fa fa-money"></i> Fees Collection</h4>
                                <ul>
                                    <li><a href="/studentfee"><i className="fa fa-angle-double-right"></i> Collect Fees</a></li>
                                    <li><a href="/studentfee/searchpayment"><i className="fa fa-angle-double-right"></i> Search Fees Payment</a></li>
                                    <li><a href="/studentfee/feessearch"><i className="fa fa-angle-double-right"></i> Search Due Fees</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    );
};

export default TopSidebar;

