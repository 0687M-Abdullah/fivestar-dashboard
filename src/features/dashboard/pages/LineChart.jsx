import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { BASE_URL } from "../../../data/URL";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const LineChart = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [currentYearData, setCurrentYearData] = useState([]);
  const [previousYearData, setPreviousYearData] = useState([]);

  useEffect(() => {
    fetchSales(year);
    fetchSales(year - 1, true);
  }, [year]);

  const fetchSales = async (selectedYear, isPrevious = false) => {
    try {
      const res = await axios.get(
        `${BASE_URL}Yearly-Sales?year=${selectedYear}`
      );

      if (isPrevious) {
        setPreviousYearData(res.data);
      } else {
        setCurrentYearData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const labels = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const data = {
    labels,
    datasets: [
      {
        label: `Sales ${year}`,
        data: currentYearData.map(item => item.amount),
        borderColor: "green",         
        backgroundColor: "green",
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: `Sales ${year - 1}`,
        data: previousYearData.map(item => item.amount),
        borderColor: "blue",           
        backgroundColor: "blue",
        tension: 0.4,
        borderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount"
        }
      },
      x: {
        title: {
          display: true,
          text: "Months"
        }
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",  
        marginTop: "10px"
      }}
    >
      <h1 className="text-2xl font-semibold text-center mb-6">Yearly Sales Comparison</h1>

      {/* Year Selection */}
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        style={{ marginBottom: "20px", padding: "6px" }}
      >
        {[2022, 2023, 2024, 2025, 2026].map(y => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <div style={{ width: "90%", maxWidth: "900px", height: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChart;