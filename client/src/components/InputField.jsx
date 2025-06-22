import React from 'react';

const InputField = ({ label, name, type, value, onChange ,required}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-amber-900 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  );
};

export default InputField;