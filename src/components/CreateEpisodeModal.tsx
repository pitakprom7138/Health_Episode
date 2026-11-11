import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Heart,
  Thermometer,
  Activity,
  FileText,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { LabResult } from '../types/healthSystem';

interface CreateEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (episodeId: string) => void;
}

const EMERGENCY_RED_FLAG_OPTIONS = [
  'เจ็บแน่นหน้าอกร้าวไปกรามหรือแขนซ้าย เหงื่อแตกตัวเย็น',
  'หายใจหอบเหนื่อยรุนแรง หายใจมีเสียงหวีด หรือริมฝีปากเขียวคล้ำ',
  'แขนขาอ่อนแรง หรือชาครึ่งซีก ปากเบี้ยว พูดไม่ชัดฉับพลัน (อาการโรคหลอดเลือดสมอง Fast)',
  'ปวดศีรษะรุนแรงเฉียบพลันที่สุดในชีวิต หรือหมดสติชั่วขณะ',
  'ไข้สูงมากกว่า 39.0°C ร่วมกับหนาวสั่น เพ้อ หรือคอแข็ง',
  'ความดันโลหิตสูงวิกฤต (ตัวบนมากกว่า 180 หรือตัวล่างมากกว่า 110 mmHg)',
  'อาเจียนเป็นเลือด ถ่ายอุจจาระเป็นเลือดสดหรือดำสนิท',
  'อาการแพ้รุนแรง (Anaphylaxis): ลมพิษ ตาบวม ปากบวม แน่นคอ หายใจติดขัด',
];

const LAB_TEST_TYPES: Array<LabResult['Test_Type']> = [
  'FBS / FPG',
  'HbA1c',
  'LDL',
  'Cholesterol',
  'Triglycerides',
  'Creatinine',
  'eGFR',
  'Urinalysis',
  'Electrolytes',
  'Special Laboratory Tests',
];

