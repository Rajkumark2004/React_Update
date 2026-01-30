import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';
import { useSession } from '../../../context/SessionContext';

const SearchPayment = () => {
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const currencySymbol = '₹'; // Can be fetched from settings

    // Form State
    const [paymentId, setPaymentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [feeData, setFeeData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');

        if (!paymentId.trim()) {
            setError('Payment ID is required');
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await api.searchPayment({ paymentid: paymentId });
            console.log('Search Payment Response:', response);

            if (response.status === true || response.status === 'success') {
                setFeeData(response.data || response.feeList || response);
            } else {
                setFeeData(null);
                toast.error(response.message || 'Payment not found');
            }
        } catch (err) {
            console.error('Error searching payment:', err);
            setFeeData(null);
            toast.error('Error searching payment');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        const num = parseFloat(amount) || 0;
        return num.toFixed(2);
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> Fees Collection</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">
                                        <i className="fa fa-search"></i> Search Fees Payment
                                    </h3>
                                    <div className="btn-group pull-right">
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="btn btn-primary btn-xs"
                                        >
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <form onSubmit={handleSearch} className="form-inline">
                                                <div className="form-group">
                                                    <div className="col-sm-12">
                                                        <label>Payment ID</label>
                                                        <small className="req"> *</small>
                                                        <input
                                                            autoFocus
                                                            id="paymentid"
                                                            name="paymentid"
                                                            placeholder="Enter Payment ID"
                                                            type="text"
                                                            className="form-control"
                                                            value={paymentId}
                                                            onChange={(e) => setPaymentId(e.target.value)}
                                                            style={{ marginLeft: '10px', marginRight: '10px' }}
                                                        />
                                                        {error && (
                                                            <span className="text-danger">{error}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="form-group align-text-top">
                                                    <div className="col-sm-12">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary btn-sm checkbox-toggle"
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                            ) : (
                                                                <><i className="fa fa-search"></i> Search</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Section */}
                                {searched && (
                                    <div className="ptt10">
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix">
                                                <i className="fa fa-money"></i> Payment ID Detail
                                            </h3>
                                            <div className="box-tools pull-right"></div>
                                        </div>
                                        <div className="box-body table-responsive">
                                            <div className="download_label">Payment ID Detail</div>
                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Payment ID</th>
                                                        <th>Date</th>
                                                        <th>Name</th>
                                                        <th>Class</th>
                                                        <th>Fees Group</th>
                                                        <th>Fee Type</th>
                                                        <th>Mode</th>
                                                        <th className="text text-right">Amount</th>
                                                        <th className="text text-right">Discount</th>
                                                        <th className="text text-right">Fine</th>
                                                        <th className="text text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="11" className="text-center">
                                                                <i className="fa fa-spinner fa-spin"></i> Loading...
                                                            </td>
                                                        </tr>
                                                    ) : feeData ? (
                                                        <tr>
                                                            <td>{feeData.payment_id || `${feeData.id}/${feeData.sub_invoice_id || ''}`}</td>
                                                            <td>{formatDate(feeData.date)}</td>
                                                            <td>
                                                                {feeData.firstname} {feeData.middlename || ''} {feeData.lastname || ''}
                                                                {feeData.admission_no && ` (${feeData.admission_no})`}
                                                            </td>
                                                            <td>
                                                                {feeData.class} {feeData.section && `(${feeData.section})`}
                                                            </td>
                                                            <td>{feeData.fee_group_name || feeData.name || '-'}</td>
                                                            <td>
                                                                {feeData.fee_type || feeData.type || '-'}
                                                                {feeData.code && ` (${feeData.code})`}
                                                            </td>
                                                            <td>{feeData.payment_mode || '-'}</td>
                                                            <td className="text text-right">
                                                                {currencySymbol}{formatAmount(feeData.amount)}
                                                            </td>
                                                            <td className="text text-right">
                                                                {currencySymbol}{formatAmount(feeData.amount_discount || feeData.discount)}
                                                            </td>
                                                            <td className="text text-right">
                                                                {currencySymbol}{formatAmount(feeData.amount_fine || feeData.fine)}
                                                            </td>
                                                            <td className="text text-right">
                                                                <Link
                                                                    to={`/studentfee/addfee/${feeData.student_session_id}`}
                                                                    className="btn btn-primary btn-xs"
                                                                    title="View"
                                                                >
                                                                    <i className="fa fa-list-alt"></i> View
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="11" className="text-center">
                                                                No record found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default SearchPayment;
