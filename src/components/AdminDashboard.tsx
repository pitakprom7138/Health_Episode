import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  Pill,
  FileSpreadsheet,
  Stethoscope,
  BarChart3,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  Clock,
  Sparkles,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Play,
  Link2,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { MedicationCatalogItem, SystemUser } from '../types/healthSystem';
import { GOOGLE_APPS_SCRIPT_CODE, SPREADSHEET_ID, DRIVE_FOLDER_ID } from '../utils/gasCodeGenerator';
import { ER_TABLES } from '../data/erDiagramData';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    patients,
    pharmacists,
    healthEpisodes,
    clinicalAssessments,
    medicationCatalog,
    drugUsageSummary,
    auditLogs,
    patientFeedbacks,
    updateUserStatus,
    addMedicationCatalogItem,
    gasWebAppUrl,
    setGasWebAppUrl,
    isGasSyncing,
    syncWithGas,
    triggerSetupSheets,
  } = useHealthSystem();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'MEDS' | 'DRUG_SUMMARY' | 'AUDIT' | 'SHEETS_DRIVE'>('OVERVIEW');
  const [userSearch, setUserSearch] = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // GAS Setup state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSheetId, setCopiedSheetId] = useState(false);
  const [urlInput, setUrlInput] = useState(gasWebAppUrl);
  const [setupFeedback, setSetupFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExecutingSetup, setIsExecutingSetup] = useState(false);

  useEffect(() => {
    setUrlInput(gasWebAppUrl);
  }, [gasWebAppUrl]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleCopySheetId = async () => {
    try {
      await navigator.clipboard.writeText(SPREADSHEET_ID);
      setCopiedSheetId(true);
      setTimeout(() => setCopiedSheetId(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSaveGasUrl = async () => {
    const trimmed = urlInput.trim();
    if (trimmed.includes('docs.google.com/spreadsheets')) {
      setSetupFeedback({
        type: 'error',
        text: 'URL ที่ระบุคือลิงก์ Google Sheet ไม่ใช่ Web App URL กรุณา Deploy เป็น Web app ใน Apps Script แล้วนำ URL ที่ลงท้ายด้วย /exec มากรอก',
      });
      return;
    }

    setGasWebAppUrl(trimmed);
    setSetupFeedback({
      type: 'success',
      text: 'บันทึก URL สำเร็จ! ระบบกำลังทดสอบเชื่อมต่อ Real-time...',
    });

    if (trimmed) {
      try {
        const res = await syncWithGas();
        if (res.success) {
          setSetupFeedback({
            type: 'success',
            text: 'เชื่อมต่อ Google Apps Script สำเร็จ และเปิดใช้งานการบันทึกข้อมูลเรียลไทม์เรียบร้อยแล้ว!',
          });
        }
      } catch {}
    }
  };

  const handleTriggerSetup = async () => {
    const trimmed = urlInput.trim();
    if (trimmed.includes('docs.google.com/spreadsheets')) {
      setSetupFeedback({
        type: 'error',
        text: 'URL ที่ระบุคือลิงก์หน้า Google Sheet ไม่ใช่ Web App URL กรุณาไปที่ Extensions > Apps Script > Deploy > New deployment > Web app แล้วนำลิงก์ที่ลงท้ายด้วย /exec มาใช้งาน หรือกดปุ่ม Run setupSheetsAndDrive ใน Apps Script โดยตรง',
      });
      return;
    }

    if (!trimmed) {
      setSetupFeedback({
        type: 'success',
        text: '💡 วิธีสร้าง 16 ตารางใน Google Sheet โดยตรง (เร็วที่สุด): 1) กดปุ่ม "คัดลอกโค้ด Google Apps Script" 2) เปิด Google Sheet เมนู Extensions > Apps Script วางโค้ดลงไป 3) เลือกฟังก์ชัน "setupSheetsAndDrive" แล้วกดปุ่ม "Run" ชีททั้ง 16 ตารางจะถูกสร้างและจัดรูปแบบสีเขียวมรกตทันทีใน 5 วินาที!',
      });
      return;
    }

    setIsExecutingSetup(true);
    setSetupFeedback(null);
    try {
      const res = await triggerSetupSheets();
      setSetupFeedback({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setSetupFeedback({
        type: 'error',
        text: `เกิดข้อผิดพลาด: ${err.message}`,
      });
    } finally {
      setIsExecutingSetup(false);
    }
  };

  const handleLiveSync = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setSetupFeedback({
        type: 'error',
        text: 'กรุณากรอก Web App URL (ลงท้ายด้วย /exec) ที่ได้จากการ Deploy ใน Google Apps Script ก่อนซิงค์ข้อมูล หรือดูขั้นตอน 4 ขั้นตอนด้านล่าง',
      });
      return;
    }

    if (trimmed.includes('docs.google.com/spreadsheets')) {
      setSetupFeedback({
        type: 'error',
        text: 'URL ที่ระบุคือลิงก์ Google Sheet ไม่ใช่ Web App URL กรุณา Deploy เป็น Web app ใน Apps Script แล้วนำ URL ที่ลงท้ายด้วย /exec มากรอก',
      });
      return;
    }

    setIsExecutingSetup(true);
    setSetupFeedback(null);
    try {
      const res = await syncWithGas();
      setSetupFeedback({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setSetupFeedback({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการซิงค์: ${err.message}`,
      });
    } finally {
      setIsExecutingSetup(false);
    }
  };

  // New Med Form modal state
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [newMedGeneric, setNewMedGeneric] = useState('');
  const [newMedBrand, setNewMedBrand] = useState('');
  const [newMedForm, setNewMedForm] = useState('เม็ด');
  const [newMedStrength, setNewMedStrength] = useState('');
  const [newMedUnit, setNewMedUnit] = useState('เม็ด');
  const [newMedIndications, setNewMedIndications] = useState('');
  const [newMedPrecautions, setNewMedPrecautions] = useState('');

  // Analytics metrics
  const totalEpisodes = healthEpisodes.length;
  const assessedEpisodes = clinicalAssessments.length;
  const emergencyCount = healthEpisodes.filter(e => e.Has_Emergency_Flags).length;

  const problemCounts = {
    acute: clinicalAssessments.filter(a => a.Problem_Type === 'Acute / New Problem').length,
    chronic: clinicalAssessments.filter(a => a.Problem_Type === 'Chronic Problem').length,
    medRelated: clinicalAssessments.filter(a => a.Problem_Type === 'Medication-related Problem').length,
    treatmentRelated: clinicalAssessments.filter(a => a.Problem_Type === 'Treatment-related Problem').length,
  };

  const avgSatisfaction =
    patientFeedbacks.length > 0
      ? (
          patientFeedbacks.reduce((sum, f) => sum + f.Satisfaction_Score, 0) /
          patientFeedbacks.length
        ).toFixed(1)
      : '5.0';

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedGeneric.trim()) {
      alert('กรุณาระบุชื่อสามัญทางยา (Generic Name)');
      return;
    }
    const newId = `MED${String(medicationCatalog.length + 1).padStart(3, '0')}`;
    addMedicationCatalogItem({
      Med_ID: newId,
      Generic_Name: newMedGeneric,
      Brand_Name: newMedBrand,
      Dosage_Form: newMedForm,
      Strength: newMedStrength,
      Default_Unit: newMedUnit,
      Indications: newMedIndications,
      Precautions: newMedPrecautions,
      Contraindications: '',
      Storage_Info: 'เก็บที่อุณหภูมิห้อง ไม่ชื้น',
    });
    setIsAddMedOpen(false);
    setNewMedGeneric('');
    setNewMedBrand('');
    setNewMedStrength('');
    setNewMedIndications('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-2xl text-emerald-300 border border-white/20 shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">ศูนย์ควบคุมและบริหารระบบ (Administrator)</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                  RBAC & Audit Trail Level
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                จัดการบัญชีผู้ใช้งาน กำหนดสิทธิ์ ทะเบียนยา ตรวจสอบ Audit Log และสถิติภาพรวม
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-emerald-400 font-bold">ระบบสารสนเทศสุขภาพปฐมภูมิ</div>
              <div className="text-[11px] font-mono text-slate-400">สถานะ: ฐานข้อมูล 16 ตารางสมบูรณ์</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>รายงานสถิติและภาพรวม</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการผู้ใช้งาน ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MEDS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'MEDS'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>บัญชียา Medication Catalog ({medicationCatalog.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DRUG_SUMMARY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'DRUG_SUMMARY'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>สรุปการใช้ยา (Drug_Usage_Summary)</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ประวัติการใช้งาน (Audit Log - {auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SHEETS_DRIVE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'SHEETS_DRIVE'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>เชื่อมต่อชีท 16 ตาราง & Drive</span>
        </button>
      </div>

      {setupFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            setupFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {setupFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{setupFeedback.text}</span>
          </div>
          <button
            onClick={() => setSetupFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Tab 1: Overview Analytics */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500">ผู้ใช้งานในระบบทั้งหมด</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{users.length} บัญชี</div>
              <div className="text-xs text-slate-400 mt-1">ผู้ป่วย {patients.length} | เภสัชกร {pharmacists.length}</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Health Episodes ทั้งหมด</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2">{totalEpisodes} เคส</div>
              <div className="text-xs text-emerald-600 mt-1">ประเมินแล้ว {assessedEpisodes} เคส</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500">เคสสัญญาณอันตราย (Red Flag)</div>
              <div className="text-3xl font-extrabold text-rose-600 mt-2">{emergencyCount} เคส</div>
              <div className="text-xs text-rose-500 mt-1">
                {totalEpisodes > 0 ? ((emergencyCount / totalEpisodes) * 100).toFixed(0) : 0}% ของเคสทั้งหมด
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-500">ความพึงพอใจเฉลี่ย</div>
              <div className="text-3xl font-extrabold text-amber-500 mt-2">{avgSatisfaction} / 5.0</div>
              <div className="text-xs text-slate-400 mt-1">จากผู้ป่วย {patientFeedbacks.length} ท่าน</div>
            </div>
          </div>

          {/* Problem Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <span>การจำแนกประเภทปัญหาสุขภาพ (Problem Classification)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Acute / New Problem (เฉียบพลัน)</span>
                    <span>{problemCounts.acute} ครั้ง</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{
                        width: `${assessedEpisodes > 0 ? (problemCounts.acute / assessedEpisodes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Chronic Problem (เรื้อรัง)</span>
                    <span>{problemCounts.chronic} ครั้ง</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{
                        width: `${assessedEpisodes > 0 ? (problemCounts.chronic / assessedEpisodes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Medication-related Problem (ปัญหาจากยา)</span>
                    <span>{problemCounts.medRelated} ครั้ง</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${assessedEpisodes > 0 ? (problemCounts.medRelated / assessedEpisodes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Treatment-related Problem (ปัญหาจากการรักษา)</span>
                    <span>{problemCounts.treatmentRelated} ครั้ง</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${assessedEpisodes > 0 ? (problemCounts.treatmentRelated / assessedEpisodes) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pharmacists Roster Overview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span>เภสัชกรผู้มีใบอนุญาตในระบบ (Pharmacists Roster)</span>
              </h3>

              <div className="space-y-3">
                {pharmacists.map(ph => (
                  <div
                    key={ph.Pharmacist_ID}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{ph.Full_Name}</div>
                      <div className="text-emerald-700 font-semibold">{ph.License_No}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{ph.Hospital_Or_Store_Affiliation}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                      พร้อมปฏิบัติการ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">จัดการบัญชีผู้ใช้งานระบบ (Users)</h3>
              <p className="text-xs text-slate-500">ควบคุมสิทธิ์ Role-Based Access Control (RBAC) และสถานะบัญชี</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรืออีเมล..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">ชื่อ - นามสกุล</th>
                  <th className="py-2.5 px-3">อีเมล</th>
                  <th className="py-2.5 px-3">บทบาท (Role)</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                  <th className="py-2.5 px-3">เชื่อมโยง</th>
                  <th className="py-2.5 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter(
                    u =>
                      u.Full_Name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.Email.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map(u => (
                    <tr key={u.User_ID} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{u.User_ID}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{u.Full_Name}</td>
                      <td className="py-3 px-3 text-slate-600">{u.Email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.Role === 'Patient'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.Role === 'Pharmacist'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-800 text-white'
                          }`}
                        >
                          {u.Role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.Status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.Status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {u.Linked_Patient_ID || u.Linked_Pharmacist_ID || '-'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => updateUserStatus(u.User_ID, u.Status === 'Active' ? 'Inactive' : 'Active')}
                          className="px-2.5 py-1 text-[11px] rounded-lg font-bold border border-slate-200 hover:bg-slate-100 transition"
                        >
                          {u.Status === 'Active' ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Medication Catalog */}
      {activeTab === 'MEDS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">ฐานข้อมูลรายการยา (Medication_Catalog)</h3>
              <p className="text-xs text-slate-500">บัญชียามาตรฐานสำหรับให้เภสัชกรเลือกจ่ายใน Clinical Assessment</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อยา หรือข้อบ่งใช้..."
                  value={medSearch}
                  onChange={e => setMedSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                onClick={() => setIsAddMedOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มยาใหม่</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {medicationCatalog
              .filter(
                m =>
                  m.Generic_Name.toLowerCase().includes(medSearch.toLowerCase()) ||
                  m.Brand_Name.toLowerCase().includes(medSearch.toLowerCase()) ||
                  m.Indications.toLowerCase().includes(medSearch.toLowerCase())
              )
              .map(m => (
                <div
                  key={m.Med_ID}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{m.Generic_Name}</span>
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        {m.Med_ID}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      ชื่อการค้า: {m.Brand_Name || '-'} | ความแรง: {m.Strength}
                    </div>
                    <div className="text-slate-700 mt-2 font-medium">
                      ข้อบ่งใช้: {m.Indications}
                    </div>
                    {m.Precautions && (
                      <div className="text-rose-700 text-[11px] mt-1">
                        ข้อควรระวัง: {m.Precautions}
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>รูปแบบ: {m.Dosage_Form} ({m.Default_Unit})</span>
                    <span>{m.Storage_Info}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Med Modal */}
          {isAddMedOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900">เพิ่มยาใหม่ใน Medication_Catalog</h3>
                <form onSubmit={handleAddMed} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ชื่อสามัญทางยา (Generic Name) *</label>
                    <input
                      type="text"
                      placeholder="เช่น Ibuprofen"
                      value={newMedGeneric}
                      onChange={e => setNewMedGeneric(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ชื่อการค้า (Brand Name)</label>
                      <input
                        type="text"
                        placeholder="เช่น Nurofen"
                        value={newMedBrand}
                        onChange={e => setNewMedBrand(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">ความแรง (Strength)</label>
                      <input
                        type="text"
                        placeholder="เช่น 400 mg"
                        value={newMedStrength}
                        onChange={e => setNewMedStrength(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">รูปแบบยา</label>
                      <input
                        type="text"
                        value={newMedForm}
                        onChange={e => setNewMedForm(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">หน่วยนับ</label>
                      <input
                        type="text"
                        value={newMedUnit}
                        onChange={e => setNewMedUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ข้อบ่งใช้ (Indications)</label>
                    <input
                      type="text"
                      placeholder="เช่น บรรเทาอาการปวดและอักเสบ"
                      value={newMedIndications}
                      onChange={e => setNewMedIndications(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ข้อควรระวัง / ข้อห้ามใช้</label>
                    <input
                      type="text"
                      placeholder="เช่น ระวังในผู้ป่วยโรคกระเพาะอาหารและไต"
                      value={newMedPrecautions}
                      onChange={e => setNewMedPrecautions(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddMedOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900"
                    >
                      บันทึกรายการยา
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Drug Usage Summary (Aggregated table) */}
      {activeTab === 'DRUG_SUMMARY' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              สรุปภาพรวมการใช้ยาในระบบ (Drug_Usage_Summary)
            </h3>
            <p className="text-xs text-slate-500">
              ตารางนี้คำนวณและสรุปยอดสะสมรวมโดยอัตโนมัติจาก Episode_Medications โดยไม่ทำให้ข้อมูลต้นทางสูญหาย
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Summary ID</th>
                  <th className="py-2.5 px-3">Med ID</th>
                  <th className="py-2.5 px-3">ชื่อยา</th>
                  <th className="py-2.5 px-3">หน่วย</th>
                  <th className="py-2.5 px-3 text-right">จำนวนที่แนะนำสะสม</th>
                  <th className="py-2.5 px-3 text-right">จำนวนเคสที่สั่งใช้</th>
                  <th className="py-2.5 px-3 text-right">วันที่แนะนำล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drugUsageSummary.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      ยังไม่มีข้อมูลการจ่ายยาในระบบ
                    </td>
                  </tr>
                ) : (
                  drugUsageSummary.map(row => (
                    <tr key={row.Summary_ID} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{row.Summary_ID}</td>
                      <td className="py-3 px-3 font-mono text-emerald-800 font-bold">{row.Med_ID}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{row.Drug_Name}</td>
                      <td className="py-3 px-3 text-slate-600">{row.Unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {row.Total_Quantity_Recommended}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {row.Assessment_Count_Used} ครั้ง
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                        {row.Last_Used_Date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                บันทึกประวัติความปลอดภัยและการใช้งานระบบ (Audit_Log)
              </h3>
              <p className="text-xs text-slate-500">
                เก็บบันทึกทุกกิจกรรมตามมาตรฐานการคุ้มครองข้อมูลสุขภาพส่วนบุคคล (PDPA)
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหากิจกรรม หรือผู้ใช้..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">วันเวลา (Timestamp)</th>
                  <th className="py-2.5 px-3">ผู้ใช้งาน (User)</th>
                  <th className="py-2.5 px-3">สิทธิ์ (Role)</th>
                  <th className="py-2.5 px-3">กิจกรรม (Action)</th>
                  <th className="py-2.5 px-3">ตารางที่เกี่ยวข้อง</th>
                  <th className="py-2.5 px-3">รายละเอียดเหตุการณ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs
                  .filter(
                    log =>
                      log.Action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      log.User_Email.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      log.Details.toLowerCase().includes(auditSearch.toLowerCase())
                  )
                  .map(log => (
                    <tr key={log.Log_ID} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{log.Timestamp}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans font-bold text-slate-800">
                        {log.User_Email}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.Role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.Action.includes('CREATE')
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.Action.includes('LOGIN')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.Action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{log.Table_Affected}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 max-w-md truncate" title={log.Details}>
                        {log.Details}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Google Sheets & Google Drive Integration */}
      {activeTab === 'SHEETS_DRIVE' && (
        <div className="space-y-6">
          {/* Target Integration Card */}
          <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-bold text-lg text-emerald-100">
                    การเชื่อมต่อระบบฐานข้อมูล Google Sheets & Google Drive
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700 font-semibold">
                    16 ตารางสัมพันธ์
                  </span>
                </div>
                <p className="text-xs text-emerald-300/80 mt-1 max-w-2xl leading-relaxed">
                  ระบบเวชระเบียนสารสนเทศสุขภาพปฐมภูมิดิจิทัลเชื่อมโยงข้อมูล 16 ตารางสัมพันธ์ลงใน Google Sheet
                  และจัดเก็บไฟล์แนบทางการแพทย์ รูปภาพฉลากยา และเอกสารผลตรวจลงใน Google Drive อย่างปลอดภัย
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'คัดลอก Code.gs สำเร็จ!' : 'คัดลอกโค้ด Google Apps Script'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-emerald-900/80 text-xs">
              <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/80 space-y-1">
                <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Target Google Sheet ID:
                  </span>
                  <button
                    onClick={handleCopySheetId}
                    className="text-[11px] text-emerald-200 hover:text-white flex items-center gap-1 underline cursor-pointer"
                  >
                    {copiedSheetId ? 'คัดลอกแล้ว' : 'คัดลอก ID'}
                  </button>
                </div>
                <code className="text-emerald-100 font-mono text-xs font-bold break-all select-all block pt-1">
                  {SPREADSHEET_ID}
                </code>
              </div>

              <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/80 space-y-1">
                <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-emerald-400" />
                    Target Google Drive Folder:
                  </span>
                  <a
                    href="https://drive.google.com/drive/folders/16NAYAa6rlefbnTlIObqgdIePdG0207Dn?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-200 hover:text-white flex items-center gap-1 underline cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    เปิดโฟลเดอร์ใน Drive
                  </a>
                </div>
                <code className="text-emerald-100 font-mono text-xs font-bold break-all select-all block pt-1">
                  {DRIVE_FOLDER_ID}
                </code>
              </div>
            </div>
          </div>

          {/* Web App URL Configuration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-700" />
                  <span>Google Apps Script Web App Endpoint</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  กรอก Web App URL ที่ได้จากการ Deploy ใน Google Apps Script (ลงท้ายด้วย <code className="bg-slate-100 px-1 py-0.5 rounded">/exec</code>) เพื่อเปิดใช้งาน Two-way Sync
                </p>
              </div>

              <button
                onClick={handleSaveGasUrl}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition self-start sm:self-auto cursor-pointer"
              >
                บันทึก URL ปลายทาง
              </button>
            </div>

            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTriggerSetup}
                disabled={isExecutingSetup || isGasSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isExecutingSetup || isGasSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-300" />
                )}
                <span>สร้างชีท 16 ตารางและฟอร์แมตสีเขียวมรกต (#0D5C3A) ทันที</span>
              </button>

              <button
                onClick={handleLiveSync}
                disabled={isExecutingSetup || isGasSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${isExecutingSetup || isGasSyncing ? 'animate-spin' : ''}`} />
                <span>ซิงค์ข้อมูลกับ Google Sheet ทันที (Live Sync All Tables)</span>
              </button>
            </div>
          </div>

          {/* 4-Step Guide */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>แนวทางดำเนินการ 4 ขั้นตอนสำหรับเชื่อมต่อ Google Sheets & Drive</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-bold text-slate-800">เปิด Apps Script</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  เปิด Google Sheet ID <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">{SPREADSHEET_ID}</code> ไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong>
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-bold text-slate-800">วาง Code.gs</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  กดปุ่ม <strong>&quot;คัดลอกโค้ด Google Apps Script&quot;</strong> แล้ววางทับในไฟล์ <code className="font-mono">Code.gs</code> แล้วกดบันทึก
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-bold text-slate-800">รัน setup ครั้งแรก</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  ใน Apps Script เลือกฟังก์ชัน <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">setupSheetsAndDrive</code> แล้วกด <strong>Run</strong> เพื่อสร้าง 16 ตารางและจัดสี Emerald
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  4
                </div>
                <div className="font-bold text-slate-800">Deploy Web App</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  กด <strong>Deploy &gt; New deployment &gt; Web app</strong> เลือก <em>Anyone</em> แล้วนำ URL มาวางในช่องด้านบน
                </p>
              </div>
            </div>
          </div>

          {/* 16 Sheets Overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>รายชื่อและโครงสร้างทั้ง 16 ตารางใน Google Sheet</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {ER_TABLES.map(table => (
                <div key={table.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-[11px]">
                    <span className="truncate">{table.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans">
                      {table.columns.length} ฟิลด์
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">{table.thaiName}</div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-1">PK: {table.primaryKey}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
