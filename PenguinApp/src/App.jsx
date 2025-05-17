// --- Imports ---
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './App.css';

// --- API URL Setup ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/tempData'; // Use environment variable or default to localhost

// --- Chart.js Imports and Registration ---
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

// --- Main App Component ---
function App() {
  // --- State Variables ---
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [rangeType, setRangeType] = useState("year"); // Default to year

  const [startDate, setStartDate] = useState(new Date("2025-01-01T00:00:00Z"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31T23:59:59Z"));

  const [stats, setStats] = useState(null);

  const [downloadType, setDownloadType] = useState('filtered'); // default to current chart
  const [showDropdown, setShowDropdown] = useState(false);

  // --- API URL (Override for Render) ---
  const BASE_API = 'https://server-api-609n.onrender.com'; // or your Render URL http://localhost:3000/tempData

  
  // --- Fetch Data and Calculate Stats ---
  useEffect(() => {
    const fetchData = async () => {
    try {
      let res;
      let labels = [];
      let temps = [];

      if (rangeType == 'year') {
        const year = startDate.getFullYear();
        res = await axios.get(`${BASE_API}/avgTemp`, { params: { year ,rangeType} });
        const data = res.data;

        labels = data.map(d =>
          new Date(year, d._id.month - 1).toLocaleString('default', { month: 'short' })
        );
        temps = data.map(d => d.avgTemperature);

      } else if (rangeType == 'month') {
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        res = await axios.get(`${BASE_API}/avgTemp`, { params: { year, month ,rangeType} });
        const data = res.data;

        labels = data.map(d => `${d._id.day}`);
        temps = data.map(d => d.avgTemperature);

      } else {
        const params = rangeType != 'all' && startDate && endDate
          ? {
              start: startDate.toISOString(),
              end: endDate.toISOString()
            }
          : {};
        res = await axios.get(`${BASE_API}/tempData`, { params });
        const data = res.data;

        labels = data.map(d => {
        const date = new Date(d.timestamp);
        return rangeType === "day"
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
});

        temps = data.map(d => d.temperature);
      }

      if (temps.length > 0) {
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

        const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
        const sortedTemps = [...temps].sort((a, b) => a - b);
        const median = sortedTemps.length % 2 === 0
          ? (sortedTemps[sortedTemps.length / 2 - 1] + sortedTemps[sortedTemps.length / 2]) / 2
          : sortedTemps[Math.floor(sortedTemps.length / 2)];
        const max = Math.max(...temps);
        const min = Math.min(...temps);
        const stdDev = Math.sqrt(temps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temps.length);

        setStats({ mean, median, max, min, stdDev });
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

  // --- CSV Download Handler ---
  const handleDownloadCSV = async () => {
    let url = '';
    if (downloadType === 'all') {
      url = 'https://server-api-609n.onrender.com/downloadTempData'; // URL for all data download
    } else {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      url = `https://server-api-609n.onrender.com/downloadTempDataFiltered?${params.toString()}`; // URL for filtered data download
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = downloadType === 'all' ? 'temperature_data.csv' : 'filtered_temperature_data.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Download Error:", err.message);
      alert("Failed to download CSV");
    }
  };

  // --- Render UI ---
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      flexDirection: 'column',
      paddingLeft: 0,
      paddingRight: 0
    }}>
      {/* --- Error Message --- */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- Range Selector --- */}
      <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
        <div
          style={{
            padding: '0px 12px',
            border: '1px solid #0077cc',
            borderRight: 'none',
            borderRadius: '5px 0 0 5px',
            background: '#00aaff',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Select Range:
        </div>
        <select
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value)}
          style={{
            padding: '10px 5px',
            border: '1px solid #0077cc',
            borderLeft: 'none',
            borderRadius: '0 5px 5px 0',
            background: '#ffffff',
            color: '#333',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* --- Date Pickers for Each Range Type --- */}
      {rangeType === "day" && (
        <div style={{ marginBottom: '20px', display: 'inline-block' }}>
          <DatePicker
            selected={startDate}
            onChange={date => {
              setStartDate(date);
              setEndDate(new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1));
            }}
            dateFormat="yyyy-MM-dd"
            className="custom-datepicker"
          />
        </div>
      )}

      {rangeType === "month" && (
        <div style={{ marginBottom: '20px', display: 'inline-block' }}>
          <DatePicker
            selected={startDate}
            onChange={date => {
              const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
              const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
              setStartDate(startOfMonth);
              setEndDate(endOfMonth);
            }}
            dateFormat="yyyy-MM"
            showMonthYearPicker
            className="custom-datepicker"
          />
        </div>
      )}

      {rangeType === "year" && (
        <div style={{ marginBottom: '20px', display: 'inline-block' }}>
          <DatePicker
            selected={startDate}
            onChange={date => {
              const startOfYear = new Date(date.getFullYear(), 0, 1);
              const endOfYear = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
              setStartDate(startOfYear);
              setEndDate(endOfYear);
            }}
            dateFormat="yyyy"
            showYearPicker
            className="custom-datepicker"
          />
        </div>
      )}

      {rangeType === "custom" && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="custom-datepicker"
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="custom-datepicker"
          />
        </div>
      )}

      {/* --- Chart and Statistics Section --- */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* --- Chart --- */}
        <div
          style={{
            width: '100%',
            minWidth: '1000px',
            maxWidth: '3000px',
            height: '533px',
            flex: 1
          }}
        >
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true },
                  title: { display: true, text: 'Penguin Temperature Data', fontSize: 20 }
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

        {/* --- Statistics and Download Section --- */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* --- Statistics --- */}
          {stats && (
            <>
              <h3>Statistics</h3>
              <p>Mean: {stats.mean.toFixed(2)}°C</p>
              <p>Standard Deviation: {stats.stdDev.toFixed(2)}°C</p>
              <p>Max: {stats.max.toFixed(2)}°C</p>
              <p>Min: {stats.min.toFixed(2)}°C</p>
            </>
          )}

          {/* --- Download CSV Buttons and Dropdown --- */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              onClick={handleDownloadCSV}
              style={{ padding: '10px 12px', border: '1px solid #0077cc', borderRight: 'none', borderRadius: '5px 0 0 5px', background: '#00aaff', color: 'white', cursor: 'pointer' }}
            >
              {downloadType === 'all' ? 'Download All CSV' : 'Download Filtered CSV'}
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ padding: '10px', border: '1px solid #0077cc', borderRadius: '0 5px 5px 0', background: '#00aaff', color: 'white', cursor: 'pointer' }}
              >
                ▼
              </button>

              {/* --- Dropdown for Download Type --- */}
              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#00aaff',
                    border: '1px solid #0077cc',
                    zIndex: 1000,
                    minWidth: '180px',
                    color: 'white',
                    borderRadius: '0 0 5px 5px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={() => { setDownloadType('filtered'); setShowDropdown(false); }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: downloadType === 'filtered' ? '#0077cc' : 'transparent',
                      color: 'white',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0077cc'}
                    onMouseLeave={e => e.currentTarget.style.background = downloadType === 'filtered' ? '#0077cc' : 'transparent'}
                  >
                    Download Filtered CSV
                  </div>
                  <div
                    onClick={() => { setDownloadType('all'); setShowDropdown(false); }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: downloadType === 'all' ? '#0077cc' : 'transparent',
                      color: 'white',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0077cc'}
                    onMouseLeave={e => e.currentTarget.style.background = downloadType === 'all' ? '#0077cc' : 'transparent'}
                  >
                    Download All CSV
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Export App Component ---
export default App;