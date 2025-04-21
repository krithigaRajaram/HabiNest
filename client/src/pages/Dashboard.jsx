import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HabitForm from '../components/HabitForm';
import { TrashIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/habits', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHabits(res.data);
      } catch (err) {
        console.error('Error fetching habits:', err);
      }
    };
    fetchHabits();
  }, []);
  
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/habits/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setHabits(habits.filter((habit) => habit._id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <Navbar onAddHabitClick={() => setShowForm(true)} />

      {showForm && (
        <HabitForm
          onHabitAdded={(newHabit) => {
            setHabits([...habits, newHabit]);
            setShowForm(false);
          }}
        />
      )}

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">Your Habits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="p-4 rounded-lg shadow-md bg-white border"
              style={{ borderLeft: `6px solid ${habit.color}` }}
            >
              
              <h3 className="text-xl font-semibold text-amber-900">{habit.title}</h3>
              <p className="text-sm text-gray-600">{habit.description}</p>
              <span className="inline-block mt-2 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded">
                {habit.frequency}
              </span>
              <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">{habit.icon}</div>
              <button
                onClick={() => handleDelete(habit._id)}
                className="text-black hover:scale-110 transition-transform duration-200"
                title="Delete Habit"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>



            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
