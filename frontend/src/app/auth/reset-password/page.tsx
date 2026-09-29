import React from 'react';
import ResetFormSteps from './_resetPassword';
import Link from 'next/link';

export const metadata = {
  title: 'Reset Password - Ecole des Sciences de Gisenyi',
  description: 'Reset your password',
};

const ResetPassword = () => {
  return (
    <div className="flex w-full flex-col gap-1 p-4 overflow-hidden rounded-md border max-w-[450px]">
      <div className=" w-full gap-y-4 flex flex-col">
        <h2 className=" font-bold text-xl opacity-80 text-center">Password Reset</h2>
        <ResetFormSteps />
        <div className="flex items-center text-black gap-x-3 ">
          <span>Remember your password?</span>
          <Link href="/auth/login" className=" text-mainPurple font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
