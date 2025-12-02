export const convertToWebP = (
  file: File, 
  quality: number,
  duration: number = 3000,
  onProgress?: (percent: number) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    onProgress?.(0);

    const reader = new FileReader();
    
    // Track file reading progress (0-10%)
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 10);
        onProgress?.(percent);
      }
    };

    reader.onload = (event) => {
      onProgress?.(12); // File read into memory
      
      const img = new Image();
      img.onload = () => {
        onProgress?.(15); // Image loaded into DOM element
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        // Use the passed duration (default 3000ms)
        // Range for delay loop is 15% -> 98%
        const startProgress = 15;
        const endProgress = 98;
        const range = endProgress - startProgress;
        
        const updateInterval = 100; // Update progress every 100ms
        const totalUpdates = Math.ceil(duration / updateInterval);
        let updates = 0;

        const timer = setInterval(() => {
          updates++;
          
          // Linear ease for the progress bar
          const currentStepProgress = (updates / totalUpdates) * range;
          const totalProgress = Math.min(endProgress, Math.round(startProgress + currentStepProgress));
          
          if (updates >= totalUpdates) {
            clearInterval(timer);
            onProgress?.(99);
            
            // Execute actual conversion
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  onProgress?.(100);
                  resolve(blob);
                } else {
                  reject(new Error('Conversion failed'));
                }
              },
              'image/webp',
              quality
            );
          } else {
            onProgress?.(totalProgress);
          }
        }, updateInterval);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('FileReader result is empty'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};