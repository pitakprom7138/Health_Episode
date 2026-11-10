import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  ArrowRight,
  Table2,
  Key,
  Link2,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Play,
  FileCode,
  FolderKanban,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ER_TABLES, TableDefinition } from '../data/erDiagramData';
import { useHealthSystem } from '../context/HealthSystemContext';
import { GOOGLE_APPS_SCRIPT_CODE, SPREADSHEET_ID, DRIVE_FOLDER_ID } from '../utils/gasCodeGenerator';

interface ErDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErDiagramModal: React.FC<ErDiagramModalProps> = ({ isOpen, onClose }) => {
  const {
    gasWebAppUrl,
    setGasWebAppUrl,
    isGasSyncing,
    syncWithGas,
    triggerSetupSheets,
  } = useHealthSystem();

  const [selectedTable, setSelectedTable] = useState<TableDefinition>(ER_TABLES[0]);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'DICTIONARY' | 'SETUP_GAS'>('VISUAL');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSheetId, setCopiedSheetId] = useState(false);
  const [urlInput, setUrlInput] = useState(gasWebAppUrl);
  const [setupFeedback, setSetupFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    setUrlInput(gasWebAppUrl);
  }, [gasWebAppUrl]);

  if (!isOpen) return null;

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

  const handleSaveUrl = async () => {
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

  const handleRunSetup = async () => {
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
        text: '💡 วิธีสร้างชีท 16 ตารางโดยตรงใน Google Sheet (เร็วที่สุด): 1) กดปุ่ม "คัดลอกโค้ด Google Apps Script" 2) เปิด Google Sheet แล้วไปที่ Extensions > Apps Script วางโค้ดลงไป 3) เลือกฟังก์ชัน "setupSheetsAndDrive" แล้วกดปุ่ม "Run" ชีททั้ง 16 ตารางจะถูกสร้างและจัดรูปแบบสีเขียวมรกตทันทีใน 5 วินาที!',
      });
      return;
    }

    setIsExecuting(true);
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
      setIsExecuting(false);
    }
  };

  const handleSyncNow = async () => {
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

    setIsExecuting(true);
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
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0">
              <Database className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">สถาปัตยกรรมฐานข้อมูล 16 ตาราง & ER Diagram</h2>
              <p className="text-xs text-slate-400">
                Healthcare Information Database Architecture (ระบบสารสนเทศเวชระเบียน 16 ตารางสัมพันธ์)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('VISUAL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === 'VISUAL' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                แผนภาพ ER Diagram
              </button>
              <button
                onClick={() => setActiveTab('DICTIONARY')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === 'DICTIONARY' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                พจนานุกรมข้อมูล (16 ตาราง)
              </button>
              <button
                onClick={() => setActiveTab('SETUP_GAS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'SETUP_GAS' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>เชื่อมต่อชีท & Drive (Setup)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
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
                <span className="font-medium">{setupFeedback.text}</span>
              </div>
              <button
                onClick={() => setSetupFeedback(null)}
                className="text-xs opacity-60 hover:opacity-100 font-bold"
              >
                ปิด
              </button>
            </div>
          )}

          {activeTab === 'VISUAL' && (
            <div className="space-y-6">
              {/* Architecture Core Summary */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-slate-700 space-y-2">
                <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>หลักการออกแบบความสัมพันธ์ของทั้ง 16 ตาราง (Relational Integrity):</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                  <li>
                    <strong>Patient_ID:</strong> ใช้รหัสเฉพาะรูปแบบ <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded">PT000001</code> เพื่อรักษาความลับของผู้ป่วย ห้ามใช้เบอร์โทรหรือเลขบัตรประชาชนเป็น Primary Key ตามหลัก PDPA
                  </li>
                  <li>
                    <strong>Core Flow (1:N):</strong> <code className="font-bold">Patients</code> (1) ➔ <code className="font-bold">Health_Episodes</code> (N) ➔ <code className="font-bold">Clinical_Assessments</code> (N) ➔ <code className="font-bold">Episode_Medications</code> (N)
                  </li>
                  <li>
                    <strong>Drug_Usage_Summary:</strong> คำนวณสรุปยอดสะสมจาก <code className="font-bold">Episode_Medications</code> ตาม <code className="font-bold">Med_ID</code> โดยอัตโนมัติ โดยไม่สูญเสียข้อมูลรายการเดิมในแต่ละเคส
                  </li>
                  <li>
                    <strong>Secure File Attachments:</strong> ตาราง <code className="font-bold">Attachments</code> จัดเก็บรหัสประจำไฟล์และลิงก์เปิดดูไฟล์อย่างปลอดภัย พร้อมระบบตรวจสอบสิทธิ์ก่อนเข้าถึงตามมาตรฐาน PDPA
                  </li>
                </ul>
              </div>

              {/* Visual Table Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ER_TABLES.map(table => {
                  const isSelected = selectedTable.name === table.name;
                  return (
                    <div
                      key={table.name}
                      onClick={() => {
                        setSelectedTable(table);
                        setActiveTab('DICTIONARY');
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-xs font-bold text-emerald-900 truncate">
                            {table.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {table.columns.length} ฟิลด์
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800">{table.thaiName}</div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {table.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] space-y-1">
                        <div className="flex items-center gap-1 text-emerald-800 font-mono font-bold">
                          <Key className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>PK: {table.primaryKey}</span>
                        </div>
                        {table.foreignKeys.length > 0 && (
                          <div className="flex items-center gap-1 text-slate-500 font-mono truncate">
                            <Link2 className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>FK: {table.foreignKeys.map(f => f.field).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'DICTIONARY' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tables Sidebar */}
              <div className="lg:col-span-4 space-y-1.5 overflow-y-auto max-h-[600px] pr-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
                  เลือก Worksheet ทั้ง 16 ตาราง
                </div>
                {ER_TABLES.map(table => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                      selectedTable.name === table.name
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-mono text-[11px]">{table.name}</div>
                      <div
                        className={`text-[10px] ${
                          selectedTable.name === table.name ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {table.thaiName}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </button>
                ))}
              </div>

              {/* Table Fields & Details */}
              <div className="lg:col-span-8 bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold font-mono text-slate-900">{selectedTable.name}</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        {selectedTable.thaiName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{selectedTable.description}</p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      PK: {selectedTable.primaryKey}
                    </span>
                  </div>
                </div>

                {/* Relationships summary */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>ความสัมพันธ์กับตารางอื่น (Relationships):</span>
                  </div>
                  <ul className="list-disc pl-5 text-slate-600 space-y-0.5 text-[11px]">
                    {selectedTable.relationships.map((rel, i) => (
                      <li key={i}>{rel}</li>
                    ))}
                  </ul>
                </div>

                {/* Columns Table */}
                <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">ชื่อฟิลด์ (Column)</th>
                        <th className="py-2.5 px-3">ชนิดข้อมูล (Type)</th>
                        <th className="py-2.5 px-3">Null</th>
                        <th className="py-2.5 px-3">คำอธิบายฟังก์ชัน</th>
                        <th className="py-2.5 px-3">ตัวอย่างข้อมูล</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTable.columns.map(col => (
                        <tr key={col.name} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {col.name === selectedTable.primaryKey ? (
                              <span className="text-amber-600 flex items-center gap-1">
                                <Key className="w-3 h-3" />
                                {col.name}
                              </span>
                            ) : (
                              col.name
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700">{col.type}</td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-400">
                            {col.nullable ? 'YES' : 'NO'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{col.description}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                            {col.sample}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SETUP_GAS' && (
            <div className="space-y-6">
              {/* Target Spreadsheet & Drive Target Card */}
              <div className="bg-emerald-950 text-white rounded-3xl p-6 border border-emerald-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-base text-emerald-100">
                        ปลายทางเชื่อมต่อ Google Sheet & Google Drive
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                        16 ตารางสัมพันธ์
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      ระบบกำหนดค่าเชื่อมโยงอัตโนมัติไปยัง Google Sheet และโฟลเดอร์ Google Drive สำหรับจัดเก็บไฟล์แนบทางการแพทย์
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'คัดลอก Code.gs แล้ว!' : 'คัดลอกโค้ด Google Apps Script'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-emerald-900/80 text-xs">
                  <div className="bg-emerald-900/50 p-3.5 rounded-2xl border border-emerald-800/80">
                    <div className="flex items-center justify-between text-emerald-300 text-[11px] font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                        Target Google Spreadsheet ID:
                      </span>
                      <button
                        onClick={handleCopySheetId}
                        className="text-[10px] text-emerald-200 hover:text-white flex items-center gap-1 underline cursor-pointer"
                      >
                        {copiedSheetId ? 'คัดลอกแล้ว' : 'คัดลอก ID'}
                      </button>
                    </div>
                    <code className="text-emerald-100 font-mono text-xs font-bold break-all select-all">
                      {SPREADSHEET_ID}
                    </code>
                  </div>

                  <div className="bg-emerald-900/50 p-3.5 rounded-2xl border border-emerald-800/80">
                    <div className="text-emerald-300 text-[11px] font-semibold mb-1 flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                      Target Google Drive Folder ID:
                    </div>
                    <code className="text-emerald-100 font-mono text-xs font-bold break-all select-all">
                      {DRIVE_FOLDER_ID}
                    </code>
                  </div>
                </div>
              </div>

              {/* Web App URL Configuration */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-emerald-700" />
                      <span>Google Apps Script Web App Endpoint URL</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      กรอก Web App URL ที่ได้จากการ Deploy ใน Google Apps Script (ลงท้ายด้วย <code className="bg-slate-100 px-1 py-0.5 rounded">/exec</code>) เพื่อเปิดใช้งานการอ่าน-เขียนข้อมูลแบบ Realtime สู่ Google Sheet
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSaveUrl}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      บันทึก URL
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleRunSetup}
                    disabled={isExecuting || isGasSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {isExecuting || isGasSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    ) : (
                      <Play className="w-4 h-4 text-emerald-300" />
                    )}
                    <span>สร้างชีท 16 ตารางและเชื่อมต่อทันที (Setup 16 Sheets Now)</span>
                  </button>

                  <button
                    onClick={handleSyncNow}
                    disabled={isExecuting || isGasSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-600 ${isExecuting || isGasSyncing ? 'animate-spin' : ''}`} />
                    <span>ซิงค์ข้อมูลกับ Google Sheet ทันที (Live Sync All Tables)</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>ขั้นตอนการเชื่อมต่อ Google Sheet & Google Drive แบบ 4 ขั้นตอน</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <div className="font-bold text-slate-800">เปิด Apps Script ใน Google Sheet</div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      เปิด Google Sheet ID <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">{SPREADSHEET_ID}</code> ไปที่เมนู <strong>Extensions (ส่วนขยาย) &gt; Apps Script</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <div className="font-bold text-slate-800">วางโค้ด Code.gs</div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      กดปุ่ม <strong>&quot;คัดลอกโค้ด Google Apps Script&quot;</strong> ด้านบน แล้วนำไปวางแทนที่โค้ดเดิมทั้งหมดในไฟล์ <code className="font-mono">Code.gs</code> แล้วกดบันทึก (Ctrl+S หรือ Cmd+S)
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <div className="font-bold text-slate-800">รันสร้าง 16 ตารางครั้งแรก (Setup)</div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      ใน Apps Script เลือกฟังก์ชัน <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-800">setupSheetsAndDrive</code> แล้วกด <strong>Run</strong> หรือกดปุ่ม <strong>&quot;สร้างชีท 16 ตารางและเชื่อมต่อทันที&quot;</strong> ในหน้านี้ เพื่อสร้างชีททั้ง 16 ตารางพร้อมแถบหัวตารางสีเขียวมรกต <code className="text-emerald-700 font-bold">#0D5C3A</code>
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      4
                    </div>
                    <div className="font-bold text-slate-800">Deploy เป็น Web App</div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      กด <strong>Deploy &gt; New deployment &gt; Web app</strong> เลือก <em>Execute as: Me</em> และ <em>Who has access: Anyone</em> จากนั้นคัดลอก Web App URL มาใส่ในช่องด้านบนเพื่อเริ่มเชื่อมต่อทันที
                    </p>
                  </div>
                </div>
              </div>

              {/* 16 Sheet Structure Checklist */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>โครงสร้าง 16 ตารางที่ระบบรองรับและสร้างใน Google Sheet:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {ER_TABLES.map(t => (
                    <div key={t.name} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-800 font-semibold truncate">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
