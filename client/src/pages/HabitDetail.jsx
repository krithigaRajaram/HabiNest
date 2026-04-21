import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FireIcon } from '@heroicons/react/24/solid';
import { Badge } from '@/components/ui/badge';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';
import { getStreak, getHabitHistory } from '../api/habitStatus';
import '../styles/habitDetail.css';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch habit details
        const habitRes = await axiosInstance.get(`/habits/${id}`);
        setHabit(habitRes.data);

        // Fetch streak
        const streakRes = await getStreak(id);
        setStreak(streakRes.data.currentStreak);

        // Fetch all status data for this habit (last 365 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 364);

        const statusRes = await getHabitHistory(
          id,
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0]
        );

        setStatusData(statusRes.data);
      } catch (err) {
        console.error('Error loading habit detail:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="hd-page">
        <Navbar />
        <div className="hd-loading">Loading…</div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="hd-page">
        <Navbar />
        <div className="hd-loading">Habit not found</div>
      </div>
    );
  }

  // Build status map: { 'YYYY-MM-DD': true/false }
  const statusMap = {};
  statusData.forEach((s) => {
    const dateStr = s.date.split('T')[0];
    statusMap[dateStr] = s.completed;
  });

  // Calculate stats
  const totalDays = statusData.length;
  const completedDays = statusData.filter((s) => s.completed).length;
  const completionRate = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  // Build calendar grid — last 52 weeks (364 days)
  const today = new Date();
  const grid = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const completed = statusMap[dateStr] || false;
    grid.push({ date: d, dateStr, completed });
  }

  // Group by week (7 days per column)
  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  const freqClass = habit.frequency === 'Daily' ? 'daily' : habit.frequency === 'Weekly' ? 'weekly' : 'monthly';

  return (
    <div className="hd-page">
      <Navbar />

      <div className="hd-body">
        <div className="hd-container">

          {/* Back button */}
          <button className="hd-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} />
            Back to Dashboard
          </button>

          {/* Habit header */}
          <div className="hd-header">
            <div>
              <h1 className="hd-title">{habit.title}</h1>
              {habit.description && (
                <p className="hd-description">{habit.description}</p>
              )}
            </div>
            <Badge variant="outline" className={`hd-freq-badge freq-${freqClass}`}>
              {habit.frequency}
            </Badge>
          </div>

          {/* Stats cards */}
          <div className="hd-stats">
            <div className="hd-stat-card">
              <div className="hd-stat-icon streak">
                <FireIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <div className="hd-stat-value">{streak}</div>
                <div className="hd-stat-label">Day Streak</div>
              </div>
            </div>

            <div className="hd-stat-card">
              <div className="hd-stat-icon completed">
                <span>✓</span>
              </div>
              <div>
                <div className="hd-stat-value">{completedDays}</div>
                <div className="hd-stat-label">Completed</div>
              </div>
            </div>

            <div className="hd-stat-card">
              <div className="hd-stat-icon rate">
                <span>{completionRate}%</span>
              </div>
              <div>
                <div className="hd-stat-value">{totalDays} days</div>
                <div className="hd-stat-label">Tracked</div>
              </div>
            </div>
          </div>

          {/* Progress calendar */}
          <div className="hd-calendar-section">
            <h2 className="hd-section-title">Progress — Last 52 Weeks</h2>

            <div className="hd-calendar">
              {/* Month labels */}
              <div className="hd-month-labels">
                {weeks.map((week, wIdx) => {
                  const firstDay = week[0].date;
                  const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                  return (
                    <div key={wIdx} className="hd-month-label">
                      {isFirstWeekOfMonth ? MONTHS[firstDay.getMonth()] : ''}
                    </div>
                  );
                })}
              </div>

              {/* Day labels */}
              <div className="hd-day-labels">
                {DAYS_SHORT.map((day, i) => (
                  <div key={i} className="hd-day-label">{day}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="hd-grid">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="hd-week">
                    {week.map((cell) => (
                      <div
                        key={cell.dateStr}
                        className={`hd-cell ${cell.completed ? 'completed' : 'empty'}`}
                        title={`${cell.date.toLocaleDateString()} — ${cell.completed ? 'Completed' : 'Not done'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HabitDetail;