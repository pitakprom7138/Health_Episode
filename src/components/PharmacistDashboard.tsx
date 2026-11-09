import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  User,
  Pill,
  Heart,
  FileText,
  Star,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { HealthEpisode, Patient, ClinicalAssessment } from '../types/healthSystem';

interface PharmacistDashboardProps {
  onOpenAssessment: (episode: HealthEpisode, patient: Patient) => void;
}

export const PharmacistDashboard: React.FC<PharmacistDashboardProps> = ({
  onOpenAssessment,
}) => {
  const {
    currentPharmacist,
    currentUser,
    healthEpisodes,
    patients,
    clinicalAssessments,
    patientMedications,
    episodeMedications,
    followups,
    patientFeedbacks,
    labResults,
  } = useHealthSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ASSESSED' | 'RED_FLAGS'>('ALL');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);

  // Filter episodes
  const filteredEpisodes = healthEpisodes.filter(ep => {
    const patient = patients.find(p => p.Patient_ID === ep.Patient_ID);
    const pName = patient ? patient.Full_Name : '';
    const pHn = patient ? patient.Citizen_ID_Or_HN : '';
    const matchesSearch =
      ep.Episode_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.Chief_Complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pHn.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'PENDING') return ep.Status === 'Pending_Assessment';
    if (filterStatus === 'ASSESSED') return ep.Status === 'Assessed' || ep.Status === 'Follow_Up_Scheduled';
    if (filterStatus === 'RED_FLAGS') return ep.Has_Emergency_Flags;
    return true;
  });

  const activeEpisode = selectedEpisodeId
    ? healthEpisodes.find(e => e.Episode_ID === selectedEpisodeId) || filteredEpisodes[0]
    : filteredEpisodes[0];

  const activePatient = activeEpisode
    ? patients.find(p => p.Patient_ID === activeEpisode.Patient_ID) || patients[0]
    : null;

  const activeAssessment = activeEpisode
    ? clinicalAssessments.find(a => a.Episode_ID === activeEpisode.Episode_ID)
    : undefined;

  const activePatientMeds = activePatient
    ? patientMedications.filter(pm => pm.Patient_ID === activePatient.Patient_ID)
    : [];

  const activeLabs = activeEpisode
    ? labResults.filter(l => l.Episode_ID === activeEpisode.Episode_ID)
    : [];

  const activeFeedback = activeAssessment
    ? patientFeedbacks.find(fb => fb.Assessment_ID === activeAssessment.Assessment_ID)
    : undefined;

  const pendingCount = healthEpisodes.filter(e => e.Status === 'Pending_Assessment').length;
  const redFlagCount = healthEpisodes.filter(e => e.Has_Emergency_Flags).length;
  const followupCount = followups.filter(f => f.Status === 'Scheduled').length;

  return (
    <div className="space-y-6">
      {/* Pharmacist Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-2xl text-emerald-200 border border-white/20 shrink-0">
              <Stethoscope className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentPharmacist?.Full_Name || currentUser.Full_Name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-400/40 text-xs font-semibold">
                  {currentPharmacist?.License_No || 'ภ.19842 (ใบประกอบวิชาชีพเภสัชกรรม)'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-white text-xs">
                  {currentPharmacist?.Specialization || 'เภสัชกรรมคลินิกและบริบาลปฐมภูมิ'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-2">
                สังกัด: {currentPharmacist?.Hospital_Or_Store_Affiliation || 'คลินิกยาชุมชนอบอุ่น / รพ.มหาวิทยาลัย'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>พร้อมให้บริการประเมินทางคลินิก</span>
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">รอประเมินทางคลินิก</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount} เคส</div>
          <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>ต้องการการดูแล</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">เคสสัญญาณอันตราย (Red Flag)</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{redFlagCount} เคส</div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ต้องคัดกรองด่วน</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">นัดติดตามผล (Follow-ups)</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{followupCount} นัด</div>
          <div className="text-[11px] text-teal-600 mt-1">ติดตามอาการในระบบ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">ผู้ป่วยในความดูแล</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{patients.length} คน</div>
          <div className="text-[11px] text-slate-400 mt-1">ทะเบียนผู้ป่วย</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย, HN, หรืออาการสำคัญ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({healthEpisodes.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            รอประเมิน ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('RED_FLAGS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === 'RED_FLAGS'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            สัญญาณอันตราย ({redFlagCount})
          </button>
          <button
            onClick={() => setFilterStatus('ASSESSED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === 'ASSESSED'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            ประเมินแล้ว
          </button>
        </div>
      </div>

      {/* Main Split Queue and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Episode Queue (Left) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">
            คิว Health Episodes ({filteredEpisodes.length} รายการ)
          </div>

          {filteredEpisodes.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              ไม่พบรายการเหตุการณ์ตามเงื่อนไขค้นหา
            </div>
          ) : (
            filteredEpisodes.map(ep => {
              const p = patients.find(patient => patient.Patient_ID === ep.Patient_ID);
              const isSelected = activeEpisode?.Episode_ID === ep.Episode_ID;
              const isAssessed = ep.Status === 'Assessed' || ep.Status === 'Follow_Up_Scheduled';

              return (
                <div
                  key={ep.Episode_ID}
                  onClick={() => setSelectedEpisodeId(ep.Episode_ID)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{p?.Full_Name || 'ผู้ป่วย'}</span>
                      <span className="text-[10px] text-slate-400">({p?.Citizen_ID_Or_HN})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAssessed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAssessed ? 'ประเมินแล้ว' : 'รอประเมิน'}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-800 mt-1 line-clamp-1">
                    {ep.Chief_Complaint}
                  </div>

                  {ep.Has_Emergency_Flags && (
                    <div className="mt-1.5 p-1.5 bg-red-100 border border-red-300 rounded-lg text-red-800 text-[11px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">ตรวจพบ Red Flag ({ep.Emergency_Red_Flags.length} รายการ)</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-500 line-clamp-2">
                    {ep.Symptoms_Description}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{ep.Episode_ID}</span>
                    <span>T: {ep.Temperature_C ?? '-'}°C | BP: {ep.Systolic_BP ?? '-'}/{ep.Diastolic_BP ?? '-'}</span>
                    <span>เป็นมา {ep.Duration_Days} วัน</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clinical Workspace & Patient Profile (Right) */}
        <div className="lg:col-span-7">
          {activeEpisode && activePatient ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Header with Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {activeEpisode.Episode_ID}
                    </span>
                    <span className="text-xs text-slate-500">
                      วันเวลา: {activeEpisode.Onset_DateTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {activePatient.Full_Name} ({activePatient.Citizen_ID_Or_HN})
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    เพศ {activePatient.Gender} | วันเกิด {activePatient.DOB} | เบอร์โทร {activePatient.Phone}
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => onOpenAssessment(activeEpisode, activePatient)}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-800/20 transition flex items-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4 text-emerald-200" />
                    <span>
                      {activeAssessment ? 'แก้ไขผลการประเมินทางคลินิก' : 'ทำการประเมินทางคลินิก (Assess)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Patient Allergies & Chronic Diseases Warning Banner */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>ประวัติการแพ้ยาและโรคประจำตัวที่ต้องเฝ้าระวัง:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 font-semibold block">ประวัติแพ้ยา (Allergies):</span>
                    <span className="font-bold text-rose-700">
                      {activePatient.Known_Allergies.join(', ') || 'ไม่มีประวัติแพ้ยา'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">โรคประจำตัว (Chronic Diseases):</span>
                    <span className="font-bold text-slate-900">
                      {activePatient.Chronic_Diseases.join(', ') || 'ไม่มีโรคประจำตัว'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Symptoms & Vitals Presentation */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  อาการสำคัญและสัญญาณชีพในเหตุการณ์นี้
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  <div className="font-bold text-slate-900 mb-1">อาการสำคัญ: {activeEpisode.Chief_Complaint}</div>
                  {activeEpisode.Symptoms_Description}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">อุณหภูมิร่างกาย</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Temperature_C ? `${activeEpisode.Temperature_C} °C` : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">ความดันโลหิต</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Systolic_BP && activeEpisode.Diastolic_BP
                        ? `${activeEpisode.Systolic_BP}/${activeEpisode.Diastolic_BP} mmHg`
                        : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">ชีพจร</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Pulse_BPM ? `${activeEpisode.Pulse_BPM} bpm` : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">อัตราการหายใจ</span>
                    <span className="font-bold text-slate-800">
                      {activeEpisode.Resp_Rate ? `${activeEpisode.Resp_Rate} /min` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Medications of Patient */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <span>ยาที่ผู้ป่วยใช้อยู่ในปัจจุบัน (Patient_Medications):</span>
                </div>
                {activePatientMeds.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">ไม่มีบันทึกยาประจำตัว</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activePatientMeds.map(med => (
                      <div
                        key={med.ID}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{med.Drug_Name}</div>
                          <div className="text-slate-600 text-[11px] mt-0.5">{med.Dose_Instructions}</div>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">
                          หมวด: {med.Category} | แหล่งที่มา: {med.Prescriber_Source}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lab Results */}
              {activeLabs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>ผลตรวจทางห้องปฏิบัติการ (Lab Results):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeLabs.map(lab => (
                      <div
                        key={lab.Lab_ID}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{lab.Test_Type}</div>
                          <div className="text-[10px] text-slate-400">ช่วงปกติ: {lab.Reference_Range}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-xs">
                            {lab.Result_Value} {lab.Unit}
                          </span>
                          <span
                            className={`block text-[10px] font-bold ${
                              lab.Normal_Abnormal_Flag === 'High'
                                ? 'text-rose-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            [{lab.Normal_Abnormal_Flag}]
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Done Details */}
              {activeAssessment ? (
                <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>ผลการประเมินทางคลินิกที่บันทึกแล้ว ({activeAssessment.Assessment_ID})</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-800 text-white rounded-lg text-xs font-bold">
                      {activeAssessment.Problem_Type}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 whitespace-pre-line font-mono bg-white p-3 rounded-2xl border border-emerald-200">
                    {activeAssessment.Clinical_Assessment_Notes}
                  </div>

                  {activeAssessment.Care_Plan_Recommendations && (
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-2xl border border-emerald-200">
                      <span className="font-bold text-emerald-900 block mb-0.5">คำแนะนำการดูแลสุขภาพ:</span>
                      {activeAssessment.Care_Plan_Recommendations}
                    </div>
                  )}

                  {/* Feedback from Patient if present */}
                  {activeFeedback && (
                    <div className="p-3 bg-white rounded-2xl border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>ผลลัพธ์และความพึงพอใจจากผู้ป่วย:</span>
                      </div>
                      <div className="text-slate-700">
                        ผลลัพธ์: <strong>{activeFeedback.Outcome_Status}</strong> | คะแนน:{' '}
                        <strong>{activeFeedback.Satisfaction_Score} ดาว</strong>
                      </div>
                      {activeFeedback.Comments && (
                        <div className="text-slate-500 italic mt-0.5">&quot;{activeFeedback.Comments}&quot;</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>ยังไม่มีการบันทึกผลการประเมินสำหรับเคสนี้</span>
                  <button
                    onClick={() => onOpenAssessment(activeEpisode, activePatient)}
                    className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs hover:bg-emerald-900 transition"
                  >
                    เริ่มการประเมิน
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
              เลือกเหตุการณ์เจ็บป่วยจากรายการด้านซ้ายเพื่อดูรายละเอียดและทำการประเมิน
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
