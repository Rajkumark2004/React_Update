import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../utils/include_files';

const CCAvenueCheckout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Mock data to simulate PHP variables
    const [paymentData] = useState({
        amount: 2000,
        total: 2000,
        currency_symbol: "₹",
        action_url: "/onlineadmission/ccavenue/pay" // In a real app, this would be an API endpoint
    });

    const handleBack = () => {
        navigate(-1);
    };

    const handlePayment = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate form submission
        setTimeout(() => {
            alert("Redirecting to CCAvenue Payment Gateway...");
            setLoading(false);
            // In a real scenario, you would post to your backend to get encrypted data
            // api.post('/onlineadmission/ccavenue/pay', { amount: paymentData.amount })
        }, 1000);
    };

    return (
        <div style={{ background: '#ededed', minHeight: '100vh', padding: '20px' }}>
            <div className="container">
                <div className="row">
                    <div className="paddtop20" style={{ paddingTop: '20px' }}>
                        <div className="col-md-8 offset-md-2 text-center">
                            <img src="/uploads/school_content/logo/app_logo.png" alt="School Logo" style={{ maxHeight: '50px' }} /> {/* Mock Logo */}
                        </div>
                        <div className="col-md-6 offset-md-3 mt-4" style={{ marginTop: '20px' }}>
                            <div className="paymentbg" style={{ background: '#fff', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <div className="invtext" style={{ padding: '15px', borderBottom: '1px solid #eee', fontSize: '16px', fontWeight: 'bold' }}>
                                    Payment Details
                                </div>
                                <div className="padd2 paddtzero" style={{ padding: '20px' }}>
                                    <form onSubmit={handlePayment} action={paymentData.action_url} method="post">
                                        <table className="table2" width="100%" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Description</th>
                                                    <th className="text-right" style={{ textAlign: 'right', paddingBottom: '10px' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border_bottom" style={{ borderBottom: '1px solid #e6e6e6' }}>
                                                    <td style={{ padding: '10px 0' }}>
                                                        <span className="title" style={{ color: '#0084B4', fontWeight: '600', fontSize: '15px' }}>
                                                            Online Admission Form Fees
                                                        </span>
                                                    </td>
                                                    <td className="text-right" style={{ textAlign: 'right', padding: '10px 0' }}>
                                                        {paymentData.currency_symbol} {paymentData.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr className="bordertoplightgray" style={{ borderTop: '1px solid #eee' }}>
                                                    <td colSpan="2" className="text-right" style={{ textAlign: 'right', paddingTop: '10px', fontWeight: 'bold' }}>
                                                        Total: {paymentData.currency_symbol} {paymentData.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr className="bordertoplightgray">
                                                    <td style={{ paddingTop: '20px' }}>
                                                        <button type="button" onClick={handleBack} className="btn btn-info" style={{ background: '#5bc0de', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                                                            <i className="fa fa-chevron-left"></i> Back
                                                        </button>
                                                    </td>
                                                    <td className="text-right" style={{ textAlign: 'right', paddingTop: '20px' }}>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-success"
                                                            disabled={loading}
                                                            style={{ background: '#5cb85c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            Pay with CCAvenue <i className="fa fa-chevron-right"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CCAvenueCheckout;
