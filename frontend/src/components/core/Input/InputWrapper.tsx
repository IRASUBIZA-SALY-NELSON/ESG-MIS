import React, { FC } from 'react';

interface Props {
  label?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  error?: React.ReactNode;
}

const InputWrapper: FC<Props> = ({ label, description, className, children, error }) => {
  return (
    <div
      className={`flex w-ful p-1 rounded-md bg-lightPurple  border-gray-300 ring-1 ring-slate-300 duration-300 focus-within:ring-1 focus-within:ring-mainPurple flex-col ${className}`}
    >
      {label && <label className="text-sm px-3 text-gray-900 font-medium">{label}</label>}
      {description && <span className="text-xs px-3 text-gray-500">{description}</span>}
      {children}
      {error && <span className="text-xs px-3 text-red-500">{error}</span>}
    </div>
  );
};

export default InputWrapper;
