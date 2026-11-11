import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Calendar,
  AlertTriangle,
  Pill,
  Heart,
  FileText,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Thermometer,
  ExternalLink,
  MessageSquareHeart,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { HealthEpisode, ClinicalAssessment, Attachment } from '../types/healthSystem';

interface PatientDashboardProps {
  onOpenCreateEpisode: () => void;
  onOpenFeedback: (assessment: ClinicalAssessment) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onOpenCreateEpisode,
  onOpenFeedback,
}) => {
  const {
    currentPatient,
    currentUser,
    healthEpisodes,
    clinicalAssessments,
    episodeMedications,
    patientMedications,
    followups,
    patientFeedbacks,
    attachments,
    labResults,
  } = useHealthSystem();

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Filter episodes for current patient only (strict RBAC compliance)
  const patientId = currentPatient?.Patient_ID || 'PT000001';
  const myEpisodes = healthEpisodes.filter(ep => ep.Patient_ID === patientId);
  const myMeds = patientMedications.filter(pm => pm.Patient_ID === patientId);
  const myFollowups = followups.filter(f => f.Patient_ID === patientId);

  // Selected episode details
  const activeEpisode = selectedEpisodeId
    ? myEpisodes.find(ep => ep.Episode_ID === selectedEpisodeId) || myEpisodes[0]
    : myEpisodes[0];

  const activeAssessment = activeEpisode
    ? clinicalAssessments.find(as => as.Episode_ID === activeEpisode.Episode_ID)
    : undefined;

  const activeEpisodeMeds = activeAssessment
    ? episodeMedications.filter(em => em.Assessment_ID === activeAssessment.Assessment_ID)
    : [];

  const activeFeedback = activeAssessment
    ? patientFeedbacks.find(fb => fb.Assessment_ID === activeAssessment.Assessment_ID)
    : undefined;

  const activeLabs = activeEpisode
    ? labResults.filter(l => l.Episode_ID === activeEpisode.Episode_ID)
    : [];

  const activeAttachments = activeEpisode
    ? attachments.filter(a => a.Record_ID === activeEpisode.Episode_ID)
    : [];

  return (
    <div className="space-y-6">
      {/* Patient Profile & Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-2xl text-emerald-100 border border-white/20 shrink-0">
              {currentPatient?.Full_Name?.slice(0, 1) || 'ผ'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentPatient?.Full_Name || currentUser?.Full_Name || 'ผู้ป่วย'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-semibold">
                  {currentPatient?.Citizen_ID_Or_HN || 'HN-670124'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/15 text-white text-xs">
                  หมู่โลหิต {currentPatient?.Blood_Group || 'O'}
                </span>
              </div>

              <div className="text-xs text-emerald-100/90 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <span>เพศ: {currentPatient?.Gender || 'ชาย'}</span>
                <span>วันเกิด: {currentPatient?.DOB || '1982-05-14'}</span>
                <span>เบอร์โทร: {currentPatient?.Phone || '081-234-5678'}</span>
                <span>ผู้ติดต่อฉุกเฉิน: {currentPatient?.Emergency_Contact || 'ภรรยา (089-876-5432)'}</span>
              </div>

              {/* Known Allergies highlight */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  ประวัติแพ้ยา:
                </span>
                {currentPatient?.Known_Allergies && currentPatient.Known_Allergies.length > 0 ? (
                  currentPatient.Known_Allergies.map((alg, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 bg-rose-900/70 text-rose-200 border border-rose-400/40 rounded-lg text-xs font-bold"
                    >
                      ⚠️ {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-200">ปฏิเสธประวัติแพ้ยา</span>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenCreateEpisode}
              className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 text-emerald-700 transition group-hover:scale-110" />
              <span>บันทึก Health Episode ใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">เหตุการณ์เจ็บป่วยทั้งหมด</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{myEpisodes.length} เคส</div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            <span>บันทึกในระบบ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">ได้รับการประเมินแล้ว</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {myEpisodes.filter(e => e.Status === 'Assessed' || e.Status === 'Follow_Up_Scheduled').length} ครั้ง
          </div>
          <div className="text-[11px] text-slate-400 mt-1">มีคำแนะนำจากเภสัชกร</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">นัดติดตามผล (Follow-up)</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{myFollowups.length} นัดหมาย</div>
          <div className="text-[11px] text-teal-600 mt-1">นัดหมายครั้งถัดไป</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">ยาและอาหารเสริมที่ใช้อยู่</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{myMeds.length} รายการ</div>
          <div className="text-[11px] text-blue-600 mt-1">ยาปัจจุบัน/สมุนไพร</div>
        </div>
      </div>

      {/* Current Medications Roster */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              ประวัติยาที่ใช้ในปัจจุบัน (Current Medications & Supplements)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            รวมยาแผนปัจจุบัน สมุนไพร และผลิตภัณฑ์เสริมอาหาร
          </span>
        </div>

        {myMeds.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            ยังไม่มีรายการยาที่บันทึก
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myMeds.map(med => (
              <div
                key={med.ID}
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 transition text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900 text-sm">{med.Drug_Name}</div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      med.Category === 'ยาแผนปัจจุบัน'
                        ? 'bg-blue-100 text-blue-800'
                        : med.Category === 'ยาสมุนไพร'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {med.Category}
                  </span>
                </div>
                <div className="text-slate-600 mt-1.5 leading-relaxed">{med.Dose_Instructions}</div>
                <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>ที่มา: {med.Prescriber_Source}</span>
                  <span className="text-emerald-700 font-semibold">{med.Status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Episodes Layout: Left List, Right Active Episode Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Episodes List (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>ประวัติ Health Episode ของฉัน</span>
            </h2>
            <span className="text-xs text-slate-400">{myEpisodes.length} รายการ</span>
          </div>

          {myEpisodes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">ยังไม่มีประวัติการเจ็บป่วย</div>
              <p className="text-xs text-slate-400">
                เมื่อท่านมีอาการเจ็บป่วย สามารถกดปุ่ม &quot;บันทึก Health Episode ใหม่&quot; เพื่อรับคำปรึกษาจากเภสัชกร
              </p>
              <button
                onClick={onOpenCreateEpisode}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                บันทึก Episode แรก
              </button>
            </div>
          ) : (
            myEpisodes.map(ep => {
              const isSelected = activeEpisode?.Episode_ID === ep.Episode_ID;
              const hasAssessment = clinicalAssessments.some(a => a.Episode_ID === ep.Episode_ID);
              return (
                <div
                  key={ep.Episode_ID}
                  onClick={() => setSelectedEpisodeId(ep.Episode_ID)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900">{ep.Episode_ID}</div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        hasAssessment
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hasAssessment ? '✓ เภสัชกรประเมินแล้ว' : '⏳ รอการประเมิน'}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-800 mt-1 line-clamp-1">
                    {ep.Chief_Complaint}
                  </div>

                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {ep.Symptoms_Description}
                  </div>

                  {ep.Has_Emergency_Flags && (
                    <div className="mt-2 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>มีสัญญาณอันตราย/ฉุกเฉิน</span>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {String(ep.Onset_DateTime || '').slice(0, 16)}
                    </span>
                    <span>เป็นมา {ep.Duration_Days} วัน</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Episode Detail & Pharmacist Advice (Right Column) */}
        <div className="lg:col-span-7">
          {activeEpisode ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {activeEpisode.Episode_ID}
                    </span>
                    <span className="text-xs text-slate-400">
                      เริ่มมีอาการ: {activeEpisode.Onset_DateTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {activeEpisode.Chief_Complaint}
                  </h3>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      activeAssessment
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    สถานะ: {activeAssessment ? 'เภสัชกรประเมินแล้ว' : 'รอการประเมิน'}
                  </span>
                </div>
              </div>

              {/* Vitals & Symptoms */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  รายละเอียดอาการและสัญญาณชีพ
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeEpisode.Symptoms_Description}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">อุณหภูมิร่างกาย</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Temperature_C ? `${activeEpisode.Temperature_C} °C` : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">ความดันโลหิต (BP)</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Systolic_BP && activeEpisode.Diastolic_BP
                        ? `${activeEpisode.Systolic_BP}/${activeEpisode.Diastolic_BP} mmHg`
                        : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">ชีพจร (Pulse)</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Pulse_BPM ? `${activeEpisode.Pulse_BPM} bpm` : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">อัตราหายใจ</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Resp_Rate ? `${activeEpisode.Resp_Rate} /min` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lab Results in this Episode */}
              {activeLabs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">ผลตรวจทางห้องปฏิบัติการ (Lab):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeLabs.map(lab => (
                      <div
                        key={lab.Lab_ID}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{lab.Test_Type}</div>
                          <div className="text-[10px] text-slate-400">อ้างอิง: {lab.Reference_Range}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">
                            {lab.Result_Value} {lab.Unit}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              lab.Normal_Abnormal_Flag === 'High'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {lab.Normal_Abnormal_Flag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              {activeAttachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>เอกสารและภาพถ่ายที่แนบไว้ ({activeAttachments.length} รายการ):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {activeAttachments.map(att => (
                      <div
                        key={att.Attachment_ID}
                        onClick={() => setPreviewAttachment(att)}
                        className="p-2.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200 cursor-pointer transition flex items-center gap-2 group"
                      >
                        {att.Preview_Data_URL || att.Drive_View_URL?.startsWith('data:image') ? (
                          <img
                            src={att.Preview_Data_URL || att.Drive_View_URL}
                            alt={att.File_Name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            DOC
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 truncate text-[11px] group-hover:text-emerald-800">
                            {att.File_Name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {att.File_Size_KB} KB • ดูไฟล์
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pharmacist Assessment Section */}
              {activeAssessment ? (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-emerald-800" />
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950">
                          ผลการประเมินและคำปรึกษาจากเภสัชกร
                        </h4>
                        <div className="text-[11px] text-emerald-700">
                          การประเมินรหัส: {activeAssessment.Assessment_ID} | วันที่: {activeAssessment.Created_At}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs">
                      {activeAssessment.Problem_Type}
                    </span>
                  </div>

                  {/* Clinical Notes & Care Plan */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-900 block mb-1">
                        บันทึกผลการประเมินทางคลินิก (Clinical Evaluation):
                      </span>
                      <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 text-slate-700 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                        {activeAssessment.Clinical_Assessment_Notes}
                      </div>
                    </div>

                    {activeAssessment.Care_Plan_Recommendations && (
                      <div>
                        <span className="font-bold text-emerald-900 block mb-1">
                          คำแนะนำการปฏิบัติตัวและปรับพฤติกรรม:
                        </span>
                        <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 text-slate-700 leading-relaxed whitespace-pre-line">
                          {activeAssessment.Care_Plan_Recommendations}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prescribed Medications */}
                  {activeEpisodeMeds.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-xs text-emerald-900 block">
                        รายการยาที่เภสัชกรแนะนำสำหรับรอบนี้:
                      </span>
                      <div className="space-y-2">
                        {activeEpisodeMeds.map(med => (
                          <div
                            key={med.ID}
                            className="p-3 bg-white rounded-2xl border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {med.Drug_Name}
                              </div>
                              <div className="text-slate-600 mt-0.5">
                                วิธีใช้: <strong>{med.Sig_Instructions}</strong>
                              </div>
                            </div>
                            <div className="text-right sm:text-right shrink-0">
                              <span className="font-bold text-emerald-800 text-xs">
                                จำนวน {med.Quantity} {med.Unit}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                ระยะเวลา {med.Duration_Days} วัน
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Followup notice */}
                  {activeAssessment.Followup_Needed === 'Yes' && (
                    <div className="p-3 bg-teal-100/70 border border-teal-300 rounded-2xl text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-teal-900">
                        <Calendar className="w-4 h-4 text-teal-700" />
                        <span>
                          <strong>มีนัดติดตามผล:</strong> {activeAssessment.Followup_Outcome_Notes || 'ติดตามอาการเปลี่ยนแปลง'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Patient Feedback Section / Button */}
                  <div className="pt-2 border-t border-emerald-200 flex items-center justify-between flex-wrap gap-2">
                    {activeFeedback ? (
                      <div className="text-xs text-slate-700 flex items-center gap-2">
                        <span className="font-bold text-emerald-800">✓ ท่านประเมินแล้ว:</span>
                        <span className="flex items-center text-amber-500 font-bold">
                          {Array.from({ length: activeFeedback.Satisfaction_Score }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                        <span className="text-slate-500 font-semibold">({activeFeedback.Outcome_Status})</span>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs text-slate-600">
                          หลังจากปฏิบัติตามคำแนะนำ ท่านสามารถประเมินผลลัพธ์เพื่อช่วยพัฒนาการดูแลสุขภาพได้
                        </span>
                        <button
                          onClick={() => onOpenFeedback(activeAssessment)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>ประเมินผลลัพธ์และความพึงพอใจ</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 text-center space-y-2">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                  <div className="font-bold text-amber-900 text-sm">
                    กำลังรอการประเมินจากเภสัชกร
                  </div>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    ข้อมูลเหตุการณ์เจ็บป่วยของท่านถูกส่งเข้าสู่ระบบแล้ว เภสัชกรผู้ได้รับอนุญาตจะทำการตรวจสอบประวัติยา การแพ้ยา และจัดทำแผนการประเมินทางคลินิกให้ท่านโดยเร็ว
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
              เลือกเหตุการณ์เจ็บป่วยทางด้านซ้ายเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{previewAttachment.File_Name}</h3>
                <span className="text-[11px] text-slate-400">
                  ขนาด {previewAttachment.File_Size_KB} KB • บันทึกเมื่อ {previewAttachment.Uploaded_At}
                </span>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-100 rounded-2xl p-2 flex items-center justify-center min-h-[200px] max-h-[65vh] overflow-auto">
              {previewAttachment.Preview_Data_URL || previewAttachment.Drive_View_URL?.startsWith('data:image') ? (
                <img
                  src={previewAttachment.Preview_Data_URL || previewAttachment.Drive_View_URL}
                  alt={previewAttachment.File_Name}
                  className="max-h-[60vh] rounded-xl object-contain shadow-xs"
                />
              ) : (
                <div className="text-center p-8 text-slate-500 text-xs">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">{previewAttachment.File_Name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">ไฟล์เอกสารถูกจัดเก็บในระบบอย่างปลอดภัย</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
