import InputWrapper from '@/components/core/Input/InputWrapper';
import CustomInput from '@/components/core/input';
import AsyncMultiSelect from '@/components/core/selects/AsyncMultiSelect';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import { Teacher } from '@/types/teacher.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { TagsInput, Button, MultiSelect } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';

interface Props {
  onClose: () => void;
  refetch: () => void;
}

const ViewRole: FC<Props> = ({ onClose, refetch }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleAssignLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthApi.put('/teachers/assign/courses');

      notifications.show({
        title: 'Courses Assigned',
        message: 'Courses have been assigned successfully',
        color: 'green',
      });
      refetch();
      onClose();
    } catch (err) {
      const resErr = getResError(err);
      notifications.show({
        title: 'Failed to Update Course',
        message: resErr,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  const [selected, setSelected] = useState<string[]>([]);
  const loadingData = [{ value: 'loading', label: 'Loading...', disabled: true }];
  const privileges = [
    { value: 'report', label: 'Report-cards' },
    { value: 'students', label: 'Students' },
    { value: 'teachers', label: 'Teachers' },
  ];
  return (
    <form className=" w-full flex flex-col gap-y-3 p-12" onSubmit={handleAssignLesson}>
      {/* {loading && <h1 className=" text-xs text-center">Loading...</h1>} */}
      <CustomInput
        label="Name"
        type="text"
        placeholder="The name of your new role"
        name="name"
        required
        // value={className}
        // onChange={(e) => setClassName(e.target.value)}
        // error={error.className}
      />
      <CustomInput
        label="Description"
        name="The description of the new role to be created"
        type="text"
        required
        // value={studentsNumber}
        // onChange={(e) => setStudentsNumber(e.target.value)}
        // error={error.studentsNumber}
      />
      <InputWrapper label="Roles/Allowed Privileges" description="">
        {/* {!loadingCourses && ( */}
        <MultiSelect
          placeholder={'All the roles to be gven'}
          variant="unstyled"
          px={6}
          data={loading ? loadingData : privileges}
          value={loading ? ['loading...'] : selected}
          nothingFoundMessage="No data found"
          onChange={(e) => {
            // const selected = data?.find((item) => item[accessorKey ?? 'id'] === e);

            setSelected(e!);
            //       onChange?.(e);
          }}
          disabled={false}
        />
        {/* )} */}
      </InputWrapper>
    </form>
  );
};

export default ViewRole;
