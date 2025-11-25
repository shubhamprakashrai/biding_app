import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
}

export default function InputField({
  label,
  name,
  icon,
  value,
  onChange,
  placeholder,
  error
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            {icon}
          </span>
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-3 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
