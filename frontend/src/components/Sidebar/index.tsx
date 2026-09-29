'use client';
import { SideBarRoute } from '@/utils/routes';
import { Collapse, Overlay } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { MenuDotsIcon } from '../core/icons/icons1';

interface SideBarProps {
  routes: SideBarRoute[];
}

const Sidebar: FC<SideBarProps> = ({ routes }) => {
  const [opened, setOpened] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const path = usePathname();

  const isActiveLink = (linkPath: string, index: number) => {
    if (index === 0) return path === linkPath;
    return path.startsWith(linkPath);
  };

  useEffect(() => {
    setMobileNav(false);
  }, [path]);

  return (
    <>
      {mobileNav && <Overlay zIndex={40} onClick={() => setMobileNav(false)} />}
      <button
        onClick={() => {
          setMobileNav(!mobileNav);
        }}
        className="block absolute top-2.5 left-3 z-50 md:hidden transition-all duration-200 text-black"
      >
        <MenuDotsIcon />
      </button>
      <div
        className={` md:flex md:static absolute top-0 duration-300 ${
          mobileNav ? ' left-0' : '-left-[800px]'
        } w-80 overflow-y-auto md:pt-0 pt-12 z-40 sidebar  bg-[#EEF5F1]  flex-col border text-[#00000075] p-1 rounded-md h-full  md:w-[25vw] lg:w-[20vw]  text-sm`}
      >
        <p className="font-medium my-2 mx-3 hidden md:block transition-all duration-200 text-xl">
          Menu
        </p>
        <div className="">
          {routes.map((route, i) => {
            const key = `${route.path || 'group'}:${route.name}:${i}`;
            if (route.hasSubRoutes && route.routes)
              return (
                <WithSubRoutes
                  key={key}
                  route={route}
                  path={path}
                  opened={opened}
                  setOpened={setOpened}
                />
              );
            return (
              <Link
                key={key}
                href={route.path}
                className={
                  isActiveLink(route.path, i)
                    ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/15 text-primary font-semibold shadow-[inset_3px_0_0_#FCB90A] my-1'
                    : 'flex flex-row gap-5 items-center p-3 rounded-lg hover:bg-primary/20 hover:text-primary my-1'
                }
              >
                <route.icon size={route.iconSize ?? 20} />
                <p className="transition-all duration-200">{route.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

const WithSubRoutes: FC<{ route: SideBarRoute; path: string; opened: string; setOpened: any }> = ({
  route,
  path,
  opened,
  setOpened,
}) => {
  const isActiveLink = (linkPath: string) => path.startsWith(linkPath);
  return (
    <div className=" w-full flex flex-col">
      <button
        className={
          // ? 'flex flex-row gap-5 items-center p-3 rounded-lg bg-primary/20 text-primary my-2'
          'flex flex-row gap-5 bg-transparent items-center p-3 rounded-lg hover:bg-primary/20 hover:text-primary my-1'
        }
        onClick={() => setOpened(opened === route.name ? '' : route.name)}
      >
        <route.icon size={route.iconSize ?? 20} />
        {route.name}
        <BiChevronRight
          size={25}
          className={`ml-auto duration-300 ${opened === route.name ? ' rotate-90' : ' rotate-0'}`}
        />
      </button>
      <Collapse in={opened === route.name}>
        <div className="flex flex-col w-full pl-4">
          {route.routes?.map((subRoute) => (
            <Link
              key={subRoute.path || subRoute.name}
              href={subRoute.path}
              className={
                isActiveLink(subRoute.path)
                  ? 'flex flex-row gap-5 items-center p-2 py-3 rounded-lg bg-primary/15 text-primary font-semibold shadow-[inset_3px_0_0_#FCB90A] my-1'
                  : 'flex flex-row gap-5 items-center p-2 py-3 rounded-lg hover:bg-primary/20 hover:text-primary my-1'
              }
            >
              <subRoute.icon size={subRoute.iconSize ?? 20} />
              <p className=" whitespace-nowrap transition-all duration-200">{subRoute.name}</p>
            </Link>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

export default Sidebar;
