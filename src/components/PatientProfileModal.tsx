import React, { useState } from 'react';
import { X, User, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { Patient } from '../types/healthSystem';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentPatient, updatePatientProfile } = useHealthSystem();

  const [fullName, setFullName] = useState(currentPatient?.Full_Name || '');
  const [hn, setHn] = useState(currentPatient?.Citizen_ID_Or_HN || '');
  const [dob, setDob] = useState(currentPatient?.DOB || '');
  const [gender, setGender] = useState(currentPatient?.Gender || 'ชาย');
  const [phone, setPhone] = useState(currentPatient?.Phone || '');
  const [email, setEmail] = useState(currentPatient?.Email || '');
  const [address, setAddress] = useState(currentPatient?.Address || '');
  const [emergencyContact, setEmergencyContact] = useState(currentPatient?.Emergency_Contact || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentPatient?.Emergency_Phone || '');
  const [bloodGroup, setBloodGroup] = useState(currentPatient?.Blood_Group || 'O');
  const [allergies, setAllergies] = useState(currentPatient?.Known_Allergies.join(', ') || '');
  const [chronic, setChronic] = useState(currentPatient?.Chronic_Diseases.join(', ') || '');

  if (!isOpen || !currentPatient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Patient = {
      ...currentPatient,
      Full_Name: fullName,
      Citizen_ID_Or_HN: hn,
      DOB: dob,
      Gender: gender as any,
      Phone: phone,
      Email: email,
      Address: address,
      Emergency_Contact: emergencyContact,
      Emergency_Phone: emergencyPhone,
      Blood_Group: bloodGroup as any,
      Known_Allergies: allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      Chronic_Diseases: chronic ? chronic.split(',').map(s => s.trim()).filter(Boolean) : [],
      Updated_At: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    updatePatientProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base">ข้อมูลส่วนบุคคลและเวชระเบียนผู้ป่วย</h3>
              <p className="text-[11px] text-emerald-200">Patient ID: {currentPatient.Patient_ID}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ชื่อ - สกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เลขประจำตัว (HN)</label>
              <input
                type="text"
                value={hn}
                onChange={e => setHn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">วันเกิด</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เพศ</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">หมู่โลหิต</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value as any)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ประวัติแพ้ยา (ระบุชื่อยาและอาการ คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              placeholder="เช่น Penicillin (ผื่นคัน ปากบวม), Aspirin"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              className="w-full px-3 py-2 bg-rose-50 border border-rose-300 text-rose-900 font-bold rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              โรคประจำตัว (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              placeholder="เช่น ความดันโลหิตสูง, เบาหวาน"
              value={chronic}
              onChange={e => setChronic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ผู้ติดต่อฉุกเฉิน</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรฉุกเฉิน</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
