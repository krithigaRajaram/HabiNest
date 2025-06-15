import React, { useState } from 'react';
import InputField from './InputField';
import axios from 'axios';
import add_habit from '../assets/add_habit.jpg'

const HabitForm = ({ onHabitAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'Daily',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/habits', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onHabitAdded(res.data); 
      setFormData({
        title: '',
        description: '',
        frequency: 'Daily',
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-8">
      
      <h3 className="text-xl font-semibold text-amber-900 mb-4">Add New Habit</h3>
       <div className="flex justify-center mb-4">
        <img
          src={add_habit}
          alt="Add Habit"
          className="w-68 h-auto object-contain"
        />
      </div>
      <InputField label="Title" name="title" type="text" value={formData.title} onChange={handleChange} required/>
      <InputField label="Description" name="description" type="text" value={formData.description} onChange={handleChange} />      
      <div className="mb-4">
        <label className="block text-sm font-medium text-amber-900 mb-1">Frequency</label>
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md bg-amber-50 border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>


      <button
        type="submit"
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
      >
        Add Habit
      </button>
    </form>
  );
};

export default HabitForm;
