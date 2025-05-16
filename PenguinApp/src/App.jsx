import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/tempData'; // Use environment variable or default to localhost

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [rangeType, setRangeType] = useState("year"); // Default to year

  const [startDate, setStartDate] = useState(new Date("2025-01-01T00:00:00Z"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31T23:59:59Z"));

  const [stats, setStats] = useState(null);

  const API_URL = 'https://server-api-609n.onrender.com/tempData'; // or your Render URL http://localhost:3000/data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = rangeType != "all" && startDate && endDate
          ? {
              start: startDate.toISOString(),
              end: endDate.toISOString()
            }
          : {}; // Empty params for all time

        const res = await axios.get(API_URL, { params }); // Fetch data from the API
        const data = res.data; // Parse the response data

        const labels = data.map(d => 
          new Date(d.timestamp).toLocaleString([], { // Format date and time
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
        const temps = data.map(d => d.temperature); // Extract temperature values

        if (data.length > 0) {
          setChartData({
            labels,
            datasets: [
              {
                label: 'Temperature (°C)',
                data: temps,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: 5
              }
            ]
          });

          // Calculate stats
          const mean = temps.reduce((a, b) => a + b, 0) / temps.length; // Calculate mean
          const sortedTemps = [...temps].sort((a, b) => a - b); // Sort temperatures for median calculation
          const median =
            sortedTemps.length % 2 === 0
              ? (sortedTemps[sortedTemps.length / 2 - 1] + sortedTemps[sortedTemps.length / 2]) / 2
              : sortedTemps[Math.floor(sortedTemps.length / 2)]; // Calculate median
          const max = Math.max(...temps); // Calculate max temperature
          const min = Math.min(...temps); // Calculate min temperature
          const stdDev = Math.sqrt(temps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temps.length); // Calculate standard deviation

          setStats({ mean, median, max, min, stdDev }); // Set stats state
        } else {
          setChartData(null);
          setStats(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, [startDate, endDate, rangeType]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <label>Select Range: </label>
        <select value={rangeType} onChange={(e) => setRangeType(e.target.value)}>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {rangeType == "day" && (
        <div style={{ marginBottom: '20px' }}>
          <DatePicker
            selected={startDate}
            onChange={date => {
              setStartDate(date); // Set startDate to the selected date
              setEndDate(new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1)); // Set endDate to the end of the selected day
            }}
            dateFormat="yyyy-MM-dd"
          />
        </div>
      )}

      {rangeType == "month" && (
        <div style={{ marginBottom: '20px' }}>
          <DatePicker
            selected={startDate}
            onChange={date => {
              const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); // Start of month
              const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999); // End of month
              setStartDate(startOfMonth);
              setEndDate(endOfMonth);
            }}
            dateFormat="yyyy-MM"
            showMonthYearPicker
          />
        </div>
      )}

      {rangeType == "year" && (
        <div style={{ marginBottom: '20px' }}>
          <DatePicker
            selected={startDate}
            onChange={date => {
              const startOfYear = new Date(date.getFullYear(), 0, 1); // Start of year
              const endOfYear = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999); // End of year
              setStartDate(startOfYear);
              setEndDate(endOfYear);
            }}
            dateFormat="yyyy"
            showYearPicker
          />
        </div>
      )}

      {rangeType == "custom" && (
        <div style={{ marginBottom: '20px' }}>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)} // Set startDate to the selected date
            showTimeSelect
            dateFormat="Pp"
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)} // Set endDate to the selected date
            showTimeSelect
            dateFormat="Pp"
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ width: '1600px', height: '533px' }}>
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: true },
                  title: { display: true, text: 'Penguin Temperature Data' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          ) : (
            <p>No data for this range</p>
          )}
        </div>

        {stats && ( // Display stats if available
          <div style={{ textAlign: 'left' }}>
            <h3>Statistics</h3>
            <p>Mean: {stats.mean.toFixed(2)}°C</p>
            <p>Standard Deviation: {stats.stdDev.toFixed(2)}°C</p>
            <p>Max: {stats.max.toFixed(2)}°C</p>
            <p>Min: {stats.min.toFixed(2)}°C</p>
          </div>
        )}
        <a href="https://server-api-609n.onrender.com/downloadTempData" download>
        <button>Download Temperature CSV</button>
        </a>

      </div>
    </div>
  );
}

export default App;