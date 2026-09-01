import React from 'react';
import { X, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SlipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slipUrl: string;
  orderId?: string;
  customerName?: string;
}

export const SlipPreviewModal: React.FC<SlipPreviewModalProps> = ({
  isOpen,
  onClose,
  slipUrl,
  orderId,
  customerName
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  if (!isOpen || !slipUrl) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-black/10 dark:border-white/10 mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C18A45]" />
              <span>Payment Slip Receipt</span>
            </h3>
            <p className="text-xs opacity-60 mt-0.5">
              {orderId ? `Order Ref: #${orderId}` : ''} {customerName ? `• Customer: ${customerName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={slipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-[#C18A45]/20 hover:text-[#C18A45] transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex items-center justify-center bg-black/40 rounded-2xl p-2 min-h-[300px] max-h-[70vh] overflow-auto">
          {slipUrl.endsWith('.pdf') ? (
            <iframe src={slipUrl} className="w-full h-[500px] rounded-xl" title="Payment Receipt PDF" />
          ) : (
            <img
              src={slipUrl}
              alt="Payment Slip"
              className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-bold hover:bg-black/20 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
