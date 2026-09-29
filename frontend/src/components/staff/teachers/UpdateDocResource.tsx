import React, { useState } from 'react';
import { AuthApi } from '@/utils/constants';
import pdf from '@/assets/pdf.svg';
import docx from '@/assets/docx.svg';
import Image from 'next/image';
import addDoc from '@/assets/addDoc.svg';
import removeDoc from '@/assets/removeDoc.svg';
import { notifications } from '@mantine/notifications';

interface UpdateDocResourceProps {
  close: () => void;
  paperId: string;
  currentFileName: string;
  onSuccess: () => void;
}

const UpdateDocResource: React.FC<UpdateDocResourceProps> = ({
  close,
  paperId,
  currentFileName,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');

  const onSubmit = async () => {
    if (!file) {
      notifications.show({
        title: 'No File Selected',
        message: 'Please select a file to replace the current one',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) {
      formData.append('type', documentType);
    }

    try {
      await AuthApi.put(`/past-papers/update/${paperId}`, formData);
      notifications.show({
        title: 'Successfully Updated Document',
        message: 'The document was successfully updated',
        color: 'green',
      });
      onSuccess();
      close();
    } catch (error) {
      notifications.show({
        title: 'Error Updating Document',
        message: 'The document was not updated',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setFile(fileList[0]);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        className="p-6 rounded-lg w-full"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current File:</p>
          <p className="text-xs text-gray-700 bg-gray-100 p-2 rounded">
            {currentFileName.length > 50 ? currentFileName.slice(0, 50) + '...' : currentFileName}
          </p>
        </div>

        <div className="w-full mb-4">
          <label htmlFor="documentType" className="block text-gray-700 mb-2">
            Select Document Type (Optional):
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-mainPurple"
          >
            <option value="">Keep Current Type</option>
            <option value="CAT">CAT</option>
            <option value="EXAM">EXAM</option>
          </select>
        </div>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="updateFile"
        />

        <div className="w-full h-[250px] overflow-y-auto flex flex-col items-center justify-center">
          {file && (
            <div className="w-full flex items-center justify-between bg-gray-200 rounded-lg my-2 p-3">
              <div className="flex-grow flex gap-3 items-center">
                {file.type === 'application/pdf' ? (
                  <Image src={pdf} alt="PDF icon" className="w-10" />
                ) : file.type ===
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                  <Image src={docx} alt="Docx icon" className="w-10" />
                ) : (
                  <span>No logo available</span>
                )}
                <p className="text-gray-700 text-xs">
                  {file.name.length > 50 ? file.name.slice(0, 30) + '...' : file.name}
                </p>
              </div>
              <button
                type="button"
                className="bg-gray-200 rounded-full p-2"
                onClick={() => setFile(null)}
              >
                <Image src={removeDoc} alt="remove document" className="w-5" />
              </button>
            </div>
          )}

          <label htmlFor="updateFile" className="w-full">
            <div className="cursor-pointer bg-gray-200 w-full rounded-lg flex justify-center items-center gap-5 p-3">
              <Image src={addDoc} alt="Add document" className="w-10" />
              <p className="text-sm text-gray-700">Select New File to Replace</p>
            </div>
          </label>
        </div>

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 bg-gray-200 text-black rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-mainPurple text-white rounded-lg"
            disabled={loading || !file}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateDocResource;
