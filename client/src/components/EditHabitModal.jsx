import React, { useEffect, useState } from 'react';
import '../styles/modal.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EditHabitModal = ({ editData, onSave, onCancel }) => {
  const [local, setLocal] = useState(editData);

  useEffect(() => setLocal(editData), [editData]);

  const handleChange = (e) =>
    setLocal((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Edit Habit</h2>

        <input
          type="text"
          name="title"
          value={local.title}
          onChange={handleChange}
          placeholder="Title"
          className="modal-input"
        />

        <textarea
          name="description"
          value={local.description}
          onChange={handleChange}
          placeholder="Description"
          className="modal-textarea"
        />

        <label className="modal-label">Frequency</label>
        <select name="frequency" value={local.frequency} onChange={handleChange} className="modal-select">
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        {local.frequency === 'Weekly' && (
          <>
            <label className="modal-label">Day of the Week</label>
            <select name="scheduledDay" value={local.scheduledDay} onChange={handleChange} className="modal-select">
              <option value="">-- Select a Day --</option>
              {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
            </select>
          </>
        )}

        {local.frequency === 'Monthly' && (
          <>
            <label className="modal-label">Day of the Month</label>
            <input
              type="number"
              name="scheduledDate"
              min="1"
              max="31"
              value={local.scheduledDate}
              onChange={handleChange}
              className="modal-input"
            />
          </>
        )}

        <div className="modal-actions">
          <button onClick={onCancel} className="modal-cancel-btn">Cancel</button>
          <button onClick={() => onSave(local)} className="modal-save-btn">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditHabitModal;