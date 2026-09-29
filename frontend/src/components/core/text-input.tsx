import React from 'react';
interface IinputElementProps {
  label: string;
  value: any;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder: string;
  type: string;
}
const InputElement = (props: IinputElementProps) => {
  return (
    <div className="bg-[#E7F2EC] border border-[#E7F2EC] rounded-lg flex flex-col py-4 ">
      <label className={'px-4 font-light text-sm'}>{props.label}</label>
      <input
        className={`text-md bg-[#E7F2EC] border-none outline-none ${props.className}`}
        placeholder={props.placeholder}
        type={props.type}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
  );
};
export default InputElement;
