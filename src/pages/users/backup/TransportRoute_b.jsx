
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const TransportRoute = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });



    // State for transport route data
    const [listroute, setListRoute] = useState({
        route_title: "",
        vehicle_no: "",
        vehicle_model: "",
        manufacture_year: "",
        driver_name: "",
        driver_licence: "",
        driver_contact: "",
        vehicle_photo: null,
        pickup_point_name: "",
        pickup_point: []
    });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    // Timeline state
    const [counter, setCounter] = useState(0);
    const xScrolling = 280;
    const timelineRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    initialName = userObj.username || "User";
                    setUserData(prev => ({
                        ...prev,
                        name: initialName,
                        role: userObj.role || 'Student',
                        avatar: userObj.image || "/uploads/student_images/no_image.png"
                    }));
                }
                const res = await api_users.getUserDashboard();
                if (res && res.status && res.data && res.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: res.data.student.name || initialName,
                        id: res.data.student.id || prev.id,
                        adminLogoUrl: res.data.sch_setting?.admin_logo && res.data.sch_setting?.base_url
                            ? `${res.data.sch_setting.base_url}uploads/school_content/admin_logo/${res.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            }
        };

        const fetchTransportRoute = async () => {
            try {
                const res = await api_users.getTransportRoute();
                if (res && res.data) {
                    setListRoute({
                        route_title: res.data.route_title || "",
                        vehicle_no: res.data.vehicle_no || "",
                        vehicle_model: res.data.vehicle_model || "",
                        manufacture_year: res.data.manufacture_year || "",
                        driver_name: res.data.driver_name || "",
                        driver_licence: res.data.driver_licence || "",
                        driver_contact: res.data.driver_contact || "",
                        vehicle_photo: res.data.vehicle_photo || null,
                        pickup_point_name: res.data.pickup_point_name || "",
                        pickup_point: res.data.pickup_points || res.data.pickup_point || []
                    });
                }
            } catch (error) {
                console.error("Failed to load transport route data:", error);
            }
        };

        fetchUserData();
        fetchTransportRoute();
    }, []);

    const handleLogout = async () => {
        try {
            await api_users.userLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearSession();
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            navigate('/user/login');
        }
    };



    const scrollTimeline = (direction) => {
        if (!timelineRef.current) return;
        const currentTransform = timelineRef.current.style.transform || 'translateX(0px)';
        const currentX = parseInt(currentTransform.replace('translateX(', '').replace('px)', '')) || 0;
        const sign = direction === 'next' ? -1 : 1;
        const nextX = currentX + (sign * xScrolling);

        timelineRef.current.style.transform = `translateX(${nextX}px)`;
        setCounter(direction === 'next' ? counter + 1 : counter - 1);
    };

    const isPrevDisabled = counter <= 0;
    const isNextDisabled = listroute.pickup_point.length < 3 || counter >= listroute.pickup_point.length - 2;



    return (
        <div className="wrapper">
            <style>{`
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }
                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }
                .sidebar::-webkit-scrollbar { width: 5px; }
                .sidebar::-webkit-scrollbar-track { background: transparent; }
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .sidebar-menu > li > a {
                    padding: 12px 5px !important;
                    text-align: center !important;
                }
                .sidebar-menu li img {
                    filter: brightness(0) invert(1) !important;
                    width: 24px !important;
                    margin: 0 auto !important;
                }
                .sidebar-menu > li > a span {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                    margin-top: 5px !important;
                    display: block !important;
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                }
                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .sessionul, .fixedmenu, .search-form, .navbar-form { display: none !important; }
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 0px !important;
                    margin-top: 46px !important;
                    min-height: 630px !important;
                }
