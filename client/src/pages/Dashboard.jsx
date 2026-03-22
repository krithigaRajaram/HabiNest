import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import HabitForm from '../components/HabitForm';
import EditHabitModal from '../components/EditHabitModal';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckIcon, FireIcon } from '@heroicons/react/24/solid';
import { getHabits, updateHabit, deleteHabit } from '../api/habits';
import { getStatusByDate, updateHabitStatus, getStreak } from '../api/habitStatus';
import '../styles/dashboard.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [streakMap, setStreakMap] = useState({});
  const [editHabit, setEditHabit] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayWeekday = new Date().getDay();
  const todayDate = new Date().getDate();
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitRes, statusRes] = await Promise.all([
          getHabits(), getStatusByDate(todayISO),
        ]);
        const map = {};
        statusRes.data.forEach((s) => { map[s.habit] = s.completed; });
        setHabits(habitRes.data);
        setStatusMap(map);

        const streakEntries = await Promise.all(
          habitRes.data.map(async (h) => {
            const { data } = await getStreak(h._id);
            return [h._id, data.currentStreak];
          })
        );
        setStreakMap(Object.fromEntries(streakEntries));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [todayISO]);

  const handleToggleComplete = async (habitId) => {
    const completed = !statusMap[habitId];
    try {
      await updateHabitStatus({ habitId, date: todayISO, completed });
      setStatusMap((prev) => ({ ...prev, [habitId]: completed }));
      const { data } = await getStreak(habitId);
      setStreakMap((prev) => ({ ...prev, [habitId]: data.currentStreak }));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const handleSaveEdit = async (updated) => {
    try {
      const { data } = await updateHabit(editHabit._id, updated);
      setHabits((prev) => prev.map((h) => (h._id === editHabit._id ? data : h)));
      setEditHabit(null);
    } catch (err) {
      console.error('Error updating habit:', err);
    }
  };

  const filteredHabits = habits.filter((h) => {
    if (h.frequency === 'Daily') return true;
    if (h.frequency === 'Weekly') return h.scheduledDay === todayWeekday;
    if (h.frequency === 'Monthly') return h.scheduledDate === todayDate;
    return false;
  });

  const sortedHabits = [...filteredHabits].sort(
    (a, b) => (statusMap[a._id] ? 1 : 0) - (statusMap[b._id] ? 1 : 0)
  );

  const completedCount = sortedHabits.filter((h) => statusMap[h._id]).length;
  const progressPct = sortedHabits.length ? (completedCount / sortedHabits.length) * 100 : 0;

  const freqClass = (f) => f === 'Daily' ? 'daily' : f === 'Weekly' ? 'weekly' : 'monthly';

  const freqLabel = (h) => {
    if (h.frequency === 'Daily') return 'Daily';
    if (h.frequency === 'Weekly') return `Every ${DAYS[h.scheduledDay]}`;
    if (h.frequency === 'Monthly') return `Day ${h.scheduledDate}`;
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-body">
        <HabitForm onHabitAdded={(h) => setHabits((prev) => [h, ...prev])} />

        <div className="habit-list-panel">
          <div className="habit-list-header">
            <h2 className="habit-list-title">Today's Habits</h2>
            <span className="habit-list-date">{todayLabel}</span>
          </div>

          {/* Progress bar */}
          {!loading && sortedHabits.length > 0 && (
            <div className="progress-bar-wrapper">
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="progress-label">
                <span>{completedCount}</span> / {sortedHabits.length} done
              </span>
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">Loading habits...</div>
          ) : sortedHabits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✦</div>
              <p>No habits scheduled for today.</p>
              <p>Add one from the sidebar to get started.</p>
            </div>
          ) : (
            <div className="habit-list">
              {sortedHabits.map((habit) => {
                const completed = !!statusMap[habit._id];
                const streak = streakMap[habit._id] || 0;

                return (
                  <div key={habit._id} className={`habit-card ${freqClass(habit.frequency)} ${completed ? 'is-completed' : ''}`}>
                    <div className="habit-card-left">
                      <label className="habit-checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={completed}
                          onChange={() => handleToggleComplete(habit._id)}
                          className="habit-checkbox"
                        />
                        <CheckIcon className="habit-checkbox-icon" />
                      </label>

                      <div>
                        <h3 className={`habit-title ${completed ? 'completed' : ''}`}>{habit.title}</h3>
                        {habit.description && (
                          <p className={`habit-description ${completed ? 'completed' : ''}`}>{habit.description}</p>
                        )}
                        {streak > 0 && (
                          <div className="streak-badge">
                            <FireIcon style={{ width: '0.8rem', height: '0.8rem' }} />
                            {streak} day streak
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="habit-card-right">
                      <span className="habit-frequency-label">{freqLabel(habit)}</span>
                      <button onClick={() => setEditHabit(habit)} className="habit-action-btn" title="Edit">
                        <PencilSquareIcon style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button onClick={() => handleDelete(habit._id)} className="habit-action-btn delete" title="Delete">
                        <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editHabit && (
        <EditHabitModal
          editData={{
            title: editHabit.title,
            description: editHabit.description,
            frequency: editHabit.frequency,
            scheduledDay: editHabit.scheduledDay ?? '',
            scheduledDate: editHabit.scheduledDate ?? '',
          }}
          onSave={handleSaveEdit}
          onCancel={() => setEditHabit(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;