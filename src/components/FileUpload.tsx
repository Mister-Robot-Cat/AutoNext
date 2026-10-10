import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      setError(null);
      
      const validFiles = files.filter(file => {
        if (maxSize && file.size > maxSize) {
          setError(`File ${file.name} is too large. Max size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
          return false;
        }
        if (accept) {
          const acceptTypes = accept.split(',').map(t => t.trim());
          const fileType = file.type;
          const isAccepted = acceptTypes.some(type => {
            if (type.endsWith('/*')) {
              return fileType.startsWith(type.replace('/*', '/'));
            }
            return fileType === type;
          });
          if (!isAccepted) {
             setError(`File ${file.name} has invalid type. Accepted types: ${accept}`);
             return false;
          }
        }
        return true;
      });

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : [validFiles[0]];
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
      }
    },
    [accept, maxSize, multiple, onFileSelect, selectedFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles]
  );

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(Array.from(e.target.files));
      }
    },
    [handleFiles]
  );

  const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        data-testid="dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={onFileInputChange}
          data-testid="file-input"
        />
        <UploadCloud
          className={cn(
            "w-10 h-10 mb-3",
            isDragging ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
          )}
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
          <span className="text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {accept ? `Accepted files: ${accept}` : "Any file type accepted"}
        </p>
        {maxSize && (
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
             Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
           </p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" data-testid="upload-error">
          {error}
        </p>
      )}

      {selectedFiles.length > 0 && (
        <ul className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              data-testid={`file-item-${index}`}
            >
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
