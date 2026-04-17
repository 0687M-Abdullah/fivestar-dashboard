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

const ProductSalesChart = () => {
    const currentYear = new Date().getFullYear();

    /* -------------------- Filters -------------------- */
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState("");

    const [cities, setCities] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);

    const [parties, setParties] = useState([]);
    const [selectedParties, setSelectedParties] = useState([]);

    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const [salesData, setSalesData] = useState([]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const colors = [
        "#4CAF50", "#2196F3", "#FF9800",
        "#9C27B0", "#F44336", "#00BCD4",
        "#FF5722", "#9E9E9E"
    ];

    /* -------------------- Fetch Filters -------------------- */
    useEffect(() => {
        const mapOptions = (raw, keys) => {
            const seen = new Set();
            return raw
                .map(item => {
                    const value = typeof item === "object"
                        ? keys.map(k => item[k]).find(v => v && v.trim?.())
                        : item;

                    if (!value || seen.has(value)) return null;
                    seen.add(value);
                    return { value, label: value };
                })
                .filter(Boolean);
        };

        const fetchData = async (url, setter, keys) => {
            try {
                const res = await axios.get(`${BASE_URL}${url}`);
                const raw = res.data?.recordset || res.data || [];
                setter(mapOptions(raw, keys));
            } catch (err) {
                console.error(url, err);
                setter([]);
            }
        };

        fetchData("aging-cities", setCities, ["P_City", "City", "city"]);
        fetchData("aging-all-companies", setParties, ["PartyName", "Party"]);
        fetchData("Item-Name", setItems, ["ItemName", "Item"]);
    }, []);

    /* -------------------- Fetch Top 10 Products (Default) -------------------- */
    useEffect(() => {
        if (selectedItems.length) return;

        const fetchTopProducts = async () => {
            try {
                const res = await axios.get(`${BASE_URL}top-products`, { params: { year, month } });
                const seen = new Set();

                const topItems = (res.data || [])
                    .map(i => i.Cotton_QualityDes) // Use backend column name
                    .filter(v => v && v.trim())
                    .filter(v => {
                        if (seen.has(v)) return false;
                        seen.add(v);
                        return true;
                    })
                    .map(v => ({ label: v, value: v }));

                setSelectedItems(topItems);
            } catch (err) {
                console.error("Top Products Error:", err);
            }
        };

        fetchTopProducts();
    }, [year, month]);

    /* -------------------- Fetch Sales -------------------- */
    useEffect(() => {
        if (!selectedItems.length) {
            setSalesData([]);
            return;
        }

        const fetchSales = async () => {
            try {
                const res = await axios.get(`${BASE_URL}product-wise-sales`, {
                    params: {
                        year,
                        month,
                        cities: selectedCities.map(c => c.value).join(","),
                        parties: selectedParties.map(p => p.value).join(","),
                        items: selectedItems.map(i => i.value).join(",")
                    }
                });
                setSalesData(res.data || []);
            } catch (err) {
                console.error("Sales Error:", err);
                setSalesData([]);
            }
        };

        fetchSales();
    }, [year, month, selectedCities, selectedParties, selectedItems]);

    /* -------------------- Chart Data -------------------- */
    const labels = selectedItems.map(i => i.label || "Unknown");

    const values = selectedItems.map(item => {
        const record = salesData.find(
            s => s.Cotton_QualityDes === item.value
        );
        return Number(record?.TotalAmount || 0);
    });

    const data = {
        labels,
        datasets: [
            {
                label: "Sales Amount (Rs.)",
                data: values,
                backgroundColor: labels.map((_, idx) => colors[idx % colors.length]),
                borderRadius: 6,
                barThickness: 40
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "top" },
            tooltip: {
                callbacks: { label: ctx => `Rs. ${ctx.parsed.y.toLocaleString()}` }
            }
        },
        scales: {
            x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 30 } },
            y: { beginAtZero: true, title: { display: true, text: "Amount (Rs.)" } }
        }
    };

    /* -------------------- UI -------------------- */
    return (
        <div style={{ padding: 20 }}>
            <h1 className="text-2xl font-semibold text-center mb-6">Product-wise Sales</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <select
                        value={year}
                        onChange={e => setYear(+e.target.value)}
                        className="w-full h-[42px] border rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {[2022, 2023, 2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Month</label>
                    <select
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="w-full h-[42px] border rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Months</option>
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <Select
                        isMulti
                        options={cities}
                        value={selectedCities}
                        onChange={setSelectedCities}
                        placeholder="Select cities"
                        classNamePrefix="react-select"
                        styles={{ control: base => ({ ...base, minHeight: 42 }) }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Party</label>
                    <Select
                        isMulti
                        options={parties}
                        value={selectedParties}
                        onChange={setSelectedParties}
                        placeholder="Select parties"
                        classNamePrefix="react-select"
                        styles={{ control: base => ({ ...base, minHeight: 42 }) }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Item</label>
                    <Select
                        isMulti
                        options={items}
                        value={selectedItems}
                        onChange={setSelectedItems}
                        placeholder="Select items"
                        classNamePrefix="react-select"
                        styles={{ control: base => ({ ...base, minHeight: 42 }) }}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-hidden">
                {selectedItems.length ? (
                    <div className="relative h-[450px] w-full">
                        <Bar data={data} options={options} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Select items to view chart</p>
                )}
            </div>
        </div>
    );
};

export default ProductSalesChart;
