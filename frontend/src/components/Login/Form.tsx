'use client';
import { api } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { getRolePath } from '@/utils/funcs';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getCookie, setCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BiX } from 'react-icons/bi';
import * as yup from 'yup';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const isOauth = searchParams.get('oauth') === 'true';

  useEffect(() => {
    const auth = async () => {
      const token = getCookie('token');
      const role = getCookie('role');
      if (token) {
        if (role === 'ADMIN') {
          router.push('/staff');
        } else {
          router.push('/student');
        }
      }
    };
    auth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState(false);
  const [showingPw, setShowingPw] = useState(true);
  const schema = yup.object().shape({
    email: yup
      .string()
      .email('Please provide a valid email address')
      .required('Please provide an email address'),
    password: yup.string().required('Please enter password'),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleOauth = async (token: string) => {
    setLoading(true);
    // redirect to page requested token (login with this app)
    // window.location.href = `${redirect}?token=${token}`;
    const hasQuery = redirect?.includes('?');
    const separator = hasQuery ? '&' : '?';
    window.location.href = `${redirect}${separator}token=${token}`;
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    api
      .post(`/auth/login`, data)
      .then(async (res) => {
        const token = res.data?.data?.token;
        setCookie('token', token, { maxAge: 60 * 60 * 24 });
        setCookie('role', res.data.data.roles[0].roleName, { maxAge: 60 * 60 * 24 });
        localStorage.setItem('rcaappuser', JSON.stringify(res.data?.data?.user));
        const role = res.data?.data?.roles[0].roleName;
        if (isOauth) {
          handleOauth(token);
          return;
        }
        window.location.href = getRolePath(role);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.data?.message === 'Incorrect Email or Password') {
          notifications.show({
            title: 'Incorrect Email or Password',
            message: 'Please provide correct credentials',
            color: 'red',
            icon: <BiX size={25} />,
          });
        } else {
          notifications.show({
            title: 'Login failed',
            message: getResError(err),
            color: 'red',
            icon: <BiX size={25} />,
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <input
        type="text"
        className="text-black rounded-md border border-gray-300 border-opacity-9 bg-[#4343430D] w-full px-[1.94rem] py-[1rem] outline-none focus:outline-none my-2.5 "
        placeholder="Email"
        autoComplete="email"
        {...register('email')}
      />
      <p className="text-red-500">{errors.email?.message}</p>
      <div className="relative">
        <input
          type={!showingPw ? 'text' : 'password'}
          className="text-black rounded-md border border-gray-300 border-opacity-9 bg-[#4343430D] w-full px-[1.94rem] py-[1rem]  outline-none focus:outline-none my-2.5  "
          placeholder="Password"
          autoComplete="current-password"
          {...register('password')}
        />
        <button
          type="button"
          className="absolute top-[38%] right-2"
          onClick={() => setShowingPw(!showingPw)}
        >
          {showingPw ? <AiOutlineEye size={25} /> : <AiOutlineEyeInvisible size={25} />}
        </button>
      </div>
      <p className="text-red-500">{errors.password?.message}</p>
      <div className="my-2.5 flex flex-row justify-between">
        <div className="flex flex-row gap-5">
          <input
            type="checkbox"
            name="remember"
            id="remember"
            className="w-[1rem] h-[1rem] rounded-[0.5rem] border-[#D9D9D9]"
          />
          <p className="text-[#4343436D] text-sm font-medium">Remember Me</p>
        </div>
        <Link href={'/auth/reset-password'} className="font-medium text-primary text-sm">
          Forgot my password
        </Link>
      </div>
      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className=" mx-auto text-sm mt-4"
        radius={100}
        size="lg"
        classNames={{
          inner: 'text-base',
          label: 'text-base',
          loader: ' h-fit flex items-center',
        }}
        // py={15}
        px={rem(60)}
      >
        Login
      </Button>
      {/* {!loading ? (
        <input
          type="submit"
          value="Login"
          className="cursor-pointer flex justify-center mx-auto mt-6 rounded-full border border-[#2955C56E] border-opacity-43 bg-primary text-white px-[3.5rem]  py-3 my-2.5 text-[1rem] w-[60%]"
        />
      ) : (
        <button
          type="button"
          className="cursor-pointer flex justify-center mx-auto mt-6 rounded-full border border-[#2955C56E] border-opacity-43 bg-primary text-white px-[3.5rem]  py-3 my-2.5 text-[1rem] w-[60%]"
        >
          <ClipLoader color="white" size={15} />
        </button>
      )} */}
    </form>
  );
};

export default LoginForm;
