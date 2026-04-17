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

const CityBarChart = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [allCities, setAllCities] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [salesData, setSalesData] = useState([]);

    // Fetch all available cities for the dropdown
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await axios.get(`${BASE_URL}aging-cities`);
                const cityData = res.data?.recordset || res.data || [];
                const cityNames = cityData.map(item => {
                    if (typeof item === "object" && item !== null) {
                        return item.P_City || item.City || item.city || "";
                    }
                    return item;
                }).filter(Boolean);
                setAllCities(cityNames);
            } catch (err) {
                console.error("Fetch Cities Error:", err);
                setAllCities([]);
            }
        };
        fetchCities();
    }, []);

    // Fetch top 3 cities by sales for selected year
    useEffect(() => {
        const fetchTopCities = async () => {
            try {
                const res = await axios.get(`${BASE_URL}top-cities-sales`, {
                    params: { year }
                });
                const topCities = (res.data || []).map(d => d.City);
                setSelectedCities(topCities); // Pre-select top cities
                setSalesData(res.data || []);
            } catch (err) {
                console.error("Top Cities Fetch Error:", err);
                setSelectedCities([]);
                setSalesData([]);
            }
        };
        fetchTopCities();
    }, [year]);

    // Fetch sales data whenever selectedCities change
    useEffect(() => {
        const fetchSales = async () => {
            if (!selectedCities.length) {
                setSalesData([]);
                return;
            }
            try {
                const res = await axios.get(`${BASE_URL}city-wise-sales`, {
                    params: {
                        year,
                        cities: selectedCities.join(",")
                    }
                });
                setSalesData(res.data || []);
            } catch (err) {
                console.error("City Sales Fetch Error:", err);
                setSalesData([]);
            }
        };
        fetchSales();
    }, [year, selectedCities]);

    const cityOptions = allCities.map(city => ({ label: city, value: city }));

    const datasets = selectedCities.map((city, idx) => {
        const cityData = months.map((_, monthIndex) => {
            const month = monthIndex + 1;
            const record = salesData.find(r => {
                const recordCity = r.P_City || r.City || r.city || r.CityName;
                const recordMonth = r.Month || r.MonthNo || r.month || r.month_no;
                return recordCity === city && Number(recordMonth) === month;
            });
            return Number(record?.Total || record?.TotalAmount || record?.amount || 0);
        });
        return {
            label: city,
            data: cityData,
            backgroundColor: colors[idx % colors.length],
            borderColor: colors[idx % colors.length],
            borderWidth: 1
        };
    });

    const data = { labels: months, datasets };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.dataset.label}: Rs.${ctx.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: "Sales Amount" } },
            x: { title: { display: true, text: "Months" } }
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-semibold text-center mb-6">
                City-wise Monthly Sales Comparison
            </h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <select
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="w-full h-[42px] border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {[2022, 2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cities */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Cities (Max 5)
                        </label>
                        <Select
                            isMulti
                            options={cityOptions}
                            value={cityOptions.filter(c => selectedCities.includes(c.value))}
                            onChange={(selected) => {
                                if (selected.length > 5) {
                                    alert("Please select maximum 5 cities");
                                    return;
                                }
                                setSelectedCities(selected.map(c => c.value));
                            }}
                            placeholder="Select cities"
                            closeMenuOnSelect={false}
                            classNamePrefix="react-select"
                            styles={{
                                control: base => ({ ...base, minHeight: 42, borderRadius: "0.375rem" })
                            }}
                        />
                    </div>

                </div>
            </div>

            {/* Chart */}
            <div style={{ width: "90%", margin: "0 auto", minHeight: "400px" }}>
                {datasets.length ? (
                    <Bar data={data} options={options} />
                ) : (
                    <p style={{ textAlign: "center", color: "#666" }}>
                        {selectedCities.length ? "No sales data for selected cities/year" : "Please select up to 5 cities to view chart"}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CityBarChart;