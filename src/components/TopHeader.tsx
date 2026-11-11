import React from 'react';
import { Menu, HeartPulse, PhoneCall, User, Stethoscope, ShieldCheck, Link2 } from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';

interface TopHeaderProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
  openProfileModal?: () => void;
  openGasModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  openProfileModal,
  openGasModal,
}) => {
  const { currentUser, gasWebAppUrl } = useHealthSystem();

  if (!currentUser) return null;

  const getTabTitle = () => {
    switch (currentTab) {
      case 'patient':
        return 'ประวัติสุขภาพและ Health Episodes';
      case 'pharmacist':
        return 'คิวบริบาลเภสัชกรรม (Pharmacist Clinical Queue)';
      case 'admin':
        return 'ศูนย์ควบคุมและบริหารจัดการระบบ (Admin Console)';
      default:
        return 'ระบบบันทึกประวัติการเจ็บป่วยและการให้คำปรึกษาด้านสุขภาพ';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & Page Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="เปิดเมนูด้านซ้าย"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <HeartPulse className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[180px]">
              Personal Pharmacist
            </span>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">
              {getTabTitle()}
            </h1>
            <p className="text-[11px] text-slate-500">
              Personal Pharmacist–Led Digital Primary Care
            </p>
          </div>
        </div>

        {/* Right: Quick Emergency button & User Profile trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {openGasModal && (
            <button
              onClick={openGasModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                gasWebAppUrl
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="ตั้งค่าการเชื่อมต่อ Google Sheets & Drive"
            >
              <span className={`w-2 h-2 rounded-full ${gasWebAppUrl ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="hidden md:inline">
                {gasWebAppUrl ? 'Sheet & Drive เชื่อมต่อแล้ว' : 'ตั้งค่า Web App'}
              </span>
            </button>
          )}

          <a
            href="tel:1669"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
            title="สายด่วนฉุกเฉิน 1669"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>โทร 1669 ฉุกเฉิน</span>
          </a>

          {openProfileModal && currentUser.Role === 'Patient' && (
            <button
              onClick={openProfileModal}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="hidden sm:inline truncate max-w-[120px]">{currentUser.Full_Name}</span>
            </button>
          )}

          {currentUser.Role === 'Pharmacist' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-xl text-[11px] font-bold text-teal-800">
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">เภสัชกร</span>
            </div>
          )}

          {currentUser.Role === 'Admin' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-xl text-[11px] font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Admin</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
