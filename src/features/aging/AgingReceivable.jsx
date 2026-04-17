import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../data/URL';

const AgingReceivable = () => {
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

                {/* Show Button (same padding as Print) */}
                <button
                    onClick={fetchReport}
                    style={{ backgroundColor: '#536976' }}
                    className="text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center"
                >
                    <span className="mr-1">Show</span> 👁️
                </button>

                {/* Print Button (only shows if data is available) */}
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
                        let crSum = 0;
                        let showRemaining = false;
                        let cumulativeBalance = 0;
                        const rendered = new Set();
                        const blocks = [];

                        // Sum total credit
                        reportData.forEach(row => {
                            if (row.VCr) crSum += row.VCr;
                        });

                        for (let i = 0; i < reportData.length; i++) {
                            const row = reportData[i];
                            if (row.VCr || rendered.has(row.VNo)) continue;

                            // Group by same VNo (consecutively)
                            const group = [];
                            let j = i;
                            while (
                                j < reportData.length &&
                                reportData[j].VNo === row.VNo &&
                                !reportData[j].VCr
                            ) {
                                group.push(reportData[j]);
                                j++;
                            }

                            rendered.add(row.VNo);

                            const invAmount = group.reduce((sum, r) => sum + (r.VDr || 0), 0);
                            const narration = group.map(r => r.VNarr).join(' / ');
                            const date = group[0].Vdate;

                            if (!showRemaining) {
                                if (crSum >= invAmount) {
                                    crSum -= invAmount;
                                    continue;
                                } else {
                                    showRemaining = true;
                                }
                            }

                            const balance = invAmount - crSum;
                            crSum = 0;
                            cumulativeBalance += balance;

                            const days = Math.floor(
                                (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
                            );

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
                                        <span><strong>Inv. Amount:</strong> {Number(invAmount).toLocaleString()}</span>
                                        <span><strong>Outstanding:</strong> {Number(balance).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span><strong>Payment:</strong> {(invAmount - balance).toLocaleString()}</span>
                                        <span><strong>Balance:</strong> {Number(cumulativeBalance).toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <strong>Days:</strong> {days}
                                    </div>
                                </div>
                            );
                        }

                        return blocks;
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
                                <th className="p-2 border">Out Standing</th>
                                <th className="p-2 border">Days</th>
                                <th className="p-2 border">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let crSum = 0;
                                let showRemaining = false;
                                let cumulativeBalance = 0;
                                const rendered = new Set(); // to avoid rendering the same VNo again

                                // Step 1: Sum all credits
                                reportData.forEach(row => {
                                    if (row.VCr) crSum += row.VCr;
                                });

                                // Step 2: Render while grouping only consecutive same VNo
                                const rows = [];

                                for (let i = 0; i < reportData.length; i++) {
                                    const row = reportData[i];

                                    if (row.VCr || rendered.has(row.VNo)) continue;

                                    // Group all rows with same VNo (consecutively)
                                    const group = [];
                                    let j = i;
                                    while (j < reportData.length && reportData[j].VNo === row.VNo && !reportData[j].VCr) {
                                        group.push(reportData[j]);
                                        j++;
                                    }

                                    // Skip if this group has already been rendered
                                    rendered.add(row.VNo);

                                    // Sum VDr and merge VNarr
                                    const invAmount = group.reduce((sum, r) => sum + (r.VDr || 0), 0);
                                    const narration = group.map(r => r.VNarr).join(" / ");
                                    const date = group[0].Vdate;

                                    if (!showRemaining) {
                                        if (crSum >= invAmount) {
                                            crSum -= invAmount;
                                            continue;
                                        } else {
                                            showRemaining = true;
                                        }
                                    }

                                    const balance = invAmount - crSum;
                                    crSum = 0;
                                    cumulativeBalance += balance;

                                    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

                                    rows.push(
                                        <tr key={i} className="text-center">
                                            <td className="p-2 border bg-red-50">{row.VNo}</td>
                                            <td className="p-2 border bg-orange-50">{formatDate(date)}</td>
                                            <td className="p-2 border text-left bg-yellow-50">{narration}</td>
                                            <td className="p-2 border bg-green-50">{Number(invAmount).toLocaleString()}</td>
                                            <td className="p-2 border bg-blue-50">{Number(balance).toLocaleString()}</td>
                                            <td className="p-2 border bg-purple-50">{days}</td>
                                            <td className="p-2 border bg-pink-50">{Number(cumulativeBalance).toLocaleString()}</td>
                                        </tr>
                                    );
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

export default AgingReceivable;
