import { DateInput, DateValue } from '@mantine/dates';
import React, { FC } from 'react';
import AsyncSelect from './selects/AsyncSelect';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  description?: string;
  handleError?: (e: React.FocusEvent<HTMLInputElement>) => void;
} & (
    | {
        type: 'text' | 'number' | 'password' | 'email' | 'tel' | 'url';
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      }
    | {
        type: 'date';
        onChange?: (e: DateValue) => void;
      }
    | {
        type: 'select';
        onChange?: (e: string) => void;
        datasrc?: string;
      }
  );

const CustomInput: FC<Props> = (props) => {
  const {
    label,
    error,
    className,
    description,
    handleError,
    name,
    required,
    onChange,
    children,
    ...rest
  } = props;
  const [_error, _setError] = React.useState(error);

  const _handleError = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!required) return;
    if (!e.target.value || e.target.value === '') {
      _setError(`${e.target.name} is required`);
    } else {
      _setError('');
    }
  };

  const _handleDateError = (e: DateValue) => {
    if (!required) return;
    if (!e || e.toString() === '') {
      _setError(`${name} is required`);
    } else {
      _setError('');
    }
  };

  const _handleSelectError = (e: string) => {
    if (!required) return;
    if (!e || e === '') {
      _setError(`${name} is required`);
    } else {
      _setError('');
    }
  };
  const value = props.value ? new Date(props?.value as any) : null;

  return (
    <div
      className={`flex w-ful p-1 rounded-md bg-lightPurple  border-gray-300 duration-300 focus-within:ring-1 focus-within:ring-mainPurple flex-col ${className}`}
      {...rest}
    >
      {label && <label className="text-sm px-3 text-gray-900 font-medium">{label}</label>}
      {description && <span className="text-xs px-3 text-gray-500">{description}</span>}
      {children ? (
        children
      ) : props.type === 'date' ? (
        <DateInput
          clearable
          label=""
          px="sm"
          // onBlur={}
          onChange={(e) => {
            if (!e) return;
            const val = e;
            onChange && onChange(val as any);
            handleError ? handleError : _handleDateError(e);
          }}
          value={value}
          variant="unstyled"
          className=" outline-none"
          placeholder={props.placeholder}
        />
      ) : props.type === 'select' ? (
        <AsyncSelect
          datasrc={props.datasrc ?? ''}
          placeholder={props.placeholder}
          onChange={(e) => {
            onChange && onChange(e);
            handleError ? handleError : _handleSelectError(e);
          }}
        />
      ) : (
        <input
          className={` bg-lightPurple duration-300 rounded-md px-3 py-2 pb-1 outline-none ${
            _error ? 'border-red-500' : ''
          }`}
          name={name}
          onBlur={handleError ? handleError : required ? _handleError : undefined}
          onChange={(e) => {
            onChange && onChange(e);
            handleError ? handleError : _handleError(e as any);
          }}
          {...rest}
        />
      )}
      {(_error || error) && <span className="text-xs px-3 text-red-500">{_error ?? error}</span>}
    </div>
  );
};

export default CustomInput;
