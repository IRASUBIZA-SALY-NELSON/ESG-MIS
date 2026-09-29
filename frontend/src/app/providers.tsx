'use client';
import { Next13ProgressBar } from 'next13-progressbar';
import React, { FC, Suspense } from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import { Notifications } from '@mantine/notifications';
import MainSpotLight from '@/components/core/spotlight';
import RiseLoader from 'react-spinners/RiseLoader';
import AppProvider from '@/context/AppContext';
import ThemeProvider from '@/context/ThemeContext';
import { DatesProvider } from '@mantine/dates';

interface Props {
  children: React.ReactNode;
}

const Providers: FC<Props> = ({ children }) => {
  return (
    <MantineProvider
      theme={{
        colors: {
          brand: [
            '#E8F5EF',
            '#C9E8DA',
            '#97D1B7',
            '#62B893',
            '#37A075',
            '#0A6B4F',
            '#024F3A',
            '#013F2E',
            '#012F22',
            '#001F16',
          ],
          gold: [
            '#FFF8E1',
            '#FFEFB8',
            '#FFE38A',
            '#FFD75C',
            '#FDCB33',
            '#FCB90A',
            '#E3A500',
            '#C98F00',
            '#A57500',
            '#7D5900',
          ],
        },
        primaryColor: 'brand',
        primaryShade: 6,
      }}
    >
      <MainSpotLight />
      <Notifications position="top-right" />
      <Next13ProgressBar color="#FCB90A" height={'3px'} options={{ showSpinner: false }} />
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center items-center">
            {/* <RiseLoader color="#024F3A" /> */}
          </div>
        }
      >
        <DatesProvider settings={{ locale: 'en' }}>
          <AppProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AppProvider>
        </DatesProvider>
      </Suspense>
    </MantineProvider>
  );
};

export default Providers;
