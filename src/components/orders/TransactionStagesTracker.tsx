import React from 'react';
import { Order } from '../../types/package';
import {
  Check,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  CreditCard,
  MapPin,
  Calendar
} from 'lucide-react';

interface TransactionStagesTrackerProps {
  order: Order;
  isAmharic?: boolean;
}

interface StageStep {
  stepNumber: number;
  id: string;
  title: string;
  amharicTitle: string;
  description: string;
  amharicDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp?: string;
}

export const TransactionStagesTracker: React.FC<TransactionStagesTrackerProps> = ({
  order,
  isAmharic = false
}) => {
  const isRes = Boolean(order.isReservation);
  const status = order.status;
  const isRejected = status === 'rejected';

  // Define stages for Direct Full Orders
  const directStages: StageStep[] = [
    {
      stepNumber: 1,
      id: 'slip_submitted',
      title: 'Payment Slip Submitted',
      amharicTitle: 'የክፍያ ደረሰኝ ተልኳል',
      description: 'Transfer slip uploaded and under admin review',
      amharicDescription: 'የክፍያ ደረሰኝ ተልኮ በአድሚን እየተረጋገጠ ነው',
      icon: FileText,
      timestamp: order.createdAt
    },
    {
      stepNumber: 2,
      id: 'payment_verified',
      title: 'Payment Verified & Confirmed',
      amharicTitle: 'ክፍያ ተረጋግጧል & ከብቱ ተይዟል',
      description: 'Payment confirmed! Livestock/package secured and tagged',
      amharicDescription: 'ክፍያዎ ጸድቋል! ከብቱ ወይም ጥቅሉ ተዘጋጅቶ ተመድቧል',
      icon: ShieldCheck,
      timestamp: order.verifiedAt
    },
    {
      stepNumber: 3,
      id: 'dispatched_or_ready',
      title: order.isDelivery
        ? (status === 'delivery_pending' ? 'Dispatched / In Transit' : 'Preparing for Dispatch')
        : (status === 'pickup_ready' ? 'Ready for Hub Pickup' : 'Preparing for Pickup'),
      amharicTitle: order.isDelivery
        ? (status === 'delivery_pending' ? 'በጉዞ ላይ ነው' : 'ለመላክ በመዘጋጀት ላይ')
        : (status === 'pickup_ready' ? 'ለርክክብ ዝግጁ ነው' : 'ለርክክብ በመዘጋጀት ላይ'),
      description: order.isDelivery
        ? (status === 'delivery_pending'
            ? `Dispatched via ${order.vehicleName || order.vehicleType || 'vehicle'} to ${order.deliveryAddress || 'your address'}`
            : 'Delivery vehicle is being scheduled and prepared')
        : (status === 'pickup_ready'
            ? 'Your livestock/order is ready for collection at Jonny Livestock Supplier Hub'
            : 'Livestock is being prepped and tagged for pickup'),
      amharicDescription: order.isDelivery
        ? (status === 'delivery_pending'
            ? `በ${order.vehicleName || order.vehicleType || 'ተሽከርካሪ'} ወደ መድረሻዎ በመጓጓዝ ላይ ነው`
            : 'ተሽከርካሪ በመመደብና በመዘጋጀት ላይ ነው')
        : (status === 'pickup_ready'
            ? 'ከብቱ/ጥቅሉ በጆኒ የቀንድ ከብት አቅራቢ ማዕከል ለመረከብ ዝግጁ ነው'
            : 'ከብቱ ለማዕከል ርክክብ እየተዘጋጀ ነው'),
      icon: order.isDelivery ? Truck : MapPin,
      timestamp: order.deliveryApprovedAt
    },
    {
      stepNumber: 4,
      id: 'completed',
      title: order.isDelivery ? 'Delivered to Customer Door' : 'Fulfilled & Collected',
      amharicTitle: order.isDelivery ? 'በስኬት ደርሷል' : 'ተረክበው ተጠናቋል',
      description: order.isDelivery
        ? 'Delivered to your address and transaction completed'
        : 'Customer picked up from hub and transaction completed',
      amharicDescription: order.isDelivery
        ? 'በአድራሻዎ ደርሶ ትዕዛዙ በስኬት ተጠናቋል'
        : 'ከማዕከል ተረክበው ትዕዛዙ በስኬት ተጠናቋል',
      icon: CheckCircle2,
      timestamp: order.deliveredAt
    }
  ];

  // Define stages for 50% Reservations
  const reservationStages: StageStep[] = [
    {
      stepNumber: 1,
      id: 'deposit_submitted',
      title: '50% Deposit Slip Submitted',
      amharicTitle: '50% የቅድመ ክፍያ ደረሰኝ ተልኳል',
      description: 'Half-deposit uploaded and pending review',
      amharicDescription: 'ግማሽ ክፍያ ተልኮ በአድሚን ማረጋገጫ በመጠባበቅ ላይ',
      icon: Clock,
      timestamp: order.createdAt
    },
    {
      stepNumber: 2,
      id: 'reservation_locked',
      title: 'Reservation Confirmed (Locked)',
      amharicTitle: 'ይዞታው ተረጋግጧል (ተቆልፏል)',
      description: 'Animal/package held exclusively for you',
      amharicDescription: 'ከብቱ ለእርስዎ ብቻ በይዞታ ተቆልፎ ተቀምጧል',
      icon: Lock,
      timestamp: order.verifiedAt
    },
    {
      stepNumber: 3,
      id: 'final_payment_review',
      title: order.isDelivery
        ? (status === 'delivery_pending' ? 'Dispatched / In Transit' : 'Final 50% Payment / Dispatch')
        : (status === 'pickup_ready' ? 'Ready for Hub Pickup' : 'Final 50% Payment / Pickup'),
      amharicTitle: order.isDelivery
        ? (status === 'delivery_pending' ? 'በጉዞ ላይ ነው' : 'የቀሪ ክፍያ / የማድረስ ሂደት')
        : (status === 'pickup_ready' ? 'ለርክክብ ዝግጁ ነው' : 'የቀሪ ክፍያ / የርክክብ ዝግጅት'),
      description: order.isDelivery
        ? (status === 'delivery_pending'
            ? `Dispatched via ${order.vehicleName || order.vehicleType || 'vehicle'} to ${order.deliveryAddress || 'destination'}`
            : 'Final payment verified, preparing vehicle delivery dispatch')
        : (status === 'pickup_ready'
            ? 'Final payment settled, order ready for collection at Jonny Livestock Hub'
            : 'Final payment verified, preparing animal for hub pickup'),
      amharicDescription: order.isDelivery
        ? (status === 'delivery_pending'
            ? `በ${order.vehicleName || order.vehicleType || 'ተሽከርካሪ'} በመጓጓዝ ላይ ነው`
            : 'ቀሪ ክፍያ ተረጋግጦ ለመላክ በመዘጋጀት ላይ ነው')
        : (status === 'pickup_ready'
            ? 'ቀሪ ክፍያ ተረጋግጧል፣ በማዕከል ለመረከብ ዝግጁ ነው'
            : 'ቀሪ ክፍያ ተረጋግጦ ለማዕከል ርክክብ በመዘጋጀት ላይ ነው'),
      icon: order.isDelivery ? Truck : CreditCard,
      timestamp: order.deliveryApprovedAt || order.finalVerifiedAt
    },
    {
      stepNumber: 4,
      id: 'settled_and_fulfilled',
      title: order.isDelivery ? 'Delivered & Completed' : 'Fully Paid & Picked Up',
      amharicTitle: order.isDelivery ? 'በስኬት ደርሶ ተጠናቋል' : 'ተረክበው ሙሉ በሙሉ ተጠናቋል',
      description: '100% payment settled, animal marked SOLD and fulfilled',
      amharicDescription: 'ሙሉ ክፍያ ተጠናቋል፣ ከብቱ ተሸጧል ተብሎ ተረክበዋል',
      icon: CheckCircle2,
      timestamp: order.deliveredAt || order.finalVerifiedAt
    }
  ];

  const stages = isRes ? reservationStages : directStages;

  // Determine current active step index (0-based)
  const getActiveStepIndex = (): number => {
    if (isRejected) return 0;

    if (!isRes) {
      // Direct orders
      if (status === 'delivered' || status === 'completed') return 3;
      if (order.isDelivery) {
        if (status === 'delivery_pending') return 2;
        if (status === 'verified') return 1;
      } else {
        if (status === 'pickup_ready') return 2;
        if (status === 'verified') return 1;
      }
      return 0; // pending_verification
    } else {
      // Reservations
      if (status === 'delivered' || status === 'completed') return 3;
      if (order.isDelivery) {
        if (status === 'delivery_pending') return 2;
        if (status === 'verified') return 2;
      } else {
        if (status === 'pickup_ready') return 2;
        if (status === 'verified') return 2;
      }
      if (status === 'final_payment_pending') return 2;
      if (status === 'reserved') return 1;
      return 0; // reservation_pending
    }
  };

  const currentStepIndex = getActiveStepIndex();

  return (
    <div className="space-y-4">
      {/* If Rejected Banner */}
      {isRejected ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">
              {isAmharic ? 'ትዕዛዙ ውድቅ ተደርጓል' : 'Transaction Rejected by Admin'}
            </h4>
            <p className="text-xs opacity-90">
              {order.adminNotes ||
                (isAmharic
                  ? 'የተላከው የክፍያ ደረሰኝ ሊረጋገጥ አልቻለም። እባክዎ እንደገና ይሞክሩ ወይም ያግኙን።'
                  : 'The payment transfer slip could not be confirmed. Please contact support or re-submit a valid slip.')}
            </p>
          </div>
        </div>
      ) : (
        /* Stepper Container */
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
            {stages.map((stage, idx) => {
              const isCompleted = idx < currentStepIndex || (!isRejected && currentStepIndex === 3 && idx === 3);
              const isCurrent = idx === currentStepIndex && !isCompleted;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm ring-1 ring-amber-500/20'
                      : isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-50'
                  }`}
                >
                  <div>
                    {/* Header: Stage Number & Status Pill */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 animate-pulse'
                            : 'bg-black/10 dark:bg-white/10 text-neutral-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                          {isAmharic ? 'የአሁን ደረጃ' : 'Active'}
                        </span>
                      )}

                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                          ✓ {isAmharic ? 'ተጠናቋል' : 'Done'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h5
                      className={`font-bold text-xs leading-snug line-clamp-2 ${
                        isCurrent
                          ? 'text-amber-500 dark:text-amber-400'
                          : isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-500'
                      }`}
                    >
                      {isAmharic ? stage.amharicTitle : stage.title}
                    </h5>

                    {/* Description */}
                    <p className="text-[11px] opacity-75 mt-1 leading-relaxed line-clamp-2">
                      {isAmharic ? stage.amharicDescription : stage.description}
                    </p>
                  </div>

                  {/* Timestamp if available */}
                  {stage.timestamp && (isCompleted || isCurrent) && (
                    <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-1 text-[10px] opacity-60">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(stage.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
