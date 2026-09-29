import Footer from '@/components/Footer/Footer';
import React, { FC } from 'react';

interface Props {
  children: React.ReactNode;
}

const PublicLayout: FC<Props> = ({ children }) => {
  return (
    <div className="flex w-full flex-col justify-between">
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
