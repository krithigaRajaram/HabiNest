import React, { useState } from 'react';
import { createHabit } from '../api/habits';
import { toast } from 'react-toastify';
import '../styles/habitForm.css';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const init = { title: '', description: '', frequency: 'Daily', scheduledDay: '', scheduledDate: '' };

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
        return toast.error('Please enter a valid date (1–31)');
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
          <label className="hf-label">Day of the Month</label>
          <input
            className="hf-input"
            name="scheduledDate"
            type="number"
            min="1"
            max="31"
            value={form.scheduledDate}
            onChange={handleChange}
            placeholder="1 – 31"
          />
        </div>
      )}

      <button className="hf-submit" onClick={handleSubmit}>
        Add Habit
      </button>
    </div>
  );
};

export default HabitForm;