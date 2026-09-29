import Link from 'next/link';
import React from 'react';

const Footer = ({ role }: { role?: string }) => {
  return (
    <div
      className={`h-[30px] flex flex-row ${role === 'student' ? ' justify-between' : 'justify-end'} items-center mx-2    bg-[#D9D9D975] border border-[#43434305] p-1 py-2 rounded-md mb-1`}
    >
      {role === 'student' && (
        <h5 className="text-[80%] text-[#000000]">
          Yooo, if the web interface ain't your jam, just roll with{' '}
          <Link href={`/public/cmd`} className="text-[#4261ff] font-semibold">
            command line
          </Link>
        </h5>
      )}
      <h5 className="text-[80%] text-[#000000]">
        🙌🏻 Credits to all this platform{'  '}
        <Link href={`/public/maintainers`} className="text-[#4261ff] font-bold">
          Maintainers
        </Link>
      </h5>
    </div>
  );
};

export default Footer;
