import React from 'react';

interface AdUnitProps {
  width: number;
  height: number;
  label?: string;
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ width, height, label = "Ad Space", className = "" }) => {
  return (
    <div 
      className={`bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center flex-col text-gray-400 text-xs uppercase tracking-wider rounded ${className}`}
      style={{ width: '100%', maxWidth: width, height: height }}
    >
      <span className="mb-1 font-semibold">{label}</span>
      <span className="text-[10px]">{width}x{height}</span>
    </div>
  );
};

export default AdUnit;