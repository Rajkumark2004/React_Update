import React, { useEffect, useState } from 'react';
import PrintFeesByGroupArray from './PrintFeesByGroupArray';
import Loader from '../../../components/Loader';

const PrintFeesByGroupArrayPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('printFeesByGroupArrayData');
            if (storedData) {
                setData(JSON.parse(storedData));
            }
        } catch (error) {
            console.error("Failed to load print data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) return <Loader />;
    if (!data) return <div className="text-center p-5">No data found to print.</div>;

    const { feearray, student, sch_setting } = data;

    return (
        <PrintFeesByGroupArray
            feearray={feearray}
            student={student}
            sch_setting={sch_setting}
        />
    );
};

export default PrintFeesByGroupArrayPage;
