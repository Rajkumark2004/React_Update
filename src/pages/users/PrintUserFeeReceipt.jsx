import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const convertToWords = (amount) => {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const denominations = ["", "Thousand", "Lakh", "Crore"];

    let num = parseInt(amount);
    if (num === 0) return "Zero Rupees Only";

    let words = [];

    // Last 3 digits
    let chunk = num % 1000;
    if (chunk > 0) {
        let chunkWords = [];
        let hundreds = Math.floor(chunk / 100);
        if (hundreds > 0) chunkWords.push(units[hundreds] + " Hundred");

        let remainder = chunk % 100;
        if (remainder > 0) {
            if (remainder === 10) chunkWords.push("Ten");
            else if (remainder < 10) chunkWords.push(units[remainder]);
            else if (remainder < 20) chunkWords.push(teens[remainder - 10]);
            else {
                let tenDigit = Math.floor(remainder / 10);
                let unitDigit = remainder % 10;
                chunkWords.push(tens[tenDigit]);
                if (unitDigit > 0) chunkWords.push(units[unitDigit]);
            }
        }
        words = chunkWords.concat(words);
    }

    num = Math.floor(num / 1000);
    let i = 1; // start with Thousand

    while (num > 0 && i < denominations.length) {
        let chunk = num % 100; // Indian numbering system uses chunks of 100 after 1000 (Lakhs, Crores)
        if (chunk > 0) {
            let chunkWords = [];
            if (chunk === 10) chunkWords.push("Ten");
            else if (chunk < 10) chunkWords.push(units[chunk]);
            else if (chunk < 20) chunkWords.push(teens[chunk - 10]);
            else {
                let tenDigit = Math.floor(chunk / 10);
                let unitDigit = chunk % 10;
                chunkWords.push(tens[tenDigit]);
                if (unitDigit > 0) chunkWords.push(units[unitDigit]);
            }
            if (denominations[i]) chunkWords.push(denominations[i]);
            words = chunkWords.concat(words);
        }
        num = Math.floor(num / 100);
        i++;
    }
    return words.join(" ") + " Rupees Only";
};

const UserReceiptTemplate = ({ data, copyType }) => {
    const student = data.student || {};
    const settings = data.settings && data.settings[0] ? data.settings[0] : {};
    const currencySymbol = settings.currency_symbol || '₹';
    const fee_category = data.fee_category || 'fees';
    const invoice_id = data.invoice_id || '';
    const sub_invoice_id = data.sub_invoice_id || '';
    const fees = data.fees || {};

    let amount_detail = {};
    if (fees.amount_detail) {
        try {
            amount_detail = typeof fees.amount_detail === 'string' ? JSON.parse(fees.amount_detail) : fees.amount_detail;
        } catch (e) {
            console.error('Failed to parse amount_detail', e);
        }
    }

    // The specific deposit details
    const deposit = amount_detail[sub_invoice_id] || {};

    // Format helpers
    const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const receiptNo = `${settings.session ? settings.session.split('-')[0] : ''}/${settings.session ? settings.session.split('-')[1].substring(2) : ''}-${invoice_id}/${sub_invoice_id}`;
    const paymentDate = deposit.date && deposit.date.includes('-') && deposit.date.split('-')[0].length === 4
        ? deposit.date.split('-').reverse().join('/')
        : (deposit.date || '');

    const headerUrl = settings.receipt_header_url || (settings.image ? `https://newlayout.wisibles.com/api_admin/uploads/print_headerfooter/student_receipt/${settings.image}` : '');

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
                        <div className="col-sm-3" style={{ width: '25%' }}>: {student.admission_no || ''}</div>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Roll No.</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>: {student.roll_no || ''}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Student's Name</div>
                        <div className="col-sm-9" style={{ width: '75%' }}>: {`${student.firstname || ''} ${student.middlename || ''} ${student.lastname || ''}`.trim()}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Father's Name</div>
                        <div className="col-sm-9" style={{ width: '75%' }}>: {student.father_name || ''}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
                        <div className="col-sm-3" style={{ width: '25%', fontWeight: 'bold' }}>Class & Sec</div>
                        <div className="col-sm-9" style={{ width: '75%' }}>: {student.class || ''} {student.section ? `(${student.section})` : ''}</div>
                    </div>
                </div>
            </div>

            <div className="row">
                <table className="table table-striped table-bordered" style={{ fontSize: '9pt', width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '10%', border: '1px solid #ddd', padding: '8px' }}>S.No.</th>
                            <th colSpan="4" style={{ border: '1px solid #ddd', padding: '8px' }}>Particulars</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mode</th>
                            <th className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="dark-gray">
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>1</td>
                            <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px' }}>{fee_category === 'transport' ? 'Transport Fee' : 'Tuition Fee'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(deposit.payment_mode || '').toUpperCase()}</td>
                            <td className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{currencySymbol} {formatAmount(deposit.amount)}</td>
                        </tr>
                        <tr>
                            <td colSpan="7" style={{ border: '1px solid #ddd', padding: '8px' }}>Remarks: {deposit.description || `Fee payment (${fees.name || ''} - ${fees.type || ''})`}</td>
                        </tr>
                        <tr>
                            <td colSpan="7" style={{ border: '1px solid #ddd', padding: '8px' }}>Received Amount: {currencySymbol} {formatAmount(deposit.amount)}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}></td>
                            <td colSpan="4" className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                            <td className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{currencySymbol} {formatAmount(deposit.amount)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="print_footer" style={{ marginTop: '10px', border: '0.5px solid', borderRadius: '8px', padding: '5px 10px', fontSize: '9pt' }}>
                <div className="row header">
                    <div className="col-sm-12">
                        In Words: {convertToWords(deposit.amount)}
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

export const printUserFeeReceipt = (data) => {
    try {
        const receiptHtml = renderToStaticMarkup(
            <div style={{ padding: '20px', background: 'white', display: 'flex', width: '100%' }}>
                <UserReceiptTemplate data={data} copyType="Office Copy" />
                <UserReceiptTemplate data={data} copyType="Student Copy" />
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
        frameDoc.document.write('<html><head><title>Print Receipt</title>');
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
        console.error("Error generating print receipt", e);
        alert('An error occurred while printing');
    }
};
