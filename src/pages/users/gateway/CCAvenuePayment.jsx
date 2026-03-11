import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../user_components/Header_user';
import Sidebar from '../user_components/Sidebar_user';
import Footer from '../../../components/Footer';
import { api_users } from '../../../services/api_users';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';

const CCAvenuePayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentSession, clearSession } = useSession();
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const {
        student_id,
        selectedFees = [],
        student = {},
        currencySymbol = '\u20B9',
        userData = {}
    } = location.state || {};

    const sessionYear = currentSession?.session || '2024-25';

    const amountFormat = (amount) => {
        if (amount === null || amount === undefined) return "0.00";
        return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // Call API on mount to get payment details from server
    useEffect(() => {
        if (selectedFees.length > 0 && student_id) {
            initiatePayment();
        } else {
            setLoading(false);
        }
    }, []);

    const initiatePayment = async () => {
        try {
            setLoading(true);
            const isSingle = selectedFees.length === 1;

            let payload;
            if (isSingle) {
                const fee = selectedFees[0];
                payload = {
                    fee_category: fee.fee_category || 'fees',
                    student_transport_fee_id: fee.fee_category === 'transport' ? (fee.trans_fee_id || null) : null,
                    student_fees_master_id: fee.student_fees_master_id || 0,
                    fee_groups_feetype_id: fee.fee_groups_feetype_id || 0,
                    student_id: student_id,
                    submit_mode: "online_payment"
                };
            } else {
                payload = {
                    student_id: student_id,
                    fees: selectedFees.map(fee => ({
                        fee_category: fee.fee_category || 'fees',
                        student_fees_master_id: fee.student_fees_master_id || 0,
                        fee_groups_feetype_id: fee.fee_groups_feetype_id || 0,
                        pay_amount: parseFloat(fee.balance || 0)
                    }))
                };
            }

            const result = await api_users.initiateCCAvenuePayment(payload, isSingle);

            if (result && result.status) {
                // The pay API returns payment details in `params`, grouppay in `payment_data`
                const data = isSingle ? result.params : result.payment_data;
                if (data) {
                    setPaymentData(data);
                } else {
                    toast.error('Failed to get payment details from response');
                }
            } else {
                toast.error(result?.message || 'Failed to get payment details');
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error(error.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePayWithCCAvenue = async () => {
        if (!paymentData) return;
        // For now, CCAvenue redirect would happen after server processes the pay request
        // The actual CCAvenue form submission requires encrypted data from the server
        toast.success('Redirecting to CCAvenue payment gateway...');
        // TODO: When the server returns encRequest and access_code, auto-submit to CCAvenue
    };

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

    const commonStyles = `
        .sessionul, .search-form2, .search-form { display: none !important; }
        .navbar-custom-menu { overflow: visible !important; }
        .navbar-custom-menu .nav { overflow: visible !important; }
        .navbar-custom-menu .nav > li:not(.user-menu) { display: none !important; }
        .navbar-custom-menu .nav > li.user-menu { display: block !important; overflow: visible !important; }
        .dropdown-user { display: none; z-index: 9999 !important; position: absolute !important; right: 0 !important; top: 100% !important; }
        .user-menu.open .dropdown-user { display: block !important; }
        .content-wrapper, .main-footer { margin-left: 80px !important; }
        .fixedmenu { display: none !important; }
        .paymentbg { background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .invtext { background: #9854cb; color: #fff; padding: 15px 20px; font-size: 16px; font-weight: 600; }
        .table2 tr.border_bottom td { box-shadow: none; border-radius: 0; border-bottom: 1px solid #e6e6e6; }
        .table2 td, .table2 th { padding: 6px 15px 3px 15px; }
        .title { color: #9854cb; font-weight: 600 !important; font-size: 15px !important; display: inline; }
        .product-description { display: block; color: #999; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .text-fine { color: #bf4f4d; }
        .bordertoplightgray td { border-top: 2px solid #ddd !important; font-weight: 700; font-size: 15px; }
        .divider { height: 1px; background: #e6e6e6; margin: 10px 0; }
        .paddtlrb { padding: 15px 20px; }
        @media (max-width: 991px) {
            .main-sidebar { width: 0 !important; }
            .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
        }
    `;

    if (!selectedFees || selectedFees.length === 0) {
        return (
            <div className="wrapper theme-white-skin">
                <style>{commonStyles}</style>
                <Header userData={userData} handleLogout={handleLogout} sessionYear={sessionYear} headerLogoUrl={userData.adminLogoUrl} />
                <Sidebar sessionYear={sessionYear} currentUrl="/user/getfees" />
                <div className="content-wrapper" style={{ minHeight: '850px' }}>
                    <section className="content">
                        <div className="text-center" style={{ padding: '100px' }}>
                            <p>No fees selected for payment.</p>
                            <button className="btn" style={{ backgroundColor: '#9854cb', color: '#fff' }} onClick={handleGoBack}>
                                <i className="fa fa-chevron-left"></i> Go Back
                            </button>
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }

    // Support both single pay (params.amount) and group pay (paymentData.amount_total and paymentData.fees)
    const fees = paymentData?.fees ? paymentData.fees : selectedFees;

    // Total amount without fine
    const amountTotal = paymentData
        ? parseFloat(paymentData.amount_total || paymentData.amount || 0)
        : selectedFees.reduce((s, f) => s + parseFloat(f.balance || 0), 0);

    // Total fine
    const fineTotal = paymentData?.fine_total !== undefined
        ? parseFloat(paymentData.fine_total || 0)
        : selectedFees.reduce((s, f) => s + parseFloat(f.fine_amount || 0), 0);

    const grandTotal = amountTotal + fineTotal;

    return (
        <div className="wrapper theme-white-skin">
            <style>{commonStyles}</style>

            <Header userData={userData} handleLogout={handleLogout} sessionYear={sessionYear} headerLogoUrl={userData.adminLogoUrl} />
            <Sidebar sessionYear={sessionYear} currentUrl="/user/getfees" />

            <div className="content-wrapper" style={{ minHeight: '850px', background: '#ededed' }}>
                <section className="content">
                    {loading ? (
                        <div className="text-center" style={{ padding: '100px' }}>
                            <i className="fa fa-spinner fa-spin fa-3x" style={{ color: '#9854cb' }}></i>
                            <p style={{ marginTop: '15px', color: '#666' }}>Loading payment details...</p>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col-md-8 col-md-offset-2 text-center" style={{ paddingTop: '20px' }}>
                                {userData.adminLogoUrl && (
                                    <img src={userData.adminLogoUrl} alt="School Logo" style={{ maxHeight: '80px' }} />
                                )}
                            </div>
                            <div className="col-md-6 col-md-offset-3" style={{ marginTop: '20px' }}>
                                {paymentData && (
                                    <div style={{ textAlign: 'center', marginBottom: '15px', color: '#555', fontSize: '13px' }}>
                                        <strong>{paymentData.name}</strong> | {paymentData.email} | {paymentData.phone}
                                    </div>
                                )}
                                <div className="paymentbg">
                                    <div className="invtext">
                                        <i className="fa fa-credit-card"></i> Fees Payment Details
                                    </div>
                                    <div style={{ padding: '15px 20px 0' }}>
                                        <table className="table2" width="100%">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th className="text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fees.map((fee, index) => (
                                                    <React.Fragment key={index}>
                                                        <tr>
                                                            <td>
                                                                <span className="title">{fee.fee_group_name || fee.groupName || 'Fee Group'}</span>
                                                                <span className="product-description">{fee.fee_type_code || fee.feeTypeCode || ''}</span>
                                                            </td>
                                                            <td className="text-right">
                                                                {currencySymbol}{amountFormat(fee.amount_balance || fee.balance || 0)}
                                                            </td>
                                                        </tr>
                                                        <tr className="border_bottom">
                                                            <td>
                                                                <span className="text-fine">Fine</span>
                                                            </td>
                                                            <td className="text-right">
                                                                {currencySymbol}{amountFormat(fee.fine_balance || fee.fine_amount || 0)}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}
                                                <tr className="bordertoplightgray">
                                                    <td colSpan="2" className="text-right">
                                                        Total: {currencySymbol}{amountFormat(grandTotal)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="divider"></div>
                                        <div className="paddtlrb" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <button
                                                type="button"
                                                className="btn"
                                                style={{ backgroundColor: '#9854cb', color: '#fff', border: 'none' }}
                                                onClick={handleGoBack}
                                            >
                                                <i className="fa fa-chevron-left"></i> Back
                                            </button>
                                            <button
                                                type="button"
                                                className="btn"
                                                style={{ backgroundColor: '#9854cb', color: '#fff', border: 'none' }}
                                                onClick={handlePayWithCCAvenue}
                                                disabled={paying || !paymentData}
                                            >
                                                {paying ? (
                                                    <><i className="fa fa-spinner fa-spin"></i> Processing...</>
                                                ) : (
                                                    <><i className="fa fa-money"></i> Pay with CCAvenue</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default CCAvenuePayment;
