import React from 'react';
import '../styles/inputField.css';

const InputField = ({ label, name, type, value, onChange, required }) => (
  <div className="input-field-wrapper">
    <label htmlFor={name} className="input-field-label">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={`Enter your ${label.toLowerCase()}`}
      className="input-field"
    />
  </div>
);

export default InputField;