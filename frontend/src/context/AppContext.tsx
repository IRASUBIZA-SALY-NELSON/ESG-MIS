import { IReportCard } from '@/types/marks.type';
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext({
  reportCard: null as IReportCard | null,
  setReportCard: (data: IReportCard) => {},
});

export const useApp = () => useContext(AppContext);

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [reportCard, setReportCard] = useState<IReportCard | null>(null);

  return (
    <AppContext.Provider
      value={{
        reportCard,
        setReportCard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
