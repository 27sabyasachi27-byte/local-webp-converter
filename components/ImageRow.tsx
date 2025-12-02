import React, { useEffect, useRef, useMemo } from 'react';
import { ProcessedImage } from '../types';
import { formatFileSize } from '../utils/format';
import { convertToWebP } from '../utils/converter';
import Tooltip from './Tooltip';

interface ImageRowProps {
  item: ProcessedImage;
  onUpdate: (id: string, updates: Partial<ProcessedImage>) => void;
  onRetry: (id: string) => void;
}

const getFileType = (file: File): 'JPG' | 'PNG' | 'OTHER' => {
  const type = file.type;
  if (type === 'image/jpeg') return 'JPG';
  if (type === 'image/png') return 'PNG';
  const name = file.name.toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'JPG';
  if (name.endsWith('.png')) return 'PNG';
  return 'OTHER';
};

const getFriendlyErrorMessage = (error: string) => {
  const e = error.toLowerCase();
  if (e.includes('load image')) return 'Corrupt/Unsupported File';
  if (e.includes('context') || e.includes('canvas')) return 'Browser Memory Full';
  if (e.includes('timeout')) return 'Processing Timed Out';
  return error;
};

const FileTypeBadge: React.FC<{ type: 'JPG' | 'PNG' | 'OTHER' }> = ({ type }) => {
  let colorClass = 'bg-gray-100 text-gray-600 border-gray-200';
  if (type === 'JPG') {
    colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (type === 'PNG') {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <Tooltip content={`Original Format: ${type}`}>
      <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${colorClass} flex-shrink-0 uppercase tracking-wide select-none shadow-sm cursor-help`}>
        <svg className="w-3 h-3 mr-1 opacity-80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" />
        </svg>
        {type}
      </span>
    </Tooltip>
  );
};

const ImageRow: React.FC<ImageRowProps> = ({ item, onUpdate, onRetry }) => {
  // Use a ref to prevent double-firing strict mode effects if needed
  const processingRef = useRef(false);
  const qualityToUse = item.targetQuality || 0.8;

  // Trigger conversion on mount only if status is pending
  useEffect(() => {
    if (item.status === 'pending' && !processingRef.current) {
      convert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.status]);

  const convert = async () => {
    processingRef.current = true;
    // Reset error and progress when starting conversion
    onUpdate(item.id, { status: 'converting', progress: 0, error: undefined });
    try {
      const duration = item.delayDuration || 3000;
      const blob = await convertToWebP(item.originalFile, qualityToUse, duration, (progress) => {
        onUpdate(item.id, { progress });
      });
      
      const url = URL.createObjectURL(blob);
      onUpdate(item.id, {
        status: 'completed',
        webpBlob: blob,
        webpUrl: url,
        newSize: blob.size,
        progress: 100
      });
    } catch (err) {
      onUpdate(item.id, { 
        status: 'error', 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      processingRef.current = false;
    }
  };

  const handleDownload = () => {
    if (item.webpUrl) {
      const a = document.createElement('a');
      a.href = item.webpUrl;
      const originalName = item.originalFile.name.replace(/\.[^/.]+$/, "");
      a.download = `${originalName}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Calculate savings percentage - Memoized
  const savings = useMemo(() => {
    return item.newSize && item.originalSize 
      ? Math.round(((item.originalSize - item.newSize) / item.originalSize) * 100) 
      : 0;
  }, [item.newSize, item.originalSize]);

  // Calculate remaining seconds for timer - Memoized
  const secondsLeft = useMemo(() => {
    const duration = item.delayDuration || 3000;
    const progress = item.progress || 0;
    return Math.max(0, Math.ceil((duration * (1 - progress / 100)) / 1000));
  }, [item.delayDuration, item.progress]);

  const fileType = getFileType(item.originalFile);
  
  // Dynamic status text for tooltip
  const statusTooltip = useMemo(() => {
    if (item.status === 'completed') return 'Conversion Successful';
    if (item.status === 'error') return 'Conversion Failed';
    if (item.status === 'converting') return 'Processing...';
    if (item.status === 'pending') return 'Queued';
    return 'Waiting to Start';
  }, [item.status]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 hover:scale-[1.005] transition-all duration-200 ease-in-out">
      
      {/* File Info */}
      <div className="flex items-center space-x-4 mb-4 sm:mb-0 overflow-hidden flex-1 mr-4">
        <Tooltip content={statusTooltip}>
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative cursor-help
            ${item.status === 'completed' ? 'bg-green-100 text-green-600' : ''}
            ${item.status === 'error' ? 'bg-red-100 text-red-600' : ''}
            ${item.status === 'converting' || item.status === 'pending' ? 'bg-blue-50 text-[#005ea2]' : ''}
            ${item.status === 'idle' ? 'bg-gray-100 text-gray-500' : ''}
          `}>
            {item.status === 'completed' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            {item.status === 'error' && (
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {item.status === 'idle' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {(item.status === 'converting' || item.status === 'pending') && (
              <>
                {/* Circular Progress Background */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-blue-100"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-[#005ea2] transition-all duration-200 ease-out"
                    strokeDasharray={`${item.progress || 0}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </>
            )}
          </div>
        </Tooltip>
        
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center">
            <p className="text-sm font-medium text-[#1b1b1b] truncate max-w-[150px] sm:max-w-xs cursor-default" title={item.originalFile.name}>
              {item.originalFile.name}
            </p>
            <FileTypeBadge type={fileType} />
          </div>
          <div className="text-xs text-gray-500 flex items-center flex-wrap gap-x-2">
            <span title="Original File Size">{formatFileSize(item.originalSize)}</span>
            
            {/* Success state info */}
            {item.status === 'completed' && item.newSize && (
              <>
                <span>→</span>
                <span className="font-semibold text-green-700" title="New WebP File Size">{formatFileSize(item.newSize)}</span>
                {savings > 0 && <span className="text-green-600" title="Space Saved">(-{savings}%)</span>}
              </>
            )}

            {/* Separator */}
            {!item.error && <span className="text-gray-400">•</span>}
            
            {/* Quality Info */}
            {!item.error && <span title={`Converted at ${(qualityToUse * 100).toFixed(0)}% quality setting`}>Q: {(qualityToUse * 100).toFixed(0)}%</span>}

            {/* Error Display */}
            {item.error && (
              <div className="flex items-center text-red-600 ml-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                <span className="font-medium mr-1 truncate max-w-[120px] sm:max-w-[200px]" title={item.error}>
                   {getFriendlyErrorMessage(item.error)}
                </span>
                <a href="#faq" className="text-[10px] uppercase font-bold underline decoration-red-300 hover:text-red-800" title="See Troubleshooting Tips">
                  Help
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 w-full sm:w-auto">
        {item.status === 'completed' ? (
          <Tooltip content="Save WebP File">
            <button
              onClick={handleDownload}
              className="w-full sm:w-32 px-4 py-2 bg-[#005ea2] hover:bg-[#00497e] text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005ea2]"
            >
              Download
            </button>
          </Tooltip>
        ) : item.status === 'error' ? (
          <Tooltip content="Try converting again">
            <button
              onClick={() => onRetry(item.id)}
              className="w-full sm:w-32 px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Retry
            </button>
          </Tooltip>
        ) : item.status === 'idle' ? (
          <Tooltip content="Waiting for Start">
            <div className="w-full sm:w-32 h-9 flex items-center justify-center text-xs font-medium text-gray-400 border border-gray-200 bg-gray-50 rounded-md cursor-default">
              Ready
            </div>
          </Tooltip>
        ) : (
          <Tooltip content={`Progress: ${item.progress || 0}%`}>
            <div className="w-full sm:w-32 h-9 bg-gray-100 rounded-md overflow-hidden relative cursor-wait">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-300 ease-out"
                style={{ width: `${item.progress || 0}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-500">
                 {item.status === 'converting' 
                   ? (secondsLeft > 0 ? `${secondsLeft}s left` : 'Finalizing...') 
                   : 'Starting...'
                 }
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ImageRow;