import { ActionIcon, Button } from '@mantine/core';
import React, { FC } from 'react';
import { DeleteIcon } from '../icons/icons1';

interface VarData {
  left: any;
  right: any;
}

type ChangeHandler = (index: number, value: string, type: 'left' | 'right') => void;

interface Props {
  left: (data: VarData['left'], onChange: ChangeHandler, i: number) => React.ReactNode;
  right: (data: VarData['right'], onChange: ChangeHandler, i: number) => React.ReactNode;
  data: VarData[];
}

const VariableInputs: FC<Props> = ({ left, right, data }) => {
  const [inputFields, setInputFields] = React.useState<VarData[]>(data);
  const [error, setError] = React.useState<string>('');

  const handleAddFields = () => {
    // check if the last input field is empty
    const lastInput = inputFields[inputFields.length - 1];
    if (lastInput && (lastInput.left === '' || lastInput.right === '')) {
      setError('Please fill the last input field');
      return;
    }
    const values = [...inputFields];
    values.push({ left: '', right: '' });
    setInputFields(values);
  };

  const handleRemoveFields = (index: number) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };

  const handleChangeInput = (index: number, value: string, type: 'left' | 'right') => {
    setError('');
    const values = [...inputFields];
    if (type === 'left') {
      values[index].left = value;
    } else {
      values[index].right = value;
    }
    setInputFields(values);
  };

  const handleReset = () => {
    setInputFields(data);
  };

  return (
    <div className="flex flex-col gap-y-3">
      {inputFields.map((inputField, index) => (
        <div key={index} className="flex w-full gap-x-3">
          <div className="flex-1">{left(inputField.left, handleChangeInput, index)}</div>
          <div className="flex-1">{right(inputField.right, handleChangeInput, index)}</div>
          <ActionIcon variant="transparent" onClick={() => handleRemoveFields(index)}>
            <DeleteIcon />
          </ActionIcon>
        </div>
      ))}
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex justify-center">
        <Button
          type="button"
          className="w-full h-full flex items-center justify-center bg-green-500 text-white rounded-md"
          onClick={() => handleAddFields()}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default VariableInputs;
