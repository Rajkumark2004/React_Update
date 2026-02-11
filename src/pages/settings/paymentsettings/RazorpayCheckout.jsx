import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import '../../../utils/include_files';

const RazorpayCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // Mock data to simulate PHP variables
    const [paymentData, setPaymentData] = useState({
        amount: 2000, // Example amount
        total: 200000, // Amount in paise
        merchant_order_id: "ORDER123",
        key_id: "rzp_test_1234567890", // Replace with real key or fetch from API
        name: "School Name",
        title: "Online Admission Fees",
        currency_code: "INR",
        order_id: "order_G345345345",
        return_url: "/onlineadmission/checkout/successinvoice/",
        school_logo: "/uploads/school_content/logo/logo.png", // Mock path
        currency_symbol: "₹"
    });

    // Load Razorpay Script dynamically
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleBack = () => {
        navigate(-1);
    };

    const handlePayment = () => {
        setLoading(true);
        const options = {
            "key": paymentData.key_id,
            "amount": paymentData.total,
            "currency": paymentData.currency_code,
            "name": paymentData.name,
            "description": paymentData.title,
            "image": paymentData.school_logo,
            "order_id": paymentData.order_id,
            "handler": function (response) {
                // Simulate backend verification and success redirect
                console.log("Payment Success:", response);

                // In a real app, verify signature here with backend API call
                // api.post(paymentData.return_url, { 
                //    razorpay_payment_id: response.razorpay_payment_id,
                //    ...
                // }).then(...)

                alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
                navigate('/onlineadmission/checkout/successinvoice/' + response.razorpay_payment_id);
            },
            "theme": {
                "color": "#528FF0"
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            alert("Payment Failed: " + response.error.description);
            setLoading(false);
        });
        rzp1.open();
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
                                                    <button onClick={handleBack} className="btn btn-info" style={{ background: '#5bc0de', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        <i className="fa fa-chevron-left"></i> Back
                                                    </button>
                                                </td>
                                                <td className="text-right" style={{ textAlign: 'right', paddingTop: '20px' }}>
                                                    <button
                                                        type="button"
                                                        id="pay_btn"
                                                        onClick={handlePayment}
                                                        disabled={loading}
                                                        className="btn btn-success"
                                                        style={{ background: '#5cb85c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Pay with Razorpay <i className="fa fa-chevron-right"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RazorpayCheckout;
