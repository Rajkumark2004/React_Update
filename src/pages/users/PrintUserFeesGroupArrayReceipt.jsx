import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { convertToWords } from './PrintUserFeeReceipt';

const UserGroupReceiptTemplate = ({ data, copyType }) => {
    // Array response, using the first element for common details (student info, settings)
    const firstFee = data[0] || {};

    // Fallback to basic settings handling if settings array isn't sent in this specific API
    const settings = firstFee.settings && firstFee.settings[0] ? firstFee.settings[0] : {};
    const currencySymbol = settings.currency_symbol || '₹';
    const invoice_id = firstFee.student_fees_deposite_id || '';

    // Format helpers
    const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const receiptNo = `${settings.session ? settings.session.split('-')[0] : ''}/${settings.session ? settings.session.split('-')[1].substring(2) : ''}-${invoice_id}`;
    let paymentDate = firstFee.created_at || '';
    if (paymentDate && paymentDate.includes(' ')) {
        paymentDate = paymentDate.split(' ')[0];
        if (paymentDate.includes('-') && paymentDate.split('-')[0].length === 4) {
            paymentDate = paymentDate.split('-').reverse().join('/');
        }
    }

    const headerUrl = settings.receipt_header_url || (settings.image ? `https://newlayout.wisibles.com/api_admin/uploads/print_headerfooter/student_receipt/${settings.image}` : '');

    // Calculate totals across all selected payments
    let grandTotal = 0;

    // Pre-process all deposits from all fees to list them uniquely
    const allDeposits = [];

    data.forEach((feeItem, index) => {
        let amount_detail = {};
        if (feeItem.amount_detail) {
            try {
                amount_detail = typeof feeItem.amount_detail === 'string' ? JSON.parse(feeItem.amount_detail) : feeItem.amount_detail;
            } catch (e) {
                console.error('Failed to parse amount_detail', e);
            }
        }

        // Convert to array of deposits
        const deposits = Array.isArray(amount_detail) ? amount_detail : Object.values(amount_detail);

        deposits.forEach(dep => {
            const amount = parseFloat(dep.amount || 0);
            grandTotal += amount;

            allDeposits.push({
                feeName: feeItem.name || 'Fee Group',
                feeType: feeItem.type || '',
                feeCategory: feeItem.fee_category || 'fees',
                mode: (dep.payment_mode || '').toUpperCase(),
                amount: amount,
                desc: dep.description || ''
            });
        });
    });

    return (
        <div className="col-sm-6" style={{ width: '50%', float: 'left', padding: '15px' }}>
            {headerUrl && (
                <div className="row header">
                    <div className="col-sm-12">
                        <img
                            src={headerUrl}
                            style={{ height: '100px', width: '100%', objectFit: 'contain' }}
                            alt="Header"
                        />
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col-md-12 text text-center" style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold' }}>{copyType}</div>
            </div>
            <div className="row table table-striped table-bordered" style={{ width: '100%', marginBottom: '10px' }}>
                <div className="col-xs-12 text-left" style={{ padding: '10px', boxSizing: 'border-box' }}>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Receipt No</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>: {receiptNo}</div>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Date</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>: {paymentDate}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Admin No</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>: {firstFee.admission_no || ''}</div>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Roll No.</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>: {firstFee.roll_no || ''}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Student's Name</div>
                        <div className="col-sm-9" style={{ width: '75%' }}>: {`${firstFee.firstname || ''} ${firstFee.middlename || ''} ${firstFee.lastname || ''}`.trim()}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Father's Name</div>
                        <div className="col-sm-9" style={{ width: '75%' }}>: {firstFee.father_name || ''}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Class & Sec</div>
                        <div className="col-sm-9" style={{ width: '75%' }}>: {firstFee.class || ''} {firstFee.section ? `(${firstFee.section})` : ''}</div>
                    </div>
                </div>
            </div>

            <div className="row">
                <table className="table table-striped table-bordered" style={{ fontSize: '9pt', width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '10%', border: '1px solid #ddd', padding: '8px' }}>S.No.</th>
                            <th colSpan="3" style={{ border: '1px solid #ddd', padding: '8px' }}>Particulars</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mode</th>
                            <th className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allDeposits.map((dep, index) => (
                            <tr key={index} className="dark-gray">
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                                <td colSpan="3" style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {dep.feeCategory === 'transport' ? 'Transport Fee' : `Tuition Fee (${dep.feeName} - ${dep.feeType})`}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dep.mode}</td>
                                <td className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{currencySymbol} {formatAmount(dep.amount)}</td>
                            </tr>
                        ))}

                        {allDeposits.length > 0 && (
                            <tr>
                                <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    Remarks: {allDeposits.map(d => d.desc).filter(d => !!d).join(', ') || 'Fee payment'}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px' }}>Received Amount: {currencySymbol} {formatAmount(grandTotal)}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}></td>
                            <td colSpan="3" className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                            <td className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{currencySymbol} {formatAmount(grandTotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="print_footer" style={{ marginTop: '10px', border: '0.5px solid', borderRadius: '8px', padding: '5px 10px', fontSize: '9pt' }}>
                <div className="row header">
                    <div className="col-sm-12">
                        In Words: {convertToWords(grandTotal)}
                    </div>
                </div>
                <div className="row header" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                    <div className="col-sm-8" style={{ width: '60%' }}>
                        {settings.receipt_footer_content ? (
                            <div dangerouslySetInnerHTML={{ __html: settings.receipt_footer_content }} />
                        ) : (
                            "Note: Fee once paid is not refundable"
                        )}
                    </div>
                    <div className="col-sm-4 text-right" style={{ width: '40%', textAlign: 'right' }}>Signature</div>
                </div>
            </div>
        </div>
    );
};

export const printUserFeesGroupArrayReceipt = (dataArray) => {
    try {
        if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
            console.error("Invalid data provided for group receipt");
            return;
        }

        const receiptHtml = renderToStaticMarkup(
            <div style={{ padding: '20px', background: 'white', display: 'flex', width: '100%' }}>
                <UserGroupReceiptTemplate data={dataArray} copyType="Office Copy" />
                <UserGroupReceiptTemplate data={dataArray} copyType="Student Copy" />
            </div>
        );

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const frameDoc = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.document ? iframe.contentDocument.document : iframe.contentDocument;
        frameDoc.document.open();
        frameDoc.document.write('<html><head><title>Print Group Receipt</title>');
        frameDoc.document.write('<style>');
        frameDoc.document.write(`
            @media print {
                .col-sm-6 { width: 50%; float: left; }
                table { width: 100%; border-collapse: collapse; }
                td, th { border: 1px solid #ddd; padding: 8px; font-size: 11px; }
            }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        `);
        frameDoc.document.write('</style>');
        frameDoc.document.write('</head><body>');
        frameDoc.document.write(receiptHtml);
        frameDoc.document.write('</body></html>');
        frameDoc.document.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
        }, 500);
    } catch (e) {
        console.error("Error generating print group receipt", e);
        alert('An error occurred while printing');
    }
};
