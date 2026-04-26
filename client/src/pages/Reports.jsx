import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { TrophyIcon, FireIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../api/axiosInstance';
import '../styles/reports.css';

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch last 365 days of data
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 364);

        const res = await axiosInstance.get('/habit-status/reports/overview', {
          params: {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
          }
        });

        setData(res.data);
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="rp-page">
        <Navbar />
        <div className="rp-loading">Loading reports…</div>
      </div>
    );
  }

  if (!data || data.totalHabits === 0) {
    return (
      <div className="rp-page">
        <Navbar />
        <div className="rp-empty">
          <p>No habits tracked yet</p>
          <p>Start adding habits to see your progress!</p>
        </div>
      </div>
    );
  }

  // Helper: get YYYY-MM-DD in local timezone
  const toLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Group statuses by date (convert from UTC to local)
  const statusByDate = {};
  data.statuses.forEach((s) => {
    const utcDate = new Date(s.date);
    const dateStr = toLocalDateStr(utcDate);
    if (!statusByDate[dateStr]) statusByDate[dateStr] = { total: 0, completed: 0 };
    statusByDate[dateStr].total++;
    if (s.completed) statusByDate[dateStr].completed++;
  });

  // Build 52-week grid
  const today = new Date();
  const grid = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateStr(d);
    const dayData = statusByDate[dateStr];
    const pct = dayData ? Math.round((dayData.completed / dayData.total) * 100) : 0;
    grid.push({ date: d, dateStr, pct, dayData });
  }

  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  // Calculate stats
  const totalDays = Object.keys(statusByDate).length;
  const totalCompletions = data.statuses.filter((s) => s.completed).length;
  const totalPossible = data.statuses.length;
  const overallRate = totalPossible ? Math.round((totalCompletions / totalPossible) * 100) : 0;

  // Best day (highest %)
  let bestDay = { date: null, pct: 0 };
  Object.entries(statusByDate).forEach(([dateStr, d]) => {
    const pct = Math.round((d.completed / d.total) * 100);
    if (pct > bestDay.pct) {
      bestDay = { date: dateStr, pct };
    }
  });

  // Build 30-day trend data for line chart
  const trendData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayData = statusByDate[dateStr];
    const pct = dayData ? Math.round((dayData.completed / dayData.total) * 100) : 0;
    trendData.push({ date: d, dateStr, pct });
  }

  // Get color for cell based on completion %
  const getCellColor = (pct) => {
    if (pct === 0) return 'var(--app-border)';
    if (pct < 34) return '#f97316';   // orange (low)
    if (pct < 67) return '#eab308';   // yellow (medium)
    return '#10b981';                  // green (high)
  };

  return (
    <div className="rp-page">
      <Navbar />

      <div className="rp-body">
        <div className="rp-container">

          <h1 className="rp-title">Reports & Insights</h1>

          {/* Stats cards */}
          <div className="rp-stats">
            <div className="rp-stat-card">
              <div className="rp-stat-icon habits">
                <TrophyIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <div className="rp-stat-value">{data.totalHabits}</div>
                <div className="rp-stat-label">Total Habits</div>
              </div>
            </div>

            <div className="rp-stat-card">
              <div className="rp-stat-icon rate">
                <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <div className="rp-stat-value">{overallRate}%</div>
                <div className="rp-stat-label">Completion Rate</div>
              </div>
            </div>

            <div className="rp-stat-card">
              <div className="rp-stat-icon days">
                <FireIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <div className="rp-stat-value">{totalDays}</div>
                <div className="rp-stat-label">Days Tracked</div>
              </div>
            </div>
          </div>

          {/* Overall calendar */}
          <div className="rp-section">
            <h2 className="rp-section-title">Yearly Overview — Last 52 Weeks</h2>
            <div className="rp-calendar">
              {/* Month labels */}
              <div className="rp-month-labels">
                {weeks.map((week, wIdx) => {
                  const firstDay = week[0].date;
                  const isFirstWeek = firstDay.getDate() <= 7;
                  return (
                    <div key={wIdx} className="rp-month-label">
                      {isFirstWeek ? MONTHS[firstDay.getMonth()] : ''}
                    </div>
                  );
                })}
              </div>

              {/* Day labels */}
              <div className="rp-day-labels">
                {DAYS_SHORT.map((day, i) => (
                  <div key={i} className="rp-day-label">{day}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="rp-grid">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="rp-week">
                    {week.map((cell) => (
                      <div
                        key={cell.dateStr}
                        className="rp-cell"
                        style={{ background: getCellColor(cell.pct) }}
                        title={`${cell.date.toLocaleDateString()} — ${cell.pct}% completed`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="rp-legend">
              <span className="rp-legend-label">Less</span>
              <div className="rp-legend-box" style={{ background: 'var(--app-border)' }} />
              <div className="rp-legend-box" style={{ background: '#f97316' }} />
              <div className="rp-legend-box" style={{ background: '#eab308' }} />
              <div className="rp-legend-box" style={{ background: '#10b981' }} />
              <span className="rp-legend-label">More</span>
            </div>
          </div>

          {/* 30-day trend chart */}
          <div className="rp-section">
            <h2 className="rp-section-title">30-Day Completion Trend</h2>
            <div className="rp-chart-container">
              <svg className="rp-chart" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={200 - (y * 2)}
                    x2="600"
                    y2={200 - (y * 2)}
                    stroke="var(--app-border)"
                    strokeWidth="1"
                  />
                ))}

                {/* Line chart */}
                <polyline
                  points={trendData.map((d, i) => `${(i / 29) * 600},${200 - (d.pct * 2)}`).join(' ')}
                  fill="none"
                  stroke="var(--app-primary)"
                  strokeWidth="2.5"
                />

                {/* Data points */}
                {trendData.map((d, i) => (
                  <circle
                    key={i}
                    cx={(i / 29) * 600}
                    cy={200 - (d.pct * 2)}
                    r="3"
                    fill="var(--app-primary)"
                  />
                ))}
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;