import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HabitForm from '../components/HabitForm';
import EditHabitModal from '../components/EditHabitModal';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [editHabit, setEditHabit] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitRes, statusRes] = await Promise.all([
          axios.get('http://localhost:5000/api/habits', { headers }),
          axios.get(`http://localhost:5000/api/habit-status/${todayISO}`, {
            headers,
          }),
        ]);

        const map = {};
        statusRes.data.forEach((s) => {
          map[s.habit] = s.completed;
        });

        setHabits(habitRes.data);
        setStatusMap(map);
      } catch (err) {
        console.error('Error loading data', err);
      }
    };

    fetchData();
  }, [todayISO]);

  const handleToggleComplete = async (habitId) => {
    const completed = !statusMap[habitId];

    try {
      await axios.post(
        'http://localhost:5000/api/habit-status',
        { habitId, date: todayISO, completed },
        { headers }
      );

      setStatusMap((prev) => ({ ...prev, [habitId]: completed }));
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/habits/${id}`, { headers });
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const sortedHabits = [...habits].sort(
    (a, b) => (statusMap[a._id] ? 1 : 0) - (statusMap[b._id] ? 1 : 0)
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-amber-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-1/3">
          <HabitForm
            onHabitAdded={(newHabit) =>
              setHabits((prev) => [...prev, newHabit])
            }
          />
        </div>

        <div className="w-full md:w-2/3 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-amber-900">
            Your Habits
          </h2>

          <div className="flex flex-col gap-4">
            {sortedHabits.map((habit) => {
              const completed = statusMap[habit._id];

              return (
                <div
                  key={habit._id}
                  className="p-4 rounded-lg shadow-md bg-white border flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <label className="relative flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!completed}
                        onChange={() => handleToggleComplete(habit._id)}
                        className="peer appearance-none h-6 w-6 rounded-full border-2 border-amber-600 checked:bg-amber-600 transition-colors duration-200"
                      />
                      <CheckIcon
                        className="absolute h-4 w-4 text-white pointer-events-none left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                      />
                    </label>

                    <div>
                      <h3
                        className={`text-xl font-semibold ${
                          completed
                            ? 'line-through text-gray-400'
                            : 'text-amber-900'
                        }`}
                      >
                        {habit.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          completed
                            ? 'text-gray-400 line-through'
                            : 'text-gray-600'
                        }`}
                      >
                        {habit.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        setEditHabit(habit);
                        setEditData({
                          title: habit.title,
                          description: habit.description,
                        });
                      }}
                      className="text-black hover:scale-110 transition-transform duration-200 ml-1"
                      title="Edit Habit"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(habit._id)}
                      className="text-black hover:scale-110 transition-transform duration-200 ml-4"
                      title="Delete Habit"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editHabit && (
        <EditHabitModal
          editData={editData}
          setEditData={setEditData}
          onCancel={() => setEditHabit(null)}
          onSave={async () => {
            try {
            console.log("Saved");
              const res = await axios.put(
                `http://localhost:5000/api/habits/${editHabit._id}`,
                editData,
                { headers }
              );
              setHabits((prev) =>
                prev.map((h) => (h._id === editHabit._id ? res.data : h))
              );
              setEditHabit(null);
            } catch (err) {
              console.error('Error updating habit', err);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
