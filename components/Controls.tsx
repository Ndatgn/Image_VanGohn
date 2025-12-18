import React from 'react';
import { StyleIntensity, ProcessingStatus } from '../types';
import { UploadIcon, BrushIcon, DownloadIcon, LoaderIcon } from './Icons';

interface ControlsProps {
  status: ProcessingStatus;
  intensity: StyleIntensity;
  setIntensity: (i: StyleIntensity) => void;
  onUploadClick: () => void;
  onProcessClick: () => void;
  onDownloadClick: () => void;
  hasOriginal: boolean;
  hasProcessed: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  status,
  intensity,
  setIntensity,
  onUploadClick,
  onProcessClick,
  onDownloadClick,
  hasOriginal,
  hasProcessed
}) => {
  const isProcessing = status === ProcessingStatus.PROCESSING;

  return (
    <div className="w-full md:w-72 bg-vangogh-sidebar border-r border-gray-800 flex flex-col p-6 space-y-8 h-auto md:h-full shrink-0">
      <div>
        <h1 className="text-vangogh-gold font-bold text-2xl tracking-wide mb-1">VAN GOGH</h1>
        <h2 className="text-gray-400 text-sm font-medium tracking-widest uppercase">BY DAT VU</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onUploadClick}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-vangogh-blue hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadIcon className="w-5 h-5" />
            <span>Load Image</span>
          </button>

          <button
            onClick={onProcessClick}
            disabled={!hasOriginal || isProcessing}
            className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-4 rounded transition-colors ${
              !hasOriginal || isProcessing 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-vangogh-orange hover:bg-orange-600 text-white'
            }`}
          >
            {isProcessing ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <BrushIcon className="w-5 h-5" />}
            <span>{isProcessing ? 'Painting...' : 'Apply Style'}</span>
          </button>

          <button
            onClick={onDownloadClick}
            disabled={!hasProcessed || isProcessing}
            className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-4 rounded transition-colors ${
              !hasProcessed || isProcessing
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-vangogh-green hover:bg-green-600 text-white'
            }`}
          >
            <DownloadIcon className="w-5 h-5" />
            <span>Save Art</span>
          </button>
        </div>

        {/* Settings */}
        <div className="pt-6 border-t border-gray-700">
          <h3 className="text-gray-300 font-medium mb-4">Stroke Intensity</h3>
          <div className="space-y-3">
            {Object.values(StyleIntensity).map((value) => (
              <label 
                key={value}
                className={`flex items-center p-3 rounded cursor-pointer border transition-all ${
                  intensity === value 
                    ? 'bg-gray-800 border-vangogh-gold text-vangogh-gold' 
                    : 'bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="intensity"
                  className="hidden"
                  checked={intensity === value}
                  onChange={() => setIntensity(value)}
                  disabled={isProcessing}
                />
                <div className={`w-3 h-3 rounded-full mr-3 ${intensity === value ? 'bg-vangogh-gold' : 'bg-gray-600'}`}></div>
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600 mt-auto">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};