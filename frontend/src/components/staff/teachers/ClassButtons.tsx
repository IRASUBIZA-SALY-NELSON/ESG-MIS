import React, { FC } from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ClassTabButtons: FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex mt-14">
      <button
        className={`py-2  text-[80%] px-5 rounded-lg ${
          activeTab !== 'a' ? 'bg-[#43434305] text-[bg-primary]' : 'bg-primary text-white font-bold'
        }`}
        onClick={() => setActiveTab('a')}
      >
        A
      </button>
      <button
        className={`py-2  text-[80%] px-5 rounded-lg ${
          activeTab !== 'b' ? 'bg-[#43434305] text-[bg-primary]' : 'bg-primary text-white font-bold'
        }`}
        onClick={() => setActiveTab('b')}
      >
        B
      </button>
      <button
        className={`py-2  text-[80%] px-5 rounded-lg ${
          activeTab !== 'c' ? 'bg-[#43434305] text-[bg-primary]' : 'bg-primary text-white font-bold'
        }`}
        onClick={() => setActiveTab('c')}
      >
        C
      </button>
      <button
        className={`py-2  text-[80%] px-5 rounded-lg ${
          activeTab !== 'd' ? 'bg-[#43434305] text-[bg-primary]' : 'bg-primary text-white font-bold'
        }`}
        onClick={() => setActiveTab('d')}
      >
        D
      </button>
    </div>
  );
};

export default ClassTabButtons;
