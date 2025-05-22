// --- Imports ---
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../App.css';

import { Link } from 'react-router-dom';
import EggMenu from '../components/eggMenu';
import { useRange } from '../RangeContext';
import html2canvas from 'html2canvas'; // Add this import
// --- API URL Setup ---
// Update these endpoints to your actual body size endpoints!
const BASE_API = 'https://server-api-609n.onrender.com';

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

function BodySizePage() {
  const { rangeType, setRangeType, startDate, setStartDate, endDate, setEndDate } = useRange(); // Importing context for date and range management
  const [chartData, setChartData] = useState(null); // State to hold chart data
  const [error, setError] = useState(null); // State to hold error messages
  const [downloadType, setDownloadType] = useState('filtered'); // State to control download type
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const [stats, setStats] = useState(null); // State to hold statistics
  const [showImageDropdown, setShowImageDropdown] = useState(false); // Add this state
  
  // --- Refs for chart and stats (for html2canvas) ---
  const chartStatsRef = useRef(null);
  const chartOnlyRef = useRef(null);

  // Helper: is custom range > 2 weeks?
  const isCustomLong =
    rangeType === "custom" &&
    (endDate - startDate) / (1000 * 60 * 60 * 24) > 14;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        let labels = [];
        let sizes = [];

        if (rangeType === 'year') {
          const year = startDate.getFullYear();
          res = await axios.get(`${BASE_API}/avgBodySize`, { params: { year, rangeType } });
          const data = res.data;
          labels = data.map(d =>
            new Date(year, d._id.month - 1).toLocaleString('default', { month: 'short' })
          );
          sizes = data.map(d => d.avgBodySize);
        } else if (rangeType === 'month') {
          const year = startDate.getFullYear();
          const month = startDate.getMonth() + 1;
          res = await axios.get(`${BASE_API}/avgBodySize`, { params: { year, month, rangeType } });
          const data = res.data;
          labels = data.map(d => `${d._id.day}`);
          sizes = data.map(d => d.avgBodySize);
        } else if (rangeType === 'day') {
          // Fetch all data for the selected day
          const params = {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          };
          res = await axios.get(`${BASE_API}/bodySizeData`, { params });
          const data = res.data;
          labels = data.map(d => {
            const date = new Date(d.timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          });
          sizes = data.map(d => d.bodySize);
        } else {
          const params = rangeType !== 'all' && startDate && endDate
            ? {
                start: startDate.toISOString(),
                end: endDate.toISOString()
              }
            : {};
          res = await axios.get(`${BASE_API}/bodySizeData`, { params });
          const data = res.data;
          labels = data.map(d => {
            const date = new Date(d.timestamp);
            return date.toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
          });
          sizes = data.map(d => d.bodySize);
        }

        if (sizes.length > 0) {
          setChartData({
            labels,
            datasets: [
              {
                label: 'Body Size',
                data: sizes,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: isCustomLong ? 2 : 2,
                pointHoverRadius: isCustomLong ? 2 : 3,
                pointBackgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBorderColor: 'rgba(75, 192, 192, 1)',
                pointHitRadius: 0,
                pointHoverBackgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
              }
            ]
          });

          const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
          const sortedSizes = [...sizes].sort((a, b) => a - b);
          const median = sortedSizes.length % 2 === 0
            ? (sortedSizes[sortedSizes.length / 2 - 1] + sortedSizes[sortedSizes.length / 2]) / 2
            : sortedSizes[Math.floor(sortedSizes.length / 2)];
          const max = Math.max(...sizes);
          const min = Math.min(...sizes);
          const stdDev = Math.sqrt(sizes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sizes.length);

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
      url = `${BASE_API}/downloadBodySizeData`;
    } else {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      url = `${BASE_API}/downloadBodySizeDataFiltered?${params.toString()}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = downloadType === 'all' ? 'body_size_data.csv' : 'filtered_body_size_data.csv';
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
        text: 'Penguin Body Size Estimation Data',
        font: { size: 20 }
      },
      tooltip: {
        enabled: !isCustomLong
      }
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
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Body Size (0-1)'
        }
      }
    }
  };

  // --- Responsive Styles (same as before) ---
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    flexDirection: 'column',
    padding: '0 20px',
    caretColor: 'transparent',
    boxSizing: 'border-box',
  };

  const chartStatsContainerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '100vw',
    boxSizing: 'border-box',
  };

  // Chart container with responsive width and height (copied from TemperaturePage)
  const chartContainerStyle = {
    flex: '1 1 200px',
    minWidth: '200px',
    maxWidth: '5000px',
    width: '100%',
    aspectRatio: '3/1',
    boxSizing: 'border-box',
    height: 'auto',
    minHeight: '300px',
    maxHeight: '850px', // Limit max height so it shrinks with width
  };

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

  const rangeSelectorContainerStyle = {
    display: 'inline-flex',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '400px',
  };

  const customDatePickerContainerStyle = {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const downloadButtonGroupStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: '76px', // Match TemperaturePage gap for consistency
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: '#00aaff',
    border: '1px solid #0077cc',
    zIndex: 1000,
    minWidth: '98%', // Match TemperaturePage for full width
    color: 'white',
    borderRadius: '0 0 5px 5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  };

  // --- Render UI ---
  return (
    <div style={containerStyle}>

      <h1>Body Size Estimation</h1>
      
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
            <div
        ref={chartStatsRef}
        style={{
          ...chartStatsContainerStyle,
          background: '#242424', // Dark background for contrast
          overflow: 'visible', // Prevent clipping of stats
          padding: '10px', // Add padding for better appearance
        }}
      >
        <div style={chartContainerStyle} ref={chartOnlyRef}>
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
              <p><strong>Mean:</strong> {stats.mean.toFixed(3)}</p>
              <p><strong>Median:</strong> {stats.median.toFixed(3)}</p>
              <p><strong>Max:</strong> {stats.max.toFixed(3)}</p>
              <p><strong>Min:</strong> {stats.min.toFixed(3)}</p>
              <p><strong>Std Dev:</strong> {stats.stdDev.toFixed(3)}</p>
            </>
          )}
        </div>
      </div>

      {/* --- Download Buttons --- */}
      <div style={{ marginTop: '20px' }}>
        <div style={downloadButtonGroupStyle}>
          {/* CSV Button + Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
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
              Download Raw Data (CSV) ▼
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
                  Currently Selected Range
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
                  All Data
                </button>
              </div>
            )}
          </div>

          {/* Chart Image Button + Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
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
              onClick={() => setShowImageDropdown(!showImageDropdown)}
            >
              Download Chart Image ▼
            </button>
            {showImageDropdown && (
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
                  onClick={async () => {
                    setShowImageDropdown(false);
                    // Download chart only
                    const chartInstance = window._chartRef && window._chartRef.chartInstance
                      ? window._chartRef.chartInstance
                      : window._chartRef && window._chartRef instanceof Object && window._chartRef;
                    if (chartInstance && chartInstance.toBase64Image) {
                      const url = chartInstance.toBase64Image();
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'body_size_chart.png';
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } else {
                      alert('Chart image download not supported.');
                    }
                  }}
                >
                  Chart Only
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
                  onClick={async () => {
                    setShowImageDropdown(false);
                    // Download chart + stats using html2canvas
                    if (chartStatsRef.current) {
                      const canvas = await html2canvas(chartStatsRef.current);
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'body_size_chart_and_stats.png';
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } else {
                      alert('Chart+Stats image download not supported.');
                    }
                  }}
                >
                  Chart + Statistics
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BodySizePage;