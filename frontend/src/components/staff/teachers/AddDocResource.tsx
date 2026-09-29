import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthApi } from '@/utils/constants';
import pdf from '@/assets/pdf.svg';
import docx from '@/assets/docx.svg';
import Image from 'next/image';
import addDoc from '@/assets/addDoc.svg';
import removeDoc from '@/assets/removeDoc.svg';
import { notifications } from '@mantine/notifications';

interface FormDataParams {
  termId: string;
  courseId: string;
  classId: string;
}

interface AddDocResourceProps {
  close: () => void;
  type: string;
  params: FormDataParams;
}

const AddDocResource: React.FC<AddDocResourceProps> = ({ close, type, params }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async () => {
    setLoading(true); // Set loading state to true before submission

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append(`file`, files[i]);
      try {
        let url = `/${type}/create?termId=${params.termId}&courseId=${params.courseId}&classId=${params.classId}`;
        if (type === 'past-papers') url += `&type=${documentType}`;
        await AuthApi.post(url, formData);
        setLoading(false);
        notifications.show({
          title: 'Successfully Added Document',
          message: 'The document was successfully saved',
          color: 'green',
        });
        close();
      } catch (error) {
        setLoading(false);
        notifications.show({
          title: 'Error Adding Document',
          message: 'The document was not saved',
          color: 'red',
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setFiles(Array.from(fileList));
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <form className="p-6 rounded-lg w-full" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          multiple
          className="hidden"
          id="files"
        />
        {type === 'past-papers' && (
          <div className="w-full mb-4">
            <label htmlFor="documentType" className="block text-gray-700 mb-2">
              Select Document Type:
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-mainPurple"
            >
              <option value="">Select Type</option>
              <option value="CAT">CAT</option>
              <option value="EXAM">EXAM</option>
            </select>
          </div>
        )}
        <div className="w-full h-[250px] overflow-y-auto flex flex-col items-center justify-center">
          {files.length > 0 &&
            files.map((file, index) => (
              <div
                key={index}
                className="w-full flex  items-center justify-between  bg-gray-200 rounded-lg my-2 p-3 "
              >
                <div className="flex-grow flex gap-3 items-center">
                  {file.type === 'application/pdf' ? (
                    <Image src={pdf} alt="PDF icon" className="w-10 " />
                  ) : file.type ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                    <Image src={docx} alt="Docx icon" className="w-10 " />
                  ) : (
                    <span>No logo available</span>
                  )}
                  <p className="text-gray-700 text-xs">
                    {file.name.length > 50 ? file.name.slice(0, 30) + '...' : file.name}
                  </p>
                </div>
                <button
                  type="button"
                  className=" bg-gray-200 rounded-full p-2 "
                  onClick={() => setFiles(files.filter((f) => f.name != file.name))}
                >
                  <Image src={removeDoc} alt="remove document" className="w-5" />
                </button>
              </div>
            ))}
          {/* {files.length === 0 && (
            
          )} */}
          <label htmlFor="files" className="w-full">
            <div className="cursor-pointer bg-gray-200 w-full   rounded-lg flex justify-center items-center gap-5 p-3">
              <Image src={addDoc} alt="Docx icon" className="w-10 " />
              <p className="text-sm text-gray-700">Add File(s)</p>
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
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDocResource;
