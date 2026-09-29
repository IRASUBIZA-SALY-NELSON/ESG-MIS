import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen gap-1 overflow-y-auto">
      <div className="flex items-center flex-col gap-4 justify-center h-full">
        <Image src="/logo.png" width={150} height={150} alt="logo" priority />
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
