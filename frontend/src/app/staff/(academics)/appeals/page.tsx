'use client';
import drop from '@/assets/dropdown.svg';
import confirmBtn from '@/assets/confirm.svg';
import ExportForm from '@/components/core/data-table/ExportForm';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import {
  getAcademicYears,
  getAllTeachers,
  getAppeals,
  getDsAppeals,
  getTeacherAppeals,
  getTermsInYear,
} from '@/utils/funcs';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  divider,
} from '@nextui-org/react';
import { stat } from 'fs';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Switch, useMantineTheme } from '@mantine/core';
import deleteAccount from '@/assets/deleteUserAvatar.svg';
import closeStudentModal from '@/assets/close.svg';
import { AuthApi } from '@/utils/constants';
import { useError } from '@/hooks/useError';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from '@/components/core/icons/icons1';
import { DataTable } from '@/components/core/data-table';
import DebugInfo from '@/components/dev/DebugInfo';
import ViewAppeal from '@/components/staff/ds/ViewAppeal';
import ViewAcademicAppeal from '@/components/staff/teachers/ViewAcademicAppeal';
import CommentOnAppeal from '@/components/appeals/commentOnAppeal';
import { getFormattedDate } from '@mantine/dates';
interface Appeal {
  id: string;
  appealID: string;
  studentName: string;
  teacherName: string;
  lesson: string;
  status: string;
  description: string;
  student: {
    firstName: string;
    lastName: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  course: {
    courseName: string;
  };
}
interface AcademicYear {
  name: string;
  id: string;
}
const AppealsPage = () => {
  const [activeTerm, setActiveTerm] = useState<string | undefined>();
  const {
    data,
    getPaginated,
    loading: loadingAppeals,
    paginateOpts,
    setPaginateOpts,
    error,
  } = useGet<Appeal[]>('/academicAppeals/teacher/{for-loggedIn-teacher}', {
    defaultData: [],
    paginated: true,
    pagination: {
      limit: 30,
    },
    onMount: false,
    query: {
      termId: activeTerm,
    },
  });
  const [activeTab, setActiveTab] = useState('all');
  const [showExport, setShowExport] = useState(false);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [err, setError] = useState(false);
  const [appeal, setAppeal] = useState<Appeal | null | any>();
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [thisYearTerms, setThisYearTerms] = useState<any[]>([]);
  const [AcadYearsFilter, setAcadYearsFilter] = useState('Academic years');
  const [termFilter, setTermsFilter] = useState('term');
  const [activeAcademicYear, setActiveAcademicYear] = useState<string | undefined>();
  const [opened, { open, close }] = useDisclosure(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [modalRejecting, setModalRejecting] = useState(false);
  const [modalLoading, setModelLoading] = useState(false);
  const [rejectMsg, setRejectMsg] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [isComment, setIsComment] = useState<{
    opened: boolean;
    data: any;
  }>({
    opened: false,
    data: '',
  });

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchAndSetComments = async (appealId: string) => {
    try {
      const response = await AuthApi.get(`/academicAppeals/${appealId}/comments`);
      setComments(response.data.data.content || []);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !appeal?.id) return;

    try {
      const commentDTO = {
        content: newComment,
        resultingStatus: 'REVIEWING' as const,
      };

      await AuthApi.post(`/academicAppeals/${appeal.id}/make-comments`, commentDTO);
      setNewComment('');
      fetchAndSetComments(appeal.id);
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  function openUserModal(appeal: any) {
    setUserModalOpen(true);
    setAppeal(appeal);
  }
  function closeUserModal() {
    setAppeal(null);
    setUserModalOpen(false);
  }

  const accept = () => {
    setModelLoading(true);
    setAppealLoading(true);
    AuthApi.get(`/academicAppeals/approve/${appeal.id}`)
      .then((res) => {
        notifications.show({
          title: 'Appeal Accepted',
          message: `The appeal from  ${appeal?.student?.firstName} ${appeal?.student?.lastName} was accepted`,
          color: 'green',
          autoClose: 60000,
        });
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal Not Accepted',
          message: useError(err, 'Reject Appeal'),
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setOpenApprove(false);
        setModelLoading(false);
        setAppealLoading(false);
        getPaginated();
      });
  };
  const reviewing = () => {
    setModelLoading(true);
    setAppealLoading(true);
    AuthApi.get(`/academicAppeals/reviewing/${appeal.id}`)
      .then((res) => {
        notifications.show({
          title: 'Appeal set to reviewing stage',
          message: `The appeal from  ${appeal?.student?.firstName} ${appeal?.student?.lastName} was set to the reviewing stage successfully`,
          color: 'green',
          autoClose: 60000,
        });
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal  not set to reviewing stage',
          message: 'There was an error setting the appeal to reviewing stage',
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setOpenApprove(false);
        setModelLoading(false);
        setAppealLoading(false);
        getPaginated();
      });
  };
  const reject = () => {
    setModelLoading(true);
    setAppealLoading(true);
    AuthApi.put(`/academicAppeals/reject/${appeal.id}`, { message: rejectMsg })
      .then((res) => {
        notifications.show({
          title: 'Appeal Rejected',
          message: `The appeal from  ${appeal?.student?.firstName} ${appeal?.student?.lastName} was rejected `,
          color: 'green',
          autoClose: 60000,
        });
        close();
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal Not Rejected',
          message: `The appeal from  ${appeal?.student?.firstName} ${appeal?.student?.lastName} was  not rejected`,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setOpenReject(false);
        setModelLoading(false);
        setAppealLoading(false);
        getPaginated();
      });
  };

  useEffect(() => {
    setFilteredAppeals(() => {
      return appeals?.filter((app) => {
        if (activeTab == 'all') {
          return true;
        } else {
          return app.status.toLowerCase() == activeTab.toLowerCase();
        }
      });
    });
  }, [activeTab, appeals]);

  useEffect(() => {
    getAcademicYears().then((res) => {
      setAcademicYears(res.data);
      setActiveAcademicYear(res.data.filter((year: any) => year.status == 'ACTIVE')[0].id);
      setAcadYearsFilter(res.data.filter((year: any) => year.status == 'ACTIVE')[0].name);
    });
  }, []);
  useEffect(() => {
    const fetchTerms = async () => {
      if (activeAcademicYear !== undefined) {
        try {
          setLoading(true);
          const termsInYearResponse = await getTermsInYear(activeAcademicYear as any);
          const reversedTerms = [...termsInYearResponse.data].reverse();
          setThisYearTerms(reversedTerms);
          setActiveTerm(reversedTerms[0].id);
          setTermsFilter(reversedTerms[0].name);
        } catch (error) {
          setError(true);
        }
      }
    };
    if (activeAcademicYear != undefined) fetchTerms();
  }, [activeAcademicYear]);

  useEffect(() => {
    if (data) {
      setAppeals(data);
    }
  }, [data]);

  useEffect(() => {
    if (activeTerm) getPaginated();
  }, [activeTerm]);

  useEffect(() => {
    if (userModalOpen && appeal?.id) {
      fetchAndSetComments(appeal.id);
    } else {
      setComments([]);
      setNewComment('');
    }
  }, [userModalOpen, appeal?.id]);

  // useEffect(() => {
  //   if (activeTerm !== undefined) {
  //     getTeacherAppeals(activeTerm)
  //       .then((res) => {
  //         setAppeals(res.data.content);
  //         setFilteredAppeals(res.data.content);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         setError(true);
  //         setLoading(false);
  //       });
  //   }
  // }, [activeTerm]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          {row.original?.student?.firstName ||
            'Not set' + ' ' + row.original?.student?.lastName ||
            'Not set'}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          {row.original.description.length > 30
            ? `${row.original.description.slice(0, 33)} . . . `
            : row.original.description}
        </div>
      ),
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => <div>{row.original.course?.courseName}</div>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        const classes =
          s === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800'
            : s === 'REVIEWING'
              ? 'bg-blue-100 text-blue-800'
              : s === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : s === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800';

        return (
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${classes}`}
          >
            {s}
          </span>
        );
      },
    },
    {
      accessorKey: 'view',
      header: 'View',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              openUserModal(row.original);
            }}
          >
            <EyeIcon />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <DebugInfo />
      <Modal opened={userModalOpen} onClose={closeUserModal} withCloseButton={true} size="lg">
        <ViewAcademicAppeal appeal={appeal} close={closeUserModal} />
        <div className="mt-6 border-t pt-4">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Comments</h5>

          {/* Comments List */}
          <div className="max-h-[300px] overflow-y-auto mb-4 space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment, index) => {
                const commentDate = comment.createdAt
                  ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null;
                const authorName = comment.createdBy
                  ? `${comment.createdBy.firstName || ''} ${comment.createdBy.lastName || ''}`.trim()
                  : comment.authorName || 'Unknown';

                return (
                  <div
                    key={comment.id || comment._id || index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{authorName}</p>
                          {commentDate && <p className="text-xs text-gray-500">{commentDate}</p>}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Section */}
          <div className="border-t pt-4">
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Add a comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none text-sm"
              />
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !appeal?.id}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post Comment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reviewing Modal */}

      <Modal
        size={'md'}
        opened={openReview}
        onClose={() => setOpenReview(false)}
        closeOnClickOutside
      >
        <div>
          <h5 className="text-center">
            Are you sure you want to set {appeal?.student.firstName}'s appeal to the reviewing
            stage?{' '}
          </h5>
          <div className="flex justify-center items-center gap-9 mt-4">
            <Button
              onClick={() => setOpenReview(false)}
              className={'py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg border-l-[#ccc]'}
            >
              Cancel
            </Button>

            <Button
              className="py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg border-l-[#ccc] bg-[rgba(10,107,79,0.5)] text-white"
              onClick={reviewing}
            >
              {appealLoading ? (
                <div>
                  <ClipLoader size={20} color="white" />
                </div>
              ) : (
                'Yes'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        size={'md'}
        opened={openApprove}
        onClose={() => setOpenApprove(false)}
        closeOnClickOutside
      >
        <div>
          <h5 className="text-center">
            Are you sure you want to Approve {appeal?.student.firstName}'s appeal ?{' '}
          </h5>
          <div className="flex justify-center items-center gap-9 mt-4">
            <Button
              onClick={() => setOpenApprove(false)}
              className={'py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg border-l-[#ccc]'}
            >
              Cancel
            </Button>

            <Button
              className="py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg border-l-[#ccc] bg-[rgba(10,107,79,0.5)] text-white"
              onClick={accept}
            >
              {appealLoading ? (
                <div>
                  <ClipLoader size={20} color="white" />
                </div>
              ) : (
                'Yes'
              )}
            </Button>
          </div>
        </div>
      </Modal>
      {/* Reject Modal */}
      <Modal
        size={'md'}
        opened={openReject}
        onClose={() => setOpenReject(false)}
        closeOnClickOutside
      >
        <div>
          <h5 className="text-center">
            Are you sure you want to Reject {appeal?.student.firstName}'s appeal ?{' '}
          </h5>
          <div className="flex justify-center items-center gap-9 mt-8 mb-4">
            <Button
              onClick={() => setOpenReject(false)}
              className={'py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg border-l-[#ccc]'}
            >
              Cancel
            </Button>
            <Button
              className="py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg border-l-[#ccc] bg-[#e73737] text-white"
              onClick={() => setModalRejecting(true)}
            >
              Yes
            </Button>
          </div>
          {modalRejecting && (
            <div className="flex items-center flex-col">
              <textarea
                placeholder="Message for Rejecting Appeal"
                onChange={(e) => setRejectMsg(e.target.value)}
                className=" w-full  my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]"
              ></textarea>
              {!modalLoading ? (
                <button
                  onClick={() => {
                    reject();
                    close();
                  }}
                  className="bg-primary rounded-md text-white px-5 py-2 flex gap-2 items-center"
                >
                  <Image src={confirmBtn} alt="" />
                  <p>Confirm</p>
                </button>
              ) : (
                <div className="bg-primary rounded-md text-white px-5 py-2 flex gap-2 items-center  w-[200px] justify-center">
                  <ClipLoader size={15} color="white" />
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
      <h5 className="font-medium text-[rgba(0,0,0,0.7)]">Appeals</h5>
      {/* <div className="flex flex-col md:flex-row justify-between my-5">
        <input
          type="text"
          className="text-[80%] bg-[#43434305] w-[250px] md:w-[30vw] my-1 md:my-auto px-3 h-12 rounded-md border-[1px] border-[rgba(67,67,67,0.03)]"
          placeholder="Search By Student Name"
        />
        <div
          className="bg-primary rounded-md text-white px-5 flex items-center justify-center py-2 text-sm"
          onClick={() => setShowExport(true)}
        >
          Export Table
        </div>
      </div> */}
      <div className="flex flex-col md:flex-row items-end w-full justify-between">
        <div className="w-full md: flex mt-4 mb-2 md:mb-0 relative">
          <button
            className={`py-3  text-[80%] w-[70px] md:w-[100px] rounded-lg ${
              activeTab != 'all'
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'pending'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[100px] px-3 md:px-auto md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'reviewing'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('reviewing')}
          >
            In Review
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg  ml-[-13px] border-l-[2px] border-l-[#ccc] ${
              activeTab != 'approved'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          <button
            className={`py-[0.1rem]  text-[80%] w-[70px] md:w-[100px] rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 'rejected'
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
        </div>
        <div className="flex gap-2 items-end">
          <Dropdown className="bg-[#DCEBE3] text-black">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
              >
                Filter by <span className="ml-2 text-primary font-bold">{termFilter}</span>
                <Image src={drop} alt="" className="w-3 h-3 ml-2" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {thisYearTerms.map((term, i) => {
                return (
                  <DropdownItem
                    key={i}
                    value={term.name.replace('_', ' ')}
                    className=" hover:bg-[#0A6B4F89]"
                    onClick={() => {
                      setTermsFilter(term.name.replace('_', ' '));
                      setActiveTerm(term.id);
                    }}
                  >
                    {term.name.replace('_', ' ')}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
          <Dropdown className="bg-[#DCEBE3]">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
              >
                Filter by <span className="ml-2 text-primary font-bold">{AcadYearsFilter}</span>
                <Image src={drop} alt="" className="w-3 h-3 ml-2" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {academicYears.map((year, i) => {
                return (
                  <DropdownItem
                    key={i}
                    value={year.name}
                    className=" hover:bg-[#0A6B4F89]"
                    onClick={() => {
                      setAcadYearsFilter(year.name);
                      setActiveAcademicYear(year.id);
                    }}
                  >
                    {year.name}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="mt-3" style={{ backgroundColor: 'transparent' }}>
        {err || error ? (
          <div className="flex items-center justify-center h-[500px]">
            <p>An error Occured</p>
            <button onClick={getPaginated} className="px-16 py-4 rounded-2xl border">
              Retry
            </button>
          </div>
        ) : (
          <div>
            {filteredAppeals?.length === 0 ? (
              <div className="flex h-[500px] items-center justify-center ">
                <p className="text-sm text-gray-500">No Appeals So Far</p>
              </div>
            ) : (
              <div>
                <DataTable
                  data={filteredAppeals}
                  columns={columns}
                  loading={loadingAppeals}
                  noDataMessage="No Appeals Yet"
                  paginationProps={{
                    isPaginated: true,
                    setPaginateOpts,
                    paginateOpts,
                  }}
                  limit={30}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Course Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={data!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default AppealsPage;
