import React from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  showPassword: boolean;
  placeholder?: string;
  toggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function PasswordField({
  label,
  name,
  value,
  showPassword,
  placeholder,
  toggle,
  onChange,
  error
}: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <FiLock />
        </span>

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className={`block w-full pl-10 pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute inset-y-0 right-0 pr-3 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
