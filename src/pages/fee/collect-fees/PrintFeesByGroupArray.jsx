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
        return name;
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

    const renderReceipt = (title) => (
        <div className="col-sm-6">
            <div className="row header ">
                <div className="col-sm-12">
                    <img src={sch_setting.receipt_header_url || "/uploads/print_headerfooter/student_receipt/header.jpg"} style={{ height: '100px', width: '100%' }} alt="Header" />
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 text text-center">
                    {title}
                </div>
            </div>

            <div className="row table table-bordered" style={{ width: '95%' }}>
                <div className="col-xs-12 text-left">
                    <br />
                    <div className="row">
                        <div className="col-sm-3">Receipt No &#160;:</div>
                        <div className="col-sm-3">
                            {receiptNoPrefix}{String(student.id || '').padStart(5, '0')}
                        </div>
                        <div className="col-sm-2">Date</div>
                        <div className="col-sm-1">:</div>
                        <div className="col-sm-3">
                            {formatDate(new Date())}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-3">Admin No &#160;&#160;&#160;:</div>
                        <div className="col-sm-3">{firstFee.admission_no || student.admission_no}</div>
                        <div className="col-sm-2">Roll No</div>
                        <div className="col-sm-1">:</div>
                        <div className="col-sm-3">{firstFee.roll_no || student.roll_no}</div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4">Student's Name</div>
                        <div className="col-sm-1">:</div>
                        <div className="col-sm-6">
                            {getFullName(firstFee.firstname || student.firstname, firstFee.middlename || student.middlename, firstFee.lastname || student.lastname, sch_setting.middlename, sch_setting.lastname)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4">Father's Name</div>
                        <div className="col-sm-1">:</div>
                        <div className="col-sm-6">{firstFee.father_name || student.father_name}</div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4">Class & Sec</div>
                        <div className="col-sm-1">:</div>
                        <div className="col-sm-6">
                            {firstFee.class || student.class} ({firstFee.section || student.section})
                        </div>
                    </div>
                </div>
            </div>
            <hr style={{ marginTop: '0px', marginBottom: '0px' }} />
            <div className="row">
                {!feearray || feearray.length === 0 ? (
                    <table className="table table-bordered" style={{ fontSize: '8pt', width: '95%' }}>
                        <tbody>
                            <tr>
                                <td colSpan="11" className="text-danger text-center">
                                    No Transaction Found
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table className="table table-bordered" style={{ fontSize: '8pt', width: '95%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '20px' }}>S.No.</th>
                                <th colSpan="4">Particulars</th>
                                <th className="text text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feearray.map((fee, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td colSpan="4">
                                        {fee.type || fee.feeTypeName}
                                        {fee.code ? ` (${fee.code})` : ''}
                                        {fee.fine_amount > 0 && <span className="text-danger"> + Fine ({currency_symbol}{fee.fine_amount})</span>}
                                    </td>
                                    <td className="text text-right">
                                        {currency_symbol}{amountFormat(parseFloat(fee.amount) + parseFloat(fee.fine_amount || 0))}
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <td></td>
                                <td colSpan="4" className="text text-right">Total</td>
                                <td className="text text-right">
                                    {currency_symbol}{amountFormat(total_amount + total_fine_amount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>

            <div className="print_footer">
                <div className="row header ">
                    <div className="col-sm-12">
                        In Words: {convertToWords(total_amount + total_fine_amount)}
                    </div>
                </div>
                <div className="row header" style={{ marginTop: '10px' }}>
                    <div className="col-sm-8">
                        {sch_setting.receipt_footer_content ? (
                            <div dangerouslySetInnerHTML={{ __html: sch_setting.receipt_footer_content }} />
                        ) : (
                            "Note: Fee once paid is not refundable"
                        )}
                    </div>
                    <div className="col-sm-4 text-right">
                        Signature
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container">
            <style>
                {`
                .page-break { display: block; page-break-before: always; }
                @media print {
                    .page-break { display: block; page-break-before: always; }
                    .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 { float: left; }
                    .col-sm-12 { width: 100%; }
                    .col-sm-6 { width: 50%; }
                    .col-sm-4 { width: 33.33333333%; }
                    .col-sm-3 { width: 25%; }
                    .col-sm-2 { width: 16.66666667%; }
                    .col-sm-1 { width: 8.33333333%; }
                    .col-xs-12 { width: 100%; float: left; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    
                    .print_header { border: 0.5px solid; border-radius: 8px; padding: 5px 10px; }
                    .print_footer { border: 0.5px solid; border-radius: 8px; padding: 5px 10px; margin-left: -10px; width: 98%; font-size: 8pt; }
                    table, tr, td, th { background-color: #ffffff !important; }
                    body, html { background-color: #ffffff !important; }
                }
                .print_footer { border: 0.5px solid; border-radius: 8px; padding: 5px 10px; margin-left: -10px; width: 98%; font-size: 8pt; }
                table, tr, td, th { background-color: #ffffff !important; }
                body, html { background-color: #ffffff !important; }
                `}
            </style>
            <div className="row">
                {renderReceipt("Office Copy")}
                {renderReceipt("Student Copy")}
            </div>
        </div>
    );
};

export default PrintFeesByGroupArray;
