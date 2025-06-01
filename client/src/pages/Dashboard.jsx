import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HabitForm from '../components/HabitForm';
import { TrashIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);

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
  <div className="flex flex-col h-screen overflow-hidden bg-amber-50">
      <Navbar />
      <div className="flex flex-1 h-full overflow-hidden">
        
        <div className="w-full md:w-1/3">
          <HabitForm
            onHabitAdded={(newHabit) => {
              setHabits([...habits, newHabit]);
            }}
          />
        </div>


        <div className="w-full md:w-2/3 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-amber-900">Your Habits</h2>
          <div className="flex flex-col gap-4">

            {habits.map((habit) => (
             <div key={habit._id} className="p-4 rounded-lg shadow-md bg-white border flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-amber-900">{habit.title}</h3>
                <p className="text-sm text-gray-600">{habit.description}</p>
              </div>

              <button
                onClick={() => handleDelete(habit._id)}
                className="text-black hover:scale-110 transition-transform duration-200 ml-4"
                title="Delete Habit"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
