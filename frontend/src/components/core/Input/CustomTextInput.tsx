import React from 'react';

interface CustomTextInputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  register?: any;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  description,
  error,
  register,
  ...rest
}) => {
  return (
    <div className="flex w-full flex-col">
      {label && <label className="text-sm text-gray-900 font-medium">{label}</label>}
      {description && <span className="text-xs text-gray-500">{description}</span>}
      <input
        className={`w-full mt-1 p-2 rounded-md bg-lightPurple  border-[2px] border-gray-300 duration-500  focus-within:border-mainPurple focus-within:text-mainPurple`}
        {...rest}
        {...register}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default CustomTextInput;
