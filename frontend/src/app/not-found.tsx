import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'Page not found',
};

const NotFound = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <p className="text-xl">Page not found</p>
    </div>
  );
};

export default NotFound;
