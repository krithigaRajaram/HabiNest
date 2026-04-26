import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HabitForm from '../components/HabitForm';
import EditHabitModal from '../components/EditHabitModal';
import { Badge } from '@/components/ui/badge';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckIcon, FireIcon, PlusIcon } from '@heroicons/react/24/solid';
import { getHabits, updateHabit, deleteHabit }           from '../api/habits';
import { getStatusByDate, updateHabitStatus, getStreak }  from '../api/habitStatus';
import '../styles/dashboard.css';

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [habits, setHabits]             = useState([]);
  const [statusMap, setStatusMap]       = useState({});
  const [streakMap, setStreakMap]       = useState({});
  const [editHabit, setEditHabit]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const today        = new Date();
  const todayISO     = useMemo(() => today.toISOString().split('T')[0], []);
  const todayWeekday = today.getDay();
  const todayDate    = today.getDate();
  const todayLabel   = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;

  useEffect(() => {
    (async () => {
      try {
        const [habitRes, statusRes] = await Promise.all([
          getHabits(), getStatusByDate(todayISO),
        ]);
        const map = {};
        statusRes.data.forEach((s) => { map[s.habit] = s.completed; });
        setHabits(habitRes.data);
        setStatusMap(map);
        const entries = await Promise.all(
          habitRes.data.map(async (h) => {
            const { data } = await getStreak(h._id);
            return [h._id, data.currentStreak];
          })
        );
        setStreakMap(Object.fromEntries(entries));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [todayISO]);

  const handleToggle = async (habitId) => {
    const completed = !statusMap[habitId];
    try {
      await updateHabitStatus({ habitId, date: todayISO, completed });
      setStatusMap((p) => ({ ...p, [habitId]: completed }));
      const { data } = await getStreak(habitId);
      setStreakMap((p) => ({ ...p, [habitId]: data.currentStreak }));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      setHabits((p) => p.filter((h) => h._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleSaveEdit = async (updated) => {
    try {
      const { data } = await updateHabit(editHabit._id, updated);
      setHabits((p) => p.map((h) => (h._id === editHabit._id ? data : h)));
      setEditHabit(null);
    } catch (err) { console.error(err); }
  };

  const filtered = habits.filter((h) => {
    if (h.frequency === 'Daily')   return true;
    if (h.frequency === 'Weekly')  return h.scheduledDay === todayWeekday;
    if (h.frequency === 'Monthly') return h.scheduledDate === todayDate;
    return false;
  });

  const sorted = [...filtered].sort(
    (a, b) => (statusMap[a._id] ? 1 : 0) - (statusMap[b._id] ? 1 : 0)
  );

  const completedCount = sorted.filter((h) => statusMap[h._id]).length;
  const total          = sorted.length;
  const progressPct    = total ? Math.round((completedCount / total) * 100) : 0;

  const freqClass = (f) => f === 'Daily' ? 'daily' : f === 'Weekly' ? 'weekly' : 'monthly';
  const freqLabel = (h) => {
    if (h.frequency === 'Daily')   return 'Daily';
    if (h.frequency === 'Weekly')  return `Every ${DAYS[h.scheduledDay]}`;
    if (h.frequency === 'Monthly') return `Day ${h.scheduledDate}`;
  };

  const motivation = () => {
    if (!total)                   return '';
    if (completedCount === total) return 'All done 🎉';
    if (progressPct >= 67)        return 'Almost there!';
    if (progressPct >= 34)        return 'Keep going!';
    return "Let's go!";
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-body">

        {/* ── Habit List ── */}
        <div className="habit-list-panel">
          {/* Header - never scrolls */}
          <div className="habit-list-header">
            <div>
              <h2 className="habit-list-title">Today's Habits</h2>
              <span className="habit-list-date">{todayLabel}</span>
            </div>
            {total > 0 && (
              <Badge variant="secondary" className="done-pill">
                {completedCount} / {total} done
              </Badge>
            )}
          </div>

          {/* Only this scrolls */}
          <div className="habit-list-scroll">
            {loading ? (
              <div className="loading-state">Loading habits…</div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <p>No habits for today.</p>
                <p>Tap <strong>+</strong> to add one.</p>
              </div>
            ) : (
              <div className="habit-list">
                {sorted.map((habit) => {
                  const completed = !!statusMap[habit._id];
                  const streak    = streakMap[habit._id] || 0;
                  return (
                    <div
                      key={habit._id}
                      className={`habit-card freq-${freqClass(habit.frequency)} ${completed ? 'is-completed' : ''}`}
                      onClick={() => navigate(`/habit/${habit._id}`)}
                    >
                      <div className="habit-card-left">
                        <label className="habit-checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={completed}
                            onChange={() => handleToggle(habit._id)}
                            className="habit-checkbox"
                          />
                          <CheckIcon className="habit-checkbox-icon" />
                        </label>
                        <div className="habit-text">
                          <h3 className={`habit-title ${completed ? 'completed' : ''}`}>{habit.title}</h3>
                          {habit.description && (
                            <p className={`habit-desc ${completed ? 'completed' : ''}`}>{habit.description}</p>
                          )}
                          {streak > 0 && (
                            <span className="streak-badge">
                              <FireIcon className="streak-icon" />{streak}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="habit-card-right">
                        <Badge variant="outline" className={`freq-pill freq-pill-${freqClass(habit.frequency)}`}>
                          {freqLabel(habit)}
                        </Badge>
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); setEditHabit(habit); }}>
                          <PencilSquareIcon style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button className="action-btn danger" onClick={(e) => { e.stopPropagation(); handleDelete(habit._id); }}>
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

        {/* ── Stack Panel ── */}
        <div className="stack-panel">
          <p className="stack-heading">Progress</p>
          <p className="stack-day">{DAYS[today.getDay()]}</p>
          {total > 0 ? (
            <>
              <div className="stack-pipe">
                <div className="stack-unfill" style={{ height: `${100 - progressPct}%` }} />
              </div>
              <div className="stack-numbers">
                <span className="stack-count">{completedCount}</span>
                <span className="stack-total"> / {total}</span>
              </div>
              <p className="stack-pct">{progressPct}%</p>
              {motivation() && <p className="stack-motivation">{motivation()}</p>}
            </>
          ) : (
            <p className="stack-empty">No habits yet</p>
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <button className="fab-btn" onClick={() => setShowAddModal(true)} title="Add Habit">
        <PlusIcon style={{ width: '1.1rem', height: '1.1rem' }} />
      </button>

      {/* ── Add Habit Modal (custom — no Shadcn Dialog) ── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Habit</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <HabitForm
              onHabitAdded={(h) => {
                setHabits((p) => [h, ...p]);
                setShowAddModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editHabit && (
        <EditHabitModal
          editData={{
            title:         editHabit.title,
            description:   editHabit.description,
            frequency:     editHabit.frequency,
            scheduledDay:  editHabit.scheduledDay  ?? '',
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