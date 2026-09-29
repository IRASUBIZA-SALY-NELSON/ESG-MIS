import Image from 'next/image';
import React from 'react';

const Banner = () => {
  return (
    <div className="flex flex-col  items-center justify-center py-20 gap-10">
      <Image src={'/logo.png'} width={300} height={300} alt="ESG Logo" className="" />
      <p className="font-bold text-mainPurple text-4xl">Ecole des Sciences de Gisenyi</p>
      <p className="font-bold  text-xl">Terminal</p>
    </div>
  );
};

export default Banner;
