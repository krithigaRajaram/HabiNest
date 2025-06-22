import React, { useState } from 'react';
import InputField from './InputField';
import axios from 'axios';
import add_habit from '../assets/add_habit.jpg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HabitForm = ({ onHabitAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'Daily',
    scheduledDay: '',
    scheduledDate: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.frequency === 'Weekly' && formData.scheduledDay === '') {
      toast.error('Please select a day of the week');
      return;
    }

    if (formData.frequency === 'Monthly') {
      const dateNum = Number(formData.scheduledDate);
      if (!dateNum || dateNum < 1 || dateNum > 31) {
        toast.error('Please enter a valid date (1‑31) for monthly habits');
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      frequency: formData.frequency,
    };

    if (formData.frequency === 'Weekly') {
      payload.scheduledDay = Number(formData.scheduledDay);
    }
    if (formData.frequency === 'Monthly') {
      payload.scheduledDate = Number(formData.scheduledDate);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/habits', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onHabitAdded(res.data);
      toast.success('Habit added successfully!');
      setFormData({
        title: '',
        description: '',
        frequency: 'Daily',
        scheduledDay: '',
        scheduledDate: '',
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.msg || 'Could not add habit');
    }
  };

  return (
    <div className="h-full max-w-sm bg-white shadow-md p-4 md:p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-amber-900 mb-3">Add New Habit</h3>
        <div className="flex justify-center mb-4">
          <img src={add_habit} alt="Add Habit" className="w-56 h-44 object-contain" />
        </div>
        <InputField
          label="Title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <InputField
          label="Description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
        />
        <div className="mb-3">
          <label className="block text-sm font-medium text-amber-900 mb-1">Frequency</label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md bg-amber-50 border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        {formData.frequency === 'Weekly' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-amber-900 mb-1">Select Day of the Week</label>
            <select
              name="scheduledDay"
              value={formData.scheduledDay}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-amber-50 border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              required
            >
              <option value="">-- Select a Day --</option>
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
        )}
        {formData.frequency === 'Monthly' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-amber-900 mb-1">Select Day of the Month</label>
            <input
              type="number"
              name="scheduledDate"
              min="1"
              max="31"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-amber-50 border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
        )}
      </div>
      <div className="pt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Add Habit
        </button>
      </div>
    </div>
  );
};

export default HabitForm;
