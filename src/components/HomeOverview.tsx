import React from 'react';
import {
  Activity,
  User,
  Stethoscope,
  ShieldCheck,
  Database,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';

interface HomeOverviewProps {
  onSelectRole: (role: 'Patient' | 'Pharmacist' | 'Admin') => void;
  onOpenErModal: () => void;
  onOpenCreateEpisode: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onSelectRole,
  onOpenErModal,
  onOpenCreateEpisode,
}) => {
  const { healthEpisodes, patients, pharmacists } = useHealthSystem();

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 sm:p-12 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-emerald-200">
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>Healthcare Information System (ระบบสารสนเทศด้านสุขภาพ)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Personal Pharmacist–Led Digital Primary Care
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            ระบบบันทึกประวัติการเจ็บป่วยและการให้คำปรึกษาด้านสุขภาพโดยเภสัชกร เชื่อมโยงข้อมูลผู้ป่วย เภสัชกร และผู้ดูแลระบบอย่างไร้รอยต่อ พร้อมโครงสร้างฐานข้อมูลเวชระเบียน 16 ตาราง จัดเก็บประวัติยา ผลแล็บ คำแนะนำการรักษา และไฟล์เอกสารทางการแพทย์อย่างปลอดภัยตามมาตรฐาน PDPA
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectRole('Patient')}
              className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>เข้าใช้งานในบทบาท &quot;ผู้ป่วย&quot;</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectRole('Pharmacist')}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/40 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              <span>เข้าใช้งานในบทบาท &quot;เภสัชกร&quot;</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectRole('Admin')}
              className="px-4 py-3 bg-slate-900/60 hover:bg-slate-900 text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-300" />
              <span>ผู้ดูแลระบบ</span>
            </button>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Database Architecture Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                ระบบฐานข้อมูลเวชระเบียนสุขภาพ 16 ตารางสัมพันธ์ (Relational Data Model)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                16 Tables Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              รองรับ Patients, Health_Episodes, Clinical_Assessments, Medication_Catalog, Lab_Results, Drug_Usage_Summary และ Audit_Log
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenErModal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Database className="w-4 h-4" />
            <span>ดูโครงสร้างและ ER Diagram 16 ตาราง</span>
          </button>
        </div>
      </div>

      {/* 3 User Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role 1: Patient */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">บทบาทที่ 1</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">ผู้ป่วย (Patient)</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>บันทึก Health Episode: อาการสำคัญ ระยะเวลา สัญญาณอันตราย</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>บันทึกสัญญาณชีพ (Vitals): อุณหภูมิ ชีพจร ความดันโลหิต อัตราหายใจ</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>บันทึกยาประจำตัว สมุนไพร อาหารเสริม และแนบรูปภาพฉลากยา</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>บันทึกผลแล็บ (LDL, FBS, HbA1c, Cr, eGFR ฯลฯ) พร้อมใบตรวจ</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>รับคำแนะนำจากเภสัชกร และประเมินผลลัพธ์/ความพึงพอใจ 1-5 ดาว</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectRole('Patient')}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>เข้าสู่หน้าผู้ป่วย</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Role 2: Pharmacist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">บทบาทที่ 2</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">เภสัชกร (Pharmacist)</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>คัดกรองอาการ ตรวจสอบประวัติแพ้ยา และความซ้ำซ้อนของการใช้ยา</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>จำแนกประเภทปัญหา: Acute, Chronic, Medication, Treatment-related</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>แนะนำรายการยาจาก Medication_Catalog พร้อมวิธีใช้และคำนวณยอดรวม</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>ระบุแหล่งข้อมูลอ้างอิงวิชาการ (CPG, UpToDate, บัญชียาหลัก)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>นัดติดตามผล (Follow-up) เฝ้าระวังอาการไม่พึงประสงค์ (ADR) และส่งต่อแพทย์</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectRole('Pharmacist')}
            className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>เข้าสู่หน้าเภสัชกร</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Role 3: Admin */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">บทบาทที่ 3</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">ผู้ดูแลระบบ (Administrator)</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span>จัดการบัญชีผู้ใช้งาน กำหนดสิทธิ์ และเปิด/ปิดการใช้งาน</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span>จัดการทะเบียนยา Medication_Catalog และข้อห้ามใช้</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span>ตรวจสอบตารางคำนวณยอดสะสม Drug_Usage_Summary</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span>ตรวจสอบ Audit Log เพื่อความโปร่งใสและความปลอดภัย PDPA</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span>รายงานสถิติและภาพรวมการประเมินปัญหาสุขภาพ</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectRole('Admin')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>เข้าสู่หน้าผู้ดูแลระบบ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Safety & Medical Disclaimer Banner */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>มาตรฐานความปลอดภัยและการรักษาความลับข้อมูลสุขภาพ (PDPA & Clinical Safety):</strong>{' '}
          ระบบนี้ออกแบบตามหลักการคุ้มครองข้อมูลส่วนบุคคลด้านสุขภาพ มีการเข้ารหัสและตรวจสอบสิทธิ์ในทุกระดับ
          ข้อมูลผู้ป่วยจะถูกแยกการมองเห็นตามสิทธิ์ของผู้ป่วยรายบุคคล เภสัชกรที่ผ่านการรับรอง และผู้ดูแลระบบ
          ระบบนี้ไม่ใช่ระบบวินิจฉัยโรคและไม่ใช้ทดแทนการรักษาจากแพทย์ หากพบอาการวิกฤตกรุณาติดต่อบริการฉุกเฉิน 1669 ทันที
        </div>
      </div>
    </div>
  );
};
