'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Video, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { UploadedFileItem } from '../types/enrollment';
import { useLanguage } from '../i18n/LanguageContext';

interface FileUploadCardProps {
  label: string;
  sublabel?: string;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  maxSizeMb?: number;
  files?: UploadedFileItem | UploadedFileItem[];
  onFileChange: (fileOrFiles: UploadedFileItem | UploadedFileItem[] | undefined) => void;
}

export default function FileUploadCard({
  label,
  sublabel,
  accept = '.pdf,.jpg,.jpeg,.png',
  required = false,
  multiple = false,
  maxSizeMb = 10,
  files,
  onFileChange,
}: FileUploadCardProps) {
  const { t } = useLanguage();
  const u = t.upload;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileList: UploadedFileItem[] = Array.isArray(files)
    ? files
    : files
    ? [files]
    : [];

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileObjects: FileList | null) => {
    if (!fileObjects || fileObjects.length === 0) return;
    setErrorMsg(null);

    const filesToProcess: File[] = [];
    for (let i = 0; i < fileObjects.length; i++) {
      const file = fileObjects[i];
      if (file.size > maxSizeMb * 1024 * 1024) {
        setErrorMsg(u.fileTooLarge(file.name, maxSizeMb));
        continue;
      }
      filesToProcess.push(file);
    }

    if (filesToProcess.length === 0) return;

    try {
      const processedItems: UploadedFileItem[] = await Promise.all(
        filesToProcess.map(async (file) => {
          let dataUrl: string | undefined = undefined;
          try {
            // Read dataUrl for preview & playback in admin panel
            dataUrl = await readFileAsDataUrl(file);
          } catch (err) {
            console.warn('Could not read file as dataUrl:', err);
          }

          return {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl,
            uploadedAt: new Date().toISOString(),
          };
        })
      );

      if (multiple) {
        onFileChange([...fileList, ...processedItems]);
      } else {
        onFileChange(processedItems[0]);
      }
    } catch (err) {
      console.error('Error handling uploaded files:', err);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const updated = fileList.filter((f) => f.id !== id);
      onFileChange(updated);
    } else {
      onFileChange(undefined);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-600" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4 text-amber-600" />;
    return <FileText className="w-4 h-4 text-pink-600" />;
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#E86A33]/50 transition-all shadow-2xs">
      <div className="flex items-start justify-between mb-2">
        <div>
          <label className="text-sm font-semibold text-slate-900 block">
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
        </div>
        {fileList.length > 0 && (
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            {fileList.length} {u.attached}
          </span>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
          isDragging
            ? 'border-[#E86A33] bg-orange-50/50'
            : 'border-slate-200 hover:border-[#E86A33]/50 bg-slate-50/50 hover:bg-orange-50/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-9 h-9 rounded-full bg-orange-100 text-[#E86A33] flex items-center justify-center mb-1.5 shadow-xs">
          <Upload className="w-4 h-4" />
        </div>

        <p className="text-xs font-semibold text-slate-700">
          <span className="text-[#E86A33] hover:underline">{u.clickToBrowse}</span> {u.orDragDrop}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {u.formats} {accept.replace(/\./g, ' ').toUpperCase()} ({u.max} {maxSizeMb}MB)
        </p>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg flex items-center gap-1.5 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Attached Files List */}
      {fileList.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {file.dataUrl ? (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center shrink-0">
                    {getIcon(file.type)}
                  </div>
                )}
                <div className="truncate max-w-[180px] sm:max-w-[280px]">
                  <p className="font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleRemove(file.id, e)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
