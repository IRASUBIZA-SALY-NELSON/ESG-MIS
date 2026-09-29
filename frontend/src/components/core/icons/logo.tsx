import React from 'react';
import Image from 'next/image';

const RcaLogo = () => {
  return (
    <div className="flex items-center cursor-pointer h-11 w-fit ">
      <Image
        alt="Logo"
        src={'/logo.png'}
        width={50}
        height={100}
        className=" md:ml-0 ml-9 h-full"
      />
      <span className="ml-1.5 whitespace-nowrap leading-[1.1] text-[0.55em] text-primary">
        Ecole des <br />
        <span className="text-[1.3em] font-bold">Sciences</span> <br />
        de Gisenyi
      </span>
    </div>
  );
};

export default RcaLogo;
