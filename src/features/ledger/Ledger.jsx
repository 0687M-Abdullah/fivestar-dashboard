import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../data/URL';

const Ledger = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [ledgerData, setLedgerData] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [descriptions, setDescriptions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [fromDateInput, setFromDateInput] = useState('');
    const [toDateInput, setToDateInput] = useState('');

    const printSectionRef = useRef();

    useEffect(() => {
        const today = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(today.getMonth() - 2);

        const to = today.toISOString().split('T')[0];
        const from = twoMonthsAgo.toISOString().split('T')[0];

        setToDate(to);
        setFromDate(from);

        setToDateInput(formatDate(to));
        setFromDateInput(formatDate(from));
    }, []);

    useEffect(() => {
        if (fromDate) {
            setFromDateInput(formatDate(fromDate));
        }
    }, [fromDate]);

    useEffect(() => {
        if (toDate) {
            setToDateInput(formatDate(toDate));
        }
    }, [toDate]);

    const handleFromDateChange = (e) => {
        const input = e.target.value;
        setFromDateInput(input);

        const parts = input.split('/');
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            if (/^\d{2}$/.test(dd) && /^\d{2}$/.test(mm) && /^\d{4}$/.test(yyyy)) {
                setFromDate(`${yyyy}-${mm}-${dd}`);
            }
        }
    };

    const formatDateToDMY = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleToDateChange = (e) => {
        const input = e.target.value;
        setToDateInput(input);

        const parts = input.split('/');
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            if (/^\d{2}$/.test(dd) && /^\d{2}$/.test(mm) && /^\d{4}$/.test(yyyy)) {
                setToDate(`${yyyy}-${mm}-${dd}`);
            }
        }
    };


    useEffect(() => {
        if (fromDate) {
            setFromDateInput(formatDate(fromDate));
        }
    }, [fromDate]);


    useEffect(() => {
        const today = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(today.getMonth() - 2);
        setToDate(today.toISOString().split('T')[0]);
        setFromDate(twoMonthsAgo.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setDescriptions([]);
            return;
        }

        const fetchFilteredDescriptions = async () => {
            try {
                const response = await axios.get(`${BASE_URL}ledger/descriptions?search=${searchTerm}`);
                // const response = await axios.get(`https://fivestar-cgyj.onrender.com/api/ledger/descriptions?search=${searchTerm}`);
                setDescriptions(response.data.map(d => d.Acc_Description));
            } catch (error) {
                toast.error('Error fetching filtered descriptions:', error);
            }
        };

        fetchFilteredDescriptions();
    }, [searchTerm]);

    const handleShow = async () => {
        setLoading(true);
        setDataReady(false);

        try {
            const [openingResponse, ledgerResponse] = await Promise.all([
                axios.get(`${BASE_URL}ledger/opening-balance`, {
                // axios.get('https://fivestar-cgyj.onrender.com/api/ledger/opening-balance', {
                    params: { search: searchTerm, from: fromDate },
                }),
                axios.get(`${BASE_URL}ledger/filter`, {
                // axios.get('https://fivestar-cgyj.onrender.com/api/ledger/filter', {
                    params: { search: searchTerm, from: fromDate, to: toDate },
                }),
            ]);

            const fetchedOpeningBalance = openingResponse.data.openingBalance;

            if (fetchedOpeningBalance === undefined || fetchedOpeningBalance === null) {
                throw new Error('Opening balance not returned');
            }

            setOpeningBalance(fetchedOpeningBalance);
            setLedgerData(ledgerResponse.data);
            setDataReady(true);

        } catch (error) {
            toast.error('Error:', error);
            setLedgerData([]);
            setOpeningBalance(0); 
        } finally {
            setLoading(false);
        }
    };


    const handlePrint = () => {
        if (printSectionRef.current) {
            const printContents = printSectionRef.current.innerHTML;
            const originalContents = document.body.innerHTML;

            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
        }
    };

    const renderLedgerTable = () => {
        const rowsWithBalance = ledgerData.reduce((acc, item, index) => {
            const debit = parseFloat(String(item.VDr).replace(/,/g, '')) || 0;
            const credit = parseFloat(String(item.VCr).replace(/,/g, '')) || 0;

            const previousBalance = index === 0 ? openingBalance : acc[index - 1].computedBalance;
            const computedBalance = previousBalance + debit - credit;

            acc.push({ ...item, computedBalance });
            return acc;
        }, []);

        const totalBalance = rowsWithBalance.length > 0
            ? rowsWithBalance[rowsWithBalance.length - 1].computedBalance
            : openingBalance;

        return (
            <>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-300 rounded-md">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border">S.No</th>
                                <th className="px-4 py-2 border">Date</th>
                                <th className="px-4 py-2 border">Type</th>
                                <th className="px-4 py-2 border">V.No</th>
                                <th className="px-4 py-2 border">Narration</th>
                                <th className="px-4 py-2 border">Debit</th>
                                <th className="px-4 py-2 border">Credit</th>
                                <th className="px-4 py-2 border">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="font-semibold bg-gray-200">
                                <td className="px-4 py-2 border text-center" colSpan={7}>Opening Balance</td>
                                <td className="px-4 py-2 border">{openingBalance.toFixed(2)}</td>
                            </tr>

                            {rowsWithBalance.length > 0 ? (
                                <>
                                    {rowsWithBalance.map((item, index) => (
                                        <tr key={index} className="even:bg-gray-50">
                                            <td className="px-4 py-2 border">{index + 1}</td>
                                            <td className="px-4 py-2 border">{formatDateToDMY(item.Vdate)}</td>
                                            <td className="px-4 py-2 border">{item.Vtype}</td>
                                            <td className="px-4 py-2 border">{item.VNo}</td>
                                            <td className="px-4 py-2 border">{item.VNarr}</td>
                                            <td className="px-4 py-2 border">{item.VDr}</td>
                                            <td className="px-4 py-2 border">{item.VCr}</td>
                                            <td className="px-4 py-2 border">{item.computedBalance.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-semibold bg-gray-200">
                                        <td className="px-4 py-2 border text-center" colSpan={7}>Total Balance</td>
                                        <td className="px-4 py-2 border">{totalBalance.toFixed(2)}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr className="text-center text-gray-500">
                                    <td colSpan={8} className="px-4 py-4">
                                        No transactions found for selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Two Rows per Entry */}
                <div className="sm:hidden space-y-4">
                    <div className="border border-gray-300 rounded-md p-3 bg-gray-200 shadow-sm font-semibold">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Opening Balance</span>
                            <span className="text-gray-900">{openingBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    {rowsWithBalance.length > 0 ? (
                        <>
                            {rowsWithBalance.map((item, index) => (
                                <div
                                    key={index}
                                    className={`border border-gray-300 rounded-md p-3 shadow-sm text-sm ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                                    <div className="flex justify-between mb-1">
                                        <span><strong>S.No:</strong> {index + 1}</span>
                                        <span><strong>Type:</strong> {item.Vtype}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span><strong>Entry:</strong> {formatDateToDMY(item.Vdate)}</span>
                                        <span><strong>Code:</strong> {item.VNo}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span><strong>Description:</strong> {item.VNarr}</span>
                                        <span><strong>Debit:</strong> {item.VDr}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span><strong>Credit:</strong> {item.VCr}</span>
                                        <span><strong>Balance:</strong> {item.computedBalance.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="border border-gray-300 rounded-md p-3 bg-gray-200 shadow-sm font-semibold">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-700">Total Balance</span>
                                    <span className="text-gray-900">{totalBalance.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            No transactions found for selected criteria.
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-4 mb-6">
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

                <div className="flex flex-wrap gap-4">
                    <div className="flex w-full sm:w-auto">
                        <label className="text-md bg-gray-300 font-medium text-gray-700 px-3 py-2 rounded-l-md border border-gray-300">
                            From
                        </label>
                        <input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            className="border border-gray-300 px-4 py-2 rounded-r-md w-full sm:w-48"
                            value={fromDateInput}
                            onChange={handleFromDateChange}
                        />
                    </div>

                    <div className="flex w-full sm:w-auto">
                        <label className="text-md bg-gray-300 font-medium text-gray-700 px-3 py-2 rounded-l-md border border-gray-300">
                            To
                        </label>
                        <input
                            type="text"
                            placeholder="dd/mm/yyyy"
                            className="border border-gray-300 px-4 py-2 rounded-r-md w-full sm:w-48"
                            value={toDateInput}
                            onChange={handleToDateChange}
                        />
                    </div>
                </div>

                <button
                    style={{ backgroundColor: '#536976' }}
                    className="text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center"
                    onClick={handleShow}
                >
                    <span className="mr-1">Show</span> 👁️
                </button>

                {dataReady && (
                    <button
                        style={{ backgroundColor: '#292E49' }}
                        className="text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center"
                        onClick={handlePrint}
                    >
                        <span className="mr-1">Print</span> 🖨️
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : dataReady ? (
                <div ref={printSectionRef}>
                    {renderLedgerTable()}
                </div>
            ) : null}
        </div>
    );
};

export default Ledger;
