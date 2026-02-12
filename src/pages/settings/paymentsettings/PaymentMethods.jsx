import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SettingsMenu from '../../../components/SettingsMenu';
import api from '../../../services/api';
import '../../../utils/include_files';

const PaymentMethods = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('ccavenue');
    const [selectedGateway, setSelectedGateway] = useState('ccavenue');

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const response = await api.getPaymentSettings();
                if (response && response.paymentlist) {
                    setFormState(prevState => {
                        const newFormState = { ...prevState };
                        let activeGateway = 'none';

                        response.paymentlist.forEach(payment => {
                            const gatewayId = payment.payment_type;
                            if (newFormState[gatewayId]) {
                                newFormState[gatewayId] = {
                                    ...newFormState[gatewayId],
                                    ...payment, // Spread all API fields
                                    // Map specific fields
                                    username: payment.api_username || newFormState[gatewayId].username,
                                    password: payment.api_password || newFormState[gatewayId].password,
                                    signature: payment.api_signature || newFormState[gatewayId].signature,
                                    merchant_id: payment.api_publishable_key || newFormState[gatewayId].merchant_id, // Assuming publishable key holds merchant id for some
                                    key: payment.api_publishable_key || newFormState[gatewayId].key,
                                    website: payment.paytm_website || newFormState[gatewayId].website,
                                    industry_type: payment.paytm_industrytype || newFormState[gatewayId].industry_type,
                                    api_email: payment.api_email || newFormState[gatewayId].api_email,
                                };
                            }
                            if (payment.is_active === 'yes') {
                                activeGateway = gatewayId;
                            }
                        });

                        // We also need to update selectedGateway outside of this state update, 
                        // but we can't do it inside the setter easily without another effect or just setting it here.
                        setSelectedGateway(activeGateway);
                        return newFormState;
                    });
                }
            } catch (error) {
                console.error('Failed to fetch payment settings:', error);
            }
        };

        fetchPaymentSettings();
    }, []);



    const gateways = [
        { id: 'ccavenue', name: 'CCAvenue', image: 'https://newlayout.wisibles.com/backend/images/ccavenue.png?1770874763', desc: 'Payment Gateway for India', url: 'https://www.ccavenue.com' },
        { id: 'razorpay', name: 'Razorpay', image: 'https://newlayout.wisibles.com//backend/images/razorpay.jpg?1770874763', desc: 'Payment Gateway for India', url: 'https://www.razorpay.com' },
    ]

    const [formState, setFormState] = useState({
        paypal: { username: 'mahesh.sandblaze@gmail.com', password: 'password123', signature: '' },
        stripe: { api_publishable_key: '', api_secret_key: '' },
        payu: { salt: '', key: '' },
        ccavenue: { merchant_id: '', salt: '', api_publishable_key: '' },
        instamojo: { api_publishable_key: '', api_secret_key: '' },
        paystack: { api_publishable_key: '', api_secret_key: '' },
        razorpay: { api_publishable_key: '', api_secret_key: '' },
        paytm: { merchant_id: '', api_secret_key: '', website: '', industry_type: '' },
        midtrans: { api_publishable_key: '' },
        pesapal: { api_publishable_key: '', api_secret_key: '' },
        flutterwave: { api_publishable_key: '', api_secret_key: '' },
        ipayafrica: { api_publishable_key: '', api_secret_key: '' },
        jazzcash: { api_publishable_key: '', api_secret_key: '', salt: '' },
        billplz: { api_publishable_key: '' },
        sslcommerz: { api_publishable_key: '', api_secret_key: '' },
        walkingm: { api_publishable_key: '', api_secret_key: '' },
        mollie: { api_publishable_key: '' },
        cashfree: { api_publishable_key: '', api_secret_key: '' },
        payfast: { api_publishable_key: '', api_secret_key: '', salt: '' },
        toyyibpay: { api_secret_key: '', api_signature: '' },
        twocheckout: { api_publishable_key: '', api_secret_key: '' },
        skrill: { api_email: '', salt: '' },
        payhere: { api_publishable_key: '', api_secret_key: '' },
        onepay: { merchant_id: '', salt: '', api_signature: '' }
    });

    const handleInputChange = (gateway, field, value) => {
        setFormState(prev => ({
            ...prev,
            [gateway]: { ...prev[gateway], [field]: value }
        }));
    };

    const handleSave = async (gateway) => {
        console.log(`Saving ${gateway} settings:`, formState[gateway]);

        try {
            if (gateway === 'ccavenue') {
                const payload = {
                    ccavenue_secret: formState.ccavenue.merchant_id,
                    ccavenue_salt: formState.ccavenue.salt,
                    ccavenue_api_publishable_key: formState.ccavenue.api_publishable_key
                };
                await api.saveCCAvenueSettings(payload);
                alert('CCAvenue settings saved successfully');
            } else if (gateway === 'razorpay') {
                const payload = {
                    razorpay_keyid: formState.razorpay.api_publishable_key,
                    razorpay_secretkey: formState.razorpay.api_secret_key
                };
                await api.saveRazorpaySettings(payload);
                alert('Razorpay settings saved successfully');
            } else {
                alert(`${gateway} settings saved successfully (mocked)`);
            }
        } catch (error) {
            console.error(`Failed to save ${gateway} settings:`, error);
            alert(`Failed to save ${gateway} settings`);
        }
    };

    const handleGatewayActivation = (e) => {
        setSelectedGateway(e.target.value);
    };

    const handleMainSave = async () => {
        console.log('Active gateway set to:', selectedGateway);
        if (selectedGateway === 'none') {
            // Handle "None" case if needed, possibly by sending empty string or specific value to API
            // For now assuming 'none' is just a local state if not supported by API
            alert('Please select a payment gateway to activate.');
            return;
        }

        try {
            await api.activatePaymentGateway(selectedGateway);
            alert(`Payment gateway ${selectedGateway} activated successfully`);
        } catch (error) {
            console.error('Failed to activate payment gateway:', error);
            alert('Failed to activate payment gateway');
        }
    };

    const renderFormFields = (gatewayId) => {
        const fields = {
            paypal: [{ label: 'Paypal Username', key: 'username', type: 'text' }, { label: 'Paypal Password', key: 'password', type: 'password' }, { label: 'Paypal Signature', key: 'signature', type: 'text' }],
            stripe: [{ label: 'Stripe Publishable Key', key: 'api_publishable_key', type: 'text' }, { label: 'Stripe Secret Key', key: 'api_secret_key', type: 'text' }],
            payu: [{ label: 'PayU Money Key', key: 'key', type: 'text' }, { label: 'PayU Money Salt', key: 'salt', type: 'text' }],
            ccavenue: [{ label: 'Merchant Id', key: 'merchant_id', type: 'text' }, { label: 'Working Key', key: 'salt', type: 'text' }, { label: 'Access Code', key: 'api_publishable_key', type: 'text' }],
            instamojo: [{ label: 'Instamojo API Key', key: 'api_publishable_key', type: 'text' }, { label: 'Instamojo Auth Token', key: 'api_secret_key', type: 'text' }],
            paystack: [{ label: 'Paystack Secret Key', key: 'api_secret_key', type: 'text' }],
            razorpay: [{ label: 'Razorpay Key Id', key: 'api_publishable_key', type: 'text' }, { label: 'Razorpay Key Secret', key: 'api_secret_key', type: 'text' }],
            paytm: [{ label: 'Merchant Id', key: 'merchant_id', type: 'text' }, { label: 'Merchant Key', key: 'api_secret_key', type: 'text' }, { label: 'Website', key: 'website', type: 'text' }, { label: 'Industry Type', key: 'industry_type', type: 'text' }],
            midtrans: [{ label: 'Server Key', key: 'api_publishable_key', type: 'text' }],
            pesapal: [{ label: 'Consumer Key', key: 'api_publishable_key', type: 'text' }, { label: 'Consumer Secret', key: 'api_secret_key', type: 'text' }],
            flutterwave: [{ label: 'Public Key', key: 'api_publishable_key', type: 'text' }, { label: 'Secret Key', key: 'api_secret_key', type: 'text' }],
            ipayafrica: [{ label: 'Vendor Id', key: 'api_publishable_key', type: 'text' }, { label: 'Hash Key', key: 'api_secret_key', type: 'text' }],
            jazzcash: [{ label: 'Merchant Id', key: 'api_publishable_key', type: 'text' }, { label: 'Password', key: 'api_secret_key', type: 'text' }, { label: 'Salt', key: 'salt', type: 'text' }],
            billplz: [{ label: 'API Key', key: 'api_publishable_key', type: 'text' }],
            sslcommerz: [{ label: 'Store Id', key: 'api_publishable_key', type: 'text' }, { label: 'Store Password', key: 'api_secret_key', type: 'text' }],
            walkingm: [{ label: 'Public Key', key: 'api_publishable_key', type: 'text' }, { label: 'Secret Key', key: 'api_secret_key', type: 'text' }],
            mollie: [{ label: 'API Key', key: 'api_publishable_key', type: 'text' }],
            cashfree: [{ label: 'App Id', key: 'api_publishable_key', type: 'text' }, { label: 'Secret Key', key: 'api_secret_key', type: 'text' }],
            payfast: [{ label: 'Merchant Id', key: 'api_publishable_key', type: 'text' }, { label: 'Merchant Key', key: 'api_secret_key', type: 'text' }, { label: 'Security Passphrase', key: 'salt', type: 'text' }],
            toyyibpay: [{ label: 'Secret Key', key: 'api_secret_key', type: 'text' }, { label: 'Category Code', key: 'api_signature', type: 'text' }],
            twocheckout: [{ label: 'Merchant Code', key: 'api_publishable_key', type: 'text' }, { label: 'Secret Key', key: 'api_secret_key', type: 'text' }],
            skrill: [{ label: 'Merchant Account Email', key: 'api_email', type: 'text' }, { label: 'Merchant Secret Salt', key: 'salt', type: 'text' }],
            payhere: [{ label: 'Merchant Id', key: 'api_publishable_key', type: 'text' }, { label: 'Merchant Secret', key: 'api_secret_key', type: 'text' }],
            onepay: [{ label: 'Onepay Merchant Id', key: 'merchant_id', type: 'text' }, { label: 'Access Code', key: 'salt', type: 'text' }, { label: 'Hash Key', key: 'api_signature', type: 'text' }]
        };

        const currentFields = fields[gatewayId] || [];
        return currentFields.map((f, index) => (
            <div key={index} className="form-group row mb-4" style={{ alignItems: 'center' }}>
                <label className="col-md-5 text-end" style={{ fontSize: '14px', color: '#333' }}>
                    {f.label} <span className="text-danger">*</span>
                </label>
                <div className="col-md-7">
                    <input
                        type={f.type === 'password' ? 'password' : 'text'}
                        className="form-control"
                        style={{ backgroundColor: '#e8f0fe', border: '1px solid #ddd', borderRadius: '2px', padding: '6px 12px', fontSize: '14px' }}
                        value={formState[gatewayId][f.key]}
                        onChange={(e) => handleInputChange(gatewayId, f.key, e.target.value)}
                    />
                </div>
            </div>
        ));
    };

    const firstRowGateways = gateways.slice(0, 15);
    const secondRowGateways = gateways.slice(15);

    return (
        <SettingsMenu hideSidebars={true}>
            <div className="row">
                <div className="col-md-12">
                    <div className="box box-primary" style={{ border: 'none', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', background: '#fff' }}>
                        <div className="box-header with-border" style={{ borderBottom: '1px solid #f4f4f4', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="box-title" style={{ fontSize: '18px', color: '#333', margin: '0' }}>Payment Methods</h3>
                            <button
                                onClick={() => navigate('/settings')}
                                className="btn btn-primary btn-sm"
                                style={{ background: '#9153c3', borderColor: '#9153c3', borderRadius: '20px', fontSize: '12px' }}
                            >
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                        <div className="box-body" style={{ padding: '20px' }}>
                            {/* Combined Tabs row - scrollable if many */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #ddd', paddingBottom: '0px' }}>
                                {gateways.map(gw => (
                                    <div
                                        key={gw.id}
                                        onClick={() => setActiveTab(gw.id)}
                                        style={{
                                            padding: '10px 15px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            color: activeTab === gw.id ? '#3c8dbc' : '#000',
                                            fontWeight: activeTab === gw.id ? '500' : '400',
                                            borderBottom: activeTab === gw.id ? '2px solid #3c8dbc' : 'none',
                                            marginBottom: '-1px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {gw.name}
                                    </div>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="row" style={{ marginTop: '30px' }}>
                                <div className="col-md-7">
                                    <div style={{ maxWidth: '100%' }}>
                                        {renderFormFields(activeTab)}
                                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                            <button onClick={() => handleSave(activeTab)} style={{ background: '#9153c3', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 30px', fontSize: '14px', cursor: 'pointer' }}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5 text-center">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <h5 style={{ color: '#0084B4', fontWeight: 'bold', fontSize: '15px', margin: '0 0 15px 0' }}>
                                            {gateways.find(g => g.id === activeTab)?.desc}
                                        </h5>
                                        <div style={{ marginBottom: '15px' }}>
                                            <img src={gateways.find(g => g.id === activeTab)?.image} alt={activeTab} style={{ maxWidth: '180px' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/180x60?text=' + activeTab }} />
                                        </div>
                                        <a href={gateways.find(g => g.id === activeTab)?.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0084B4', fontSize: '13px', textDecoration: 'none' }}>
                                            {gateways.find(g => g.id === activeTab)?.url}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selection Box now below or could be repositioned as desired */}
                <div className="col-md-12" style={{ marginTop: '20px' }}>
                    <div className="box box-primary" style={{ border: 'none', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', background: '#fff' }}>
                        <div className="box-header with-border" style={{ borderBottom: '1px solid #f4f4f4', padding: '15px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Select Payment Gateway</h4>
                        </div>
                        <div className="box-body" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
                                {gateways.map(gw => (
                                    <div key={gw.id} style={{ display: 'flex', alignItems: 'center' }}>
                                        <input type="radio" id={`radio-${gw.id}`} name="payment_setting" value={gw.id} checked={selectedGateway === gw.id} onChange={handleGatewayActivation} style={{ marginRight: '10px', cursor: 'pointer' }} />
                                        <label htmlFor={`radio-${gw.id}`} style={{ fontSize: '13px', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                                            {gw.name}
                                        </label>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="radio" id="radio-none" name="payment_setting" value="none" checked={selectedGateway === 'none'} onChange={handleGatewayActivation} style={{ marginRight: '10px', cursor: 'pointer' }} />
                                    <label htmlFor="radio-none" style={{ fontSize: '13px', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                                        None
                                    </label>
                                </div>
                            </div>
                            <hr style={{ margin: '15px 0' }} />
                            <div style={{ textAlign: 'left' }}>
                                <button onClick={handleMainSave} style={{ background: '#9854cb', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 15px', fontSize: '12px', cursor: 'pointer' }}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsMenu>
    );
};

export default PaymentMethods;
