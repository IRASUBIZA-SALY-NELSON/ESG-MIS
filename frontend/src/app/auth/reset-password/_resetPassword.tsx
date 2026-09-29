'use client';
import Animated from '@/components/core/Animated';
import { api } from '@/utils/constants';
import { PinInput } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { notifications } from '@mantine/notifications';
import { SlRefresh } from 'react-icons/sl';

const ResetFormSteps = () => {
  const [step, setStep] = React.useState(0);
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const initiateReset = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/auth/initiate-reset-password?email=${email}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (step === 1) {
      setLoading(true);
      try {
        const { data } = await api.get(`/auth/verify-reset-code?code=${code}&email=${email}`);
        notifications.show({
          title: 'Code verified!',
          message: 'Code has been verified ',
          color: 'green',
        });
      } catch (err: any) {
        if (err.response.data.success == false) {
          notifications.show({
            title: 'Verification Failed',
            message: err.response.data.message as string,
            color: 'red',
          });
          return;
        }
      } finally {
        setLoading(false);
      }
      router.push(`/auth/reset-password/${code}`);
      return;
    }
    setStep((prev) => prev + 1);
    const params = new URLSearchParams();
    params.append('email', email);
    if (step === 0) {
      await initiateReset();
    }
    localStorage.setItem('resetEmail', JSON.stringify(email));
    router.push(`/auth/reset-password?${params.toString()}`);
  };
  const handleBack = () => {
    if (step === 0) return;
    setStep((prev) => prev - 1);
  };

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) setEmail(email);
  }, [searchParams]);

  return (
    <>
      {step > 0 && <BiArrowBack className="text-mainPurple cursor-pointer" onClick={handleBack} />}
      <div className=" flex gap-y-4 flex-col w-full">
        {step === 0 && (
          <Animated className=" animate-fade-left ">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold">
                Email
              </label>
              <div className="flex w-full flex-col">
                <input
                  type="email"
                  name="email"
                  value={email}
                  id="email"
                  placeholder="Enter your email"
                  className="text-black rounded-md border border-gray-300 border-opacity-9 bg-[#4343430D] w-full px-[1.94rem] py-[1rem]  outline-none focus:outline-none my-2.5  "
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className=" text-sm text-red-600">{error}</span>
              </div>
            </div>
          </Animated>
        )}
        {step === 1 && (
          <div className=" animate-fade-left flex items-center flex-col gap-y-8">
            <span className=" text-sm opacity-80 text-center">
              Please enter the code sent to {email} to succesfuly reset your password
            </span>
            <PinInput
              size="lg"
              placeholder=""
              length={6}
              aria-label="One time code"
              onChange={(value) => {
                setCode(value);
              }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleNext}
          className={`bg-mainPurple hover:bg-primary-900 mt-4 duration-300 text-white rounded-[4em] w-fit px-8 py-3 mx-auto ${
            loading && 'opacity-20'
          }`}
        >
          {loading ? (
            <SlRefresh className="animate-spin ml-2" />
          ) : step === 0 ? (
            'Send Code'
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </>
  );
};

export default ResetFormSteps;
