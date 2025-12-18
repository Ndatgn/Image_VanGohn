import React, { useState, useRef, useCallback } from 'react';
import { ProcessingStatus, StyleIntensity, AppState } from './types';
import { fileToBase64, downloadImage } from './utils';
import { transformImageToVanGogh } from './services/geminiService';
import { Controls } from './components/Controls';
import { ImageIcon } from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    originalImage: null,
    processedImage: null,
    status: ProcessingStatus.IDLE,
    intensity: StyleIntensity.MEDIUM,
    errorMessage: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset processed image when new image is uploaded
    setState(prev => ({ ...prev, status: ProcessingStatus.UPLOADING, errorMessage: null }));

    try {
      const base64 = await fileToBase64(file);
      setState(prev => ({
        ...prev,
        originalImage: base64,
        processedImage: null,
        status: ProcessingStatus.IDLE
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: ProcessingStatus.ERROR,
        errorMessage: "Failed to read image file."
      }));
    }
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleProcess = useCallback(async () => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, status: ProcessingStatus.PROCESSING, errorMessage: null }));

    try {
      const resultImage = await transformImageToVanGogh(state.originalImage, state.intensity);
      setState(prev => ({
        ...prev,
        processedImage: resultImage,
        status: ProcessingStatus.SUCCESS
      }));
    } catch (error: any) {
      let msg = "An unexpected error occurred.";
      if (error instanceof Error) msg = error.message;
      
      setState(prev => ({
        ...prev,
        status: ProcessingStatus.ERROR,
        errorMessage: msg
      }));
    }
  }, [state.originalImage, state.intensity]);

  const handleDownload = () => {
    if (state.processedImage) {
      downloadImage(state.processedImage, `vangogh-art-${Date.now()}.png`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-vangogh-bg overflow-hidden font-sans text-gray-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Sidebar Controls */}
      <Controls 
        status={state.status}
        intensity={state.intensity}
        setIntensity={(i) => setState(prev => ({...prev, intensity: i}))}
        onUploadClick={handleUploadClick}
        onProcessClick={handleProcess}
        onDownloadClick={handleDownload}
        hasOriginal={!!state.originalImage}
        hasProcessed={!!state.processedImage}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* Error Notification */}
        {state.status === ProcessingStatus.ERROR && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-900/90 text-red-100 p-4 rounded-lg border border-red-700 shadow-xl backdrop-blur flex justify-between items-center max-w-2xl mx-auto">
            <span>{state.errorMessage}</span>
            <button 
              onClick={() => setState(prev => ({ ...prev, status: ProcessingStatus.IDLE, errorMessage: null }))}
              className="text-white hover:text-red-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 flex items-center justify-center bg-[#151515] bg-[radial-gradient(#252525_1px,transparent_1px)] [background-size:16px_16px]">
          
          <div className="w-full h-full flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center max-w-7xl">
            
            {/* Original Image Container */}
            <div className={`relative flex flex-col flex-1 w-full h-full max-h-[80vh] bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-700 overflow-hidden transition-all duration-300 ${!state.originalImage ? 'items-center justify-center' : ''}`}>
              {!state.originalImage ? (
                <div className="text-center p-8 text-gray-500 flex flex-col items-center">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Image Loaded</p>
                  <p className="text-sm mt-2">Upload a photo to begin your masterpiece</p>
                </div>
              ) : (
                <>
                  <div className="absolute top-0 left-0 bg-black/70 text-white text-xs px-3 py-1 rounded-br-lg z-10 backdrop-blur-sm font-medium tracking-wider">
                    ORIGINAL
                  </div>
                  <img 
                    src={state.originalImage} 
                    alt="Original" 
                    className="w-full h-full object-contain p-2" 
                  />
                </>
              )}
            </div>

            {/* Arrow or Divider for Mobile */}
            {state.originalImage && (
              <div className="text-gray-600 md:rotate-0 rotate-90">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )}

            {/* Processed Image Container */}
            <div className={`relative flex flex-col flex-1 w-full h-full max-h-[80vh] bg-gray-900/50 rounded-xl border-2 border-gray-700 overflow-hidden transition-all duration-300 ${!state.processedImage ? 'items-center justify-center border-dashed' : 'border-vangogh-gold/50 shadow-[0_0_30px_rgba(241,196,15,0.1)]'}`}>
              
              {!state.processedImage ? (
                <div className="text-center p-8 text-gray-500 flex flex-col items-center">
                   {state.status === ProcessingStatus.PROCESSING ? (
                     <div className="flex flex-col items-center animate-pulse">
                       <div className="w-16 h-16 border-4 border-vangogh-gold/30 border-t-vangogh-gold rounded-full animate-spin mb-4"></div>
                       <p className="text-vangogh-gold font-medium">The artist is working...</p>
                       <p className="text-xs text-gray-500 mt-2">Analyzing gradients and applying impasto</p>
                     </div>
                   ) : (
                     <>
                      <div className="w-16 h-16 mb-4 border-2 border-gray-700 rounded-lg flex items-center justify-center opacity-50">
                        <span className="text-2xl font-serif italic text-gray-600">Vg</span>
                      </div>
                      <p className="text-lg font-medium">Canvas Empty</p>
                      <p className="text-sm mt-2">Click "Apply Style" to generate art</p>
                     </>
                   )}
                </div>
              ) : (
                <>
                  <div className="absolute top-0 left-0 bg-vangogh-gold text-black text-xs px-3 py-1 rounded-br-lg z-10 font-bold tracking-wider shadow-lg">
                    MASTERPIECE
                  </div>
                  <img 
                    src={state.processedImage} 
                    alt="Van Gogh Style" 
                    className="w-full h-full object-contain p-2 animate-in fade-in duration-700" 
                  />
                </>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;