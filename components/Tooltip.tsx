import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      role="tooltip"
      tabIndex={0} // Ensure div is focusable for accessibility
    >
      {children}
      {isVisible && (
        <div className={`
          absolute left-1/2 transform -translate-x-1/2 z-[100] px-2.5 py-1.5 
          bg-gray-900 text-white text-xs font-medium rounded shadow-xl whitespace-nowrap 
          transition-all duration-200 opacity-100 pointer-events-none
          ${position === 'top' ? '-top-9 mb-2' : 'top-full mt-2'}
        `}>
          {content}
          <div className={`
            absolute left-1/2 transform -translate-x-1/2 border-4 border-transparent 
            ${position === 'top' ? 'border-t-gray-900 -bottom-2' : 'border-b-gray-900 -top-2'}
          `}/>
        </div>
      )}
    </div>
  );
};

export default Tooltip;