'use client';
import { AuthApi, getFile } from '@/utils/constants';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import back from '@/assets/back.svg';
import Image from 'next/image';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

const Doc = () => {
  const params = useParams();
  const { id } = params;
  const [fileInfo, setFileInfo] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const fileData = await AuthApi.get(`/past-papers/id/${id}`);
        setFileInfo(fileData.data.data);

        setDocs([{ uri: getFile(fileData.data.data.fileName) as string }]);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchFile();
    }
  }, [id]);

  return (
    <div className="p-5 flex-grow">
      {loading ? (
        <div className="h-[95%] w-full flex justify-center items-center text-gray-400 font-semibold">
          Loading...
        </div>
      ) : (
        <div>
          <div className="flex gap-2 items-center mb-5">
            <Image
              src={back}
              alt="back"
              className="w-5 h-5 cursor-pointer"
              onClick={() => window.history.back()}
            />
            <h1>{fileInfo ? fileInfo.fileName : 'File Name'}</h1>
          </div>
          {docs?.length > 0 && <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />}
        </div>
      )}
    </div>
  );
};

export default Doc;
