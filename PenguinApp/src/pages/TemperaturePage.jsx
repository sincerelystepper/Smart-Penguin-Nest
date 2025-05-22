// --- Imports ---
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../App.css';

import { Link } from 'react-router-dom';
import EggMenu from '../components/eggMenu'; // Import the EggMenu component
import { useRange } from '../RangeContext'; // Import the useRange hook

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
function TemperaturePage() {
  // --- State Variables ---
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [downloadType, setDownloadType] = useState('filtered');
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState(null);

  const { rangeType, setRangeType, startDate, setStartDate, endDate, setEndDate } = useRange();

  // Helper: is custom range > 2 weeks?
  const isCustomLong =
    rangeType === "custom" &&
    (endDate - startDate) / (1000 * 60 * 60 * 24) > 14;

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
                pointRadius: rangeType === 'custom' ? 2 : 2,
                pointHoverRadius: rangeType === 'custom' ? 2 : 3,
                pointBackgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBorderColor: 'rgba(75, 192, 192, 1)',
                pointHitRadius: 0,
                pointHoverBackgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: isCustomLong ? false : { duration: 1000 },
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Penguin Temperature Data',
        font: { size: 20 }
      },
      tooltip: { enabled: !isCustomLong }
    },
    interaction: {
      mode: !isCustomLong ? 'nearest' : null,
      intersect: false
    },
    elements: {
      point: {
        radius: isCustomLong ? 5 : 5,
        hoverRadius: isCustomLong ? 5 : 6,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        hitRadius: 0
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Temperature (°C)' }
      }
    }
  };

  // --- Responsive Styles ---
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    flexDirection: 'column',
    padding: '0 20px',
    caretColor: 'transparent', // Hide caret for all children
    boxSizing: 'border-box',
  };

  // For the chart and stats container: flex wrap and spacing
  const chartStatsContainerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    flexWrap: 'wrap', // Allow wrapping on small screens
    justifyContent: 'center', // Center children horizontally
    width: '100%',
    maxWidth: '100vw',
    boxSizing: 'border-box',
  };

  // Chart container with responsive width and height
  const chartContainerStyle = {
    flex: '1 1 200px',
    minWidth: '200px',
    maxWidth: '5000px',
    width: '100%',
    height: 'auto',
    maxHeight: '850px',
    minHeight: '300px',
    boxSizing: 'border-box',
  };

  // Stats container with flexible width and padding
  const statsContainerStyle = {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: '1 1 150px',
    minWidth: '150px',
    maxWidth: '160px',
    boxSizing: 'border-box',
    padding: '0 10px',
  };

  // Range selector container with wrap on small screens
  const rangeSelectorContainerStyle = {
    display: 'inline-flex',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '400px',
  };

  // Date picker container for custom ranges on small screens stack vertically
  const customDatePickerContainerStyle = {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  // Download button group container to stack vertically on narrow screens
  const downloadButtonGroupStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: '5px',
  };

  // Style adjustments for dropdown menu to be full width on small screens
  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0, // Aligns dropdown with the left edge of the button group
    background: '#00aaff',
    border: '1px solid #0077cc',
    zIndex: 1000,
    minWidth: '150px',
    color: 'white',
    borderRadius: '0 0 5px 5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  };


  // --- Render UI ---
  return (
    <div style={containerStyle}>

      <h1>Body Temperature</h1>

      <div className="egg-menu-wrapper">
        <EggMenu />
      </div>

      <div className="range-selector-container">
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
            alignItems: 'center',
            minWidth: '110px',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          Select Range:
        </div>
        <select
          value={rangeType}
          onChange={e => {
            const value = e.target.value;
            setRangeType(value);
            if (value == "day") {
              setEndDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1));
            } 
          }}
          className="range-select"
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
            popperProps={{ strategy: 'fixed' }}
            style={{ caretColor: 'transparent' }}
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
            popperProps={{ strategy: 'fixed' }}
            style={{ caretColor: 'transparent' }}
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
            popperProps={{ strategy: 'fixed' }}
            style={{ caretColor: 'transparent' }}
          />
        </div>
      )}
      {rangeType === "custom" && (
        <div style={customDatePickerContainerStyle}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="custom-datepicker"
              popperProps={{ strategy: 'fixed' }}
              style={{ caretColor: 'transparent' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="custom-datepicker"
              popperProps={{ strategy: 'fixed' }}
              style={{ caretColor: 'transparent' }}
            />
          </div>
        </div>
      )}

      {/* --- Chart and Stats Container --- */}
      <div style={chartStatsContainerStyle}>
        {/* Chart */}
        <div style={chartContainerStyle}>
          {chartData ? (
            <Line
              data={chartData}
              options={chartOptions}
              ref={chartRef => { window._chartRef = chartRef; }}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#888',
                minHeight: '200px'
              }}
            >
              No data available
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          {stats && (
            <>
              <h3>Statistics</h3>
              <p><strong>Mean:</strong> {stats.mean.toFixed(2)} °C</p>
              <p><strong>Median:</strong> {stats.median.toFixed(2)} °C</p>
              <p><strong>Max:</strong> {stats.max.toFixed(2)} °C</p>
              <p><strong>Min:</strong> {stats.min.toFixed(2)} °C</p>
              <p><strong>Std Dev:</strong> {stats.stdDev.toFixed(2)}</p>
            </>
          )}
        </div>
      </div>

      {/* --- Download Buttons --- */}
      <div style={{ marginTop: '20px' }}>
        <div style={downloadButtonGroupStyle}>
          <button
            style={{
              borderRadius: '5px 0 0 5px',
              border: '1px solid #0077cc',
              background: '#00aaff',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '8px 15px',
            }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Download CSV ▼
          </button>
          {showDropdown && (
            <div style={dropdownMenuStyle}>
              <button
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 15px',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => {
                  setDownloadType('filtered');
                  setShowDropdown(false);
                  handleDownloadCSV();
                }}
              >
                Download Current Chart Data
              </button>
              <button
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 15px',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => {
                  setDownloadType('all');
                  setShowDropdown(false);
                  handleDownloadCSV();
                }}
              >
                Download All Data
              </button>
            </div>
          )}
          {/* Download Chart Image Button */}
          <button
            style={{
              borderRadius: '0 5px 5px 0',
              border: '1px solid #0077cc',
              background: '#00aaff',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '8px 15px',
            }}
            onClick={() => {
              // Download chart image logic
              const chartInstance = window._chartRef && window._chartRef.chartInstance
                ? window._chartRef.chartInstance
                : window._chartRef && window._chartRef instanceof Object && window._chartRef;
              if (chartInstance && chartInstance.toBase64Image) {
                const url = chartInstance.toBase64Image();
                const link = document.createElement('a');
                link.href = url;
                link.download = 'temperature_chart.png';
                document.body.appendChild(link);
                link.click();
                link.remove();
              } else {
                alert('Chart image download not supported.');
              }
            }}
          >
            Download Chart Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemperaturePage;