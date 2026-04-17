import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../data/URL';

const AgingPayable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [descriptions, setDescriptions] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setDescriptions([]);
            return;
        }

        const fetchFilteredDescriptions = async () => {
            try {
                const res = await axios.get(`${BASE_URL}ledger/descriptions?search=${searchTerm}`);
                // const res = await axios.get(`https://fivestar-cgyj.onrender.com/api/ledger/descriptions?search=${searchTerm}`);
                setDescriptions(res.data.map(d => d.Acc_Description));
            } catch (error) {
                toast.error('Error fetching descriptions:', error);
            }
        };

        fetchFilteredDescriptions();
    }, [searchTerm]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}aging-report?description=${searchTerm}`);
            // const res = await axios.get(`https://fivestar-cgyj.onrender.com/api/aging-report?description=${searchTerm}`);
            setReportData(res.data);
        } catch (err) {
            toast.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div className="w-full sm:max-w-md relative">
                    <input
                        type="text"
                        placeholder="Search account description..."
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    />
                    {showSuggestions && searchTerm && (
                        <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-48 overflow-y-auto rounded shadow">
                            {descriptions.length > 0 ? (
                                descriptions.map((desc, idx) => (
                                    <li
                                        key={idx}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onMouseDown={() => {
                                            setSearchTerm(desc);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {desc}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500">No matches</li>
                            )}
                        </ul>
                    )}
                </div>

                <button
                    onClick={fetchReport}
                    style={{ backgroundColor: '#536976' }}
                    className="text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center"
                >
                    <span className="mr-1">Show</span> 👁️
                </button>

                {!loading && reportData.length > 0 && (
                    <button
                        onClick={() => window.print()}
                        style={{ backgroundColor: '#292E49' }}
                        className="text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center"
                    >
                        <span className="mr-1">Print</span> 🖨️
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex justify-center items-center my-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-700 text-sm font-medium">Loading report...</span>
                    </div>
                </div>
            )}

            {!loading && reportData.length > 0 && (
                <div className="print-area sm:hidden space-y-4">
                    {(() => {
                        let paymentSum = 0;
                        let cumulativeBalance = 0;
                        let grandTotal = 0;
                        let showRemaining = false;
                        const rendered = new Set();
                        const blocks = [];

                        // Step 1: Calculate total payments (VDr)
                        reportData.forEach(row => {
                            if (row.VDr) paymentSum += row.VDr;
                        });

                        for (let i = 0; i < reportData.length; i++) {
                            const row = reportData[i];
                            if (row.VDr || rendered.has(row.VNo)) continue; // skip payments or already handled VNo

                            // Step 2: Group all same VNo bills (VCr) together
                            const group = [];
                            let j = i;
                            while (
                                j < reportData.length &&
                                reportData[j].VNo === row.VNo &&
                                !reportData[j].VDr
                            ) {
                                group.push(reportData[j]);
                                j++;
                            }

                            rendered.add(row.VNo);

                            const billAmount = group.reduce((sum, r) => sum + (r.VCr || 0), 0);
                            const narration = group.map(r => r.VNarr).join(' / ');
                            const date = group[0].Vdate;

                            if (!showRemaining) {
                                if (paymentSum >= billAmount) {
                                    paymentSum -= billAmount;
                                    continue; // fully paid, skip
                                } else {
                                    showRemaining = true;
                                }
                            }

                            const balance = billAmount - paymentSum;
                            paymentSum = 0;
                            cumulativeBalance += balance;
                            grandTotal += balance;

                            const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

                            blocks.push(
                                <div
                                    key={i}
                                    className={`border border-gray-300 rounded-md p-3 shadow-sm text-sm ${i % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span><strong>Inv. No:</strong> {row.VNo}</span>
                                        <span><strong>Date:</strong> {formatDate(date)}</span>
                                    </div>
                                    <div className="mb-1">
                                        <strong>Narration:</strong> {narration}
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span><strong>Inv. Amount:</strong> {billAmount.toLocaleString()}</span>
                                        <span><strong>Outstanding:</strong> {balance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span><strong>Balance:</strong> {cumulativeBalance.toLocaleString()}</span>
                                        <strong>Days:</strong> {days}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <>
                                {blocks}
                                <div className="border border-gray-300 rounded-md p-3 bg-yellow-100 text-sm font-semibold text-center mt-4">
                                    Grand Total: {grandTotal.toLocaleString()}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {!loading && reportData.length > 0 && (
                <div className="print-area hidden sm:block overflow-x-auto mt-4">
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 border">Inv. No</th>
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Narration</th>
                                <th className="p-2 border">Inv. Amount</th>
                                <th className="p-2 border">Outstanding</th>
                                <th className="p-2 border">Aging</th>
                                <th className="p-2 border">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let paymentSum = 0;
                                let cumulativeBalance = 0;
                                let startRendering = false;
                                const rows = [];

                                // ✅ STEP 1: Sum all VDr values (payments)
                                reportData.forEach(row => {
                                    if (row.VDr) paymentSum += row.VDr;
                                });

                                // ✅ STEP 2: Traverse the data, group by VNo AFTER payment check
                                const processed = new Set();

                                for (let i = 0; i < reportData.length;) {
                                    const row = reportData[i];
                                    const VNo = row.VNo;

                                    if (row.VDr) {
                                        i++;
                                        continue;
                                    }

                                    // ✅ Group all entries of this VNo (non-payment only)
                                    const group = [];
                                    let j = i;
                                    while (
                                        j < reportData.length &&
                                        reportData[j].VNo === VNo &&
                                        !reportData[j].VDr
                                    ) {
                                        group.push(reportData[j]);
                                        j++;
                                    }

                                    processed.add(VNo); // prevent duplicate group

                                    const billAmount = group.reduce((sum, r) => sum + (r.VCr || 0), 0);
                                    const narration = group.map(r => r.VNarr).join(' / ');
                                    const date = group[0].Vdate;

                                    // ✅ STEP 3: Only start rendering when bill is not fully paid
                                    if (!startRendering) {
                                        if (paymentSum >= billAmount) {
                                            paymentSum -= billAmount;
                                            i = j;
                                            continue;
                                        } else {
                                            startRendering = true;
                                        }
                                    }

                                    // ✅ STEP 4: Calculate balance and display row
                                    const balance = billAmount - paymentSum;
                                    paymentSum = 0;
                                    cumulativeBalance += balance;

                                    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

                                    rows.push(
                                        <tr key={i} className="text-center">
                                            <td className="p-2 border bg-red-50">{VNo}</td>
                                            <td className="p-2 border bg-orange-50">{formatDate(date)}</td>
                                            <td className="p-2 border text-left bg-yellow-50">{narration}</td>
                                            <td className="p-2 border bg-green-50">{billAmount.toLocaleString()}</td>
                                            <td className="p-2 border bg-indigo-50">{balance.toLocaleString()}</td>
                                            <td className="p-2 border bg-purple-50">{days}</td>
                                            <td className="p-2 border bg-pink-50">{Math.round(cumulativeBalance).toLocaleString()}</td>
                                        </tr>

                                    );

                                    i = j; // move to next unprocessed group
                                }
                                rows.push(
                                    <tr key="total" className="text-center font-semibold">
                                        <td className="p-2 border bg-red-100" colSpan={6}>Final Balance</td>
                                        <td className="p-2 border bg-pink-100">{Math.round(cumulativeBalance).toLocaleString()}</td>
                                    </tr>
                                );
                                return rows;
                            })()}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AgingPayable;
