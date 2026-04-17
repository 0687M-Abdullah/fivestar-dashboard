import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const DemandDetails = ({ contractId, onSubmitted }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Input field states
    const [remarks, setRemarks] = useState('');
    const [preparedBy, setPreparedBy] = useState('');
    const [checkedBy, setCheckedBy] = useState('');
    const [approvedBy, setApprovedBy] = useState('');

    useEffect(() => {
        const fetchContracts = async () => {
            if (!contractId) return;

            setLoading(true);
            try {
                // const res = await fetch(`https://athindustries.onrender.com/api/demand-contracts/${contractId}`);
                const res = await fetch(`http://localhost:5000/api/demand-contracts/${contractId}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                const rows = Array.isArray(data) ? data : [data];
                setRecords(rows);

                // Pre-fill remarks if available
                if (rows.length > 0) {
                    setRemarks(rows[0].Remarks || rows[0].Cont_Remarks || '');
                }
            } catch (err) {
                toast.error('Failed to load contract details');
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, [contractId]);

    const handleSubmit = async () => {
        // You can send this data to your backend (POST request) if needed
        if (!approvedBy.trim()) {
            toast.error("Approved By is required!");
            return;
        }

        const { value: password } = await Swal.fire({
            title: 'Enter Approval Password',
            input: 'password',
            inputLabel: 'Approval Password',
            inputPlaceholder: 'Enter password to approve',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true
        });

        if (!password) {
            toast.info('Approval cancelled');
            return;
        }

        const mergedRemark = `${remarks.trim()}  *${approvedBy.trim()}*`;

        try {
            // const response = await fetch('https://athindustries.onrender.com/api/demand-contracts/save-remarks',
            const response = await fetch('http://localhost:5000/api/demand-contracts/save-remarks',
                 {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId,
                    mergedRemark,
                    password,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit');

            toast.success('Submitted successfully!');

            onSubmitted?.(); // Refresh the sidebar and reset
        } catch (err) {
            console.error(err);
            toast.error('Submission failed');
        }
    };

    if (!contractId) return <div className="text-gray-500 italic">Select a contract to view details.</div>;
    if (loading) return <div className="text-gray-600">Loading contract details...</div>;
    if (records.length === 0) return <div className="text-gray-500 italic">No records found for this contract.</div>;

    const header = records[0];
    const totalAmount = records.reduce((sum, r) => sum + (r.Cont_Amount || 0), 0);
    const totalGST = records.reduce((sum, r) => sum + (r.GST_Amt || 0), 0);
    const grandTotal = totalAmount + totalGST;

    return (
        <div className="p-8 bg-white shadow rounded text-sm text-gray-800">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-center mb-2">Demand Contract</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>Contract No:</strong> {header.Cont_No}</div>
                    <div><strong>Contract Date:</strong> {new Date(header.Cont_Date).toLocaleDateString()}</div>
                    <div><strong>Party ID:</strong> {header.Cont_PartyID}</div>
                    <div><strong>Broker ID:</strong> {header.Cont_BrokerID}</div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4 mb-6">
                <table className="min-w-full border border-gray-300 text-xs">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border px-2 py-1">S.No</th>
                            <th className="border px-2 py-1">Product</th>
                            <th className="border px-2 py-1">Product Detail</th>
                            <th className="border px-2 py-1">Feel</th>
                            <th className="border px-2 py-1">Brand</th>
                            <th className="border px-2 py-1">UOM</th>
                            <th className="border px-2 py-1">Quantity</th>
                            <th className="border px-2 py-1">Rate</th>
                            <th className="border px-2 py-1">Amount</th>
                            <th className="border px-2 py-1">GST Rate</th>
                            <th className="border px-2 py-1">GST Amount</th>
                            <th className="border px-2 py-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((item, index) => (
                            <tr key={index} className="text-center">
                                <td className="border px-2 py-1">{index + 1}</td>
                                <td className="border px-2 py-1">{item.Cont_Remarks}</td>
                                <td className="border px-2 py-1">{item.Product_Detail}</td>
                                <td className="border px-2 py-1">{item.Feel}</td>
                                <td className="border px-2 py-1">{item.Brand}</td>
                                <td className="border px-2 py-1">{item.UOM}</td>
                                <td className="border px-2 py-1">{item.Cont_Weight}</td>
                                <td className="border px-2 py-1">{item.Cont_Rate}</td>
                                <td className="border px-2 py-1">{item.Cont_Amount}</td>
                                <td className="border px-2 py-1">{item.GST_Rate}</td>
                                <td className="border px-2 py-1">{item.GST_Amt}</td>
                                <td className="border px-2 py-1">{(item.Cont_Amount || 0) + (item.GST_Amt || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4 mb-2">
                <div><strong>Delivery Date:</strong> {new Date(header.Delivery_Date).toLocaleDateString()}</div>
                <div><strong>Payment Terms:</strong> {header.Payment_Condition}</div>
                <div><strong>Total Amount:</strong> Rs. {totalAmount.toLocaleString()}</div>
                <div><strong>Total GST:</strong> Rs. {totalGST.toLocaleString()}</div>
                <div><strong>Total Payable:</strong> Rs. {grandTotal.toLocaleString()}</div>
                <div>
                    <strong>Remarks:</strong>
                    <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="border rounded px-2 py-1 ml-2 w-80 mt-1"
                        placeholder="Enter remarks"
                    />
                </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 mt-6 text-center">
                <div>
                    <strong>Prepared By : </strong>
                    <input
                        type="text"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                        className="mt-1 border rounded px-2 py-1 w-60"
                        placeholder="Prepared by"
                    />
                </div>
                <div>
                    <strong>Checked By : </strong>
                    <input
                        type="text"
                        value={checkedBy}
                        onChange={(e) => setCheckedBy(e.target.value)}
                        className="mt-1 border rounded px-2 py-1 w-60"
                        placeholder="Checked by"
                    />
                </div>
                <div>
                    <strong><span className="text-red-500">*</span>Approved By : </strong>
                    <input
                        type="text"
                        value={approvedBy}
                        onChange={(e) => setApprovedBy(e.target.value)}
                        className="mt-1 border rounded px-2 py-1 w-60"
                        placeholder="Approved by"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="text-right mt-6">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default DemandDetails;
