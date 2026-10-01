'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { whitelist } from '@/middlewares/constants';
import { IUser, Profile, UserProfile } from '@/types/user.type';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { deleteCookie, getCookie } from 'cookies-next';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import RiseLoader from 'react-spinners/RiseLoader';
import { HashLoader } from 'react-spinners';

interface GlobalContextProps {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  loading: boolean;
  error: any;
}

const GlobalContext = createContext<GlobalContextProps>({
  user: null,
  setUser: () => {},
  profile: null,
  setProfile: () => {},
  loading: true,
  error: null,
});

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [init, setInit] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const isWhiteListed = whitelist.some((path) => pathname.startsWith(path));

  const getProfile = async () => {
    setLoading(true);
    if (isWhiteListed) return setLoading(false);
    try {
      const res = await AuthApi.get('/auth/profile');

      const data = res.data?.data;

      setProfile(data.person);
      setUser(data.user);
    } catch (error) {
      setError(getResError(error));
      deleteCookie('token');
      deleteCookie('role');
      // router.replace('/auth/login');
      // window.location.href = '/auth/login';
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      setInit(false);
      setLoading(false);
      return;
    }
    getProfile()
      .then(() => {
        //
      })
      .finally(() => {
        setInit(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user && !isWhiteListed && !loading) {
    router.replace('/auth/login');
    return (
      <div className="flex flex-col  justify-center items-center h-screen w-full gap-5">
        <Image
          src="/logo.png"
          width={150}
          height={150}
          alt="ESG Logo"
          className="pulse"
          style={{ width: 150, height: 150 }}
          priority
        />
      </div>
    );
  }

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        loading,
        error,
      }}
    >
      {loading && !isWhiteListed && !user ? (
        <div className="flex flex-col  justify-center items-center h-screen w-full gap-5">
          <Image
            src="/logo.png"
            width={150}
            height={150}
            alt="ESG Logo"
            className="pulse"
            style={{ width: 150, height: 150 }}
            priority
          />
        </div>
      ) : !init ? (
        children
      ) : (
        <div className="flex flex-col  justify-center items-center h-screen w-full gap-5">
          <Image
            src="/logo.png"
            width={150}
            height={150}
            alt="ESG Logo"
            className="pulse"
            style={{ width: 150, height: 150 }}
            priority
          />
        </div>
      )}
    </GlobalContext.Provider>
  );
};

export const useUserContext = () => useContext(GlobalContext);
