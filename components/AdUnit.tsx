import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  width: number;
  height: number;
  label?: string;
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ width, height, label = "Ad Space", className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if this is a supported ad slot
  const isHeaderSlot = width === 728 && height === 90;
  const isSidebarSlot = width === 300 && height === 250;
  const isActiveSlot = isHeaderSlot || isSidebarSlot;

  useEffect(() => {
    // Only inject script for supported slots
    if (isActiveSlot && containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create an iframe to sandbox the ad script execution (prevents document.write issues)
      const iframe = document.createElement('iframe');
      iframe.width = width.toString();
      iframe.height = height.toString();
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.title = "Advertisement";
      
      containerRef.current.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        
        let adScript = '';
        const closingScript = '<' + '/script>'; // Split to avoid parser error
        
        if (isHeaderSlot) {
            adScript = `
                <!-- PASTE ADSTERRA 728x90 SCRIPT HERE -->
                <script type="text/javascript">
                    atOptions = {
                        'key' : 'YOUR_ADSTERRA_KEY_HERE',
                        'format' : 'iframe',
                        'height' : 90,
                        'width' : 728,
                        'params' : {}
                    };
                ${closingScript}
                <script type="text/javascript" src="//www.highperformanceformat.com/YOUR_ADSTERRA_KEY_HERE/invoke.js">${closingScript}
            `;
        } else if (isSidebarSlot) {
            adScript = `
                <!-- PASTE ADSTERRA 300x250 SCRIPT HERE -->
                <script type="text/javascript">
                    atOptions = {
                        'key' : 'YOUR_SECOND_ADSTERRA_KEY',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                ${closingScript}
                <script type="text/javascript" src="//www.highperformanceformat.com/YOUR_SECOND_ADSTERRA_KEY/invoke.js">${closingScript}
            `;
        }

        doc.write(`
          <!DOCTYPE html>
          <html>
            <body style="margin:0;padding:0;background:transparent;">
              <div class="ad-banner" style="background:none; border:none; display:flex; justify-content:center;">
                ${adScript}
              </div>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [width, height, isHeaderSlot, isSidebarSlot, isActiveSlot]);

  // Render the Adsterra Iframe container for active slots
  if (isActiveSlot) {
    return (
      <div 
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ width: '100%', maxWidth: width, height: height }}
      />
    );
  }

  // Render Placeholder for unsupported sizes (fallback)
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