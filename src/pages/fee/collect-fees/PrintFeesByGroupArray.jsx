import React from 'react';

const PrintFeesByGroupArray = ({ feearray, student, sch_setting, receiptNoPrefix = '24/25' }) => {

    const convertToWords = (amount) => {
        const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
        const teens = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const denominations = ["", "Thousand", "Million", "Billion", "Trillion"];
        const currency = "Rupees Only";

        amount = parseInt(amount);

        if (amount === 0) {
            return "Zero " + currency;
        }

        let words = [];
        let i = 0;

        while (amount > 0) {
            let chunk = amount % 1000;

            if (chunk > 0) {
                let chunk_words = [];

                let hundreds = Math.floor(chunk / 100);
                if (hundreds > 0) {
                    chunk_words.push(units[hundreds] + " Hundred");
                }

                let tens_units = chunk % 100;
                if (tens_units > 0) {
                    if (tens_units === 10) {
                        chunk_words.push("Ten");
                    } else if (tens_units < 10) {
                        chunk_words.push(units[tens_units]);
                    } else if (tens_units < 20) {
                        chunk_words.push(teens[tens_units - 10]);
                    } else {
                        let tens_digit = Math.floor(tens_units / 10);
                        let units_digit = tens_units % 10;
                        chunk_words.push(tens[tens_digit]);
                        if (units_digit > 0) {
                            chunk_words.push(units[units_digit]);
                        }
                    }
                }

                if (chunk_words.length > 0) {
                    if (denominations[i]) {
                        chunk_words.push(denominations[i]);
                    }
                }

                // Words should be unshifted to maintain order (highest denomination first)
                // But the PHP logic merges (chunk + words), so current chunk comes first?
                // PHP: $words = array_merge($chunk_words, $words); -> New chunk (lower denomination) is PREPENDED? 
                // Wait. PHP:
                // Loop 1: chunk = amount % 1000 (last 3 digits). i=0 ("").
                // Loop 2: amount = amount / 1000. chunk = next 3 digits. i=1 ("Thousand").
                // So yes, higher denominations are processed later. array_merge(chunk_words, words) puts the NEW chunk (Higher denom) BEFORE the existing words.
                // JS concat: new.concat(old)
                words = chunk_words.concat(words);
            }

            amount = Math.floor(amount / 1000);
            i++;
        }

        return words.join(" ") + " " + currency;
    };

    const getFullName = (firstname, middlename, lastname, showMiddle, showLast) => {
        let name = firstname || "";
        if (showMiddle && middlename) name += " " + middlename;
        if (showLast && lastname) name += " " + lastname;
        return name.toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const amountFormat = (amt) => {
        // Simple formatter matching standard locale or exact requirement
        // Assuming two decimal places as common in currency
        return parseFloat(amt).toFixed(2);
    };

    // Assuming feearray contains at least one item as per PHP logic ($feearray[0])
    // If empty, layout handles it (message)
    const firstFee = feearray && feearray.length > 0 ? feearray[0] : {};

    // Calculation Logic
    let total_amount = 0;
    let total_fine_amount = 0;

    if (feearray) {
        feearray.forEach(fee => {
            total_amount += parseFloat(fee.amount || 0);
            total_fine_amount += parseFloat(fee.fine_amount || 0);
        });
    }

    const currency_symbol = sch_setting.currency_symbol || "₹";

    const renderReceipt = (title, index) => {
        const sidePadding = index === 0 ? { paddingRight: '10px' } : { paddingLeft: '10px' };

        return (
        <div style={{ width: '50%', float: 'left', boxSizing: 'border-box', ...sidePadding }}>
            <div>
                <img src={sch_setting.receipt_header_url || "/uploads/print_headerfooter/student_receipt/header.jpg"} style={{ height: '100px', width: '100%', display: 'block' }} alt="Header" />
            </div>
            <div>
                <div style={{ textAlign: 'center', margin: '6px 0', fontWeight: '600', fontSize: '10pt' }}>{title}</div>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '10px 15px', marginBottom: '0', fontSize: '9pt', lineHeight: '1.7' }}>
                    <div className="row">
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-4" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Receipt No</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-7" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>{receiptNoPrefix}{String(student.id || '').padStart(5, '0')}</div>
                            </div>
                        </div>
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-4" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Date</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-7" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>{formatDate(new Date())}</div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-4" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Admin No</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-7" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>{firstFee.admission_no || student.admission_no}</div>
                            </div>
                        </div>
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-4" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Roll No.</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-7" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>{firstFee.roll_no || student.roll_no}</div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-6" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Student Name</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-5" style={{ wordBreak: 'break-word', padding: '0 5px' }}>{getFullName(firstFee.firstname || student.firstname, firstFee.middlename || student.middlename, firstFee.lastname || student.lastname, sch_setting.middlename, sch_setting.lastname)}</div>
                            </div>
                        </div>
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-6" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Father's Name</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-5" style={{ wordBreak: 'break-word', padding: '0 5px' }}>{(firstFee.father_name || student.father_name || '').toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-4" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Class</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-7" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>{firstFee.class || student.class}</div>
                            </div>
                        </div>
                        <div className="col-xs-6">
                            <div className="row">
                                <div className="col-xs-4" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>Section</div>
                                <div className="col-xs-1" style={{ padding: 0, textAlign: 'center' }}>:</div>
                                <div className="col-xs-7" style={{ whiteSpace: 'nowrap', padding: '0 5px' }}>{firstFee.section || student.section}</div>
                            </div>
                        </div>
                    </div>
            </div>
            <div>
                {!feearray || feearray.length === 0 ? (
                    <table style={{ fontSize: '8pt', width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', tableLayout: 'fixed' }}>
                        <tbody>
                            <tr>
                                <td className="text-danger text-center" style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    No Transaction Found
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table style={{ fontSize: '8pt', width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '10%', border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>S.No.</th>
                                <th style={{ width: '40%', border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Particulars</th>
                                <th style={{ width: '25%', border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Mode</th>
                                <th style={{ width: '25%', border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feearray.map((fee, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {fee.type || fee.feeTypeName}
                                        {fee.code ? ` (${fee.code})` : ''}
                                        {fee.fine_amount > 0 && <span className="text-danger"> + Fine ({currency_symbol}{fee.fine_amount})</span>}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(fee.mode || '').toUpperCase()}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                            <span>{currency_symbol}</span> <span style={{ marginLeft: '4px' }}>{amountFormat(parseFloat(fee.amount) + parseFloat(fee.fine_amount || 0))}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <div style={{ display: 'flex', whiteSpace: 'nowrap', alignItems: 'center' }}>
                                        Received Amount: <span style={{ marginLeft: '4px' }}>{currency_symbol}</span> <span style={{ marginLeft: '4px' }}>{amountFormat(total_amount + total_fine_amount)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        <span>{currency_symbol}</span> <span style={{ marginLeft: '4px' }}>{amountFormat(total_amount + total_fine_amount)}</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: '6px', border: '1px solid #999', borderRadius: '4px', padding: '5px 8px', fontSize: '8pt' }}>
                <div>
                    In Words: {convertToWords(total_amount + total_fine_amount)}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        {sch_setting.receipt_footer_content ? (
                            <div dangerouslySetInnerHTML={{ __html: sch_setting.receipt_footer_content }} />
                        ) : (
                            "This receipt is computer-generated; hence, no signature is required."
                        )}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>Signature</div>
                </div>
            </div>
        </div>
        );
    };

    return (
        <div style={{ padding: '10px', background: 'white' }}>
            <div style={{ overflow: 'hidden' }}>
                {renderReceipt("Office Copy", 0)}
                {renderReceipt("Student Copy", 1)}
            </div>
        </div>
    );
};

export default PrintFeesByGroupArray;
