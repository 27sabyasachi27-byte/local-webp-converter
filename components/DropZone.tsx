import React, { useCallback, useState } from 'react';
import { generateId } from '../utils/format';
import { ProcessedImage } from '../types';
import Tooltip from './Tooltip';

interface DropZoneProps {
  onFilesAdded: (newFiles: ProcessedImage[]) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    
    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];
    let invalidCount = 0;

    filesArray.forEach(file => {
      // Robust check for JPG and PNG
      const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

      if (isJpeg || isPng) {
        validFiles.push(file);
      } else {
        invalidCount++;
      }
    });

    if (invalidCount > 0) {
      setError(`${invalidCount} file${invalidCount > 1 ? 's' : ''} ignored. Only JPG and PNG files are supported.`);
    }

    const newImages: ProcessedImage[] = validFiles.map(file => ({
      id: generateId(),
      originalFile: file,
      status: 'idle', // Changed from 'pending' to 'idle'
      originalSize: file.size,
    }));

    if (newImages.length > 0) {
      onFilesAdded(newImages);
    }
  }, [onFilesAdded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset value to allow re-selecting the same file if needed
    e.target.value = '';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center w-full h-64 
        border-3 border-dashed rounded-lg transition-colors duration-200 ease-in-out cursor-pointer
        ${isDragOver 
          ? 'border-[#005ea2] bg-blue-50' 
          : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-[#f0f0f0] hover:bg-gray-200'}
      `}
    >
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center text-center p-6 pointer-events-none">
        <Tooltip content="Supports JPG, JPEG, and PNG">
          <svg 
            className={`w-12 h-12 mb-4 ${
              isDragOver ? 'text-[#005ea2]' : error ? 'text-red-500' : 'text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {error ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            )}
          </svg>
        </Tooltip>
        
        {error ? (
          <>
            <p className="mb-2 text-lg font-medium text-red-600">
              Unsupported File Type
            </p>
            <p className="text-sm text-red-500">
              {error}
            </p>
            <p className="mt-4 text-xs font-semibold text-red-700">
              Drop valid files to try again
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-lg font-medium text-[#1b1b1b]">
              Drag & Drop JPG/PNG files here
            </p>
            <p className="text-sm text-gray-500">
              or click to browse files
            </p>
            <p className="mt-4 text-xs font-semibold text-[#005ea2]">
              Converts automatically to WebP
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DropZone;