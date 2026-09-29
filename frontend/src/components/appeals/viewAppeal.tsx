import { AppealProps } from '@/types/appeal.type';
import CustomInput from '../core/input';
import { Button } from '@mantine/core';

const ViewAppeal = (props: AppealProps | any) => {
  return (
    <div className=" w-full flex p-5 flex-col gap-y-3">
      <CustomInput
        type="text"
        label="Student's Name"
        placeholder="Alice Mukabaranga"
        name="studentsName"
        required
      />
      <CustomInput type="text" label="Marks" name="marks" required />
      <CustomInput type="text" label="Reason for appeal" name="reasonForAppeal" required />
      <div className={'flex w-[45%]  mx-auto'}>
        <Button variant="filled" color="" className=" mt-4 px-4" mx={'auto'}>
          Reject
        </Button>
        <Button
          variant="filled"
          className="bg-mainPurpleLightest mt-4 px-4 text-mainPurple"
          mx={'auto'}
        >
          View
        </Button>
      </div>
    </div>
  );
};
export default ViewAppeal;
