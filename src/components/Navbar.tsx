import React, { useState } from 'react';
import {
  Activity,
  User,
  ShieldCheck,
  Stethoscope,
  Database,
  ChevronDown,
  CheckCircle2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openErModal: () => void;
  openProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openErModal,
  openProfileModal,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    quickSwitchRole,
  } = useHealthSystem();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Activity className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Health Episode Record System
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ระบบเวชระเบียนเภสัชกรรมปฐมภูมิ
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบบันทึกประวัติการเจ็บป่วยและการให้คำปรึกษาด้านสุขภาพโดยเภสัชกร
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentTab === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              ภาพรวม
            </button>

            <button
              onClick={() => {
                quickSwitchRole('Patient');
                setCurrentTab('patient');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentTab === 'patient'
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>ผู้ป่วย (Patient)</span>
            </button>

            <button
              onClick={() => {
                quickSwitchRole('Pharmacist');
                setCurrentTab('pharmacist');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentTab === 'pharmacist'
                  ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>เภสัชกร (Pharmacist)</span>
            </button>

            <button
              onClick={() => {
                quickSwitchRole('Admin');
                setCurrentTab('admin');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                currentTab === 'admin'
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ผู้ดูแลระบบ (Admin)</span>
            </button>

            <button
              onClick={openErModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
              title="ดูแผนภาพความสัมพันธ์และโครงสร้างฐานข้อมูล 16 ตาราง"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>โครงสร้างฐานข้อมูล (ER)</span>
            </button>
          </nav>

          {/* User Account / Role Switcher */}
          <div className="flex items-center gap-2 relative">
            {/* Quick Role Badge Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-left"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.Role === 'Patient'
                      ? 'bg-emerald-600 text-white'
                      : currentUser.Role === 'Pharmacist'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {currentUser.Role === 'Patient' ? 'PT' : currentUser.Role === 'Pharmacist' ? 'RX' : 'AD'}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {currentUser.Full_Name}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="font-semibold text-emerald-700">[{currentUser.Role}]</span>
                    <span>สลับสิทธิ์</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {roleMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        บัญชีที่กำลังใช้งาน
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-0.5">{currentUser.Full_Name}</div>
                      <div className="text-xs text-slate-500">{currentUser.Email}</div>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                          สิทธิ์: {currentUser.Role === 'Patient' ? 'ผู้ป่วย (Patient)' : currentUser.Role === 'Pharmacist' ? 'เภสัชกร (Pharmacist)' : 'ผู้ดูแลระบบ (Admin)'}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-2 text-xs font-semibold text-slate-500">
                      สลับบัญชีทดสอบตามบทบาท (RBAC Testing):
                    </div>

                    <div className="px-2 space-y-1">
                      {users.map(u => (
                        <button
                          key={u.User_ID}
                          onClick={() => {
                            switchUser(u.User_ID);
                            if (u.Role === 'Patient') setCurrentTab('patient');
                            else if (u.Role === 'Pharmacist') setCurrentTab('pharmacist');
                            else if (u.Role === 'Admin') setCurrentTab('admin');
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                            u.User_ID === currentUser.User_ID
                              ? 'bg-emerald-50 text-emerald-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                u.Role === 'Patient'
                                  ? 'bg-emerald-500'
                                  : u.Role === 'Pharmacist'
                                  ? 'bg-teal-600'
                                  : 'bg-slate-700'
                              }`}
                            />
                            <div className="truncate">
                              <span className="font-medium">{u.Full_Name}</span>
                              <span className="text-[10px] text-slate-400 ml-1">({u.Role})</span>
                            </div>
                          </div>
                          {u.User_ID === currentUser.User_ID && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          openProfileModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>ดูและแก้ไขข้อมูลส่วนบุคคล</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'home' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => {
              quickSwitchRole('Patient');
              setCurrentTab('patient');
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'patient' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600'
            }`}
          >
            ผู้ป่วย
          </button>
          <button
            onClick={() => {
              quickSwitchRole('Pharmacist');
              setCurrentTab('pharmacist');
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'pharmacist' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-600'
            }`}
          >
            เภสัชกร
          </button>
          <button
            onClick={() => {
              quickSwitchRole('Admin');
              setCurrentTab('admin');
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'admin' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'
            }`}
          >
            ผู้ดูแลระบบ
          </button>
          <button
            onClick={openErModal}
            className="px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap text-emerald-700 bg-emerald-50"
          >
            โครงสร้างฐานข้อมูล (ER)
          </button>
        </div>
      </div>
    </header>
  );
};
