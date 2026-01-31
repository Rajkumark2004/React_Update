import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const TransportFeesMaster = () => {
    const navigate = useNavigate();

    // Months from April to March (typical school session)
    const [months, setMonths] = useState([
        { id: 4, name: 'April', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 5, name: 'May', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 6, name: 'June', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 7, name: 'July', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 8, name: 'August', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 9, name: 'September', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 10, name: 'October', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 11, name: 'November', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 12, name: 'December', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 1, name: 'January', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 2, name: 'February', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
        { id: 3, name: 'March', due_date: '', fine_type: '', percentage: '', fine_amount: '' },
    ]);

    const [isCopyChecked, setIsCopyChecked] = useState(false);

    // Initial mock data load (simulating existing records)
    useEffect(() => {
        // In a real app, you'd fetch this from an API
        // For demonstration, let's keep it empty or pre-filled
    }, []);

    const handleFieldChange = (index, field, value) => {
        const updatedMonths = [...months];
        updatedMonths[index][field] = value;

        // If fine type changes, reset related fields
        if (field === 'fine_type') {
            if (value === '') {
                updatedMonths[index].percentage = '';
                updatedMonths[index].fine_amount = '';
            } else if (value === 'percentage') {
                updatedMonths[index].fine_amount = '';
            } else if (value === 'fix') {
                updatedMonths[index].percentage = '';
            }
        }

        setMonths(updatedMonths);

        // If copy checkbox is checked, we don't automatically update others on every keypress
        // unless it's explicitly handled. The PHP script seems to apply copy only when checkbox is toggled or saved?
        // Actually, the PHP script copies when the checkbox is *changed*.
    };

    const handleCopyToggle = (e) => {
        const checked = e.target.checked;
        setIsCopyChecked(checked);

        if (checked) {
            const firstMonth = months[0];
            const updatedMonths = months.map((month, index) => {
                if (index === 0) return month;

                // Logic for incrementing date months if date is set
                let newDueDate = firstMonth.due_date;
                if (firstMonth.due_date) {
                    const date = new Date(firstMonth.due_date);
                    date.setMonth(date.getMonth() + index);
                    // Format back to YYYY-MM-DD
                    newDueDate = date.toISOString().split('T')[0];
                }

                return {
                    ...month,
                    due_date: newDueDate,
                    fine_type: firstMonth.fine_type,
                    percentage: firstMonth.percentage,
                    fine_amount: firstMonth.fine_amount
                };
            });
            setMonths(updatedMonths);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Validation logic
        for (let i = 0; i < months.length; i++) {
            if (!months[i].due_date) {
                alert(`Please enter Due Date for ${months[i].name}`);
                return;
            }
            if (months[i].fine_type === 'percentage' && !months[i].percentage) {
                alert(`Please enter Percentage for ${months[i].name}`);
                return;
            }
            if (months[i].fine_type === 'fix' && !months[i].fine_amount) {
                alert(`Please enter Fix Amount for ${months[i].name}`);
                return;
            }
        }

        alert('Record Saved Successfully');
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '17px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-bus"></i> Transport
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Transport Fees Master</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="box-body transport-fee-master">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="checkbox mb10 mt10">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={isCopyChecked}
                                                            onChange={handleCopyToggle}
                                                        /> Copy first fees detail for all months
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {months.map((month, index) => (
                                            <div key={month.id} className="row block_row">
                                                <hr className="hrexam" />
                                                <div className="col-sm-2 col-lg-2 col-md-2">
                                                    <h4 className="transport_fee_line">{month.name}</h4>
                                                </div>
                                                <div className="col-sm-10 col-lg-10 col-md-10">
                                                    <div className="form-group row">
                                                        <div className="col-sm-12 col-lg-2 col-md-2">
                                                            <div className="form-group">
                                                                <label>Due Date</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    value={month.due_date}
                                                                    onChange={(e) => handleFieldChange(index, 'due_date', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-12 col-lg-9 col-md-10 col-lg-offset-1">
                                                            <div className="row">
                                                                <div className="col-sm-12 col-lg-12 col-md-12">
                                                                    <label>Fine Type</label>
                                                                </div>
                                                                <div id="input-type">
                                                                    <div className="col-sm-2 col-lg-2 col-md-2">
                                                                        <div className="form-group">
                                                                            <label className="radio-inline">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`fine_type_${month.id}`}
                                                                                    value=""
                                                                                    checked={month.fine_type === ''}
                                                                                    onChange={(e) => handleFieldChange(index, 'fine_type', e.target.value)}
                                                                                /> None
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-sm-12 col-lg-5 col-md-5">
                                                                        <div className="row">
                                                                            <div className="col-sm-4 col-lg-6 col-md-6 col-xs-5 text-end">
                                                                                <div className="form-group">
                                                                                    <label className="radio-inline pt4">
                                                                                        <input
                                                                                            type="radio"
                                                                                            name={`fine_type_${month.id}`}
                                                                                            value="percentage"
                                                                                            checked={month.fine_type === 'percentage'}
                                                                                            onChange={(e) => handleFieldChange(index, 'fine_type', e.target.value)}
                                                                                        /> Percentage (%)
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-sm-8 col-lg-6 col-md-6 col-xs-7">
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control percentage"
                                                                                    value={month.percentage}
                                                                                    readOnly={month.fine_type !== 'percentage'}
                                                                                    onChange={(e) => handleFieldChange(index, 'percentage', e.target.value)}
                                                                                    autoComplete="off"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-sm-12 col-lg-5 col-md-5">
                                                                        <div className="row">
                                                                            <div className="col-sm-4 col-lg-6 col-md-6 col-xs-5 text-end">
                                                                                <div className="form-group">
                                                                                    <label className="radio-inline pt4">
                                                                                        <input
                                                                                            type="radio"
                                                                                            name={`fine_type_${month.id}`}
                                                                                            value="fix"
                                                                                            checked={month.fine_type === 'fix'}
                                                                                            onChange={(e) => handleFieldChange(index, 'fine_type', e.target.value)}
                                                                                        /> Fix Amount ($)
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-sm-8 col-lg-6 col-md-6 col-xs-7">
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control fine_amount"
                                                                                    value={month.fine_amount}
                                                                                    readOnly={month.fine_type !== 'fix'}
                                                                                    onChange={(e) => handleFieldChange(index, 'fine_amount', e.target.value)}
                                                                                    autoComplete="off"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default TransportFeesMaster;
