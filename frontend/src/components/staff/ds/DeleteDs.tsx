'use client';

const DeleteDiscpline = ({ memberName, onCancel, onDelete }: any) => {
  return (
    <div className="p-12 flex flex-col gap-y-8 ">
      <p className={'text-gray-600 text-center font-medium text-[1.3rem]'}>
        Are you sure you want to delete
      </p>
      <h3 className="text-gray-600 text-center font-bold text-[2.7rem] tracking-widest">
        {memberName ?? 'Year 3 A'}
      </h3>
      <p className="text-gray-600 text-center font-medium text-[1.3rem]">
        from ESG&apos; staff list{' '}
      </p>
      <div className="flex justify-center gap-x-12">
        <button
          className="px-6 py-2 bg-[#0A6B4F70] border border-[#0A6B4F70] rounded-lg text-primary-900 "
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-primary-900 border border-primary-900 rounded-lg text-white"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
export default DeleteDiscpline;
