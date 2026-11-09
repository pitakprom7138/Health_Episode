import React, { useState } from 'react';
import { X, Star, MessageSquareHeart, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { ClinicalAssessment, PatientFeedback } from '../types/healthSystem';

interface PatientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: ClinicalAssessment;
  onSuccess: () => void;
}

export const PatientFeedbackModal: React.FC<PatientFeedbackModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSuccess,
}) => {
  const { currentPatient, currentUser, submitFeedback } = useHealthSystem();

  const [outcomeStatus, setOutcomeStatus] = useState<PatientFeedback['Outcome_Status']>(
    'อาการดีขึ้น ชัดเจน'
  );
  const [satisfactionScore, setSatisfactionScore] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [adverseReaction, setAdverseReaction] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitFeedback({
        Assessment_ID: assessment.Assessment_ID,
        Patient_ID: currentPatient ? currentPatient.Patient_ID : 'PT000001',
        Outcome_Status: outcomeStatus,
        Satisfaction_Score: satisfactionScore,
        Adverse_Reactions_Reported: adverseReaction,
        Comments: comments,
      });
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      alert('เกิดข้อผิดพลาดในการส่งแบบประเมิน: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquareHeart className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base">ประเมินผลหลังได้รับคำปรึกษา</h3>
              <p className="text-[11px] text-emerald-100">
                เคสประเมิน: {assessment.Assessment_ID}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Outcome Status */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              1. ผลลัพธ์ของอาการหลังปฏิบัติตามคำแนะนำและใช้ยา:
            </label>
            <div className="space-y-2">
              {[
                'อาการดีขึ้น ชัดเจน',
                'อาการทรงตัว',
                'อาการไม่ดีขึ้น / แย่ลง',
              ].map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    outcomeStatus === opt
                      ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="outcomeStatus"
                    value={opt}
                    checked={outcomeStatus === opt}
                    onChange={() => setOutcomeStatus(opt as any)}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Satisfaction Star Rating */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              2. ระดับความพึงพอใจต่อคำปรึกษาและการให้บริการของเภสัชกร (1 - 5 ดาว):
            </label>
            <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSatisfactionScore(star as any)}
                  className="p-1.5 transition transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= satisfactionScore
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                  <span className="block text-[10px] text-center font-bold text-slate-600 mt-0.5">
                    {star}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ADR Adverse Drug Reaction */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              3. ท่านมีอาการไม่พึงประสงค์หรืออาการข้างเคียงหลังใช้ยาหรือไม่ (ถ้ามี):
            </label>
            <input
              type="text"
              placeholder="เช่น คลื่นไส้ ง่วงนอน มีผื่นคัน ปวดศีรษะ หรือระบุว่า ไม่มี"
              value={adverseReaction}
              onChange={e => setAdverseReaction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              4. ข้อเสนอแนะและความคิดเห็นเพิ่มเติม:
            </label>
            <textarea
              rows={3}
              placeholder="ความประทับใจ หรือข้อเสนอแนะเพื่อการพัฒนาบริการ..."
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              ปิด
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ส่งแบบประเมินผลลัพธ์</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
