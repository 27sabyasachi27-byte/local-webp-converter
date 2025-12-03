import React, { useEffect, useRef } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-[scaleIn_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 id="modal-title" className="text-xl font-bold text-[#1b1b1b] flex items-center">
            <span className="bg-blue-50 text-[#005ea2] p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            About LocalWebP
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-12">
          
          {/* Why Use Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#005ea2]">Why Convert JPG to WebP?</h3>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Google PageSpeed Insights often flags sites for not using <strong>Next-Gen Formats</strong>. Converting your legacy JPG and PNG images to WebP is the fastest way to fix LCP (Largest Contentful Paint) issues and improve your Core Web Vitals score.
              </p>
              <ul className="space-y-3">
                {[
                  { title: "Client-Side Privacy", desc: "Images never leave your browser." },
                  { title: "Fix LCP Errors", desc: "Reduce load times by up to 35%." },
                  { title: "Bulk Processing", desc: "Convert unlimited files instantly." },
                  { title: "Offline PWA", desc: "Works without an internet connection." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700"><strong>{item.title}:</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-[#005ea2]">How to Batch Convert Images</h3>
              <ol className="space-y-4">
                {[
                  "Drag & Drop a folder of JPG/PNG files into the box.",
                  "Select Compression Quality (80% is recommended for Web).",
                  "Click 'Start Conversion' to run the local engine.",
                  "Download a ZIP file of all your optimized WebP assets."
                ].map((step, i) => (
                  <li key={i} className="flex">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#005ea2] text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Comparison Table */}
          <section>
            <h3 className="text-xl font-bold mb-6 text-[#005ea2]">WebP vs. JPG: SEO Performance</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image Format</th>
                    <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Size (1080p)</th>
                    <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transparency</th>
                    <th scope="col" className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PageSpeed Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">Original JPG/PNG</td>
                    <td className="py-4 px-6 text-sm text-gray-500">2.5 MB</td>
                    <td className="py-4 px-6 text-sm text-gray-500">PNG Only</td>
                    <td className="py-4 px-6 text-sm text-red-500 font-medium">Poor (Slow LCP)</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="py-4 px-6 text-sm font-bold text-[#005ea2]">Optimized WebP</td>
                    <td className="py-4 px-6 text-sm text-green-600 font-bold">450 KB</td>
                    <td className="py-4 px-6 text-sm text-gray-700">Supported</td>
                    <td className="py-4 px-6 text-sm text-green-600 font-bold">90+ (Excellent)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h3 className="text-xl font-bold mb-6 text-[#005ea2]">Common SEO Questions</h3>
            <div className="space-y-4">
              {[
                {
                  q: "What is the best WebP quality setting for SEO?",
                  a: "For most websites, a quality setting of <strong>80%</strong> offers the perfect balance between file size reduction and visual fidelity. This usually results in images that are indistinguishable from the original but 30-50% smaller."
                },
                {
                  q: "How does this fix 'Serve images in next-gen formats'?",
                  a: "Google's Lighthouse audit checks if you are using modern formats like WebP or AVIF. By converting your JPG/PNG library to WebP with LocalWebP, you directly satisfy this audit requirement."
                },
                {
                  q: "Is LocalWebP secure for sensitive documents?",
                  a: "Yes. Unlike other converters that upload files to a cloud server, LocalWebP operates <strong>100% client-side</strong>. Your data never leaves this browser tab."
                },
                {
                  q: "Does WebP support transparent backgrounds?",
                  a: "Yes! WebP supports both lossy and lossless compression with transparency (alpha channel), making it a superior replacement for heavy PNG files."
                }
              ].map((faq, i) => (
                <details key={i} className="group bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-gray-800 hover:text-[#005ea2]">
                    <span>{faq.q}</span>
                    <span className="transition-transform group-open:rotate-180 text-gray-400">
                      <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="text-gray-600 px-4 pb-4 leading-relaxed">
                    <p dangerouslySetInnerHTML={{ __html: faq.a }} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#005ea2] hover:bg-[#00497e] text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005ea2]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;