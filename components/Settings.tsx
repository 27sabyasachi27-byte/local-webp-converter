import React from 'react';
import Tooltip from './Tooltip';

interface SettingsProps {
  globalQuality: number;
  setGlobalQuality: (q: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  globalQuality, 
  setGlobalQuality,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-[#1b1b1b] mb-4">Conversion Settings</h3>
      
      {/* Quality Setting */}
      <div className="space-y-2 mb-2">
        <div className="flex justify-between items-center mb-1">
          <Tooltip content="Lower quality = smaller size. Higher quality = better looking.">
            <label htmlFor="globalQuality" className="text-sm font-medium text-gray-700 cursor-help border-b border-dotted border-gray-400">
              Compression Quality (Default: 80%)
            </label>
          </Tooltip>
          <span className="text-sm font-mono text-[#005ea2] font-bold">
            {(globalQuality * 100).toFixed(0)}%
          </span>
        </div>
        
        <input
          id="globalQuality"
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={globalQuality}
          onChange={(e) => setGlobalQuality(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#005ea2]"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Lower Size</span>
          <span>Higher Quality</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Images will use the quality setting selected at the moment they are dropped.
      </p>
    </div>
  );
};

export default Settings;