import Link from 'next/link';
import React from 'react';
import clsx from 'clsx';

const Staffs = () => {
  const allPromos = ['Teachers', 'Discpline', 'Accountants', 'Others'];
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-5 text-sm">
      <div className="flex flex-col sm:flex-row justify-between">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Staff</h2>
        <p className="text-[rgba(67,67,67,0.43)] my-2">
          All Staff Members in Ecole des Sciences de Gisenyi
        </p>
      </div>
      <div className=" mt-10 grid grid-cols-2 sm:grid-cols-s lg:grid-cols-5 gap-5">
        {allPromos.map((prom, i) => {
          return (
            <Link href={`/dos/workers/${prom.toLowerCase()}`} key={i}>
              <div
                className={clsx(
                  'w-full h-[150px] rounded-xl flex items-center justify-center text-lg',
                  i % 2 === 0
                    ? 'bg-primary  text-white'
                    : 'bg-[rgba(10,107,79,0.5)]  text-[rgba(10,107,79)]',
                )}
              >
                {prom}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Staffs;