.box-title{
    font-size: 18px !important;
    font-weight: 300 !important;
}


                /* Transport Route Specific CSS */
                .route-bus-icon {
                    border-radius: 6px;
                    width: 90%;
                    object-fit: cover;
                    height: 90px;
                    margin-bottom: 1.5rem;
                    box-shadow: 0px 2px 10px 0px rgb(0 0 0 / 38%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #fff;
                }
                .route-bus-icon i { font-size: 8rem; color: #000; }
                .route-text { margin-bottom: 5px; font-size: 13px; }
                .route-text b { color: #333; }
                .route-text span { color: #666; }
                .route-wrap { position: relative; clear: both; padding-top: 1rem; }
                .title-route-h4 { margin-bottom: 20px; font-family: "Roboto-Medium"; font-size: 18px; color: #333; }
                .timeline-route { white-space: nowrap; overflow-x: hidden; position: relative; clear: both; padding: 0 0px; margin-top: 30px; }
                .timeline-route ol { width: 100vw; padding: 160px 0; transition: all 1s; margin: 0; display: flex; align-items: center; }
                .timeline-route ol li { position: relative; display: inline-block; list-style-type: none; width: 175px; height: 6px; background: #424242; flex-shrink: 0; }
                .timeline-route ol li:first-child { width: 50px; }
                .timeline-route ol li:not(:first-child) { margin-left: 24px; }
                .timeline-route ol li:not(:last-child)::after {
                    content: "\\f041";
                    font-family: FontAwesome;
                    color: #f38000;
                    font-size: 25px;
                    position: absolute;
                    top: -15px;
                    left: calc(100% + 5px);
                    bottom: 0;
                    width: 20px;
                    height: 20px;
                    transform: translateY(2%);
                    z-index: 5;
                }
                .timeline-route ol li div {
                    position: absolute;
                    left: calc(100% - 25px);
                    width: 200px;
                    padding: 10px 15px 15px;
                    white-space: normal;
                    color: black;
                    background: #f9f3ec;
                    border-radius: 0.5rem 0.5rem 0.5rem 0rem;
                    z-index: 10;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .timeline-route ol li div.active { background: #b0dd38; }
                .timeline-route ol li div h4 { font-size: 15px; margin-top: 0; margin-bottom: 8px; font-weight: bold; }
                .timeline-route ol li div p { margin-bottom: 2px; font-size: 12px; color: #555; }
                .timeline-route ol li div p i { width: 16px; color: #333; }
                .timeline-route ol li:nth-child(odd) div { top: -26px; transform: translateY(-100%); }
                .timeline-route ol li:nth-child(odd) div::before { content: ""; position: absolute; top: 100%; left: 0; width: 0; height: 0; border-style: solid; border-width: 12px 12px 0 0; border-color: #f9f3ec transparent transparent transparent; }
                .timeline-route ol li:nth-child(odd) div.active::before { border-color: #b0dd38 transparent transparent transparent; }
                .timeline-route ol li:nth-child(even) div { top: calc(100% + 24px); }
                .timeline-route ol li:nth-child(even) div::before { content: ""; position: absolute; top: -10px; left: 0; width: 0; height: 0; border-style: solid; border-width: 12px 0 0 12px; border-color: transparent transparent transparent #f9f3ec; }
                .timeline-route ol li:nth-child(even) div.active::before { border-color: transparent transparent transparent #b0dd38; }
                            .route-wrap .arrows { display: flex; justify-content: center; position: absolute; top: 15px; right: 0px; z-index: 20; gap: 3px; }
                .route-wrap .arrows button { background: #424242; border: 0; font-size: 1.5rem; color: #fff; border-radius: 3px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; transition: all 0.5s ease; cursor: pointer; }
                .route-wrap .arrows button:hover:not(:disabled) { background: #000; }
                .route-wrap .arrows button:disabled { opacity: 0.5; cursor: not-allowed; }
                
                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .route-bus-icon { width: 120px; }
                    .hide-mobile { display: none !important; }
                }
                @media screen and (max-width: 500px) {
                    .timeline-route ol { width: auto; padding: 0; flex-direction: column; align-items: flex-start; transform: none !important; }
                    .timeline-route ol li { display: block; height: auto; background: transparent; width: 100%; margin-bottom: 20px; }
                    .timeline-route ol li div { position: static; width: 100%; transform: none !important; margin-bottom: 15px; }
                    .timeline-route ol li:not(:first-child) { margin-left: 0; }
                    .timeline-route ol li::after, .timeline-route .arrows { display: none; }
                }
            `}</style>



            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/route"
            />

            <div className="content-wrapper" style={{ minHeight: "500px" }}>
                <section className="content" style={{ padding: '13px' }}>
                    {/* TopSidebar for Session Year */}
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary" style={{ background: '#fff', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                                <div className="box-header ptbnull" style={{ padding: '10px 15px', borderBottom: '1px solid #f4f4f4' }}>
                                    <h3 className="box-title titlefix">Transport Routes</h3>
                                </div>
                                <div className="box-body" style={{ padding: '15px' }}>
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="row">
                                                <div className="col-lg-2 col-md-2 col-sm-3">
                                                    {listroute.vehicle_photo ? (
                                                        <img className="route-bus-icon" src={`/uploads/vehicle_photo/${listroute.vehicle_photo}`} alt="Vehicle" />
                                                    ) : (
                                                        <div className="route-bus-icon"><i className="fa fa-bus"></i></div>
                                                    )}
                                                </div>

                                                <div className="col-lg-10 col-md-10 col-sm-9">
                                                    <h4 style={{ marginTop: 0 }}><b>Route Title: {listroute.route_title}</b></h4>
                                                    <div className="row">
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="route-text"><b>Vehicle Number: </b><span>{listroute.vehicle_no}</span></div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="route-text"><b>Vehicle Model: </b><span>{listroute.vehicle_model}</span></div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="route-text"><b>Made: </b><span>{listroute.manufacture_year}</span></div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="route-text"><b>Driver Name: </b><span>{listroute.driver_name}</span></div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="route-text"><b>Driver License: </b><span>{listroute.driver_licence}</span></div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                                            <div className="route-text"><b>Driver Contact: </b><span>{listroute.driver_contact}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-12">
                                            <div className="route-wrap">
                                                <h4 className="title-route-h4"><b>Pickup Point List</b></h4>
                                                <div className="arrows">
                                                    <button
                                                        className={`arrow arrow__prev ${isPrevDisabled ? 'disabled' : ''}`}
                                                        onClick={() => scrollTimeline('prev')}
                                                        disabled={isPrevDisabled}
                                                    >
                                                        <i className="fa fa-angle-left"></i>
                                                    </button>
                                                    <button
                                                        className={`arrow arrow__next ${isNextDisabled ? 'disabled' : ''}`}
                                                        onClick={() => scrollTimeline('next')}
                                                        disabled={isNextDisabled}
                                                    >
                                                        <i className="fa fa-angle-right"></i>
                                                    </button>
                                                </div>

                                                <section className="timeline-route">
                                                    <ol ref={timelineRef} style={{ transform: 'translateX(0px)', visibility: listroute.pickup_point.length > 0 ? 'visible' : 'hidden' }}>
                                                        {listroute.pickup_point.map((point, index) => {
                                                            const isActive = listroute.pickup_point_name === point.pickup_point;
                                                            return (
                                                                <li key={index} className={isActive ? 'active' : ''}>
                                                                    <div className={isActive ? 'active' : ''}>
                                                                        <h4 className="timeline-title">{point.pickup_point}</h4>
                                                                        <p><i className="fa fa-tachometer timeline-icon-width"></i> Distance (km): {point.destination_distance}</p>
                                                                        <p><i className="fa fa-clock-o timeline-icon-width"></i> Pickup Time: {point.pickup_time}</p>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                        <li></li>
                                                    </ol>
                                                </section>
                                            </div>
                                        </div>
                                    </div>
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

export default TransportRoute;
