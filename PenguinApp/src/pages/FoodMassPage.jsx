// --- Imports ---
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../App.css';
import EggMenu from '../components/eggMenu';
import { useRange } from '../RangeContext';

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

const BASE_API = 'https://server-api-609n.onrender.com';

function FoodMassPage() {
  const { rangeType, setRangeType, startDate, setStartDate, endDate, setEndDate } = useRange();
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [downloadType, setDownloadType] = useState('filtered');
  const [showDropdown, setShowDropdown] = useState(false);
  const [stats, setStats] = useState(null);

  // Helper: is custom range > 2 weeks?
  const isCustomLong =
    rangeType === "custom" &&
    (endDate - startDate) / (1000 * 60 * 60 * 24) > 14;

  useEffect(() => {
  const fetchData = async () => {
    try {
      let res;
      let rawData = [];
      const params = {};

      if (rangeType === 'year') {
        params.year = startDate.getFullYear();
        params.rangeType = 'year';
        res = await axios.get(`${BASE_API}/avgFoodMass`, { params });
        rawData = res.data.map(d => ({
          label: new Date(params.year, d._id.month - 1).toLocaleString('default', { month: 'short' }),
          penguinID: d._id.penguinID,
          foodMass: d.avgFoodMass
        }));
      } else if (rangeType === 'month') {
        params.year = startDate.getFullYear();
        params.month = startDate.getMonth() + 1;
        params.rangeType = 'month';
        res = await axios.get(`${BASE_API}/avgFoodMass`, { params });
        rawData = res.data.map(d => ({
          label: `${d._id.day}`,
          penguinID: d._id.penguinID,
          foodMass: d.avgFoodMass
        }));
      } else {
        // Handles both 'day' and 'custom'
        params.start = startDate.toISOString();
        params.end = endDate.toISOString();
        res = await axios.get(`${BASE_API}/foodMassData`, { params });
        rawData = res.data.map(d => {
          const timestamp = new Date(d.timestamp);
          const isMultiDay = rangeType === 'custom' && endDate.getDate() !== startDate.getDate();
          const label = isMultiDay
            ? timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            timestamp,
            label,
            penguinID: d.penguinID,
            foodMass: d.foodMass
          };
        });
      }

      // Group by label and penguinID
      const labelMap = new Map();
      const penguinMap = {};

      rawData.forEach(d => {
        const key = d.label;
        const sortKey = d.timestamp?.getTime() ?? key;
        labelMap.set(key, sortKey);
        if (!penguinMap[d.penguinID]) penguinMap[d.penguinID] = {};
        penguinMap[d.penguinID][key] = d.foodMass;
      });

      // Sort labels using the timestamp
      const sortedLabels = Array.from(labelMap.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([label]) => label);

      const datasets = Object.keys(penguinMap).map(pid => ({
        label: `Penguin ${pid}`,
        data: sortedLabels.map(label => penguinMap[pid][label] ?? null),
        borderColor: `hsl(${(pid * 120) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(pid * 120) % 360}, 70%, 50%, 0.2)`,
        tension: 0.3,
        fill: false,
        pointRadius: isCustomLong ? 5 : 5,
        pointHoverRadius: isCustomLong ? 5 : 6,
      }));

      const allValues = Object.values(penguinMap).flatMap(p => Object.values(p));
      if (allValues.length > 0) {
        const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
        const sorted = [...allValues].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const max = Math.max(...allValues);
        const min = Math.min(...allValues);
        const stdDev = Math.sqrt(allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allValues.length);

        setStats({ mean, median, max, min, stdDev });
        setChartData({ labels: sortedLabels, datasets });
      } else {
        setStats(null);
        setChartData(null);
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
      url = `${BASE_API}/downloadFoodMassData`;
    } else {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      url = `${BASE_API}/downloadFoodMassDataFiltered?${params.toString()}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = downloadType === 'all' ? 'food_mass_data.csv' : 'filtered_food_mass_data.csv';
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
        text: 'Penguin Food Mass Data',
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
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: 'rgba(75, 192, 192, 1)',
        hitRadius: 0
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Food Mass (g)' }
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

  const chartContainerStyle = {
    flex: '1 1 200px',
    minWidth: '200px',
    maxWidth: '5000px',
    height: '400px',
    boxSizing: 'border-box',
  };

  const statsContainerStyle = {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: '1 1 150px',
    minWidth: '250px',
    maxWidth: '200px',
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
    gap: '5px',
  };

  const dropdownMenuStyle = {
    display: 'flex',
    flexDirection: 'column',
    top: '100%',
    right: 0,
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
          onChange={(e) => setRangeType(e.target.value)}
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
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p>No data available</p>
          )}
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          {stats && (
            <>
              <h3>Statistics</h3>
              <p><strong>Mean:</strong> {stats.mean.toFixed(2)} g</p>
              <p><strong>Median:</strong> {stats.median.toFixed(2)} g</p>
              <p><strong>Max:</strong> {stats.max.toFixed(2)} g</p>
              <p><strong>Min:</strong> {stats.min.toFixed(2)} g</p>
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
        </div>
      </div>
    </div>
  );
}

export default FoodMassPage;