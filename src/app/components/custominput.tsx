import React from 'react';

interface CustomInputProps {
    name: string;
    type: string;
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }

export const CustomInput: React.FC<CustomInputProps> = ({ name,
    type,
    placeholder = '',
    className = '',
    value,
    onChange, })=>{
  return (
    <div>
        <input
        name={name}
        type={type}
        placeholder={placeholder}
        className={`${className}`}
        value={value}
        onChange={onChange}
        />
    </div>
  )
}
