
// Helper for converting amount to words
export const convertToWords = (amount) => {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const denominations = ["", "Thousand", "Million", "Billion", "Trillion"];

    let num = parseInt(amount);
    if (num === 0) return "Zero Rupees Only";

    let words = [];
    let i = 0;

    while (num > 0) {
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
            if (denominations[i]) chunkWords.push(denominations[i]);
            words = chunkWords.concat(words);
        }
        num = Math.floor(num / 1000);
        i++;
    }
    return words.join(" ") + " Rupees Only";
};


export const ReceiptContent = ({ student, sch_setting }) => {
    const currencySymbol = sch_setting.currency_symbol || '₹';
    const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const renderReceipt = (copyType) => (
        <div className="col-sm-6" style={{ width: '50%', float: 'left', padding: '15px' }}>
            <div className="row header">
                <div className="col-sm-12">
                    <img
                        src={`https://newlayout.wisibles.com/api_admin//uploads/print_headerfooter/student_receipt/${sch_setting.image}`}
                        style={{ height: '100px', width: '100%' }}
                        alt="Header"
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 text text-center" style={{ textAlign: 'center', margin: '10px 0' }}>{copyType}</div>
            </div>
            <div className="row table table-striped table-bordered" style={{ width: '100%', marginBottom: '10px' }}>
                <div className="col-xs-12 text-left">
                    <br />
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div className="col-sm-3" style={{ width: '25%' }}>Receipt No &nbsp;:</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>{sch_setting.session.split('-')[0] + '/' + sch_setting.session.split('-')[1].substring(2) + '-' + String(student.id).padStart(5, '0')}</div>
                        <div className="col-sm-2" style={{ width: '16.66%' }}>Date</div>
                        <div className="col-sm-1" style={{ width: '8.33%' }}>:</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>{student.created_at.split('-').reverse().join('/')}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div className="col-sm-3" style={{ width: '25%' }}>Admin No &nbsp;&nbsp;&nbsp;:</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>{student.admission_no}</div>
                        <div className="col-sm-2" style={{ width: '16.66%' }}>Roll No.</div>
                        <div className="col-sm-1" style={{ width: '8.33%' }}>:</div>
                        <div className="col-sm-3" style={{ width: '25%' }}>{student.roll_no}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div className="col-sm-4" style={{ width: '33.33%' }}>Student's Name</div>
                        <div className="col-sm-1" style={{ width: '8.33%' }}>:</div>
                        <div className="col-sm-6" style={{ width: '50%' }}>{student.firstname} {student.lastname}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div className="col-sm-4" style={{ width: '33.33%' }}>Father's Name</div>
                        <div className="col-sm-1" style={{ width: '8.33%' }}>:</div>
                        <div className="col-sm-6" style={{ width: '50%' }}>{student.father_name}</div>
                    </div>
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div className="col-sm-4" style={{ width: '33.33%' }}>Class & Sec</div>
                        <div className="col-sm-1" style={{ width: '8.33%' }}>:</div>
                        <div className="col-sm-6" style={{ width: '50%' }}>{student.class} ({student.section})</div>
                    </div>
                </div>
            </div>
            <hr style={{ marginTop: '0px', marginBottom: '0px', borderTop: '1px solid #eee' }} />
            <div className="row">
                <table className="table table-striped table-bordered" style={{ fontSize: '8pt', width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '20px', border: '1px solid #ddd', padding: '8px' }}>S.No.</th>
                            <th colSpan="4" style={{ border: '1px solid #ddd', padding: '8px' }}>Particulars</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mode</th>
                            <th className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="dark-gray">
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>1</td>
                            <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px' }}>Tuition Fee</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{student.mode.toUpperCase()}</td>
                            <td className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{currencySymbol} {formatAmount(student.amount)}</td>
                        </tr>
                        <tr>
                            <td colSpan="9" style={{ border: '1px solid #ddd', padding: '8px' }}>Remarks: {student.fee_types}</td>
                        </tr>
                        <tr>
                            <td colSpan="9" style={{ border: '1px solid #ddd', padding: '8px' }}>Received Amount: {currencySymbol} {formatAmount(student.amount)}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}></td>
                            <td colSpan="4" className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                            <td className="text text-right" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{currencySymbol} {formatAmount(student.amount)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="print_footer" style={{ marginTop: '10px', border: '0.5px solid', borderRadius: '8px', padding: '5px 10px', fontSize: '8pt' }}>
                <div className="row header">
                    <div className="col-sm-12">
                        In Words: {convertToWords(student.amount)}
                    </div>
                </div>
                <div className="row header" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <div className="col-sm-8">Note: Fee once paid is not refundable</div>
                    <div className="col-sm-4 text-right" style={{ textAlign: 'right' }}>Signature</div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px', background: 'white' }}>
            <div className="row" style={{ display: 'flex' }}>
                {renderReceipt("Office Copy")}
                {renderReceipt("Student Copy")}
            </div>
        </div>
    );
};
