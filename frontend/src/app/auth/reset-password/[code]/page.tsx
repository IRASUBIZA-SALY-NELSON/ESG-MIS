'use client';
import NotFound from '@/app/not-found';
import { notifications } from '@mantine/notifications';
import MainModal from '@/components/core/modals/modal';
import { api } from '@/utils/constants';
import Link from 'next/link';
import { getResError } from '@/utils/fetch';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const VerifyCode = () => {
  const [email, setEmail] = useState('');
  useEffect(() => {
    const email = JSON.parse(localStorage.getItem('resetEmail')!);
    setEmail(email);
  }, []);
  const [data, setData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { code } = useParams();

  if (!code) return NotFound();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      if (data.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      await api.put('/auth/reset-password', {
        email: email,
        code: String(code),
        newPassword: data.password,
      });
      localStorage.removeItem('resetEmail');
      setSuccess(true);
      notifications.show({
        title: 'Password reset',
        message: 'Password has been reset successfully',
        color: 'green',
      });
    } catch (error) {
      const resErr = getResError(error);
      notifications.show({
        title: 'Password reset failed!',
        message: resErr,
        color: 'red',
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-1 p-4 overflow-hidden rounded-md border max-w-[450px]">
      <form onSubmit={handleSubmit} className="flex w-full gap-y-3 flex-col">
        <h2 className=" font-bold text-xl opacity-80 text-center">Reset Password</h2>
        <span className="text-sm text-gray-500 text-center">
          Enter your new password and confirm it to reset your password
        </span>
        <div className="flex w-full flex-col">
          <label htmlFor="email" className="font-semibold">
            Password
          </label>
          <input
            type="password"
            name=""
            value={data.password}
            id="email"
            placeholder="Enter your password"
            autoComplete="new-password"
            className="text-black rounded-md border border-gray-300 border-opacity-9 bg-[#4343430D] w-full px-[1.94rem] py-[1rem]  outline-none focus:outline-none my-2.5  "
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
          <span className=" text-sm text-red-600">{error}</span>
        </div>
        <div className="flex w-full flex-col">
          <label htmlFor="email" className="font-semibold">
            Confirm Password
          </label>
          <input
            type="password"
            name=""
            value={data.confirmPassword}
            id="email"
            placeholder="Confirm Password"
            autoComplete="new-password"
            className="text-black rounded-md border border-gray-300 border-opacity-9 bg-[#4343430D] w-full px-[1.94rem] py-[1rem]  outline-none focus:outline-none my-2.5  "
            onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            required
          />
          <span className=" text-sm text-red-600">{error}</span>
        </div>
        <button
          type="submit"
          // onClick={handleNext}
          className="bg-mainPurple hover:bg-primary-900 mt-4 duration-300 text-white rounded-[4em] w-fit px-8 py-3 mx-auto"
        >
          Submit
        </button>
      </form>
      <div className="flex mt-6 items-center text-black gap-x-3 ">
        <span>Remember your password?</span>
        <Link href="/auth/login" className=" text-mainPurple font-semibold">
          Login
        </Link>
      </div>
      {success && (
        <MainModal closeOnClickOutside onClose={() => router.push('/auth/login')} isOpen={success}>
          <div className="flex flex-col gap-y-2 items-center">
            <h2 className=" font-bold text-xl opacity-80 text-center">Password Reset</h2>
            <span className="text-sm text-gray-500 text-center">
              Your password has been reseted successfully
            </span>
            <Link
              href="/auth/login"
              // onClick={handleNext}
              className="bg-mainPurple hover:bg-primary-900 mt-4 duration-300 text-white rounded-[4em] w-fit px-8 py-3 mx-auto"
            >
              Go To Login
            </Link>
          </div>
        </MainModal>
      )}
    </div>
  );
};

export default VerifyCode;
