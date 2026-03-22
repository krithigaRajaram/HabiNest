import React, { useState } from 'react';
import InputField from './InputField';
import { createHabit } from '../api/habits';
import { toast } from 'react-toastify';
import '../styles/habitForm.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialState = {
  title: '', description: '', frequency: 'Daily', scheduledDay: '', scheduledDate: '',
};

const HabitForm = ({ onHabitAdded }) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');
    if (formData.frequency === 'Weekly' && formData.scheduledDay === '')
      return toast.error('Please select a day of the week');
    if (formData.frequency === 'Monthly') {
      const d = Number(formData.scheduledDate);
      if (!d || d < 1 || d > 31)
        return toast.error('Please enter a valid date (1–31)');
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      frequency: formData.frequency,
      ...(formData.frequency === 'Weekly' && { scheduledDay: Number(formData.scheduledDay) }),
      ...(formData.frequency === 'Monthly' && { scheduledDate: Number(formData.scheduledDate) }),
    };

    try {
      const { data } = await createHabit(payload);
      onHabitAdded(data);
      toast.success('Habit added!');
      setFormData(initialState);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not add habit');
    }
  };

  return (
    <div className="habit-form-panel">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 className="habit-form-title">New Habit</h3>

        <InputField label="Title" name="title" type="text" value={formData.title} onChange={handleChange} required />
        <InputField label="Description" name="description" type="text" value={formData.description} onChange={handleChange} />

        <div>
          <label className="habit-form-label">Frequency</label>
          <select name="frequency" value={formData.frequency} onChange={handleChange} className="habit-form-select">
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {formData.frequency === 'Weekly' && (
          <div>
            <label className="habit-form-label">Day of the Week</label>
            <select name="scheduledDay" value={formData.scheduledDay} onChange={handleChange} className="habit-form-select">
              <option value="">-- Select --</option>
              {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
            </select>
          </div>
        )}

        {formData.frequency === 'Monthly' && (
          <div>
            <label className="habit-form-label">Day of Month</label>
            <input type="number" name="scheduledDate" min="1" max="31"
              value={formData.scheduledDate} onChange={handleChange} className="habit-form-number" />
          </div>
        )}
      </div>

      <button onClick={handleSubmit} className="habit-form-submit-btn">+ Add Habit</button>
    </div>
  );
};

export default HabitForm;