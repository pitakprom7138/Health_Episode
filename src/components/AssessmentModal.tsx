import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Pill,
  BookOpen,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  FileCheck,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import {
  HealthEpisode,
  Patient,
  ClinicalAssessment,
  ClinicalAction,
  AssessmentDataSource,
} from '../types/healthSystem';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: HealthEpisode;
  patient: Patient;
  onSuccess: (assessmentId: string) => void;
}

const PROBLEM_TYPES: Array<ClinicalAssessment['Problem_Type']> = [
  'Acute / New Problem',
  'Chronic Problem',
  'Medication-related Problem',
  'Treatment-related Problem',
];

const ACTION_TYPES: Array<ClinicalAction['Action_Type']> = [
  'Patient Counseling',
  'Dispensing',
  'Dose Adjustment',
  'Referral to Physician',
  'Drug Discontinuation',
];

const SOURCE_TYPES: Array<AssessmentDataSource['Source_Type']> = [
  'CPG / Guideline',
  'Thai FDA / บัญชียาหลัก',
  'UpToDate',
  'Micromedex',
  'Lexicomp',
  'Pharmacotherapy Textbook',
];

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  episode,
  patient,
  onSuccess,
}) => {
  const {
    currentPharmacist,
    currentUser,
    medicationCatalog,
    patientMedications,
    labResults,
    createAssessment,
  } = useHealthSystem();

  // Form states
  const [problemType, setProblemType] = useState<ClinicalAssessment['Problem_Type']>('Acute / New Problem');
  const [assessmentNotes, setAssessmentNotes] = useState(
    `Subjective: ผู้ป่วยรายงานอาการสำคัญคือ ${episode.Chief_Complaint} เป็นมาประมาณ ${episode.Duration_Days} วัน รายละเอียด: ${episode.Symptoms_Description}\n` +
      `Objective: T ${episode.Temperature_C ?? '-'} °C, BP ${episode.Systolic_BP ?? '-'}/${episode.Diastolic_BP ?? '-'} mmHg, HR ${episode.Pulse_BPM ?? '-'} bpm, RR ${episode.Resp_Rate ?? '-'} /min\n` +
      `Assessment: \nPlan: `
  );
  const [carePlan, setCarePlan] = useState('');
  const [followupNeeded, setFollowupNeeded] = useState<'Yes' | 'No'>('Yes');
  const [followupCount, setFollowupCount] = useState(1);
  const [followupDate, setFollowupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [followupNotes, setFollowupNotes] = useState('ติดตามการตอบสนองต่อยาและอาการเปลี่ยนแปลง');
  const [referralDetails, setReferralDetails] = useState('');
  const [adrNotes, setAdrNotes] = useState('');

  // Selected Medications
  const [recommendedMeds, setRecommendedMeds] = useState<
    Array<{
      medId: string;
      quantity: number;
      unit: string;
      sig: string;
      durationDays: number;
    }>
  >([]);

  // Clinical Actions
  const [actions, setActions] = useState<
    Array<{ actionType: ClinicalAction['Action_Type']; details: string }>
  >([
    {
      actionType: 'Patient Counseling',
      details: 'ให้คำแนะนำการปฏิบัติตัว การใช้ยาที่ถูกต้อง และการสังเกตอาการเตือน',
    },
  ]);

  // Academic Data Sources
  const [sources, setSources] = useState<
    Array<{
      sourceType: AssessmentDataSource['Source_Type'];
      citation: string;
      notes: string;
    }>
  >([
    {
      sourceType: 'Thai FDA / บัญชียาหลัก',
      citation: 'คู่มือการใช้ยาอย่างสมเหตุผลตามบัญชียาหลักแห่งชาติ (RDU)',
      notes: 'แนวทางการสั่งใช้ยาอย่างปลอดภัยและสมเหตุผล',
    },
  ]);

  // AI Gemini Clinical Assistant State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Add Medication Row
  const addMedRow = () => {
    const firstMed = medicationCatalog[0];
    if (!firstMed) return;
    setRecommendedMeds(prev => [
      ...prev,
      {
        medId: firstMed.Med_ID,
        quantity: 10,
        unit: firstMed.Default_Unit,
        sig: 'รับประทานครั้งละ 1 เม็ด เมื่อมีอาการ',
        durationDays: 5,
      },
    ]);
  };

  const removeMedRow = (index: number) => {
    setRecommendedMeds(prev => prev.filter((_, i) => i !== index));
  };

  const updateMedRow = (index: number, field: string, value: any) => {
    setRecommendedMeds(prev =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        if (field === 'medId') {
          const item = medicationCatalog.find(m => m.Med_ID === value);
          if (item) {
            updated.unit = item.Default_Unit;
          }
        }
        return updated;
      })
    );
  };

  // Add Action Row
  const addActionRow = () => {
    setActions(prev => [
      ...prev,
      { actionType: 'Dispensing', details: 'จ่ายยาตามแผนการรักษาพร้อมคำแนะนำ' },
    ]);
  };

  const removeActionRow = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  // Add Source Row
  const addSourceRow = () => {
    setSources(prev => [
      ...prev,
      {
        sourceType: 'CPG / Guideline',
        citation: 'Clinical Practice Guideline',
        notes: '',
      },
    ]);
  };

  const removeSourceRow = (index: number) => {
    setSources(prev => prev.filter((_, i) => i !== index));
  };

  // Call Server-Side Gemini API for Assistive Clinical Summary
  const requestAiAssistance = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const pMeds = patientMedications
        .filter(pm => pm.Patient_ID === patient.Patient_ID && pm.Status === 'Active')
        .map(pm => `${pm.Drug_Name} (${pm.Category}): ${pm.Dose_Instructions}`);

      const epLabs = labResults
        .filter(l => l.Episode_ID === episode.Episode_ID)
        .map(l => ({
          type: l.Test_Type,
          value: l.Result_Value,
          unit: l.Unit,
          flag: l.Normal_Abnormal_Flag,
        }));

      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patient.Full_Name,
          ageOrDob: patient.DOB,
          gender: patient.Gender,
          chronicDiseases: patient.Chronic_Diseases,
          allergies: patient.Known_Allergies,
          chiefComplaint: episode.Chief_Complaint,
          symptoms: episode.Symptoms_Description,
          durationDays: episode.Duration_Days,
          vitals: {
            temp: episode.Temperature_C,
            pulse: episode.Pulse_BPM,
            bp:
              episode.Systolic_BP && episode.Diastolic_BP
                ? `${episode.Systolic_BP}/${episode.Diastolic_BP}`
                : undefined,
            rr: episode.Resp_Rate,
          },
          currentMeds: pMeds,
          labs: epLabs,
          redFlags: episode.Emergency_Red_Flags,
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiError(data.error || 'ไม่สามารถติดต่อ AI ในขณะนี้');
      }
    } catch (err: any) {
      setAiError('เกิดข้อผิดพลาดในการประมวลผล AI: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Assessment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentNotes.trim()) {
      alert('กรุณากรอกบันทึกผลการประเมินทางคลินิก');
      return;
    }

    const pharmacistId = currentPharmacist ? currentPharmacist.Pharmacist_ID : 'PH001';

    setIsSubmitting(true);
    try {
      const newAsId = await createAssessment(
        {
          Episode_ID: episode.Episode_ID,
          Pharmacist_ID: pharmacistId,
          Problem_Type: problemType,
          Clinical_Assessment_Notes: assessmentNotes,
          Care_Plan_Recommendations: carePlan,
          Followup_Needed: followupNeeded,
          Followup_Count: followupCount,
          Followup_Outcome_Notes: followupNotes,
          Referral_Details: referralDetails,
          Adverse_Drug_Reactions: adrNotes,
        },
        recommendedMeds,
        actions,
        sources,
        followupNeeded === 'Yes' ? followupDate : undefined,
        followupNotes
      );

      setIsSubmitting(false);
      onSuccess(newAsId);
    } catch (err: any) {
      setIsSubmitting(false);
      alert('เกิดข้อผิดพลาดในการบันทึกการประเมิน: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">บันทึกผลการประเมินทางคลินิกโดยเภสัชกร</h2>
              <p className="text-xs text-emerald-200">
                เคส: {episode.Episode_ID} | ผู้ป่วย: {patient.Full_Name} ({patient.Citizen_ID_Or_HN}) | เภสัชกร: {currentPharmacist?.Full_Name || currentUser.Full_Name} ({currentPharmacist?.License_No || 'ภ.19842'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Patient Quick Info Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-slate-500 font-semibold">อาการสำคัญ (Chief Complaint):</div>
              <div className="font-bold text-slate-900 mt-0.5">{episode.Chief_Complaint}</div>
              <div className="text-[11px] text-slate-600 mt-1">
                ระยะเวลา: <strong>{episode.Duration_Days} วัน</strong> | อุณหภูมิ: {episode.Temperature_C ?? '-'} °C | BP: {episode.Systolic_BP ?? '-'}/{episode.Diastolic_BP ?? '-'} mmHg
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-semibold">ประวัติแพ้ยา (Allergies):</div>
              <div className="font-bold text-rose-700 mt-0.5">
                {patient.Known_Allergies.join(', ') || 'ไม่มีประวัติแพ้ยา'}
              </div>
              <div className="text-slate-500 font-semibold mt-2">โรคประจำตัว (Chronic):</div>
              <div className="font-medium text-slate-800">
                {patient.Chronic_Diseases.join(', ') || 'ไม่มีโรคประจำตัว'}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              {episode.Has_Emergency_Flags ? (
                <div className="p-2 bg-red-100 border border-red-300 rounded-xl text-red-800 text-[11px] font-bold">
                  ⚠️ ผู้ป่วยระบุสัญญาณอันตราย:
                  <ul className="list-disc pl-4 font-normal mt-0.5">
                    {episode.Emergency_Red_Flags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-2 bg-emerald-100/60 border border-emerald-300 rounded-xl text-emerald-800 text-[11px]">
                  ✅ ไม่พบสัญญาณอันตรายฉุกเฉินเบื้องต้น
                </div>
              )}

              {/* AI Assistance Trigger Button */}
              <button
                type="button"
                onClick={requestAiAssistance}
                disabled={isAiLoading}
                className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAiLoading ? 'AI กำลังประมวลผลข้อมูล...' : 'ผู้ช่วยเภสัชกร AI (Clinical Assistant)'}</span>
              </button>
            </div>
          </div>

          {/* AI Assistive Output Panel */}
          {aiSummary && (
            <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>สรุปภาพรวมและประเด็นทางเภสัชกรรม (AI Assistive Support)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiSummary(null)}
                  className="text-teal-700 hover:text-teal-900 text-xs"
                >
                  ซ่อน
                </button>
              </div>
              <div className="text-xs text-slate-700 whitespace-pre-line mt-2 leading-relaxed">
                {aiSummary}
              </div>
              <div className="mt-3 p-2 bg-white/70 border border-teal-200 rounded-lg text-[10px] text-slate-500">
                ⚖️ <strong>ข้อสงวนสิทธิ์:</strong> ระบบนี้ใช้ Gemini AI เป็นเครื่องมือช่วยประมวลผลและจัดระเบียบข้อมูลเบื้องต้นเท่านั้น ไม่ใช้แทนการตัดสินใจทางคลินิกและการวินิจฉัยของเภสัชกรหรือแพทย์ผู้มีใบประกอบวิชาชีพ
              </div>
            </div>
          )}

          {aiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {aiError}
            </div>
          )}

          {/* Problem Type & Notes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>การประเมินและการตัดสินใจทางคลินิก</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทปัญหาสุขภาพ (Problem Classification) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROBLEM_TYPES.map(type => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                      problemType === type
                        ? 'bg-emerald-100/80 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="problemType"
                      value={type}
                      checked={problemType === type}
                      onChange={() => setProblemType(type)}
                      className="text-emerald-700 focus:ring-emerald-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บันทึกผลการประเมินทางคลินิก (SOAP Notes / Clinical Narrative) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={assessmentNotes}
                onChange={e => setAssessmentNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คำแนะนำในการดูแลสุขภาพและการปรับพฤติกรรม (Care Plan & Patient Counseling)
              </label>
              <textarea
                rows={3}
                placeholder="ระบุคำแนะนำด้านโภชนาการ การพักผ่อน การออกกำลังกาย หรือการหลีกเลี่ยงปัจจัยกระตุ้น..."
                value={carePlan}
                onChange={e => setCarePlan(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Medication Catalog Recommendations */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <span>รายการยาที่แนะนำ (Episode Medications from Catalog)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  ค้นหาและเลือกยาจาก Medication_Catalog ยอดรวมจะคำนวณเข้าสู่ตาราง Drug_Usage_Summary อัตโนมัติ
                </p>
              </div>
              <button
                type="button"
                onClick={addMedRow}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มรายการยา</span>
              </button>
            </div>

            {recommendedMeds.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                ไม่มีการแนะนำยา (ผู้ป่วยได้รับคำแนะนำการปฏิบัติตัวโดยไม่ใช้ยา)
              </div>
            ) : (
              <div className="space-y-2">
                {recommendedMeds.map((med, idx) => {
                  const catalogItem = medicationCatalog.find(m => m.Med_ID === med.medId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-500 font-semibold block">เลือกยาจาก Catalog</label>
                        <select
                          value={med.medId}
                          onChange={e => updateMedRow(idx, 'medId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        >
                          {medicationCatalog.map(item => (
                            <option key={item.Med_ID} value={item.Med_ID}>
                              {item.Generic_Name} ({item.Strength}) - {item.Dosage_Form}
                            </option>
                          ))}
                        </select>
                        {catalogItem && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {catalogItem.Indications}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 font-semibold block">จำนวน</label>
                        <input
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={e => updateMedRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 font-semibold block">หน่วย</label>
                        <input
                          type="text"
                          value={med.unit}
                          onChange={e => updateMedRow(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-500 font-semibold block">วิธีใช้ (Sig)</label>
                        <input
                          type="text"
                          placeholder="เช่น 1 เม็ด เช้า-เย็น หลังอาหาร"
                          value={med.sig}
                          onChange={e => updateMedRow(idx, 'sig', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeMedRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                          title="ลบยานี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Follow-up & ADR & Actions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>การติดตามผลและการจัดการอาการไม่พึงประสงค์</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ความจำเป็นในการติดตามผล (Follow-up)
                </label>
                <select
                  value={followupNeeded}
                  onChange={e => setFollowupNeeded(e.target.value as 'Yes' | 'No')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="Yes">จำเป็นต้องติดตามผล (Yes)</option>
                  <option value="No">ไม่ต้องติดตามผล (No)</option>
                </select>
              </div>

              {followupNeeded === 'Yes' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      วันที่นัดติดตามผล
                    </label>
                    <input
                      type="date"
                      value={followupDate}
                      onChange={e => setFollowupDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      จำนวนครั้งที่วางแผนติดตาม
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={followupCount}
                      onChange={e => setFollowupCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อาการไม่พึงประสงค์จากยาที่เฝ้าระวังหรือพบ (ADR Monitoring)
                </label>
                <input
                  type="text"
                  placeholder="เช่น สังเกตอาการแพ้ ผื่น ลมพิษ ง่วงซึม ปากแห้ง..."
                  value={adrNotes}
                  onChange={e => setAdrNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  การส่งต่อผู้ป่วย (Referral Details - ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ส่งต่อแพทย์เฉพาะทางหากอาการไม่ดีขึ้นใน 14 วัน..."
                  value={referralDetails}
                  onChange={e => setReferralDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Academic Evidence Sources */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>แหล่งข้อมูลทางวิชาการที่ใช้ประกอบการประเมิน (Evidence Sources)</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={addSourceRow}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มแหล่งอ้างอิง</span>
              </button>
            </div>

            <div className="space-y-2">
              {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-500 font-semibold block">แหล่งข้อมูล</label>
                    <select
                      value={src.sourceType}
                      onChange={e => {
                        const val = e.target.value as any;
                        setSources(prev =>
                          prev.map((s, i) => (i === idx ? { ...s, sourceType: val } : s))
                        );
                      }}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {SOURCE_TYPES.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="text-[10px] text-slate-500 font-semibold block">ชื่อเอกสาร / CPG / ลิงก์</label>
                    <input
                      type="text"
                      value={src.citation}
                      onChange={e => {
                        const val = e.target.value;
                        setSources(prev =>
                          prev.map((s, i) => (i === idx ? { ...s, citation: val } : s))
                        );
                      }}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-500 font-semibold block">หมายเหตุสำคัญ</label>
                    <input
                      type="text"
                      value={src.notes}
                      onChange={e => {
                        const val = e.target.value;
                        setSources(prev =>
                          prev.map((s, i) => (i === idx ? { ...s, notes: val } : s))
                        );
                      }}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSourceRow(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-md shadow-emerald-800/20 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>กำลังบันทึกการประเมิน...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันและบันทึกผลการประเมินทางคลินิก</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
