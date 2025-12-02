import React from 'react';

interface ToastProps {
  failedCount: number;
  onClearErrors: () => void;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ failedCount, onClearErrors, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white border border-gray-200 shadow-lg rounded-lg pointer-events-auto p-4 flex items-start animate-[slideInUp_0.3s_ease-out]">
      <div className="flex-shrink-0">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-gray-900">
          Conversion Finished
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {failedCount} image{failedCount === 1 ? '' : 's'} failed to convert.
        </p>
        <div className="mt-3 flex space-x-7">
          <button
            type="button"
            onClick={onClearErrors}
            className="bg-white rounded-md text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Clear Failed
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-white rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Dismiss
          </button>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;