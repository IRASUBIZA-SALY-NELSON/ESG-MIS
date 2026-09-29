'use client';
import AccountProfile from '@/components/Profile';
import { useUserContext } from '@/context/Usercontext';
import { deleteCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

const AdminProfile = () => {
  return (
    <div className="w-full h-full overflow-x-hidden p-2 text-sm">
      <AccountProfile />
    </div>
  );
};

export default AdminProfile;
