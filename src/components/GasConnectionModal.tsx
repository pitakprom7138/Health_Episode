import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Link2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  FolderOpen,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { GOOGLE_APPS_SCRIPT_CODE, SPREADSHEET_ID, DRIVE_FOLDER_ID } from '../utils/gasCodeGenerator';

interface GasConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasConnectionModal: React.FC<GasConnectionModalProps> = ({ isOpen, onClose }) => {
  const { gasWebAppUrl, setGasWebAppUrl, syncWithGas } = useHealthSystem();
  const [urlInput, setUrlInput] = useState(gasWebAppUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setUrlInput(gasWebAppUrl);
  }, [gasWebAppUrl]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();

    if (!trimmed) {
      setStatusMessage({
        type: 'error',
        text: 'กรุณากรอก Web App URL (ที่ลงท้ายด้วย /exec)',
      });
      return;
    }

    if (trimmed.includes('docs.google.com/spreadsheets')) {
      setStatusMessage({
        type: 'error',
        text: 'URL ที่ระบุคือลิงก์ Google Sheet ไม่ใช่ Web App URL กรุณา Deploy เป็น Web app ใน Apps Script แล้วนำ URL ที่ลงท้ายด้วย /exec มากรอก',
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage({
      type: 'info',
      text: 'กำลังทดสอบเชื่อมต่อและบันทึกลงระบบ...',
    });

    setGasWebAppUrl(trimmed);

    try {
      const res = await syncWithGas();
      setIsTesting(false);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'เชื่อมต่อ Google Apps Script สำเร็จสมบูรณ์! พร้อมบันทึกข้อมูลและอัพโหลดรูปภาพลงชีทและไดรฟ์แล้ว',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'ไม่สามารถติดต่อ Web App URL ได้ กรุณาตรวจสอบว่า Deploy ให้สิทธิ์ "Who has access: Anyone"',
        });
      }
    } catch (err: any) {
      setIsTesting(false);
      setStatusMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">ตั้งค่าการเชื่อมต่อ Google Sheets & Drive</h2>
              <p className="text-xs text-emerald-200">Google Apps Script Web App Endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Google Sheet ID เป้าหมาย:</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-bold truncate"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{SPREADSHEET_ID}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block">Google Drive Folder ID เป้าหมาย:</span>
              <a
                href={`https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-bold truncate"
              >
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{DRIVE_FOLDER_ID}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Google Apps Script Web App URL (ลงท้ายด้วย /exec) *
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                นำ URL ที่ได้จากหน้า Apps Script: เมนู <strong>Deploy &gt; Manage deployments</strong> หรือ <strong>New deployment (Web app)</strong> มาวาง
              </p>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                )}
                <span className="font-medium">{statusMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                title="คัดลอกโค้ด Code.gs เพื่อนำไปวางใน Extensions > Apps Script"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedCode ? 'คัดลอกโค้ดแล้ว ✓' : 'คัดลอกโค้ด Apps Script'}</span>
              </button>

              <button
                type="submit"
                disabled={isTesting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังทดสอบ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ทดสอบและบันทึกการเชื่อมต่อ</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Setup Guide */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>วิธีตั้งค่าให้สามารถบันทึกลง Sheet และ Drive ได้ 100%:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>กดปุ่ม <strong>&quot;คัดลอกโค้ด Apps Script&quot;</strong> ด้านบน</li>
              <li>เปิด Google Sheet &gt; เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong> วางโค้ดลงไป</li>
              <li>กด <strong>Deploy &gt; New deployment &gt; เลือกประเภท Web app</strong></li>
              <li>ตั้งค่า <strong>Execute as: Me</strong> และ <strong>Who has access: Anyone</strong> (ทุกคน) แล้วกด Deploy</li>
              <li>คัดลอก Web App URL ที่ลงท้ายด้วย <strong>/exec</strong> มาวางในช่องด้านบน แล้วกดบันทึก</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
