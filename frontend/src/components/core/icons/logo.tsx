import React from 'react';
import Image from 'next/image';

const RcaLogo = () => {
  return (
    <div className="flex items-center cursor-pointer h-11 w-fit ">
      <Image
        alt="Logo"
        src="/logo.png"
        width={53}
        height={44}
        style={{ width: 53, height: 44 }}
        className="md:ml-0 ml-9"
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
