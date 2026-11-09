import React, { useState } from 'react';
import { X, Database, ArrowRight, Table2, Key, Link2, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';
import { ER_TABLES, TableDefinition } from '../data/erDiagramData';

interface ErDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErDiagramModal: React.FC<ErDiagramModalProps> = ({ isOpen, onClose }) => {
  const [selectedTable, setSelectedTable] = useState<TableDefinition>(ER_TABLES[0]);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'DICTIONARY'>('VISUAL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Database className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">สถาปัตยกรรมฐานข้อมูล 16 ตาราง & ER Diagram</h2>
              <p className="text-xs text-slate-400">
                Healthcare Information Database Architecture (ระบบสารสนเทศเวชระเบียน 16 ตารางสัมพันธ์)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('VISUAL')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'VISUAL' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                แผนภาพ ER Diagram
              </button>
              <button
                onClick={() => setActiveTab('DICTIONARY')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'DICTIONARY' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                พจนานุกรมข้อมูล (Data Dictionary)
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
          {activeTab === 'VISUAL' ? (
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
          ) : (
            /* Data Dictionary Detail View */
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
        </div>
      </div>
    </div>
  );
};
