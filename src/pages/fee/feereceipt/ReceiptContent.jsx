
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

    const renderReceipt = (copyType, index) => {
        const sidePadding = index === 0 ? { paddingRight: '10px' } : { paddingLeft: '10px' };

        return (
            <div style={{ width: '50%', float: 'left', boxSizing: 'border-box', ...sidePadding }}>
            <div>
                <img
                    src={sch_setting.receipt_header_url || `https://newlayout.wisibles.com/api_admin//uploads/print_headerfooter/student_receipt/${sch_setting.image}`}
                    style={{ height: '100px', width: '100%', display: 'block' }}
                    alt="Header"
                />
            </div>
            <div>
                <div style={{ textAlign: 'center', margin: '6px 0', fontWeight: '600', fontSize: '10pt' }}>{copyType}</div>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '6px 8px', marginBottom: '0', fontSize: '9pt', lineHeight: '1.7' }}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '25%' }}>Receipt No :</div>
                        <div style={{ width: '25%' }}>{sch_setting.session.split('-')[0] + '/' + sch_setting.session.split('-')[1].substring(2) + '-' + String(student.id).padStart(5, '0')}</div>
                        <div style={{ width: '17%' }}>Date</div>
                        <div style={{ width: '8%' }}>:</div>
                        <div style={{ width: '25%' }}>{student.created_at.split('-').reverse().join('/')}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '25%' }}>Admin No :</div>
                        <div style={{ width: '25%' }}>{student.admission_no}</div>
                        <div style={{ width: '17%' }}>Roll No.</div>
                        <div style={{ width: '8%' }}>:</div>
                        <div style={{ width: '25%' }}>{student.roll_no}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '33%' }}>Student's Name</div>
                        <div style={{ width: '8%' }}>:</div>
                        <div style={{ width: '59%' }}>{student.firstname} {student.lastname}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '33%' }}>Father's Name</div>
                        <div style={{ width: '8%' }}>:</div>
                        <div style={{ width: '59%' }}>{student.father_name}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '33%' }}>Class & Sec</div>
                        <div style={{ width: '8%' }}>:</div>
                        <div style={{ width: '59%' }}>{student.class} ({student.section})</div>
                    </div>
            </div>
            <div>
                <table style={{ fontSize: '8pt', width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', tableLayout: 'fixed' }}>
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
            <div style={{ marginTop: '6px', border: '1px solid #999', borderRadius: '4px', padding: '5px 8px', fontSize: '8pt' }}>
                <div>
                    In Words: {convertToWords(student.amount)}
                </div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        {sch_setting.receipt_footer_content ? (
                            <div dangerouslySetInnerHTML={{ __html: sch_setting.receipt_footer_content }} />
                        ) : (
                            "Note: Fee once paid is not refundable"
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
