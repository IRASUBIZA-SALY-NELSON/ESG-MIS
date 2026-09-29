import LoginForm from '@/components/Login/Form';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login - Ecole des Sciences de Gisenyi',
  description: 'log in to your account',
};

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-1 p-4 overflow-hidden rounded-md border max-w-[450px]">
      <div className="flex flex-col w-full">
        <h2 className="text-[#00000082]  font-extrabold text-[1.3125rem] my-2">
          School Account Login
        </h2>
        <p className="text-[#4343436E] font-medium text-sm my-2">Log In to your account</p>
        <LoginForm />
      </div>
    </div>
  );
}
