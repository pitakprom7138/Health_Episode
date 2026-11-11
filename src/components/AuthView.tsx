import React, { useState } from 'react';
import {
  User,
  Stethoscope,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { useHealthSystem } from '../context/HealthSystemContext';
import { RegisterParams } from '../types/healthSystem';

interface AuthViewProps {
  onSuccessLogin?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessLogin }) => {
  const { login, register } = useHealthSystem();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regRole, setRegRole] = useState<'Patient' | 'Pharmacist'>('Patient');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  // Patient fields
  const [regCitizenId, setRegCitizenId] = useState('');
  const [regGender, setRegGender] = useState<'ชาย' | 'หญิง' | 'อื่นๆ'>('ชาย');
  const [regDob, setRegDob] = useState('1990-01-01');
  const [regBloodGroup, setRegBloodGroup] = useState<'A' | 'B' | 'AB' | 'O' | 'Unknown'>('O');
  const [regAddress, setRegAddress] = useState('');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regChronicDiseaseText, setRegChronicDiseaseText] = useState('');
  const [regAllergiesText, setRegAllergiesText] = useState('');
  // Pharmacist fields
  const [regLicenseNo, setRegLicenseNo] = useState('');
  const [regAffiliation, setRegAffiliation] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('เภสัชกรรมปฐมภูมิ');

  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPhone.trim()) {
      setLoginError('กรุณากรอกอีเมล (Username) และเบอร์โทรศัพท์ (Password)');
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      const res = login(loginEmail, loginPhone);
      setLoginLoading(false);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        if (onSuccessLogin) onSuccessLogin();
      }
    }, 250);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล, อีเมล (Username) และเบอร์โทรศัพท์ (Password)');
      return;
    }

    setRegLoading(true);

    let params: RegisterParams;
    if (regRole === 'Patient') {
      const chronicList = regChronicDiseaseText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const allergiesList = regAllergiesText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      params = {
        role: 'Patient',
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        citizenIdOrHn: regCitizenId,
        gender: regGender,
        dob: regDob,
        bloodGroup: regBloodGroup,
        address: regAddress,
        emergencyContact: regEmergencyContact,
        emergencyPhone: regEmergencyPhone,
        chronicDiseases: chronicList,
        knownAllergies: allergiesList,
      };
    } else {
      if (!regLicenseNo.trim() || !regAffiliation.trim()) {
        setRegLoading(false);
        setRegError('กรุณาระบุเลขที่ใบประกอบวิชาชีพเภสัชกรรม และสังกัดโรงพยาบาล/ร้านยา');
        return;
      }
      params = {
        role: 'Pharmacist',
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        licenseNo: regLicenseNo,
        hospitalOrStore: regAffiliation,
        specialization: regSpecialization,
      };
    }

    try {
      const res = await register(params);
      setRegLoading(false);
      if (!res.success) {
        setRegError(res.message);
      } else {
        if (onSuccessLogin) onSuccessLogin();
      }
    } catch (err: any) {
      setRegLoading(false);
      setRegError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Hero Branding & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-700/30">
              RX
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Healthcare System
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Personal Pharmacist–Led Digital Primary Care
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ระบบบันทึกประวัติการเจ็บป่วยและการให้คำปรึกษาด้านสุขภาพโดยเภสัชกรประจำตัว
            แยกสิทธิ์การใช้งานอย่างรัดกุมตามมาตรฐานเวชระเบียนและความปลอดภัยของข้อมูลสุขภาพส่วนบุคคล (PDPA)
          </p>

          {/* Key Production Healthcare Features */}
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">บริการคำปรึกษาและบริบาลเภสัชกรรม</span>
                <span className="text-[11px] text-slate-500">
                  ปรึกษาอาการเจ็บป่วย การใช้ยา และรับคำแนะนำโดยตรงจากเภสัชกรประจำตัว
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">เวชระเบียนสุขภาพและการใช้ยาต่อเนื่อง</span>
                <span className="text-[11px] text-slate-500">
                  บันทึกประวัติอาการ ภาพฉลากยา ประวัติการแพ้ยา และผลตรวจทางห้องปฏิบัติการ
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">ความปลอดภัยของข้อมูลสุขภาพส่วนบุคคล</span>
                <span className="text-[11px] text-slate-500">
                  รักษาความลับของข้อมูลตามมาตรฐาน PDPA จำกัดสิทธิ์การเข้าถึงเฉพาะเจ้าของข้อมูล
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>กรณีมีสัญญาณอันตรายหรืออาการวิกฤต กรุณาติดต่อสายด่วนฉุกเฉิน <strong>1669</strong> ทันที</span>
          </div>
        </div>

        {/* Right Col: Login / Register Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setRegError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'REGISTER'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>สมัครสมาชิกใหม่ (Register)</span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">เข้าสู่ระบบตามสิทธิ์</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ใช้อีเมลเป็น Username และเบอร์โทรศัพท์เป็น Password
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    อีเมล (Username) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="เช่น somchai@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ (Password) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="เช่น 081-234-5678 หรือ 0812345678"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <span>กำลังตรวจสอบ...</span>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>


            </div>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'REGISTER' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">สมัครสมาชิกใหม่</h2>
                <p className="text-xs text-slate-500">
                  ระบบจะใช้อีเมลเป็น Username และเบอร์โทรศัพท์เป็น Password ในการเข้าสู่ระบบ
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Role Picker for Registration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เลือกบทบาทที่ต้องการสมัคร:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRegRole('Patient')}
                    className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center gap-2 ${
                      regRole === 'Patient'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>ผู้ป่วย (Patient)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('Pharmacist')}
                    className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center gap-2 ${
                      regRole === 'Pharmacist'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>เภสัชกร (Pharmacist)</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ชื่อ - นามสกุล *
                    </label>
                    <input
                      type="text"
                      placeholder={regRole === 'Patient' ? 'เช่น นายอนุชา ใจดี' : 'เช่น ภก. กิตติพงษ์ สุขใจ'}
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      อีเมล (ใช้เป็น Username) *
                    </label>
                    <input
                      type="email"
                      placeholder="เช่น user@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ (ใช้เป็น Password) *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 0891234567 หรือ 089-123-4567"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      required
                    />
                  </div>

                  {regRole === 'Patient' ? (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เลขบัตรประชาชน หรือ เลข HN
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 1409900123456 หรือ HN-670999"
                        value={regCitizenId}
                        onChange={e => setRegCitizenId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เลขที่ใบประกอบวิชาชีพเภสัชกรรม *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ภ.29845"
                        value={regLicenseNo}
                        onChange={e => setRegLicenseNo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Patient Specific Fields */}
                {regRole === 'Patient' && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">เพศ</label>
                        <select
                          value={regGender}
                          onChange={e => setRegGender(e.target.value as any)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">วันเกิด</label>
                        <input
                          type="date"
                          value={regDob}
                          onChange={e => setRegDob(e.target.value)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">หมู่โลหิต</label>
                        <select
                          value={regBloodGroup}
                          onChange={e => setRegBloodGroup(e.target.value as any)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                          <option value="Unknown">ไม่ทราบ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ประวัติแพ้ยา (ระบุชื่อยาและอาการ ถ้ามี คั่นด้วยจุลภาค)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น Penicillin (ผื่นคัน), Aspirin (แน่นหน้าอก)"
                        value={regAllergiesText}
                        onChange={e => setRegAllergiesText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-rose-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        โรคประจำตัว (คั่นด้วยจุลภาค)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ความดันโลหิตสูง, เบาหวานชนิดที่ 2"
                        value={regChronicDiseaseText}
                        onChange={e => setRegChronicDiseaseText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          ผู้ติดต่อฉุกเฉิน
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น ภรรยา หรือ บิดา"
                          value={regEmergencyContact}
                          onChange={e => setRegEmergencyContact(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          เบอร์โทรฉุกเฉิน
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น 089-876-5432"
                          value={regEmergencyPhone}
                          onChange={e => setRegEmergencyPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Pharmacist Specific Fields */}
                {regRole === 'Pharmacist' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        สังกัดโรงพยาบาล / ร้านยา / ศูนย์สุขภาพ *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น รพ.ศูนย์ขอนแก่น หรือ คลินิกยาชุมชนอบอุ่น"
                        value={regAffiliation}
                        onChange={e => setRegAffiliation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        สาขาความเชี่ยวชาญ
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น เภสัชกรรมปฐมภูมิ, การบริบาลผู้ป่วยโรคเรื้อรัง"
                        value={regSpecialization}
                        onChange={e => setRegSpecialization(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {regLoading ? (
                    <span>กำลังบันทึกข้อมูล...</span>
                  ) : (
                    <>
                      <span>ยืนยันการสมัครสมาชิก</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
