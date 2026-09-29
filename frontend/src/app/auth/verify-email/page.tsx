'use client';
import { api } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { RiseLoader } from 'react-spinners';

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null as any);
  const [success, setSuccess] = React.useState(null as any);
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  useEffect(() => {
    if (!email || !code) {
      setLoading(false);
      setError('Invalid verification link');
      return;
    }
    const verifyEmail = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/verify-account', {
          params: {
            email,
            code,
          },
        });
        setSuccess(
          res?.data.data?.message ?? 'Email verified successfully. Check email for password',
        );
      } catch (error) {
        setError(getResError(error) + ' or invalid verification link');
      }
      setLoading(false);
    };
    verifyEmail();
  }, [code, email]);

  return (
    <div className="w-full flex-col flex items-center">
      {loading && (
        <div className="flex flex-col justify-center items-center w-full">
          <RiseLoader color="#024F3A" />
        </div>
      )}
      {error && (
        <div className="flex flex-col justify-center items-center w-full">
          <div className="text-red-500">{error}</div>
        </div>
      )}
      {success && (
        <div className="flex flex-col justify-center items-center w-full">
          <div className="text-green-500">{success}</div>
          <Link className=" text-mainPurple" href="/auth/login">
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
