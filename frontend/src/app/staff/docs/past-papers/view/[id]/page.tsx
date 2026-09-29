'use client';
import { AuthApi, getFile } from '@/utils/constants';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import back from '@/assets/back.svg';
import Image from 'next/image';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import MainModal from '@/components/core/modals/modal';
import UpdateDocResource from '@/components/staff/teachers/UpdateDocResource';
import { notifications } from '@mantine/notifications';
import { EditIcon } from '@/components/core/icons/icons1';
import deleteFile from '@/assets/deleteFile.svg';
import downloadFile from '@/assets/downloadFile.svg';
import { ClipLoader } from 'react-spinners';

const StaffPaperView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [fileInfo, setFileInfo] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const fileData = await AuthApi.get(`/past-papers/id/${id}`);
        setFileInfo(fileData.data.data);
        setDocs([{ uri: getFile(fileData.data.data.fileName) as string }]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (id) {
      fetchFile();
    }
  }, [id]);

  const handleDelete = () => {
    setDeleteLoading(true);
    AuthApi.delete(`/past-papers/delete/${id}`)
      .then((res) => {
        notifications.show({
          title: 'Deleted File',
          message: 'Successfully deleted file',
          color: 'blue',
        });
        router.back();
      })
      .catch((err) => {
        notifications.show({
          title: 'Did not delete File',
          message: 'File was not deleted',
          color: 'red',
        });
      })
      .finally(() => {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
      });
  };

  const handleUpdateSuccess = () => {
    // Refresh the file info
    const fetchFile = async () => {
      try {
        const fileData = await AuthApi.get(`/past-papers/id/${id}`);
        setFileInfo(fileData.data.data);
        setDocs([{ uri: getFile(fileData.data.data.fileName) as string }]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFile();
  };

  return (
    <div className="p-5 flex-grow">
      {loading ? (
        <div className="h-[95%] w-full flex justify-center items-center text-gray-400 font-semibold">
          <ClipLoader color="blue" size={20} />
        </div>
      ) : (
        <div>
          <div className="flex gap-4 items-center justify-between mb-5">
            <div className="flex gap-2 items-center">
              <Image
                src={back}
                alt="back"
                className="w-5 h-5 cursor-pointer"
                onClick={() => router.back()}
              />
              <h1 className="text-[17px] font-medium text-[rgba(0,0,0,0.7)]">
                {fileInfo ? fileInfo.fileName : 'File Name'}
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              {fileInfo?.downloadLink && (
                <a
                  href={fileInfo.downloadLink}
                  download={fileInfo.fileName}
                  className="cursor-pointer"
                  title="Download file"
                >
                  <Image src={downloadFile} alt="Download file" className="w-5" />
                </a>
              )}
              <button
                onClick={() => setUpdateModalOpen(true)}
                title="Update/Replace file"
                className="cursor-pointer"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                title="Delete file"
                className="cursor-pointer"
              >
                <Image src={deleteFile} alt="Delete file" className="w-5" />
              </button>
            </div>
          </div>
          {docs?.length > 0 && <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />}
        </div>
      )}

      <MainModal
        title={'Update/Replace File'}
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
      >
        <UpdateDocResource
          close={() => setUpdateModalOpen(false)}
          paperId={id as string}
          currentFileName={fileInfo?.fileName || ''}
          onSuccess={handleUpdateSuccess}
        />
      </MainModal>

      <MainModal
        title={'Delete File'}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="flex flex-col items-center">
          <p>Are you sure you want to delete file named</p>
          <p className="text-xs">
            {fileInfo?.fileName.length > 50
              ? fileInfo?.fileName.slice(0, 30) + '...'
              : fileInfo?.fileName}
          </p>
          <div className="grid grid-cols-2 gap-5 mt-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm bg-mainPurple text-white rounded-md"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </MainModal>
    </div>
  );
};

export default StaffPaperView;
