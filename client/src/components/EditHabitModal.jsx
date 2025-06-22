import React, { useState, useEffect } from 'react';

const EditHabitModal = ({ editData, setEditData, onSave, onCancel }) => {
  const [local, setLocal] = useState(editData);

  useEffect(() => setLocal(editData), [editData]);

  const handleChange = (e) =>
    setLocal({ ...local, [e.target.name]: e.target.value });

  const handleSubmit = () => onSave(local);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-amber-900">Edit Habit</h2>

        <input
          type="text"
          name="title"
          value={local.title}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-3"
          placeholder="Title"
        />

        <textarea
          name="description"
          value={local.description}
          onChange={handleChange}
          className="border w-full p-2 rounded mb-4"
          placeholder="Description"
        />

        <label className="block text-sm font-medium text-amber-900 mb-1">
          Frequency
        </label>
        <select
          name="frequency"
          value={local.frequency}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md mb-4 bg-amber-50"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        {local.frequency === 'Weekly' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Day of the Week
            </label>
            <select
              name="scheduledDay"
              value={local.scheduledDay}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-amber-50"
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

        {local.frequency === 'Monthly' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Day of the Month
            </label>
            <input
              type="number"
              name="scheduledDate"
              min="1"
              max="31"
              value={local.scheduledDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-amber-50"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-amber-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHabitModal;
