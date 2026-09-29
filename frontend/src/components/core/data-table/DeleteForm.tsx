import React from 'react';
import { Button } from '@mantine/core';

interface DeleteFormProps {
  onCancel: () => void;
  onDelete: () => void;
  title?: string;
  loading?: boolean;
}

const DeleteForm: React.FC<DeleteFormProps> = ({ onCancel, onDelete, title, loading }) => {
  return (
    <div className="flex py-6 flex-col items-center justify-center gap-y-4">
      <span className="text-lg font-semibold text-center">
        Are you sure you want to delete this {title ?? 'item'}?
      </span>
      <div className="flex gap-x-2 w-full max-w-[400px] justify-between">
        <Button
          color="#2F8A68"
          disabled={loading}
          onClick={onCancel}
          className=" bg-mainPurpleLight"
        >
          Cancel
        </Button>
        <Button disabled={loading} className=" bg-red-800" color="red" onClick={onDelete}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteForm;
