import './globals.css';
import '@mantine/core/styles.css';
import { UserContextProvider } from '@/context/Usercontext';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import React from 'react';

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
// });

export const metadata: Metadata = {
  title: 'ESG MIS · Ecole des Sciences de Gisenyi',
  description: 'School management system of Ecole des Sciences de Gisenyi for students, teachers, parents and staff',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '256x256' }],
    apple: '/favicon.png',
  },
};

const RootLayout = async ({ children, modal }: any) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` bg-[#F5FAF7]`} suppressHydrationWarning>
        <div className="bg-[#F5FAF7] w-full h-screen">
          <UserContextProvider>
            <Providers>
              {children}
              {modal}
            </Providers>
            <Toaster position="top-right" reverseOrder={false} />
          </UserContextProvider>
        </div>
      </body>
    </html>
  );
};
export default RootLayout;