export const CreateEpisodeModal: React.FC<CreateEpisodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentPatient, currentUser, createEpisode } = useHealthSystem();

  // Form State
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 10));
  const [onsetTime, setOnsetTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [durationDays, setDurationDays] = useState(1);
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);

  // Vital Signs
  const [temp, setTemp] = useState<string>('36.8');
  const [pulse, setPulse] = useState<string>('76');
  const [systolicBp, setSystolicBp] = useState<string>('120');
  const [diastolicBp, setDiastolicBp] = useState<string>('80');
  const [respRate, setRespRate] = useState<string>('18');

  // Labs
  const [labs, setLabs] = useState<
    Array<{
      testType: LabResult['Test_Type'];
      testDate: string;
      resultValue: string;
      unit: string;
      referenceRange: string;
      normalAbnormalFlag: LabResult['Normal_Abnormal_Flag'];
      notes: string;
    }>
  >([]);

  // Attachments
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; type: string; sizeKb: number; dataUrl?: string }>
  >([]);

  // AI Organize state
  const [isAiOrganizing, setIsAiOrganizing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Toggle Red Flag
  const toggleRedFlag = (flag: string) => {
    setSelectedRedFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  // Add Lab Row
  const addLabRow = () => {
    setLabs(prev => [
      ...prev,
      {
        testType: 'FBS / FPG',
        testDate: new Date().toISOString().slice(0, 10),
        resultValue: '',
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        normalAbnormalFlag: 'Normal',
        notes: '',
      },
    ]);
  };

  const removeLabRow = (index: number) => {
    setLabs(prev => prev.filter((_, i) => i !== index));
  };

  const updateLabRow = (index: number, field: string, value: any) => {
    setLabs(prev =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        // Auto reference range suggest
        if (field === 'testType') {
          if (value === 'FBS / FPG') {
            updated.unit = 'mg/dL';
            updated.referenceRange = '70 - 99 mg/dL';
          } else if (value === 'HbA1c') {
            updated.unit = '%';
            updated.referenceRange = '< 5.7%';
          } else if (value === 'LDL') {
            updated.unit = 'mg/dL';
            updated.referenceRange = '< 100 mg/dL';
          } else if (value === 'Cholesterol') {
            updated.unit = 'mg/dL';
            updated.referenceRange = '< 200 mg/dL';
          } else if (value === 'Triglycerides') {
            updated.unit = 'mg/dL';
            updated.referenceRange = '< 150 mg/dL';
          } else if (value === 'Creatinine') {
            updated.unit = 'mg/dL';
            updated.referenceRange = '0.70 - 1.20 mg/dL';
          } else if (value === 'eGFR') {
            updated.unit = 'mL/min/1.73m²';
            updated.referenceRange = '> 60 mL/min';
          }
        }
        return updated;
      })
    );
  };

  // Fast client-side image compression to prevent memory freeze and fast upload
  const compressImage = (file: File): Promise<{ dataUrl: string; sizeKb: number }> => {
    return new Promise(resolve => {
      let isSettled = false;
      const finish = (dataUrl: string, sizeKb: number) => {
        if (!isSettled) {
          isSettled = true;
          resolve({ dataUrl, sizeKb });
        }
      };

      // 3-second safety watchdog so UI can NEVER hang under any condition
      const timer = setTimeout(() => {
        finish('', Math.round(file.size / 1024));
      }, 3000);

      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          clearTimeout(timer);
          const res = (ev.target?.result as string) || '';
          finish(res, Math.round(file.size / 1024));
        };
        reader.onerror = () => {
          clearTimeout(timer);
          finish('', Math.round(file.size / 1024));
        };
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = ev => {
        const rawResult = (ev.target?.result as string) || '';
        const img = new Image();
        img.onload = () => {
          clearTimeout(timer);
          try {
            const maxDim = 1000;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.75);
              const sizeKb = Math.round((compressed.length * 0.75) / 1024);
              finish(compressed, sizeKb);
            } else {
              finish(rawResult, Math.round(file.size / 1024));
            }
          } catch {
            finish(rawResult, Math.round(file.size / 1024));
          }
        };
        img.onerror = () => {
          clearTimeout(timer);
          finish(rawResult, Math.round(file.size / 1024));
        };
        img.src = rawResult;
      };
      reader.onerror = () => {
        clearTimeout(timer);
        finish('', Math.round(file.size / 1024));
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of Array.from(files)) {
        const { dataUrl, sizeKb } = await compressImage(file);
        setUploadedFiles(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'image/jpeg',
            sizeKb,
            dataUrl,
          },
        ]);
      }
    } catch (err) {
      console.warn('File read error:', err);
    } finally {
      e.target.value = '';
    }
  };

  // AI Organize Symptoms handler
  const handleAiOrganize = async () => {
    if (!symptoms.trim()) {
      setAiError('กรุณากรอกอาการในช่องรายละเอียดก่อนให้ AI ช่วยจัดระเบียบ');
      return;
    }
    setIsAiOrganizing(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/organize-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: symptoms }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setSymptoms(data.text);
      } else {
        setAiError(data.error || 'ไม่สามารถประมวลผลข้อความได้ในขณะนี้');
      }
    } catch (err: any) {
      setAiError('เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ' + err.message);
    } finally {
      setIsAiOrganizing(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      alert('กรุณาระบุอาการสำคัญ');
      return;
    }

    const patientId = currentPatient ? currentPatient.Patient_ID : 'PT000001';
    const onsetDateTime = `${onsetDate} ${onsetTime}:00`;
    const hasEmergency = selectedRedFlags.length > 0;

    setIsSubmitting(true);
    try {
      const newEpId = await createEpisode(
        {
          Patient_ID: patientId,
          Onset_DateTime: onsetDateTime,
          Chief_Complaint: chiefComplaint,
          Symptoms_Description: symptoms,
          Duration_Days: Number(durationDays),
          Emergency_Red_Flags: selectedRedFlags,
          Has_Emergency_Flags: hasEmergency,
          Temperature_C: temp ? parseFloat(temp) : undefined,
          Pulse_BPM: pulse ? parseInt(pulse) : undefined,
          Systolic_BP: systolicBp ? parseInt(systolicBp) : undefined,
          Diastolic_BP: diastolicBp ? parseInt(diastolicBp) : undefined,
          Resp_Rate: respRate ? parseInt(respRate) : undefined,
        },
        labs.map(l => ({
          Test_Date: l.testDate,
          Test_Type: l.testType,
          Result_Value: l.resultValue,
          Unit: l.unit,
          Reference_Range: l.referenceRange,
          Normal_Abnormal_Flag: l.normalAbnormalFlag,
          Notes: l.notes,
        })),
        uploadedFiles
      );

      setIsSubmitting(false);
      onSuccess(newEpId);
    } catch (err: any) {
      setIsSubmitting(false);
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
  };

  const hasRedFlags = selectedRedFlags.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">สร้าง Health Episode ใหม่</h2>
              <p className="text-xs text-emerald-200">
                ผู้ป่วย: {currentPatient?.Full_Name || currentUser?.Full_Name || 'ผู้ป่วย'} (
                {currentPatient?.Citizen_ID_Or_HN || 'HN-NEW'})
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
          {/* Emergency Triage Section */}
          <div
            className={`p-4 rounded-2xl border transition ${
              hasRedFlags
                ? 'bg-red-50 border-red-300 ring-2 ring-red-400'
                : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`w-6 h-6 shrink-0 mt-0.5 ${
                  hasRedFlags ? 'text-red-600 animate-bounce' : 'text-amber-600'
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`font-bold text-sm ${
                    hasRedFlags ? 'text-red-800' : 'text-amber-900'
                  }`}
                >
                  การคัดกรองสัญญาณอันตรายและอาการฉุกเฉิน (Emergency Red Flags)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  กรุณาตรวจสอบว่าท่านมีอาการผิดปกติรุนแรงอย่างใดอย่างหนึ่งดังต่อไปนี้หรือไม่
                </p>

                {/* Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {EMERGENCY_RED_FLAG_OPTIONS.map((flag, idx) => {
                    const isChecked = selectedRedFlags.includes(flag);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-xl text-xs cursor-pointer border transition ${
                          isChecked
                            ? 'bg-red-100/80 border-red-400 text-red-900 font-semibold'
                            : 'bg-white/70 border-slate-200 hover:bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRedFlag(flag)}
                          className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                        />
                        <span>{flag}</span>
                      </label>
                    );
                  })}
                </div>

                {hasRedFlags && (
                  <div className="mt-3 p-3 bg-red-600 text-white rounded-xl text-xs font-semibold flex items-center justify-between">
                    <span>
                      ⚠️ ตรวจพบสัญญาณอันตราย! แนะนำให้ท่านติดต่อสายด่วน 1669 หรือพบแพทย์ที่ห้องฉุกเฉินทันที
                    </span>
                    <a
                      href="tel:1669"
                      className="px-3 py-1 bg-white text-red-700 rounded-lg font-bold shadow-xs ml-2 shrink-0"
                    >
                      โทร 1669
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Symptom & Onset */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>ข้อมูลอาการเจ็บป่วย</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่เริ่มมีอาการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={onsetDate}
                  onChange={e => setOnsetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เวลาที่เริ่มมีอาการ
                </label>
                <input
                  type="time"
                  value={onsetTime}
                  onChange={e => setOnsetTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระยะเวลาที่มีอาการ (วัน) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={e => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อาการสำคัญ (Chief Complaint) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น แสบร้อนกลางอก แน่นลิ้นปี่, เจ็บคอ มีไข้ต่ำๆ, ผื่นคันขึ้นตามตัว"
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  รายละเอียดอาการและลักษณะที่เป็น (Symptoms Description)
                </label>
                <button
                  type="button"
                  onClick={handleAiOrganize}
                  disabled={isAiOrganizing || !symptoms.trim()}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition disabled:opacity-50"
                  title="ใช้ Google Gemini ช่วยเรียบเรียงให้อ่านง่ายสำหรับเภสัชกร"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAiOrganizing ? 'กำลังจัดระเบียบ...' : 'AI ช่วยจัดระเบียบข้อความ'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="ระบุว่าเริ่มเป็นอย่างไร มีอาการเวลาไหน ทานอะไรแล้วเป็นมากขึ้น มีอาการอื่นร่วมด้วยหรือไม่..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {aiError && <p className="text-xs text-red-600 mt-1">{aiError}</p>}
            </div>
          </div>

          {/* Section 2: Vital Signs */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>สัญญาณชีพเบื้องต้น (Vital Signs - ถ้ามีเครื่องวัดที่บ้าน)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  อุณหภูมิ (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.8"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ชีพจร (bpm)
                </label>
                <input
                  type="number"
                  placeholder="76"
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ความดันตัวบน (Systolic)
                </label>
                <input
                  type="number"
                  placeholder="120"
                  value={systolicBp}
                  onChange={e => setSystolicBp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ความดันตัวล่าง (Diastolic)
                </label>
                <input
                  type="number"
                  placeholder="80"
                  value={diastolicBp}
                  onChange={e => setDiastolicBp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  อัตราหายใจ (/min)
                </label>
                <input
                  type="number"
                  placeholder="18"
                  value={respRate}
                  onChange={e => setRespRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lab Results Multi-entry */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>ผลการตรวจทางห้องปฏิบัติการ (Lab Results - บันทึกได้หลายรายการ)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  เช่น LDL, Cholesterol, Triglycerides, FBS, HbA1c, Creatinine, eGFR ฯลฯ
                </p>
              </div>
              <button
                type="button"
                onClick={addLabRow}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มผลแล็บ</span>
              </button>
            </div>

            {labs.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                ยังไม่มีการบันทึกผลแล็บ (กดปุ่ม &quot;เพิ่มผลแล็บ&quot; ด้านบนหากมีผลตรวจ)
              </div>
            ) : (
              <div className="space-y-2">
                {labs.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs"
                  >
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">ประเภทการตรวจ</label>
                      <select
                        value={row.testType}
                        onChange={e => updateLabRow(idx, 'testType', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        {LAB_TEST_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">ค่าที่ตรวจได้</label>
                      <input
                        type="text"
                        placeholder="เช่น 124"
                        value={row.resultValue}
                        onChange={e => updateLabRow(idx, 'resultValue', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">หน่วย</label>
                      <input
                        type="text"
                        placeholder="mg/dL"
                        value={row.unit}
                        onChange={e => updateLabRow(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">ช่วงค่าอ้างอิง</label>
                      <input
                        type="text"
                        placeholder="เช่น 70-99"
                        value={row.referenceRange}
                        onChange={e => updateLabRow(idx, 'referenceRange', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">การแปลผล</label>
                      <select
                        value={row.normalAbnormalFlag}
                        onChange={e => updateLabRow(idx, 'normalAbnormalFlag', e.target.value)}
                        className={`w-full px-2 py-1 rounded-lg text-xs font-semibold ${
                          row.normalAbnormalFlag === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : row.normalAbnormalFlag === 'Low'
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <option value="Normal">ปกติ (Normal)</option>
                        <option value="High">สูงกว่าเกณฑ์ (High)</option>
                        <option value="Low">ต่ำกว่าเกณฑ์ (Low)</option>
                        <option value="Abnormal">ผิดปกติ (Abnormal)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => removeLabRow(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                        title="ลบแถวนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: File Uploads */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>แนบภาพถ่ายฉลากยา หรือ เอกสารผลตรวจ (Attachments)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                สามารถแนบรูปภาพฉลากยาเดิม ซองยา หรือเอกสารใบผลการตรวจเพื่อประกอบการประเมิน
              </p>
            </div>

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-white cursor-pointer transition">
              <Upload className="w-6 h-6 text-emerald-600 mb-1" />
              <span className="text-xs font-bold text-slate-700">คลิกเพื่อเลือกไฟล์รูปภาพหรือเอกสาร</span>
              <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 10MB</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded-xl border border-slate-200 text-xs flex flex-col justify-between"
                  >
                    <div className="truncate font-medium text-slate-800">{file.name}</div>
                    <div className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{file.sizeKb} KB (พร้อมบันทึกในระบบ)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 ${
                hasRedFlags
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/30'
              }`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึกลงระบบ...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึก Health Episode</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
