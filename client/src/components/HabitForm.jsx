import React, { useState } from 'react';
import { createHabit } from '../api/habits';
import { toast } from 'react-toastify';
import '../styles/habitForm.css';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const init = { title: '', description: '', frequency: 'Daily', scheduledDay: '', scheduledDate: '' };

// Days that don't exist in every month
const DATE_WARNINGS = {
  29: { type: 'info', message: 'Feb 29 only exists on leap years — you won\'t be notified in non-leap years.' },
  30: { type: 'info', message: 'February has only 28–29 days — you won\'t be notified in February.' },
  31: { type: 'info', message: 'Only Jan, Mar, May, Jul, Aug, Oct & Dec have 31 days — other months will be skipped.' },
};

const MonthCalendar = ({ value, onChange }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const selected = value ? Number(value) : null;

  return (
    <div className="hf-calendar">
      <div className="hf-calendar-grid">
        {days.map((day) => {
          const warn = DATE_WARNINGS[day];
          return (
            <button
              key={day}
              type="button"
              className={[
                'hf-cal-day',
                selected === day ? 'hf-cal-day--selected' : '',
                warn?.type === 'info' ? 'hf-cal-day--warn' : '',
              ].join(' ')}
              onClick={() => onChange(String(day))}
              title={warn?.message || ''}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selected && DATE_WARNINGS[selected] && (
        <div className="hf-cal-notice">
          <span className="hf-cal-notice-icon">ℹ️</span>
          {DATE_WARNINGS[selected].message}
        </div>
      )}
    </div>
  );
};

const HabitForm = ({ onHabitAdded }) => {
  const [form, setForm] = useState(init);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleSubmit = async () => {
    if (!form.title.trim())
      return toast.error('Title is required');
    if (form.frequency === 'Weekly' && form.scheduledDay === '')
      return toast.error('Please select a day of the week');
    if (form.frequency === 'Monthly') {
      const d = Number(form.scheduledDate);
      if (!d || d < 1 || d > 31)
        return toast.error('Please select a day from the calendar');
    }

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      frequency:   form.frequency,
      ...(form.frequency === 'Weekly'  && { scheduledDay:  Number(form.scheduledDay) }),
      ...(form.frequency === 'Monthly' && { scheduledDate: Number(form.scheduledDate) }),
    };

    try {
      const { data } = await createHabit(payload);
      onHabitAdded(data);
      toast.success('Habit added!');
      setForm(init);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not add habit');
    }
  };

  return (
    <div className="hf-form">

      <div className="hf-field">
        <label className="hf-label">Title</label>
        <input
          className="hf-input"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Drink 3L of water"
          autoFocus
        />
      </div>

      <div className="hf-field">
        <label className="hf-label">
          Description <span className="hf-optional">(optional)</span>
        </label>
        <input
          className="hf-input"
          name="description"
          type="text"
          value={form.description}
          onChange={handleChange}
          placeholder="Brief note about this habit"
        />
      </div>

      <div className="hf-field">
        <label className="hf-label">Frequency</label>
        <select
          className="hf-select"
          name="frequency"
          value={form.frequency}
          onChange={handleChange}
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {form.frequency === 'Weekly' && (
        <div className="hf-field">
          <label className="hf-label">Day of the Week</label>
          <select
            className="hf-select"
            name="scheduledDay"
            value={form.scheduledDay}
            onChange={handleChange}
          >
            <option value="">— Select a day —</option>
            {DAYS.map((day, i) => (
              <option key={i} value={i}>{day}</option>
            ))}
          </select>
        </div>
      )}

      {form.frequency === 'Monthly' && (
        <div className="hf-field">
          <label className="hf-label">
            Day of the Month
            {form.scheduledDate && (
              <span className="hf-optional"> — {form.scheduledDate}{getOrdinal(Number(form.scheduledDate))}</span>
            )}
          </label>
          <MonthCalendar
            value={form.scheduledDate}
            onChange={(val) => set('scheduledDate', val)}
          />
        </div>
      )}

      <button className="hf-submit" onClick={handleSubmit}>
        Add Habit
      </button>
    </div>
  );
};

function getOrdinal(n) {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export default HabitForm;