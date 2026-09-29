import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const DeleteAppeal = (props: any) => {
  const [loading, setLoading] = useState(false);
  const deleteAppeal = () => {
    setLoading(true);

    AuthApi.delete(
      props.status !== 'academic'
        ? `/ds-appeals/${props.appeal.id}`
        : `/academicAppeals/${props.appeal.id}`,
    )
      .then((res) => {
        notifications.show({
          title: 'Appeal Deleted',
          message: 'The appeal was deleted succesfully',
          color: 'green',
        });
        props.close();
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal not deleted',
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="text-center p-3">
      <p>Are you sure you want to delete this appeal?</p>
      <div className="flex items-center gap-5 mt-5 justify-center">
        <button
          className="border-2 px-4 py-2 rounded-md text-black"
          onClick={() => {
            props.close();
          }}
        >
          Cancel
        </button>
        {loading ? (
          <div className="bg-red-500 px-4 py-2 rounded-md text-white">
            <ClipLoader color="white" size={15} />
          </div>
        ) : (
          <button onClick={deleteAppeal} className="bg-red-500 px-4 py-2 rounded-md text-white">
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default DeleteAppeal;
