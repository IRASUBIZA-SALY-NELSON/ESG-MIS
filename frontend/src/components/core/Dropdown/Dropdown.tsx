import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BiCaretDown } from 'react-icons/bi';

interface Props {
  dropHeader: string;
  dDownItems: object[];
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const DropDown = ({ dropHeader, dDownItems, activeTab, setActiveTab }: Props) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="w-full flex flex-col border-[1px] border-[#0A6B4F6d]  my-4 cursor-pointer rounded-lg"
    >
      <header
        onClick={() => setOpenDropdown(!openDropdown)}
        className={`text-[12px] text-[#000000bc] font-semibold pl-3 py-2 bg-[#6d6d6d12] border-[rgba(67, 67, 67, 0.09)]  border-b-[#0A6B4F6d] flex justify-between items-center ${
          !openDropdown ? 'border-0' : ''
        }`}
      >
        {dropHeader}

        <BiCaretDown className={`w-7 h-7 ${openDropdown ? ' rotate-90' : ''}`} />
      </header>

      {openDropdown &&
        dDownItems.map((item: any, index: number) => {
          return (
            <Link
              key={index}
              href={`/student/${item.to}`}
              onClick={() => setActiveTab(item.to)}
              className={`text-[12px] text-[#0000006d] font-semibold pl-3 py-3 bg-[rgba(67, 67, 67, 0.03)] border border-b text-[rgba(67, 67, 67, 0.03)] ${
                index == 2 ? ' border-b-0 rounded' : ''
              } ${activeTab == item.to ? ' bg-[#0A6B4F3c] border border-primary' : ''}`}
            >
              {item.name}
            </Link>
          );
        })}
    </div>
  );
};

export default DropDown;
