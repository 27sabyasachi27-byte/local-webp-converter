
import React, { useState, useCallback, useEffect, useRef } from 'react';
import DropZone from './components/DropZone';
import Settings from './components/Settings';
import ImageRow from './components/ImageRow';
import AdUnit from './components/AdUnit';
import Toast from './components/Toast';
import Tooltip from './components/Tooltip';
import AboutModal from './components/AboutModal';
import { ProcessedImage } from './types';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [globalQuality, setGlobalQuality] = useState(0.8);
  const [showToast, setShowToast] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Use a ref to access the latest images state in event listeners without stale closures
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const handleFilesAdded = useCallback((newFiles: ProcessedImage[]) => {
    // Use the current slider value as the target quality for these files
    const effectiveQuality = globalQuality;

    setImages(currentImages => {
      // Logic for delay:
      // Reduced significantly to max 20 seconds.
      const totalNew = newFiles.length;
      
      // Dynamic delay calculation:
      // Base: 3s
      // Incremental: +1s per file
      // Cap: 20s
      const delay = Math.min(20000, 3000 + (totalNew * 1000));

      const filesWithSettings = newFiles.map(f => ({ 
        ...f, 
        delayDuration: delay,
        targetQuality: effectiveQuality
      }));

      return [...currentImages, ...filesWithSettings];
    });
  }, [globalQuality]);

  const handleStartConversion = useCallback(() => {
    setImages(prev => prev.map(img => 
      img.status === 'idle' ? { ...img, status: 'pending' } : img
    ));
  }, []);

  const handleUpdateImage = useCallback((id: string, updates: Partial<ProcessedImage>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const handleRetry = useCallback((id: string) => {
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        // Reset state to pending, clear errors
        // Also reduce delay to single-file duration (3s) for retry UX
        return { 
          ...img, 
          status: 'pending', 
          error: undefined, 
          progress: 0,
          delayDuration: 3000 
          // targetQuality is preserved!
        };
      }
      return img;
    }));
  }, []);

  // Updated to use imagesRef for stability in keyboard shortcuts
  const handleDownloadAll = useCallback(async () => {
    const currentImages = imagesRef.current;
    const completedImages = currentImages.filter(img => img.status === 'completed' && img.webpBlob);
    if (completedImages.length === 0) return;

    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();

      completedImages.forEach(img => {
        let baseName = img.originalFile.name.replace(/\.[^/.]+$/, "");
        let fileName = `${baseName}.webp`;
        let counter = 1;

        // Ensure unique filenames within the zip
        while (usedNames.has(fileName)) {
          fileName = `${baseName}_${counter}.webp`;
          counter++;
        }
        
        usedNames.add(fileName);
        zip.file(fileName, img.webpBlob as Blob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LocalWebP_converted_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip:", error);
      alert("Failed to create zip file. Please try downloading images individually.");
    }
  }, []);

  const handleClearCompleted = useCallback(() => {
    setImages(prev => {
      const kept: ProcessedImage[] = [];
      prev.forEach(img => {
        if (img.status === 'completed') {
           // Cleanup memory
           if (img.webpUrl) URL.revokeObjectURL(img.webpUrl);
        } else {
           kept.push(img);
        }
      });
      return kept;
    });
  }, []);

  const handleClearErrors = useCallback(() => {
    setImages(prev => prev.filter(img => img.status !== 'error'));
    setShowToast(false);
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field (though currently few exist)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.target.type === 'text' || e.target.type === 'textarea' || e.target.type === 'number') {
          return;
        }
      }
      
      // Ignore if modifier keys are pressed (e.g. Ctrl+S to save page)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      // Ignore if modal is open
      if (isAboutOpen) return;

      const key = e.key.toLowerCase();

      if (key === 's') {
        // Only start if there are idle images
        const hasIdle = imagesRef.current.some(img => img.status === 'idle');
        if (hasIdle) {
          handleStartConversion();
        }
      } else if (key === 'd') {
        handleDownloadAll();
      } else if (key === 'c') {
        handleClearCompleted();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartConversion, handleDownloadAll, handleClearCompleted, isAboutOpen]);

  // --- Logic for Toast Notification ---
  const isProcessing = images.some(img => img.status === 'pending' || img.status === 'converting');
  const failedCount = images.filter(img => img.status === 'error').length;
  const idleCount = images.filter(img => img.status === 'idle').length;
  const processingRef = useRef(false);

  useEffect(() => {
    // Check for transition from processing -> not processing
    if (processingRef.current && !isProcessing && images.length > 0) {
      if (failedCount > 0) {
        setShowToast(true);
      }
    }
    
    // If processing starts again (e.g. retry), hide toast
    if (isProcessing) {
      setShowToast(false);
    }

    processingRef.current = isProcessing;
  }, [isProcessing, images.length, failedCount]);
  // ------------------------------------

  const completedCount = images.filter(img => img.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#1b1b1b]">
      
      {/* Navigation / Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.location.reload()}>
             {/* Custom Logo SVG */}
             <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield Base */}
                <path d="M20.0001 2L5.00006 7.625V19.8125C5.00006 29.0812 11.3751 37.6687 20.0001 40C28.6251 37.6687 35.0001 29.0812 35.0001 19.8125V7.625L20.0001 2Z" fill="#005ea2"/>
                {/* File Icon Document */}
                <path d="M26.25 12.5H13.75C13.0625 12.5 12.5 13.0625 12.5 13.75V28.75C12.5 29.4375 13.0625 30 13.75 30H26.25C26.9375 30 27.5 29.4375 27.5 28.75V13.75C27.5 13.0625 26.9375 12.5 26.25 12.5Z" fill="#F9FAFB" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Image Inside File */}
                <path d="M27.5 25L23.125 20L19.375 24.375L16.875 21.875L12.5 26.25" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17.5" cy="17.5" r="1.5" fill="#374151"/>
             </svg>
             
             <div>
               <div className="text-2xl font-bold tracking-tight text-[#005ea2] leading-none group-hover:opacity-90 transition-opacity">
                 LocalWebP
               </div>
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-sm font-medium text-gray-600 hover:text-[#005ea2] transition-colors focus:outline-none"
            >
              About LocalWebP
            </button>

            <Tooltip content="Verified: Files never leave your browser" position="bottom">
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full cursor-help">
                 <svg className="w-4 h-4 text-[#005ea2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
                <span className="text-xs font-semibold text-[#005ea2] hidden sm:inline">
                  100% Private & Secure
                </span>
              </div>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="bg-[#f0f9ff] border-b border-blue-100">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
             <div className="text-center max-w-3xl mx-auto">
               <h1 className="text-3xl font-extrabold text-[#1b1b1b] sm:text-4xl mb-4">
                 WebP Converter: Bulk JPG & PNG to WebP
               </h1>
               <p className="text-lg text-gray-700 font-medium">
                 Free, Secure, & Offline tool to fix Core Web Vitals.
                 <br className="hidden sm:block" />
                 <span className="text-[#005ea2]">100% Client-Side Privacy.</span>
               </p>
               <p className="mt-4 text-sm text-gray-500 max-w-2xl mx-auto">
                 Photos are processed locally on your device's CPU. 
                 No uploads. No cloud servers. No data leaks.
               </p>
             </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Top Ad Unit */}
          <div className="w-full flex justify-center mb-8">
            <AdUnit width={728} height={90} label="AdSense Banner" className="hidden md:flex" />
            <AdUnit width={320} height={100} label="AdSense Mobile" className="flex md:hidden" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#1b1b1b]">Upload Images</h2>
                </div>
                <DropZone onFilesAdded={handleFilesAdded} />
                
                {idleCount > 0 && (
                  <Tooltip content="Start processing all pending images (Press 'S')" position="top">
                    <button
                      onClick={handleStartConversion}
                      className="w-full mt-4 flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#005ea2] hover:bg-[#00497e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005ea2] transition-colors animate-[fadeIn_0.3s_ease-out]"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Conversion ({idleCount} pending)
                    </button>
                  </Tooltip>
                )}
              </div>

              <Settings 
                globalQuality={globalQuality} 
                setGlobalQuality={setGlobalQuality}
              />

              <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Tooltip content="Security Guarantee">
                      <svg className="h-5 w-5 text-gray-500 cursor-help" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </Tooltip>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">
                      <strong>Privacy Note:</strong> Your photos never leave this device. LocalWebP uses your browser's engine to process images securely.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                   <h2 className="text-lg font-semibold text-[#1b1b1b]">Conversion Results</h2>
                   {images.length > 0 ? (
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-[#005ea2]">{completedCount}</span> of <span className="font-semibold">{images.length}</span> converted
                    </p>
                   ) : (
                    <span className="text-sm text-gray-500">Ready to process unlimited files</span>
                   )}
                </div>
                {completedCount > 0 && (
                  <div className="flex items-center space-x-3">
                    <Tooltip content="Remove finished items from list (Press 'C')">
                      <button
                        onClick={handleClearCompleted}
                        className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Clear Done
                      </button>
                    </Tooltip>
                    <Tooltip content="Download all files as a single ZIP (Press 'D')">
                      <button 
                        onClick={handleDownloadAll}
                        className="flex items-center px-4 py-2 bg-[#005ea2] hover:bg-[#00497e] text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005ea2]"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download All
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {images.length === 0 ? (
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center min-h-[320px] flex flex-col items-center justify-center">
                    <div className="mb-4">
                       <AdUnit width={300} height={250} label="Ad Space" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      Results Area
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Converted files will appear here
                    </p>
                  </div>
                ) : (
                  images.map((img) => (
                    <ImageRow 
                      key={img.id} 
                      item={img} 
                      onUpdate={handleUpdateImage}
                      onRetry={handleRetry}
                    />
                  ))
                )}
              </div>

              {/* Sidebar Ad (Shows at bottom of results list on mobile/desktop) */}
              <div className="mt-8 flex justify-center lg:justify-end">
                <AdUnit width={300} height={250} label="Sidebar Ad" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Ad Unit (New) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center bg-[#f8fafc]">
        <AdUnit width={300} height={250} label="Bottom Banner" className="hidden md:flex" />
        <AdUnit width={320} height={100} label="Bottom Mobile" className="flex md:hidden" />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
             <div>
                <h4 className="font-semibold text-gray-900 mb-2">LocalWebP Utility</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  A high-performance PWA for bulk converting JPG and PNG images to WebP. 
                  Optimized for government, enterprise, and SEO professionals.
                </p>
             </div>
             <div className="md:text-right">
               <h4 className="font-semibold text-gray-900 mb-2">Quick Links</h4>
               <ul className="text-sm text-gray-500 space-y-1">
                 <li><button onClick={() => setIsAboutOpen(true)} className="hover:text-[#005ea2]">Fix Core Web Vitals</button></li>
                 <li><button onClick={() => setIsAboutOpen(true)} className="hover:text-[#005ea2]">Next-Gen Formats</button></li>
                 <li><button onClick={() => setIsAboutOpen(true)} className="hover:text-[#005ea2]">JPG to WebP Guide</button></li>
               </ul>
             </div>
          </div>
          <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} LocalWebP. 100% Client-Side. No Server Uploads.
          </div>
        </div>
      </footer>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Summary Toast */}
      {showToast && (
        <Toast 
          failedCount={failedCount} 
          onClearErrors={handleClearErrors} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
};

export default App;
