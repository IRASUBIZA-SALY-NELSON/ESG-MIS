'use client';
import { useRef, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';

/** Drag-and-drop area that also opens the file picker on click or Enter. */
export default function FileDrop({
  onFiles,
  multiple = true,
  maxMb,
  allowedTypes,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  maxMb: number;
  allowedTypes: string;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const accept = allowedTypes
    .split(',')
    .map((t) => `.${t.trim()}`)
    .join(',');

  const pick = (list: FileList | null) => {
    if (!list?.length) return;
    onFiles(multiple ? Array.from(list) : [list[0]]);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center text-center gap-1 rounded-xl border-2 border-dashed cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        compact ? 'py-5 px-4' : 'py-9 px-6'
      } ${over ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/60 hover:bg-gray-50'}`}
    >
      <FiUploadCloud
        className={`${compact ? 'text-2xl' : 'text-4xl'} ${over ? 'text-primary' : 'text-gray-400'}`}
      />
      <div className="font-medium text-primary">
        {over
          ? 'Drop to add'
          : multiple
            ? 'Drag files here, or click to browse'
            : 'Drag the new file here, or click to browse'}
      </div>
      <div className="text-xs text-gray-500">
        PDF, Word, PowerPoint, Excel, images, video, audio, text and code · up to {maxMb} MB each
      </div>
      <input
        ref={input}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => {
          pick(e.currentTarget.files);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}

export const validateFile = (file: File, maxMb: number, allowedTypes: string) => {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  const allowed = allowedTypes.split(',').map((t) => t.trim());
  if (!allowed.includes(ext)) return `.${ext || '?'} files are not allowed`;
  if (file.size > maxMb * 1024 * 1024) return `Larger than ${maxMb} MB`;
  if (file.size === 0) return 'The file is empty';
  return null;
};

export const titleFromFile = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

export const categoryOfFile = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'doc';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'slides';
  if (['xls', 'xlsx', 'ods'].includes(ext)) return 'sheet';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  return 'text';
};
