'use client';
import Image, { StaticImageData } from 'next/image';
import { useState } from 'react';
import facebookIcon from '@/assets/facebook.png';
import igIcon from '@/assets/instagram.png';
import twitterIcon from '@/assets/twitter.png';
import githubIcon from '@/assets/github.png';
import linkedinIcon from '@/assets/linkedin.png';
import { ActionIcon, Modal } from '@mantine/core';
import Link from 'next/link';
import { BiChevronLeft } from 'react-icons/bi';
import { useRouter } from 'next13-progressbar';
import { shuffleArray } from '@/utils/fetch';
import { maintainers } from '@/utils/data/maintainers';
import { IoPersonCircleOutline } from 'react-icons/io5';

interface Maintainer {
  name: string;
  profile: string;
  email: string;
  description: string;
  image: string | StaticImageData;
  links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
    linkedIn?: string;
  };
}

const Maintainers = () => {
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  const [maintainer, setMaintainer] = useState<Maintainer>(maintainers[0]);
  const [openMaintainerModel, setOpenMaintainerModel] = useState(false);
  const openModel = (data: Maintainer) => {
    setMaintainer(data);
    setOpenMaintainerModel(true);
    setOpenModal(true);
  };

  return (
    <div className="w-full p-5">
      <div className="flex w-full sticky top-0 bg-[#F5FAF7] py-3 items-center gap-x-3">
        <ActionIcon onClick={() => router.back()} radius={'xl'} size={25} variant="outline">
          <BiChevronLeft size={30} />
        </ActionIcon>
        <h5 className="text-2xl">Maintainers</h5>
      </div>
      <h6 className="my-3 text-lg px-2">2022 - 2026</h6>
      <div className=" mx-auto   flex flex-col md:grid max-[1100px]:grid-cols-3 max-[900px]:grid-cols-2 grid-cols-4 gap-3 mt-2 mb-6">
        {shuffleArray(maintainers).map((main, i) => {
          return (
            <div
              onClick={() => openModel(main)}
              key={i}
              className="w-full mx-auto h-full aspect-[4/5] rounded-[3px] px-3 flex flex-col items-center cursor-pointer bg-[#4343431d] py-3"
            >
              <Image
                width={500}
                height={500}
                alt=""
                src={main?.image || ''}
                className="w-[90%] md:h-[70%] object-cover rounded-[3px] top-0"
              ></Image>
              <h5 className="mt-2 text-center">{main.name}</h5>
              <p className="text-[80%]">{main.profile}</p>
              <p className="text-[80%] mt-[-5px] px-3">{main.email}</p>

              <div className="w-[90%] flex items-center justify-between mt-3">
                {main.links?.facebook && (
                  <Link target={'_blank'} href={main.links?.facebook ?? ''}>
                    <Image
                      width={500}
                      height={500}
                      className="w-5 h-5 cursor-pointer"
                      src={facebookIcon}
                      alt=""
                    />
                  </Link>
                )}

                {main.links?.instagram && (
                  <Link target={'_blank'} href={main.links?.instagram ?? ''}>
                    <Image
                      width={500}
                      height={500}
                      className="w-5 h-5 cursor-pointer"
                      src={igIcon}
                      alt=""
                    />
                  </Link>
                )}
                {main.links?.twitter && (
                  <Link target={'_blank'} href={main.links?.twitter ?? ''}>
                    <Image
                      width={500}
                      height={500}
                      className="w-5 h-5 cursor-pointer"
                      src={twitterIcon}
                      alt=""
                    />
                  </Link>
                )}
                {main.links?.github && (
                  <Link target={'_blank'} href={main.links?.github ?? ''}>
                    <Image
                      width={500}
                      height={500}
                      className="w-5 h-5 cursor-pointer"
                      src={githubIcon}
                      alt=""
                    />
                  </Link>
                )}
                {main.links?.linkedIn && (
                  <Link target="_blank" href={main.links?.linkedIn ?? ''}>
                    <Image
                      width={500}
                      height={500}
                      className="w-5 h-5 cursor-pointer"
                      src={linkedinIcon}
                      alt=""
                    />
                  </Link>
                )}
                {main.links?.portfolio && (
                  <Link target="_blank" href={main.links?.portfolio ?? ''}>
                    <IoPersonCircleOutline size={23} color="#4C4C4C" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Modal opened={openModal} onClose={() => setOpenModal(false)} size={'auto'}>
        <div className="w-full md:w-[40vw] h-[50vh] bg-white py-3 flex flex-col justify-start items-center rounded-lg relative">
          <Image
            width={500}
            height={500}
            alt=""
            src={maintainer?.image || ''}
            className="w-[35%] h-[50%] rounded-lg object-fit"
          />
          <h5 className="mt-2 text-left font-medium text-[120%]">{maintainer?.name}</h5>
          {maintainer.name.includes('Valens') && (
            <p className="text-[80%] font-medium text-[#0000009e] mb-[-0.3rem]">Team Lead</p>
          )}
          <p className="text-[80%] font-medium text-[#0000009e]">{maintainer?.profile}</p>
          <p className="text-[80%] font-medium text-[#0000009e] mt-[-5px] px-5">
            {maintainer?.email}
          </p>
          <p className="text-[70%] w-10/12 text-center mt-2 font-medium text-[#000000a9]">
            {maintainer?.description}
          </p>
          <div className="w-[50%] flex items-center justify-between mt-2">
            {maintainer.links?.facebook && (
              <Link target={'_blank'} href={maintainer.links?.facebook ?? ''}>
                <Image
                  width={500}
                  height={500}
                  className="w-7 h-7 cursor-pointer"
                  src={facebookIcon}
                  alt=""
                />
              </Link>
            )}

            {maintainer.links?.instagram && (
              <Link target={'_blank'} href={maintainer.links?.instagram ?? ''}>
                <Image
                  width={500}
                  height={500}
                  className="w-7 h-7 cursor-pointer"
                  src={igIcon}
                  alt=""
                />
              </Link>
            )}
            {maintainer.links?.twitter && (
              <Link target={'_blank'} href={maintainer.links?.twitter ?? ''}>
                <Image
                  width={500}
                  height={500}
                  className="w-7 h-7 cursor-pointer"
                  src={twitterIcon}
                  alt=""
                />
              </Link>
            )}
            {maintainer.links?.github && (
              <Link target={'_blank'} href={maintainer.links?.github ?? ''}>
                <Image
                  width={500}
                  height={500}
                  className="w-7 h-7 cursor-pointer"
                  src={githubIcon}
                  alt=""
                />
              </Link>
            )}
            {maintainer.links?.linkedIn && (
              <Link target="_blank" href={maintainer.links?.linkedIn ?? ''}>
                <Image
                  width={500}
                  height={500}
                  className="w-7 h-7 cursor-pointer"
                  src={linkedinIcon}
                  alt=""
                />
              </Link>
            )}
            {maintainer.links?.portfolio && (
              <Link target="_blank" href={maintainer.links?.portfolio ?? ''}>
                <IoPersonCircleOutline size={28} color="#4C4C4C" />
              </Link>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Maintainers;
