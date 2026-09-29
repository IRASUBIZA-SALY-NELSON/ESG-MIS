import { Student } from '@/types/student.types';
import Image from 'next/image';
import React from 'react';

type DeleteConfirmationProps = {
  deleteAccount: string;
  currentStudent: Student | null;
  closeModal: () => void;
  deleteStudent: (id: string | undefined) => void;
};

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  currentStudent,
  closeModal,
  deleteStudent,
}) => {
  return (
    <div className="p-2 rounded-lg w-full py-10 text-center">
      <p className="mt-5">Are you sure you want to delete </p>
      <p className="my-5 font-semibold text-lg text-center">
        {currentStudent?.fullName + ' ' + currentStudent?.lastName}dsds
      </p>
      <p>from ESG’s student list? </p>
      <div className="mt-5 flex gap-5 justify-center">
        <button
          onClick={closeModal}
          className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2"
        >
          Cancel
        </button>
        <button
          onClick={() => deleteStudent(currentStudent?.id)}
          className="bg-primary rounded-md text-white px-5 py-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
