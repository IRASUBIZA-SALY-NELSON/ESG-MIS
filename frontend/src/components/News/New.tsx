'use client';
import { backend } from '@/utils/constants';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { ClipLoader } from 'react-spinners';

interface Props {
  date: Date;
  title: string;
  content: string;
  image: string;
  id: number;
}
export const New = ({ id, image, date, title, content }: Props) => {
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const router = useRouter();
  const deleteNew = () => {
    if (loading) return;
    setLoading(true);
    const token = getCookie('token');
    axios
      .delete(`${backend}/news/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success('Successfully deleted new');
        closeModal();
        router.refresh();
      })
      .catch((err) => {
        toast.error('Failed to delete new');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const [loading, setLoading] = useState(false);
  return (
    <div className="border border-[#ccc] p-2 rounded-lg h-full  sm:h-[200px] my-2 flex flex-col sm:flex-row gap-2 relative bg-[rgba(67,67,67,0.09)] sm:pr-10 ">
      {/* <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className="p-5 rounded-lg">
          <p className="my-5 font-semibold text-lg">Are you sure you want to delete the news?</p>
          <div className="flex items-center justify-between">
            <button
              onClick={closeModal}
              type="button"
              className="bg-[rgba(67,67,67,0.03)]  text-black rounded-md  border-[2px] border-[rgba(67,67,67,0.09)] px-5 py-2"
            >
              Cancel{' '}
            </button>
            <div>
              <button
                onClick={deleteNew}
                className="bg-primary rounded-md text-white px-5 py-2 cursor-pointer"
              >
                {!loading ? 'Delete' : <ClipLoader color="white" size={15} />}
              </button>
            </div>
          </div>
        </div>
      </Modal> */}
      <div className="hidden sm:block absolute right-0 bottom-0 p-2 h-full ">
        <div className="flex flex-col h-full p-4 justify-between gap-1 border border-[#ccc] p-1 rounded-lg">
          <Link href={`/admin/news/${id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="18"
              viewBox="0 0 21 18"
              fill="none"
              className="cursor-pointer w-4"
            >
              <path
                d="M10.5 0C15.733 0 20.0867 3.88 21 9C20.0877 14.12 15.733 18 10.5 18C5.26698 18 0.913254 14.12 0 9C0.912284 3.88 5.26698 0 10.5 0ZM10.5 16C12.4793 15.9996 14.3999 15.3068 15.9474 14.0352C17.4948 12.7635 18.5775 10.9883 19.0182 9C18.5759 7.0133 17.4925 5.24 15.9452 3.97003C14.3979 2.70005 12.4782 2.00853 10.5 2.00853C8.5218 2.00853 6.60211 2.70005 5.05481 3.97003C3.5075 5.24 2.42412 7.0133 1.98179 9C2.4225 10.9883 3.50518 12.7635 5.05264 14.0352C6.6001 15.3068 8.52067 15.9996 10.5 16ZM10.5 13.5C9.34172 13.5 8.23087 13.0259 7.41184 12.182C6.59281 11.3381 6.13268 10.1935 6.13268 9C6.13268 7.80653 6.59281 6.66193 7.41184 5.81802C8.23087 4.97411 9.34172 4.5 10.5 4.5C11.6583 4.5 12.7691 4.97411 13.5882 5.81802C14.4072 6.66193 14.8673 7.80653 14.8673 9C14.8673 10.1935 14.4072 11.3381 13.5882 12.182C12.7691 13.0259 11.6583 13.5 10.5 13.5ZM10.5 11.5C11.1435 11.5 11.7606 11.2366 12.2156 10.7678C12.6707 10.2989 12.9263 9.66304 12.9263 9C12.9263 8.33696 12.6707 7.70107 12.2156 7.23223C11.7606 6.76339 11.1435 6.5 10.5 6.5C9.85651 6.5 9.23937 6.76339 8.78436 7.23223C8.32934 7.70107 8.07371 8.33696 8.07371 9C8.07371 9.66304 8.32934 10.2989 8.78436 10.7678C9.23937 11.2366 9.85651 11.5 10.5 11.5Z"
                fill="black"
              />
            </svg>
          </Link>
          <div className="w-full h-[2px] bg-gray-400"></div>
          <Link href={`/admin/news/edit/${id}`}>
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className="cursor-pointer w-4"
            >
              <path
                d="M13.757 0.9L11.757 2.9H2V16.9H16V7.143L18 5.143V17.9C18 18.1652 17.8946 18.4196 17.7071 18.6071C17.5196 18.7946 17.2652 18.9 17 18.9H1C0.734784 18.9 0.48043 18.7946 0.292893 18.6071C0.105357 18.4196 0 18.1652 0 17.9V1.9C0 1.63478 0.105357 1.38043 0.292893 1.19289C0.48043 1.00536 0.734784 0.9 1 0.9H13.757ZM17.485 0L18.9 1.416L9.708 10.608L8.296 10.611L8.294 9.194L17.485 0Z"
                fill="#0357BD"
              />
            </svg>
          </Link>
          <div className="w-full h-[2px] bg-gray-400"></div>
          <button onClick={openModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              className="cursor-pointer w-4"
            >
              <path
                d="M14.175 3.78H18.9V5.67H17.01V17.955C17.01 18.2056 16.9104 18.446 16.7332 18.6232C16.556 18.8004 16.3156 18.9 16.065 18.9H2.835C2.58437 18.9 2.34401 18.8004 2.16678 18.6232C1.98956 18.446 1.89 18.2056 1.89 17.955V5.67H0V3.78H4.725V0.945C4.725 0.69437 4.82456 0.454006 5.00178 0.276784C5.17901 0.0995622 5.41937 0 5.67 0H13.23C13.4806 0 13.721 0.0995622 13.8982 0.276784C14.0754 0.454006 14.175 0.69437 14.175 0.945V3.78ZM15.12 5.67H3.78V17.01H15.12V5.67ZM6.615 8.505H8.505V14.175H6.615V8.505ZM10.395 8.505H12.285V14.175H10.395V8.505ZM6.615 1.89V3.78H12.285V1.89H6.615Z"
                fill="#DD1A49"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="hidden sm:block absolute bottom-0 right-0 w-[75%] pr-20 p-1">
        <div className="flex flex-row justify-between  text-gray-700">
          <p>1000 Appreciations</p>
          <p>100 Comments</p>
          <p>Published by Mugisha Yves</p>
        </div>
      </div>
      <div className="h-[200px] sm:h-full  w-full sm:min-w-[300px] sm:max-w-[300px]  rounded-lg flex">
        <Image
          width={1080}
          height={1920}
          src={`${backend}/files/${image}`}
          alt=""
          className="h-full object-cover w-full rounded-lg"
        />
      </div>
      <div className="flex flex-row sm:block items-center gap-2">
        <div className="my-1  w-full pr-10">
          <div className="flex items-center justify-between  ">
            <p className="font-bold text-base">{title}</p>
            <p className=" text-xs">26 days ago</p>
          </div>
          <p className="text-gray-700">
            {new Date(date).getDate()} - {new Date(date).getMonth()} -{' '}
            {new Date(date).getFullYear()}{' '}
          </p>
          <div className="my-1 flex gap-1 flex-wrap"></div>
          <p>{content}</p>
        </div>
        <div className="flex sm:hidden flex-col h-full  justify-between gap-3 border border-[#ccc] p-3 rounded-lg">
          <Link href={`/admin/news/${id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="18"
              viewBox="0 0 21 18"
              fill="none"
              className="cursor-pointer w-4"
            >
              <path
                d="M10.5 0C15.733 0 20.0867 3.88 21 9C20.0877 14.12 15.733 18 10.5 18C5.26698 18 0.913254 14.12 0 9C0.912284 3.88 5.26698 0 10.5 0ZM10.5 16C12.4793 15.9996 14.3999 15.3068 15.9474 14.0352C17.4948 12.7635 18.5775 10.9883 19.0182 9C18.5759 7.0133 17.4925 5.24 15.9452 3.97003C14.3979 2.70005 12.4782 2.00853 10.5 2.00853C8.5218 2.00853 6.60211 2.70005 5.05481 3.97003C3.5075 5.24 2.42412 7.0133 1.98179 9C2.4225 10.9883 3.50518 12.7635 5.05264 14.0352C6.6001 15.3068 8.52067 15.9996 10.5 16ZM10.5 13.5C9.34172 13.5 8.23087 13.0259 7.41184 12.182C6.59281 11.3381 6.13268 10.1935 6.13268 9C6.13268 7.80653 6.59281 6.66193 7.41184 5.81802C8.23087 4.97411 9.34172 4.5 10.5 4.5C11.6583 4.5 12.7691 4.97411 13.5882 5.81802C14.4072 6.66193 14.8673 7.80653 14.8673 9C14.8673 10.1935 14.4072 11.3381 13.5882 12.182C12.7691 13.0259 11.6583 13.5 10.5 13.5ZM10.5 11.5C11.1435 11.5 11.7606 11.2366 12.2156 10.7678C12.6707 10.2989 12.9263 9.66304 12.9263 9C12.9263 8.33696 12.6707 7.70107 12.2156 7.23223C11.7606 6.76339 11.1435 6.5 10.5 6.5C9.85651 6.5 9.23937 6.76339 8.78436 7.23223C8.32934 7.70107 8.07371 8.33696 8.07371 9C8.07371 9.66304 8.32934 10.2989 8.78436 10.7678C9.23937 11.2366 9.85651 11.5 10.5 11.5Z"
                fill="black"
              />
            </svg>
          </Link>
          <div className="w-full h-[2px] bg-gray-400"></div>
          <Link href={`/admin/news/edit/${id}`}>
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className="cursor-pointer w-4"
            >
              <path
                d="M13.757 0.9L11.757 2.9H2V16.9H16V7.143L18 5.143V17.9C18 18.1652 17.8946 18.4196 17.7071 18.6071C17.5196 18.7946 17.2652 18.9 17 18.9H1C0.734784 18.9 0.48043 18.7946 0.292893 18.6071C0.105357 18.4196 0 18.1652 0 17.9V1.9C0 1.63478 0.105357 1.38043 0.292893 1.19289C0.48043 1.00536 0.734784 0.9 1 0.9H13.757ZM17.485 0L18.9 1.416L9.708 10.608L8.296 10.611L8.294 9.194L17.485 0Z"
                fill="#0357BD"
              />
            </svg>
          </Link>
          <div className="w-full h-[2px] bg-gray-400"></div>
          <button onClick={openModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              className="cursor-pointer w-4"
            >
              <path
                d="M14.175 3.78H18.9V5.67H17.01V17.955C17.01 18.2056 16.9104 18.446 16.7332 18.6232C16.556 18.8004 16.3156 18.9 16.065 18.9H2.835C2.58437 18.9 2.34401 18.8004 2.16678 18.6232C1.98956 18.446 1.89 18.2056 1.89 17.955V5.67H0V3.78H4.725V0.945C4.725 0.69437 4.82456 0.454006 5.00178 0.276784C5.17901 0.0995622 5.41937 0 5.67 0H13.23C13.4806 0 13.721 0.0995622 13.8982 0.276784C14.0754 0.454006 14.175 0.69437 14.175 0.945V3.78ZM15.12 5.67H3.78V17.01H15.12V5.67ZM6.615 8.505H8.505V14.175H6.615V8.505ZM10.395 8.505H12.285V14.175H10.395V8.505ZM6.615 1.89V3.78H12.285V1.89H6.615Z"
                fill="#DD1A49"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
