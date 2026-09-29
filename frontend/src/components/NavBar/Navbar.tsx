'use client';
import { SideBarRoute } from '@/utils/routes';
import { Avatar, Collapse, Kbd, Menu } from '@mantine/core';
import { deleteCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next13-progressbar';
import React, { FC, useState } from 'react';
import logo from '../../assets/rcalogo.png';
import { AccountBtn, LogoutBtn } from '../core/icons';
import { FiSearch } from 'react-icons/fi';
import { spotlight } from '@mantine/spotlight';
import { GoIssueOpened } from 'react-icons/go';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { useUserContext } from '@/context/Usercontext';
import { getFile } from '@/utils/constants';
import RcaLogo from '../core/icons/logo';

interface Props {
  logginPage?: boolean;
  routes: SideBarRoute[];
  rightRoutes: SideBarRoute[];
}

const Navbar: React.FC<Props> = ({ logginPage, routes, rightRoutes }) => {
  const [accountTab, setAccountTab] = useState(false);
  const { user } = useUserContext();
  const path = usePathname();

  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('rcaappuser');
    localStorage.removeItem('token');
    deleteCookie('role');
    deleteCookie('token');
    // router.push('/');
    window.location.reload();
  };
  return (
    <div className="h-[60px] relative flex flex-row justify-between items-center mx-2 my-1 bg-[#EEF5F1] border border-primary/20 p-1 rounded-md  ">
      <Link href={'/'}>
        <RcaLogo />
      </Link>
      {/* <Image alt="Logo" src={logo} width={100} height={25} className=" md:ml-0 ml-9" /> */}
      <div className="flex items-center gap-x-2 w-full justify-end">
        {!logginPage && (
          <button
            onClick={spotlight.open}
            className="hidden sm:flex bg-[white] p-2 py-1.5  items-center font-light   relative w-full max-w-[16em] text-sm text-gray-600 gap-x-2 border rounded-md"
          >
            <FiSearch className="" />
            <span>Search</span>
            <Kbd size="xs" className=" ml-auto">
              Ctrl + K
            </Kbd>
          </button>
        )}
        {!logginPage && rightRoutes && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <button
                onClick={() => {
                  setAccountTab(!accountTab);
                }}
                className="h-10 w-10 flex items-center justify-center overflow-hidden border-2 rounded-full text-[#0357BD96]"
              >
                {user?.profilePicture ? (
                  <Image
                    src={getFile(user?.profilePicture) as string}
                    alt="Profile"
                    width={35}
                    className="rounded-full object-center"
                    height={35}
                  />
                ) : (
                  <AccountBtn />
                )}
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              {rightRoutes?.map((route) => (
                <Menu.Item
                  onClick={() => router.push(route.path)}
                  key={route.path || route.name}
                  leftSection={<route.icon size={route.iconSize ?? 20} />}
                >
                  <Link href={route.path} className="flex flex-row gap-5 items-center">
                    <p className="transition-all duration-200">{route.name}</p>
                  </Link>
                </Menu.Item>
              ))}
              <Menu.Item>
                <Link
                  className="flex items-center gap-x-2"
                  href={'https://github.com/RCA-MIS/rca-mis-issues/issues/new/choose'}
                  target="_blank"
                >
                  <GoIssueOpened size={20} />
                  Report bug/issues
                </Link>
              </Menu.Item>
              <Menu.Item leftSection={<RiLogoutCircleRLine size={20} />} onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
    </div>
  );
};

export default Navbar;
