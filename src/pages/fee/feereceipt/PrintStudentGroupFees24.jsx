import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import Loader from '../../../components/Loader';
import { ReceiptContent } from './ReceiptContent';

const PrintStudentGroupFees24 = () => {
    const { receipt_id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.printStudentGroupFees24(receipt_id);
                if (response && response.status === 1) {
                    setData(response.data);
                } else {
                    setError('Failed to fetch receipt data');
                }
            } catch (err) {
                setError('An error occurred while fetching data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [receipt_id]);



    if (loading) return <Loader />;
    if (error) return <div className="text-center p-4">{error}</div>;
    if (!data) return null;

    const { student, sch_setting } = data;
    const currencySymbol = sch_setting.currency_symbol || '₹';

    // Use ReceiptContent for rendering

    return (
        <div className="container" style={{ background: 'white', padding: '20px' }}>
            <style>{`
                .print_header {
                    border: 0.5px solid;
                    border-radius: 8px;
                    padding: 5px 10px;
                    font-size: 12px;
                }
                .print_footer {
                    border: 0.5px solid;
                    border-radius: 8px;
                    padding: 5px 10px;
                    margin-left: -10px;
                    width: 98%;
                    font-size: 8pt;
                }
                @media print {
                    .col-sm-6 { width: 50%; float: left; }
                    .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-12 { float: left; }
                    .col-sm-12 { width: 100%; }
                    .col-sm-3 { width: 25%; }
                    .col-sm-4 { width: 33.33333333%; }
                    .col-sm-2 { width: 16.66666667%; }
                    .col-sm-1 { width: 8.33333333%; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                    .no-print { display: none !important; }
                }
            `}</style>
            <div className="row no-print" style={{ marginBottom: '20px' }}>
                <div className="col-md-12">
                    <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                        <i className="fa fa-arrow-left"></i> Back
                    </button>
                    <button onClick={() => window.print()} className="btn btn-success btn-sm pull-right">
                        <i className="fa fa-print"></i> Print
                    </button>
                </div>
            </div>
            <div className="row">
                <ReceiptContent student={student} sch_setting={sch_setting} />
            </div>
        </div>
    );
};

export default PrintStudentGroupFees24;
