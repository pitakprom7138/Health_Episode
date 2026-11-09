import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md relative no-print border-b border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
          </span>
          <div>
            <span className="font-bold tracking-wide mr-2 text-amber-200">ข้อควรระวังสำคัญสำหรับผู้ป่วย:</span>
            <span>
              หากพบอาการฉุกเฉิน เช่น แน่นหน้าอก หายใจลำบาก แขนขาอ่อนแรงฉับพลัน หรือไข้สูงรุนแรง 
              <strong> กรุณาติดต่อสายด่วน 1669 หรือไปห้องฉุกเฉินโรงพยาบาลทันที</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:1669"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 font-bold rounded-md hover:bg-red-50 transition text-xs shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            โทร 1669 ฉุกเฉิน
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition"
            title="ปิดการแจ้งเตือนชั่วคราว"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
