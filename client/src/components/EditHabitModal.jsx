import React from 'react';

const EditHabitModal = ({
  editData,
  setEditData,
  onSave,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-amber-900">Edit Habit</h2>

        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="border w-full p-2 rounded mb-3"
          placeholder="Title"
        />

        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          className="border w-full p-2 rounded mb-4"
          placeholder="Description"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
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
