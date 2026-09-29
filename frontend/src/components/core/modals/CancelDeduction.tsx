import { AuthApi } from '@/utils/constants';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';

interface Props {
  setShowCancel: React.Dispatch<React.SetStateAction<{ show: boolean; deduction: any }>>;
  refetch: () => void;
  deduction: any;
  onClose: () => void;
}

const CancelDeduction = ({ setShowCancel, refetch, deduction, onClose }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      const res = await AuthApi.patch(`/deductions/cancel/${deduction.id}`);

      notifications.show({
        title: 'Deduction cancelled successfully',
        message: '',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Oops! Something went wrong while cancelling the deduction.',
        color: 'red',
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-y-2">
      <p className="text-lg text-center">Are you sure you want to cancel this deduction?</p>
      <div className="flex gap-x-2">
        <Button
          variant="light"
          disabled={loading}
          onClick={() => {
            setShowCancel({ show: false, deduction: null });
          }}
        >
          No
        </Button>
        <Button
          loading={loading}
          disabled={loading}
          variant="filled"
          color="red"
          onClick={handleCancel}
        >
          Yes
        </Button>
      </div>
    </div>
  );
};

export default CancelDeduction;
