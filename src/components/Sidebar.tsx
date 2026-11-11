import React from 'react';
import {
  Activity,
  User,
  ShieldCheck,
  Stethoscope,
  Database,
  LogOut,
  PlusCircle,
  FileText,
  UserCheck,
  X,
  ChevronRight,
  Shield,
  HeartPulse,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openErModal: () => void;
  openProfileModal: () => void;
  openCreateEpisodeModal?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openErModal,
  openProfileModal,
  openCreateEpisodeModal,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { currentUser, currentPatient, currentPharmacist, logout } = useHealthSystem();

  if (!currentUser) return null;

  const handleTabSelect = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleOpenAction = (actionFn?: () => void) => {
    if (actionFn) actionFn();
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-800">
      {/* 1. Header: Brand Logo & Title */}
      <div>
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (currentUser.Role === 'Patient') handleTabSelect('patient');
                else if (currentUser.Role === 'Pharmacist') handleTabSelect('pharmacist');
                else if (currentUser.Role === 'Admin') handleTabSelect('admin');
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0 group-hover:bg-emerald-800 transition">
                <HeartPulse className="w-6 h-6 text-emerald-100" />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Personal Pharmacist
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  Digital Primary Care
                </div>
              </div>
            </div>

            {/* Close button for mobile drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3">
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ระบบเวชระเบียนเภสัชกรรมปฐมภูมิ
            </span>
          </div>
        </div>

        {/* 2. User Profile Summary Box */}
        <div className="p-3 mx-3 my-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                currentUser.Role === 'Patient'
                  ? 'bg-emerald-600 text-white'
                  : currentUser.Role === 'Pharmacist'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-800 text-white'
              }`}
            >
              {currentUser.Role === 'Patient' ? (
                <User className="w-4 h-4" />
              ) : currentUser.Role === 'Pharmacist' ? (
                <Stethoscope className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 truncate" title={currentUser.Full_Name}>
                {currentUser.Full_Name}
              </div>
              <div className="text-[10px] font-medium text-slate-500 truncate">
                {currentUser.Role === 'Patient' ? (
                  <span className="text-emerald-700 font-semibold">
                    ผู้ป่วย {currentPatient?.Citizen_ID_Or_HN ? `• ${currentPatient.Citizen_ID_Or_HN}` : ''}
                  </span>
                ) : currentUser.Role === 'Pharmacist' ? (
                  <span className="text-teal-700 font-semibold">
                    เภสัชกร {currentPharmacist?.License_No ? `• ${currentPharmacist.License_No}` : ''}
                  </span>
                ) : (
                  <span className="text-slate-700 font-semibold">ผู้ดูแลระบบ (Admin)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Navigation Menu Items */}
        <div className="px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            เมนูการใช้งาน
          </div>

          {/* PATIENT MENU ITEMS */}
          {currentUser.Role === 'Patient' && (
            <>
              <button
                onClick={() => handleTabSelect('patient')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                  currentTab === 'patient'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${currentTab === 'patient' ? 'text-white' : 'text-slate-500'}`} />
                  <span>ประวัติสุขภาพและ Episodes</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${currentTab === 'patient' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {openCreateEpisodeModal && (
                <button
                  onClick={() => handleOpenAction(openCreateEpisodeModal)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 mt-1"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    <span>แจ้งอาการเจ็บป่วยใหม่</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                    + ใหม่
                  </span>
                </button>
              )}

              <button
                onClick={() => handleOpenAction(openProfileModal)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>ข้อมูลส่วนตัวของฉัน</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </>
          )}

          {/* PHARMACIST MENU ITEMS */}
          {currentUser.Role === 'Pharmacist' && (
            <button
              onClick={() => handleTabSelect('pharmacist')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                currentTab === 'pharmacist'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Stethoscope className={`w-4 h-4 ${currentTab === 'pharmacist' ? 'text-white' : 'text-slate-500'}`} />
                <span>คิวบริบาลเภสัชกรรม (Queue)</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${currentTab === 'pharmacist' ? 'text-white' : 'text-slate-400'}`} />
            </button>
          )}

          {/* ADMIN MENU ITEMS */}
          {currentUser.Role === 'Admin' && (
            <>
              <button
                onClick={() => handleTabSelect('admin')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                  currentTab === 'admin'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${currentTab === 'admin' ? 'text-white' : 'text-slate-500'}`} />
                  <span>ศูนย์ควบคุมระบบ (Admin)</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${currentTab === 'admin' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              <button
                onClick={() => handleOpenAction(openErModal)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer text-left"
                title="ดูโครงสร้างฐานข้อมูล 16 ตาราง"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span>โครงสร้างฐานข้อมูล (ER)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. Bottom Footer Section */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition text-xs font-bold cursor-pointer"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>

        <div className="px-2 pt-1 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>มาตรฐานคุ้มครองข้อมูลสุขภาพ (PDPA)</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen z-20 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
