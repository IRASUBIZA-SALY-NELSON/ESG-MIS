'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Modal } from '@mantine/core';
import backBtn from '../../../../assets/back.svg';
import closeStudentModal from '../../../../assets/close.svg';
import deleteAccount from '../../../../assets/deleteUserAvatar.svg';
import { ColumnDef } from '@tanstack/react-table';
import useSearch from '@/hooks/useSearch';
import useGet from '@/hooks/useGet';
import { Teacher } from '@/types/teacher.type';

const OtherStaffMembers = () => {
  const {
    data: content,
    getPaginated,
    loading,
    paginateOpts,
    setPaginateOpts,
    setData,
    error,
  } = useGet<any[]>('/staff-members/all', {
    defaultData: [],
    paginated: true,
  });
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | null>();
  const {
    setInput,
    input,
    data: searchData,
  } = useSearch<any>('/staff-members/all-roles/PUBLISHER', {
    defaultData: [],
    searchKey: 'studentName',
    throttleTime: 500,
    setTableData: setData,
  });
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => <div>{row.getValue('fullName')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender')}</div>,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
      cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    },
  ];

  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 5000);
  // });
  const students = [
    {
      id: 1,
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      gender: 'M',
      role: 'Kitchen',
      phone: '07988888888',
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'johndoe@gmail.com',
      role: 'Security Guard',
      gender: 'F',
      phone: '07988888888',
    },
  ];
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#F5FAF7',
      borderRadius: '20px',
    },
  };
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [userModalOpen, setUserModalOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function openUserModal() {
    setUserModalOpen(true);
  }
  function closeUserModal() {
    setUserModalOpen(false);
  }

  function closeModal() {
    setIsOpen(false);
  }
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <Modal opened={modalIsOpen} onClose={closeModal} closeOnClickOutside size={'lg'}>
        <div className="p-2 rounded-lg bg-[#F5FAF7] min-w-[40vw] py-10 text-center">
          <div className="flex items-center justify-center">
            <Image src={deleteAccount} alt="" className="w-20" />
          </div>
          <p className="mt-5">Are you sure you want to delete </p>
          <p className="my-5 font-semibold text-lg text-center">Mugisha Yves</p>
          <p>from ESG’s staff list? </p>
          <div className="mt-5 flex gap-5 justify-center">
            <button
              onClick={closeModal}
              className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2"
            >
              Cancel
            </button>
            <button onClick={closeModal} className="bg-primary rounded-md text-white px-5 py-2">
              Delete
            </button>
          </div>
        </div>
      </Modal>
      <Modal opened={userModalOpen} onClose={closeModal} closeOnClickOutside size={'xl'}>
        {/* <div className="p-2 rounded-lg bg-[#F5FAF7] max-w-[80vw]  text-center relative">
          <button
            onClick={closeUserModal}
            className="absolute -right-1 -top-1 bg-[#F5FAF7] p-3 rounded-full"
          >
            <Image src={closeStudentModal} alt="" className="w-5" />
          </button>
          <p className="my-5 font-semibold text-lg text-center">Staff Member's Profile</p>
          <div className="flex gap-5">
            <div className="w-[25%]">
              <Image src={deleteAccount} alt="" className="w-[100%]" />
            </div>
            <div className="w-[75%]">
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>First Name: </p>
                <p style={{ fontSize: '80%' }}>Mugisha Yves</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Email: </p>
                <p style={{ fontSize: '80%' }}>mugishayves189000@gmail.com</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }}>Gender: </p>
                  <p style={{ fontSize: '80%' }}>Male</p>
                </div>
                <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }}>First Name: </p>
                  <p style={{ fontSize: '80%' }}>Mugisha Yves</p>
                </div>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Phone: </p>
                <p style={{ fontSize: '80%' }}>0798667782</p>
              </div>
            </div>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Bio: </p>
            <p style={{ fontSize: '80%' }}>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloremque, voluptas eveniet
              nulla reprehenderit molestiae perspiciatis beatae asperiores, omnis, deserunt nobis
              voluptatem mollitia facere totam ipsam nesciunt animi temporibus. Molestias,
              repudiandae.
            </p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Province of Residence: </p>
            <p style={{ fontSize: '80%' }}>Mugisha Yves</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>District: </p>
                <p style={{ fontSize: '80%' }}>Musanze</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Sector: </p>
                <p style={{ fontSize: '80%' }}>Muhoza</p>
              </div>
            </div>
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Cell: </p>
                <p style={{ fontSize: '80%' }}>Muhoze</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Village: </p>
                <p style={{ fontSize: '80%' }}>Mugisha Yves</p>
              </div>
            </div>
          </div>
        </div> */}
        <div className="p-2 rounded-lg  w-[70vw]  text-center relative">
          <div className="flex gap-5">
            <div className="w-[25%]">
              <Image
                src={
                  currentUser?.profilePicture ||
                  'https://w7.pngwing.com/pngs/481/915/png-transparent-computer-icons-user-avatar-woman-avatar-computer-business-conversation-thumbnail.png'
                }
                alt=""
                className="w-[100%]"
                width={100}
                height={100}
              />
            </div>
            <div className="w-[75%]">
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Full Name: </p>
                <p style={{ fontSize: '80%' }}>
                  {currentUser?.firstName + ' ' + currentUser?.lastName}
                </p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Email: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.email}</p>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }}>Gender: </p>
                  <p style={{ fontSize: '80%' }}>{currentUser?.gender}</p>
                </div>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Phone: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.phoneNumber}</p>
              </div>
            </div>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Province of Residence: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.address?.province}</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>District: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.district}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Sector: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.sector}</p>
              </div>
            </div>
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Cell: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.cell}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }}>Village: </p>
                <p style={{ fontSize: '80%' }}>{currentUser?.address?.village}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => {
            window.history.back();
          }}
        >
          <Image src={backBtn} alt="" />
        </button>
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Other Staff Members
        </h2>
      </div>
      <div className="flex flex-row justify-between my-5">
        <div></div>
        <div className="flex items-center gap-3">
          <Link href={'/admin/workers/others/create'}>
            <div className="bg-primary rounded-md text-white px-5 py-2">
              Create new staff member
            </div>
          </Link>
          <button className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2">
            Download Excel for all other staff members
          </button>
        </div>
      </div>
      <div>
        {students?.length === 0 ? (
          <div className="flex items-center justify-center">
            <p className="text-gray-700">No Members So Far</p>
          </div>
        ) : (
          <div className="overflow-x-auto ">
            <table className="w-full rounded-lg text-[rgba(67,67,67,0.71)]">
              <tr className="bg-[rgba(231,242,236)] text-[rgba(2,79,58,0.8)] py-10 rounded-md">
                <th className="p-2 border-[#F5FAF7] border-y-[5px] rounded-l-xl">#</th>
                <th className="p-2 border-[#F5FAF7] border-y-[5px] ">Name</th>
                <th className="p-2 border-[#F5FAF7] border-y-[5px] ">Phone</th>
                <th className="p-2 border-[#F5FAF7] border-y-[5px] ">Gender</th>
                <th className="p-2 border-[#F5FAF7] border-y-[5px] ">Role</th>
                <th className="p-2 border-[#F5FAF7] border-y-[5px] rounded-r-xl">Actions</th>
              </tr>
              {loading
                ? [...Array(10)].map((_, index) => (
                    <tr key={index} className="">
                      <td className="p-2">
                        <Skeleton height={20} />
                      </td>
                      <td className="p-2">
                        <Skeleton height={20} />
                      </td>
                      <td className="p-2">
                        <Skeleton height={20} />
                      </td>
                      <td className="p-2">
                        <Skeleton height={20} />
                      </td>
                      <td className="p-2">
                        <Skeleton height={20} />
                      </td>
                      <td className="p-2">
                        <Skeleton height={20} />
                      </td>
                    </tr>
                  ))
                : students
                    ?.slice(currentPage * (pageLimit - 1), pageLimit)
                    .map((student: any, index: any) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? 'bg-[rgba(67,67,67,0.03)] my-20 text-center'
                            : 'bg-[rgba(67,67,67,0.06)] text-center'
                        }
                      >
                        <td className="p-2 border-[#F5FAF7] border-y-[5px]  rounded-l-xl">
                          {student.id}
                        </td>
                        <td className="p-2 border-[#F5FAF7] border-y-[5px] ">{student.name}</td>
                        <td className="p-2 border-[#F5FAF7] border-y-[5px] ">{student.phone}</td>
                        <td className="p-2 border-[#F5FAF7] border-y-[5px] ">{student.gender}</td>
                        <td className="p-2 border-[#F5FAF7] border-y-[5px] ">{student.role}</td>
                        <td className="p-2 border-[#F5FAF7] border-y-[5px]   rounded-r-xl">
                          <div className="flex flex-row justify-center gap-2">
                            <button onClick={openUserModal}>
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
                            </button>
                            <Link href={`/admin/workers/others/edit/${student.id}`}>
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
                        </td>
                      </tr>
                    ))}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherStaffMembers;
