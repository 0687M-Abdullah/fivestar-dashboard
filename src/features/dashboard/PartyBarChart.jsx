import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";
import { BASE_URL } from "../../data/URL";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"];

const PartyBarChart = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [allParties, setAllParties] = useState([]);
    const [selectedParties, setSelectedParties] = useState([]);
    const [salesData, setSalesData] = useState([]);

    // Fetch all parties
    useEffect(() => {
        const fetchParties = async () => {
            try {
                const res = await axios.get(`${BASE_URL}aging-all-companies`);
                const raw = res.data?.recordset || res.data || [];
                const partyList = raw
                    .map(p => {
                        if (typeof p === "object") return p.PartyName || p.Party || p.name || "";
                        return p;
                    })
                    .filter(Boolean)
                    .map(p => ({ label: p, value: p }));
                setAllParties(partyList);
            } catch (err) {
                console.error("Fetch Parties Error:", err);
                setAllParties([]);
            }
        };
        fetchParties();
    }, []);

    // Fetch top 3 parties by sales for selected year
    useEffect(() => {
        const fetchTopParties = async () => {
            try {
                const res = await axios.get(`${BASE_URL}top-parties-sales`, { params: { year } });
                const topParties = (res.data || []).map(d => d.PartyName);
                setSelectedParties(topParties.slice(0, 3)); // pre-select top 3
                setSalesData(res.data || []);
            } catch (err) {
                console.error("Top Parties Fetch Error:", err);
                setSelectedParties([]);
                setSalesData([]);
            }
        };
        fetchTopParties();
    }, [year]);

    // Fetch sales data whenever selectedParties change
    useEffect(() => {
        const fetchSales = async () => {
            if (!selectedParties.length) {
                setSalesData([]);
                return;
            }
            try {
                const res = await axios.get(`${BASE_URL}party-wise-sales`, {
                    params: {
                        year,
                        parties: selectedParties.join(",")
                    }
                });
                setSalesData(res.data || []);
            } catch (err) {
                console.error("Party Sales Fetch Error:", err);
                setSalesData([]);
            }
        };
        fetchSales();
    }, [year, selectedParties]);

    const partyOptions = allParties;

    const datasets = selectedParties.map((party, idx) => {
        const data = months.map((_, mIdx) => {
            const record = salesData.find(r => {
                const partyName = r.PartyName || r.Party || r.party;
                const month = r.Month || r.MonthNo || r.month || r.month_no;
                return partyName === party && Number(month) === mIdx + 1;
            });
            return Number(record?.Total || record?.TotalAmount || 0);
        });
        return {
            label: party,
            data,
            backgroundColor: colors[idx % colors.length]
        };
    });

    const chartData = { labels: months, datasets };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.dataset.label}: Rs.${ctx.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            x: { ticks: { autoSkip: true, maxRotation: 0 } },
            y: { beginAtZero: true, title: { display: true, text: "Sales Amount (Rs.)" } }
        }
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden p-6 min-h-screen">
            <h2 className="text-2xl font-semibold text-center mb-6">
                Party-wise Monthly Sales Comparison
            </h2>

            {/* Filters */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="w-full h-[42px] border rounded px-2 text-sm focus:ring-1 focus:ring-blue-500"
                        >
                            {[2022, 2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Parties */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Parties (max 5)
                        </label>
                        <Select
                            isMulti
                            options={partyOptions}
                            value={partyOptions.filter(p => selectedParties.includes(p.value))}
                            onChange={(selected) => {
                                if (!selected) {
                                    setSelectedParties([]);
                                    return;
                                }
                                if (selected.length > 5) {
                                    alert("Maximum 5 parties allowed");
                                    return;
                                }
                                setSelectedParties(selected.map(c => c.value));
                            }}
                            placeholder="Select up to 5 parties"
                            closeMenuOnSelect={false}
                            styles={{
                                control: (base) => ({ ...base, minHeight: 42 })
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="max-w-6xl mx-auto p-5 overflow-x-hidden">
                {datasets.length ? (
                    <div className="relative h-[420px] w-full">
                        <Bar data={chartData} options={options} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500">
                        {selectedParties.length
                            ? "No sales data for selected parties/year"
                            : "Please select up to 5 parties to view chart"}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PartyBarChart;