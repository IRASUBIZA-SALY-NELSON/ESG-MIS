import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

const Classes = () => {
  const allPromos = ['Year 1', 'Year 2', 'Year 3'];
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-col sm:flex-row justify-between">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Classes</h2>
        <p className="text-[rgba(67,67,67,0.43)] my-2">All Classes in ESG</p>
      </div>
      <div className="flex gap-5 items-center">
        {allPromos.map((prom, i) => {
          return (
            <Link href={`/staff/classes/${prom}`} key={i}>
              <div
                className={clsx(
                  'w-[200px] h-[200px] rounded-xl flex items-center justify-center text-xl',
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

export default Classes;
