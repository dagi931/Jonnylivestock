import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../../types/package';
import { useTheme } from '../../context/ThemeContext';
import { api, BankAccount } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';

interface FinalPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FinalPaymentModal: React.FC<FinalPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  const [transactionRef, setTransactionRef] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      const banks = await api.getBankAccounts();
      if (banks && banks.length > 0) {
        setBankAccounts(banks);
        setSelectedBankId(banks[0].id);
      }
    };
    if (isOpen) {
      fetchBanks();
      setIsSuccess(false);
      setSubmitError(null);
      setSlipFile(null);
      setSlipPreviewUrl(null);
      setTransactionRef('');
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const remainingBalance = order.remainingAmount || (order.totalAmount * 0.5);
  const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      const url = URL.createObjectURL(file);
      setSlipPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSlipFile(file);
      const url = URL.createObjectURL(file);
      setSlipPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      setSubmitError('Please attach your remaining balance payment screenshot/receipt');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('finalPaymentSlip', slipFile);
      if (selectedBank) formData.append('paymentMethod', selectedBank.bankName);
      if (transactionRef.trim()) formData.append('transactionReference', transactionRef.trim());

      const res = await api.submitFinalPayment(order.id, formData);

      if (res.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setSubmitError(res.error || 'Failed to submit final payment slip. Please try again.');
      }
    } catch (err: any) {
      console.error('Final payment submission error:', err);
      setSubmitError(err.message || 'Network error during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-white border-[#E4D4BC] text-[#241A12]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 flex items-center justify-between border-b ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">Complete Remaining 50% Payment</h3>
              <p className="text-xs opacity-75">
                Reservation: <span className="font-mono font-bold text-amber-500">{order.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-xl text-emerald-500">
                Final Payment Receipt Submitted!
              </h4>
              <p className="text-sm opacity-80 max-w-md mx-auto">
                Thank you! Our admin team has been notified to verify your remaining balance. Once approved, your order status will update to <strong className="text-emerald-500">Completed</strong> and your item/package will be dispatched for free delivery!
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold transition-all shadow-lg"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order Summary Box */}
              <div
                className={`p-4 rounded-2xl border space-y-2 text-sm ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="flex justify-between">
                  <span className="opacity-70">Item / Package:</span>
                  <span className="font-bold">{order.packageName || order.animalBreed || 'Reserved Item'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Total Value:</span>
                  <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-500">
                  <span>50% Deposit Already Paid:</span>
                  <span className="font-bold">{formatPrice(order.depositAmount || order.totalAmount * 0.5)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10 text-base font-bold text-amber-500">
                  <span>Remaining 50% Balance Due:</span>
                  <span>{formatPrice(remainingBalance)}</span>
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Choose Account to Transfer To:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {bankAccounts.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedBankId === b.id
                          ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                          : isDark
                            ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0] hover:border-amber-500/50'
                            : 'bg-white border-[#E4D4BC] text-[#241A12] hover:border-amber-500/50'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{b.bankName}</div>
                    </button>
                  ))}
                </div>

                {selectedBank && (
                  <div
                    className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="opacity-70">Account:</span>
                      <span className="font-bold">{selectedBank.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-70">Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500">{selectedBank.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedBank.accountNumber, selectedBank.id)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          {copiedBankId === selectedBank.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Receipt */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  Upload Final Balance Transfer Receipt <span className="text-red-500">*</span>
                </label>

                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : slipPreviewUrl
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : isDark
                          ? 'border-[#4A2C16] hover:border-amber-500/50 bg-[#24170D]'
                          : 'border-[#E4D4BC] hover:border-amber-500/50 bg-[#FAF7F0]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />

                  {slipPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={slipPreviewUrl}
                        alt="Payment Slip Preview"
                        className="max-h-36 mx-auto rounded-xl shadow-md object-contain border"
                      />
                      <div className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Slip Attached ({slipFile?.name})
                      </div>
                      <p className="text-[11px] opacity-60">Click or drag to change receipt</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold">Attach screenshot of remaining {formatPrice(remainingBalance)} transfer</div>
                      <div className="text-[11px] opacity-60">Supports JPG, PNG, PDF (Telebirr or Bank SMS/Slip)</div>
                    </div>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Final Payment ({formatPrice(remainingBalance)})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
