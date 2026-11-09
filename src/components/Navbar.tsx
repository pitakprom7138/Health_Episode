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
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openErModal: () => void;
  openProfileModal: () => void;
  openCreateEpisodeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openErModal,
  openProfileModal,
  openCreateEpisodeModal,
}) => {
  const {
    currentUser,
    currentPatient,
    currentPharmacist,
    logout,
  } = useHealthSystem();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (currentUser?.Role === 'Patient') setCurrentTab('patient');
              else if (currentUser?.Role === 'Pharmacist') setCurrentTab('pharmacist');
              else if (currentUser?.Role === 'Admin') setCurrentTab('admin');
              else setCurrentTab('home');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <Activity className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  Personal Pharmacist–Led Digital Primary Care
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ระบบเวชระเบียนเภสัชกรรมปฐมภูมิ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                ระบบบันทึกประวัติการเจ็บป่วยและการให้คำปรึกษาด้านสุขภาพโดยเภสัชกรประจำตัว
              </p>
            </div>
          </div>

          {/* Role-Specific Navigation Menus (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!currentUser && (
              <span className="text-xs text-slate-400 font-medium">
                กรุณาเข้าสู่ระบบเพื่อใช้งานตามสิทธิ์
              </span>
            )}

            {/* PATIENT MENU */}
            {currentUser?.Role === 'Patient' && (
              <>
                <button
                  onClick={() => setCurrentTab('patient')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentTab === 'patient'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>ประวัติสุขภาพและ Episodes</span>
                </button>

                {openCreateEpisodeModal && (
                  <button
                    onClick={openCreateEpisodeModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    <span>แจ้งอาการเจ็บป่วยใหม่</span>
                  </button>
                )}

                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition"
                >
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>ข้อมูลส่วนตัว</span>
                </button>
              </>
            )}

            {/* PHARMACIST MENU */}
            {currentUser?.Role === 'Pharmacist' && (
              <>
                <button
                  onClick={() => setCurrentTab('pharmacist')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentTab === 'pharmacist'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>คิวบริบาลเภสัชกรรม (Queue)</span>
                </button>

                <button
                  onClick={openErModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-slate-50 transition"
                  title="ดูโครงสร้างฐานข้อมูล 16 ตาราง"
                >
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>โครงสร้างฐานข้อมูล (ER)</span>
                </button>
              </>
            )}

            {/* ADMIN MENU */}
            {currentUser?.Role === 'Admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentTab === 'admin'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ศูนย์ควบคุมระบบ (Admin)</span>
                </button>

                <button
                  onClick={openErModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                  title="ดูโครงสร้างฐานข้อมูล 16 ตาราง"
                >
                  <Database className="w-4 h-4 text-slate-700" />
                  <span>โครงสร้างฐานข้อมูล (ER)</span>
                </button>
              </>
            )}
          </nav>

          {/* User Account Info & Logout */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 py-1 px-2 sm:px-3 rounded-2xl">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
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

                <div className="hidden sm:block leading-tight text-left">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {currentUser.Full_Name}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span
                      className={`font-semibold ${
                        currentUser.Role === 'Patient'
                          ? 'text-emerald-700'
                          : currentUser.Role === 'Pharmacist'
                          ? 'text-teal-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {currentUser.Role === 'Patient'
                        ? 'ผู้ป่วย'
                        : currentUser.Role === 'Pharmacist'
                        ? `เภสัชกร ${currentPharmacist?.License_No || ''}`
                        : 'ผู้ดูแลระบบ'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition text-xs font-semibold"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation bar (Strictly Role-Based) */}
        {currentUser && (
          <div className="flex lg:hidden overflow-x-auto py-2 space-x-1.5 border-t border-slate-100 scrollbar-none text-xs">
            {currentUser.Role === 'Patient' && (
              <>
                <button
                  onClick={() => setCurrentTab('patient')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                    currentTab === 'patient' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                  }`}
                >
                  ประวัติของฉัน
                </button>
                {openCreateEpisodeModal && (
                  <button
                    onClick={openCreateEpisodeModal}
                    className="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    + แจ้งอาการ
                  </button>
                )}
                <button
                  onClick={openProfileModal}
                  className="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-slate-600"
                >
                  ข้อมูลส่วนตัว
                </button>
              </>
            )}

            {currentUser.Role === 'Pharmacist' && (
              <>
                <button
                  onClick={() => setCurrentTab('pharmacist')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                    currentTab === 'pharmacist' ? 'bg-emerald-800 text-white' : 'text-slate-600'
                  }`}
                >
                  คิวบริบาลเภสัชกรรม
                </button>
                <button
                  onClick={openErModal}
                  className="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-emerald-800 bg-emerald-50"
                >
                  ฐานข้อมูล (ER)
                </button>
              </>
            )}

            {currentUser.Role === 'Admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                    currentTab === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-600'
                  }`}
                >
                  ศูนย์ควบคุมระบบ
                </button>
                <button
                  onClick={openErModal}
                  className="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-slate-700 bg-slate-100"
                >
                  ฐานข้อมูล (ER)
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
