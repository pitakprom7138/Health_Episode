import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Patient,
  PatientMedication,
  HealthEpisode,
  ClinicalAssessment,
  MedicationCatalogItem,
  EpisodeMedication,
  ClinicalAction,
  AssessmentDataSource,
  Followup,
  PatientFeedback,
  Attachment,
  SystemUser,
  Pharmacist,
  LabResult,
  DrugUsageSummary,
  AuditLog,
  RegisterParams,
} from '../types/healthSystem';
import {
  INITIAL_PATIENTS,
  INITIAL_PHARMACISTS,
  INITIAL_USERS,
  INITIAL_MEDICATION_CATALOG,
  INITIAL_PATIENT_MEDICATIONS,
  INITIAL_HEALTH_EPISODES,
  INITIAL_CLINICAL_ASSESSMENTS,
  INITIAL_EPISODE_MEDICATIONS,
  INITIAL_CLINICAL_ACTIONS,
  INITIAL_ASSESSMENT_DATA_SOURCES,
  INITIAL_FOLLOWUPS,
  INITIAL_PATIENT_FEEDBACKS,
  INITIAL_ATTACHMENTS,
  INITIAL_LAB_RESULTS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import { SPREADSHEET_ID, DRIVE_FOLDER_ID } from '../utils/gasCodeGenerator';

interface HealthContextType {
  // 16 Tables Data
  patients: Patient[];
  patientMedications: PatientMedication[];
  healthEpisodes: HealthEpisode[];
  clinicalAssessments: ClinicalAssessment[];
  medicationCatalog: MedicationCatalogItem[];
  episodeMedications: EpisodeMedication[];
  clinicalActions: ClinicalAction[];
  assessmentDataSources: AssessmentDataSource[];
  followups: Followup[];
  patientFeedbacks: PatientFeedback[];
  attachments: Attachment[];
  users: SystemUser[];
  pharmacists: Pharmacist[];
  labResults: LabResult[];
  drugUsageSummary: DrugUsageSummary[];
  auditLogs: AuditLog[];

  // Current Auth State
  currentUser: SystemUser | null;
  currentPatient: Patient | null;
  currentPharmacist: Pharmacist | null;
  isAuthenticated: boolean;
  login: (email: string, phonePassword: string) => { success: boolean; message: string; user?: SystemUser };
  register: (params: RegisterParams) => Promise<{ success: boolean; message: string; user?: SystemUser }>;
  logout: () => void;
  quickLoginAs: (role: 'Patient' | 'Pharmacist' | 'Admin') => void;
  switchUser: (userId: string) => void;
  quickSwitchRole: (role: 'Patient' | 'Pharmacist' | 'Admin') => void;

  // Google Sheets & Drive Config
  spreadsheetId: string;
  driveFolderId: string;
  gasWebAppUrl: string;
  setGasWebAppUrl: (url: string) => void;
  isGasSyncing: boolean;
  syncWithGas: () => Promise<{ success: boolean; message: string }>;
  triggerSetupSheets: () => Promise<{ success: boolean; message: string }>;

  // CRUD Actions
  createEpisode: (
    episodeData: Omit<HealthEpisode, 'Episode_ID' | 'Created_At' | 'Updated_At' | 'Status'>,
    labsData: Array<Omit<LabResult, 'Lab_ID' | 'Episode_ID' | 'Patient_ID'>>,
    attachmentFiles?: Array<{ name: string; type: string; sizeKb: number; dataUrl?: string }>
  ) => Promise<string>;

  createAssessment: (
    assessmentData: Omit<ClinicalAssessment, 'Assessment_ID' | 'Created_At' | 'Updated_At'>,
    medsData: Array<{ medId: string; quantity: number; unit: string; sig: string; durationDays: number }>,
    actionsData: Array<{ actionType: ClinicalAction['Action_Type']; details: string }>,
    sourcesData: Array<{ sourceType: AssessmentDataSource['Source_Type']; citation: string; notes: string }>,
    followupDate?: string,
    followupNotes?: string
  ) => Promise<string>;

  submitFeedback: (feedback: Omit<PatientFeedback, 'Feedback_ID' | 'Submitted_At'>) => Promise<void>;

  addPatientMedication: (med: Omit<PatientMedication, 'ID' | 'Created_At'>) => void;
  updatePatientProfile: (patient: Patient) => void;
  addMedicationCatalogItem: (item: MedicationCatalogItem) => void;
  updateUserStatus: (userId: string, status: SystemUser['Status'], role?: SystemUser['Role']) => void;
  uploadAttachment: (
    recordType: Attachment['Record_Type'],
    recordId: string,
    file: { name: string; type: string; sizeKb: number; dataUrl?: string }
  ) => Attachment;

  resetToDefaults: () => void;
}

const STORAGE_KEY = 'HEALTH_EPISODE_RECORD_SYSTEM_V1';

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from localStorage or Seed Data
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [patientMedications, setPatientMedications] = useState<PatientMedication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_patientMedications`);
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_MEDICATIONS;
  });

  const [healthEpisodes, setHealthEpisodes] = useState<HealthEpisode[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_healthEpisodes`);
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_EPISODES;
  });

  const [clinicalAssessments, setClinicalAssessments] = useState<ClinicalAssessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clinicalAssessments`);
    return saved ? JSON.parse(saved) : INITIAL_CLINICAL_ASSESSMENTS;
  });

  const [medicationCatalog, setMedicationCatalog] = useState<MedicationCatalogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_medicationCatalog`);
    return saved ? JSON.parse(saved) : INITIAL_MEDICATION_CATALOG;
  });

  const [episodeMedications, setEpisodeMedications] = useState<EpisodeMedication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_episodeMedications`);
    return saved ? JSON.parse(saved) : INITIAL_EPISODE_MEDICATIONS;
  });

  const [clinicalActions, setClinicalActions] = useState<ClinicalAction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clinicalActions`);
    return saved ? JSON.parse(saved) : INITIAL_CLINICAL_ACTIONS;
  });

  const [assessmentDataSources, setAssessmentDataSources] = useState<AssessmentDataSource[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assessmentDataSources`);
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENT_DATA_SOURCES;
  });

  const [followups, setFollowups] = useState<Followup[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_followups`);
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
  });

  const [patientFeedbacks, setPatientFeedbacks] = useState<PatientFeedback[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_patientFeedbacks`);
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_FEEDBACKS;
  });

  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attachments`);
    return saved ? JSON.parse(saved) : INITIAL_ATTACHMENTS;
  });

  const [users, setUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [pharmacists, setPharmacists] = useState<Pharmacist[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pharmacists`);
    return saved ? JSON.parse(saved) : INITIAL_PHARMACISTS;
  });

  const [labResults, setLabResults] = useState<LabResult[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_labResults`);
    return saved ? JSON.parse(saved) : INITIAL_LAB_RESULTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Current User (Defaults to Somchai for testing or loaded from localStorage)
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUserId`);
    return saved !== null && saved !== '' ? saved : 'USR001';
  });

  const [gasWebAppUrl, setGasWebAppUrlState] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_gasUrl`) || '';
  });

  const setGasWebAppUrl = (url: string) => {
    const trimmed = url.trim();
    setGasWebAppUrlState(trimmed);
    localStorage.setItem(`${STORAGE_KEY}_gasUrl`, trimmed);
    fetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gasUrl: trimmed }),
    }).catch(() => {});
  };

  const [isGasSyncing, setIsGasSyncing] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patientMedications`, JSON.stringify(patientMedications));
  }, [patientMedications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_healthEpisodes`, JSON.stringify(healthEpisodes));
  }, [healthEpisodes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clinicalAssessments`, JSON.stringify(clinicalAssessments));
  }, [clinicalAssessments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_medicationCatalog`, JSON.stringify(medicationCatalog));
  }, [medicationCatalog]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_episodeMedications`, JSON.stringify(episodeMedications));
  }, [episodeMedications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clinicalActions`, JSON.stringify(clinicalActions));
  }, [clinicalActions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assessmentDataSources`, JSON.stringify(assessmentDataSources));
  }, [assessmentDataSources]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_followups`, JSON.stringify(followups));
  }, [followups]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patientFeedbacks`, JSON.stringify(patientFeedbacks));
  }, [patientFeedbacks]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attachments`, JSON.stringify(attachments));
  }, [attachments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pharmacists`, JSON.stringify(pharmacists));
  }, [pharmacists]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_labResults`, JSON.stringify(labResults));
  }, [labResults]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEY}_currentUserId`, currentUserId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUserId`);
    }
  }, [currentUserId]);

  // Derived: Current User Object (null when logged out)
  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find(u => u.User_ID === currentUserId) || null;
  }, [users, currentUserId]);

  // Derived: Current Linked Patient (if role == Patient)
  const currentPatient = useMemo(() => {
    if (!currentUser || currentUser.Role !== 'Patient') return null;
    return patients.find(p => p.Patient_ID === currentUser.Linked_Patient_ID) || null;
  }, [currentUser, patients]);

  // Derived: Current Linked Pharmacist (if role == Pharmacist)
  const currentPharmacist = useMemo(() => {
    if (!currentUser || currentUser.Role !== 'Pharmacist') return null;
    return pharmacists.find(ph => ph.Pharmacist_ID === currentUser.Linked_Pharmacist_ID) || null;
  }, [currentUser, pharmacists]);

  // 15. Aggregated Table: Drug_Usage_Summary
  // Dynamically computed from Episode_Medications without loss of source data
  const drugUsageSummary = useMemo<DrugUsageSummary[]>(() => {
    const map = new Map<string, { drugName: string; unit: string; totalQty: number; count: number; lastDate: string }>();

    episodeMedications.forEach(em => {
      const existing = map.get(em.Med_ID) || {
        drugName: em.Drug_Name,
        unit: em.Unit || 'หน่วย',
        totalQty: 0,
        count: 0,
        lastDate: em.Created_At,
      };

      existing.totalQty += em.Quantity;
      existing.count += 1;
      if (em.Created_At > existing.lastDate) {
        existing.lastDate = em.Created_At;
      }
      map.set(em.Med_ID, existing);
    });

    const summaryList: DrugUsageSummary[] = [];
    let idx = 1;
    map.forEach((value, medId) => {
      summaryList.push({
        Summary_ID: `DUS${String(idx).padStart(3, '0')}`,
        Med_ID: medId,
        Drug_Name: value.drugName,
        Unit: value.unit,
        Total_Quantity_Recommended: value.totalQty,
        Assessment_Count_Used: value.count,
        Last_Used_Date: value.lastDate,
      });
      idx++;
    });

    return summaryList;
  }, [episodeMedications]);

  // Helper to log audit
  const addAuditLog = (action: AuditLog['Action'], table: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      Log_ID: `LOG${Date.now()}`,
      Timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      User_ID: currentUser ? currentUser.User_ID : 'GUEST',
      User_Email: currentUser ? currentUser.Email : 'guest@system',
      Role: currentUser ? currentUser.Role : 'Patient',
      Action: action,
      Table_Affected: table,
      Record_ID: recordId,
      Details: details,
      IP_Address_Or_Client: 'Web Client / AI Studio Session',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Login with Email as Username and Phone as Password
  const login = (email: string, phonePassword: string): { success: boolean; message: string; user?: SystemUser } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanInputPhone = phonePassword.replace(/\D/g, '');

    const foundUser = users.find(u => u.Email.trim().toLowerCase() === cleanEmail);
    if (!foundUser) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกใหม่' };
    }

    if (foundUser.Status === 'Inactive') {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
    }

    // Determine expected phone password for this user
    let expectedPhone = foundUser.Phone_Password || '';
    if (!expectedPhone && foundUser.Linked_Patient_ID) {
      const pt = patients.find(p => p.Patient_ID === foundUser.Linked_Patient_ID);
      expectedPhone = pt?.Phone || '';
    }
    if (!expectedPhone && foundUser.Linked_Pharmacist_ID) {
      const ph = pharmacists.find(p => p.Pharmacist_ID === foundUser.Linked_Pharmacist_ID);
      expectedPhone = ph?.Phone || '';
    }
    if (!expectedPhone && foundUser.Role === 'Admin') {
      expectedPhone = '080-999-8877';
    }

    const cleanExpectedPhone = expectedPhone.replace(/\D/g, '');
    const isPasswordValid =
      (cleanInputPhone && cleanExpectedPhone && cleanInputPhone === cleanExpectedPhone) ||
      phonePassword.trim() === expectedPhone.trim();

    if (!isPasswordValid) {
      return { success: false, message: 'รหัสผ่าน (เบอร์โทรศัพท์) ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    setCurrentUserId(foundUser.User_ID);
    localStorage.setItem(`${STORAGE_KEY}_currentUserId`, foundUser.User_ID);
    addAuditLog('LOGIN', 'Users', foundUser.User_ID, `เข้าสู่ระบบสำเร็จในบทบาท ${foundUser.Role} (${foundUser.Full_Name})`);
    return { success: true, message: 'เข้าสู่ระบบสำเร็จ', user: foundUser };
  };

  // Register new user (Patient or Pharmacist)
  const register = async (params: RegisterParams): Promise<{ success: boolean; message: string; user?: SystemUser }> => {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = users.find(u => u.Email.trim().toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newUserId = `USR${String(users.length + 1).padStart(3, '0')}`;

    if (params.role === 'Patient') {
      const newPtId = `PT${String(patients.length + 1).padStart(6, '0')}`;
      const newPatient: Patient = {
        Patient_ID: newPtId,
        Full_Name: params.fullName.trim(),
        Citizen_ID_Or_HN: params.citizenIdOrHn?.trim() || `HN-${Date.now().toString().slice(-6)}`,
        DOB: params.dob || '1990-01-01',
        Gender: params.gender || 'อื่นๆ',
        Phone: params.phone.trim(),
        Email: cleanEmail,
        Address: params.address?.trim() || '',
        Emergency_Contact: params.emergencyContact?.trim() || '',
        Emergency_Phone: params.emergencyPhone?.trim() || '',
        Blood_Group: params.bloodGroup || 'Unknown',
        Chronic_Diseases: params.chronicDiseases || [],
        Known_Allergies: params.knownAllergies || [],
        Created_At: now,
        Updated_At: now,
      };

      const newUser: SystemUser = {
        User_ID: newUserId,
        Email: cleanEmail,
        Full_Name: params.fullName.trim(),
        Role: 'Patient',
        Status: 'Active',
        Linked_Patient_ID: newPtId,
        Phone_Password: params.phone.trim(),
        Last_Login: now,
        Created_At: now,
      };

      setPatients(prev => [newPatient, ...prev]);
      setUsers(prev => [newUser, ...prev]);
      setCurrentUserId(newUserId);
      localStorage.setItem(`${STORAGE_KEY}_currentUserId`, newUserId);

      addAuditLog('REGISTER', 'Users', newUserId, `ผู้ป่วยลงทะเบียนบัญชีใหม่: ${params.fullName}`);

      // Save to Google Sheets backend
      fetch('/api/sheets/save-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registerUser',
          role: 'Patient',
          userEmail: cleanEmail,
          data: {
            user: newUser,
            patient: newPatient,
          },
        }),
      }).catch(err => console.warn('Background Sheets user register save:', err.message));

      return { success: true, message: 'สมัครสมาชิกสำเร็จ และเข้าสู่ระบบเรียบร้อย', user: newUser };
    } else {
      // Pharmacist registration
      const newPhId = `PH${String(pharmacists.length + 1).padStart(3, '0')}`;
      const newPharmacist: Pharmacist = {
        Pharmacist_ID: newPhId,
        License_No: params.licenseNo.trim(),
        Full_Name: params.fullName.trim(),
        Hospital_Or_Store_Affiliation: params.hospitalOrStore.trim(),
        Phone: params.phone.trim(),
        Email: cleanEmail,
        Specialization: params.specialization?.trim() || 'เภสัชกรรมปฐมภูมิ',
        Active_Status: true,
        Created_At: now,
      };

      const newUser: SystemUser = {
        User_ID: newUserId,
        Email: cleanEmail,
        Full_Name: params.fullName.trim(),
        Role: 'Pharmacist',
        Status: 'Active',
        Linked_Pharmacist_ID: newPhId,
        Phone_Password: params.phone.trim(),
        Last_Login: now,
        Created_At: now,
      };

      setPharmacists(prev => [newPharmacist, ...prev]);
      setUsers(prev => [newUser, ...prev]);
      setCurrentUserId(newUserId);
      localStorage.setItem(`${STORAGE_KEY}_currentUserId`, newUserId);

      addAuditLog('REGISTER', 'Users', newUserId, `เภสัชกรลงทะเบียนบัญชีใหม่: ${params.fullName} (${params.licenseNo})`);

      // Save to Google Sheets backend
      fetch('/api/sheets/save-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registerUser',
          role: 'Pharmacist',
          userEmail: cleanEmail,
          data: {
            user: newUser,
            pharmacist: newPharmacist,
          },
        }),
      }).catch(err => console.warn('Background Sheets pharmacist register save:', err.message));

      return { success: true, message: 'สมัครสมาชิกเภสัชกรสำเร็จ และเข้าสู่ระบบเรียบร้อย', user: newUser };
    }
  };

  // Logout
  const logout = () => {
    if (currentUser) {
      addAuditLog('LOGOUT', 'Users', currentUser.User_ID, `ออกจากระบบ (${currentUser.Full_Name})`);
    }
    setCurrentUserId(null);
    localStorage.removeItem(`${STORAGE_KEY}_currentUserId`);
  };

  // Quick Login As (for testing)
  const quickLoginAs = (role: 'Patient' | 'Pharmacist' | 'Admin') => {
    const target = users.find(u => u.Role === role && u.Status === 'Active');
    if (target) {
      setCurrentUserId(target.User_ID);
      localStorage.setItem(`${STORAGE_KEY}_currentUserId`, target.User_ID);
      addAuditLog('LOGIN', 'Users', target.User_ID, `เข้าสู่ระบบด่วนในบทบาท ${role} (${target.Full_Name})`);
    }
  };

  // Switch User
  const switchUser = (userId: string) => {
    const target = users.find(u => u.User_ID === userId);
    if (target) {
      setCurrentUserId(userId);
      addAuditLog('LOGIN', 'Users', userId, `เปลี่ยนผู้ใช้งานเป็น ${target.Full_Name} (${target.Role})`);
    }
  };

  // Quick Switch Role
  const quickSwitchRole = (role: 'Patient' | 'Pharmacist' | 'Admin') => {
    quickLoginAs(role);
  };

  // Upload Attachment with automatic Google Drive background upload
  const uploadAttachment = (
    recordType: Attachment['Record_Type'],
    recordId: string,
    file: { name: string; type: string; sizeKb: number; dataUrl?: string }
  ): Attachment => {
    const newAttachmentId = `ATT${Date.now()}`;
    const newAttachment: Attachment = {
      Attachment_ID: newAttachmentId,
      Record_Type: recordType,
      Record_ID: recordId,
      File_Name: file.name,
      File_Type: file.type,
      File_Size_KB: file.sizeKb,
      Drive_File_ID: `FILE_${Date.now()}`,
      Drive_View_URL: file.dataUrl || '',
      Preview_Data_URL: file.dataUrl,
      Uploaded_By: currentUser?.Email || 'system@patient',
      Uploaded_At: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setAttachments(prev => [newAttachment, ...prev]);
    addAuditLog('UPLOAD_FILE', 'Attachments', newAttachmentId, `บันทึกไฟล์ ${file.name} เข้าสู่คลังเอกสารสุขภาพของระบบ`);

    // Asynchronously send to Google Drive backend proxy
    if (file.dataUrl && file.dataUrl.includes('base64,')) {
      const base64Data = file.dataUrl.split('base64,')[1];
      fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          base64: base64Data,
          recordType,
          recordId,
          userEmail: currentUser?.Email || 'system',
        }),
      }).catch(err => console.warn('Background Drive upload task queued:', err.message));
    }

    return newAttachment;
  };

  // Create Health Episode with automatic Google Sheet synchronization
  const createEpisode = async (
    episodeData: Omit<HealthEpisode, 'Episode_ID' | 'Created_At' | 'Updated_At' | 'Status'>,
    labsData: Array<Omit<LabResult, 'Lab_ID' | 'Episode_ID' | 'Patient_ID'>>,
    attachmentFiles?: Array<{ name: string; type: string; sizeKb: number; dataUrl?: string }>
  ): Promise<string> => {
    const newEpId = `EP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(healthEpisodes.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newEpisode: HealthEpisode = {
      ...episodeData,
      Episode_ID: newEpId,
      Status: 'Pending_Assessment',
      Created_At: now,
      Updated_At: now,
    };

    // Save Labs
    const newLabs: LabResult[] = labsData.map((lab, index) => ({
      ...lab,
      Lab_ID: `LAB${Date.now()}_${index}`,
      Episode_ID: newEpId,
      Patient_ID: episodeData.Patient_ID,
    }));

    // Save attachments
    if (attachmentFiles && attachmentFiles.length > 0) {
      attachmentFiles.forEach(file => {
        uploadAttachment('Health_Episode', newEpId, file);
      });
    }

    setHealthEpisodes(prev => [newEpisode, ...prev]);
    if (newLabs.length > 0) {
      setLabResults(prev => [...newLabs, ...prev]);
    }

    addAuditLog(
      'CREATE_EPISODE',
      'Health_Episodes',
      newEpId,
      `สร้างเหตุการณ์เจ็บป่วยใหม่: ${episodeData.Chief_Complaint} (ฉุกเฉิน: ${episodeData.Has_Emergency_Flags ? 'ใช่' : 'ไม่ใช่'})`
    );

    // Asynchronously send to Google Sheets backend
    fetch('/api/sheets/save-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createEpisode',
        role: currentUser?.Role || 'Patient',
        userEmail: currentUser?.Email || 'patient@system',
        data: {
          episode: newEpisode,
          labs: newLabs,
        },
      }),
    }).catch(err => console.warn('Background Sheets save task queued:', err.message));

    return newEpId;
  };

  // Create Clinical Assessment
  const createAssessment = async (
    assessmentData: Omit<ClinicalAssessment, 'Assessment_ID' | 'Created_At' | 'Updated_At'>,
    medsData: Array<{ medId: string; quantity: number; unit: string; sig: string; durationDays: number }>,
    actionsData: Array<{ actionType: ClinicalAction['Action_Type']; details: string }>,
    sourcesData: Array<{ sourceType: AssessmentDataSource['Source_Type']; citation: string; notes: string }>,
    followupDate?: string,
    followupNotes?: string
  ): Promise<string> => {
    const newAsId = `AS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(clinicalAssessments.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newAssessment: ClinicalAssessment = {
      ...assessmentData,
      Assessment_ID: newAsId,
      Created_At: now,
      Updated_At: now,
    };

    // Episode Medications
    const newMeds: EpisodeMedication[] = medsData.map((item, idx) => {
      const catalogItem = medicationCatalog.find(m => m.Med_ID === item.medId);
      const name = catalogItem ? `${catalogItem.Generic_Name} (${catalogItem.Strength})` : 'ยาแนะนำ';
      return {
        ID: `EM${Date.now()}_${idx}`,
        Assessment_ID: newAsId,
        Episode_ID: assessmentData.Episode_ID,
        Med_ID: item.medId,
        Drug_Name: name,
        Quantity: item.quantity,
        Unit: item.unit,
        Sig_Instructions: item.sig,
        Duration_Days: item.durationDays,
        Created_At: now,
      };
    });

    // Clinical Actions
    const newActions: ClinicalAction[] = actionsData.map((act, idx) => ({
      Action_ID: `ACT${Date.now()}_${idx}`,
      Assessment_ID: newAsId,
      Action_Type: act.actionType,
      Details: act.details,
      Action_DateTime: now,
      Performed_By: currentPharmacist ? currentPharmacist.Full_Name : (currentUser ? currentUser.Full_Name : 'เภสัชกรผู้ประเมิน'),
    }));

    // Data Sources
    const newSources: AssessmentDataSource[] = sourcesData.map((src, idx) => ({
      Source_ID: `SRC${Date.now()}_${idx}`,
      Assessment_ID: newAsId,
      Source_Type: src.sourceType,
      Citation_Or_Link: src.citation,
      Notes: src.notes,
    }));

    // Followup
    let newFollowup: Followup | null = null;
    if (assessmentData.Followup_Needed === 'Yes' && followupDate) {
      const episode = healthEpisodes.find(ep => ep.Episode_ID === assessmentData.Episode_ID);
      newFollowup = {
        Followup_ID: `FLW${Date.now()}`,
        Assessment_ID: newAsId,
        Patient_ID: episode ? episode.Patient_ID : '',
        Scheduled_Date: followupDate,
        Status: 'Scheduled',
        Pharmacist_Notes: followupNotes || 'ติดตามอาการหลังเริ่มยา',
      };
    }

    // Update state
    setClinicalAssessments(prev => [newAssessment, ...prev]);
    if (newMeds.length > 0) setEpisodeMedications(prev => [...newMeds, ...prev]);
    if (newActions.length > 0) setClinicalActions(prev => [...newActions, ...prev]);
    if (newSources.length > 0) setAssessmentDataSources(prev => [...newSources, ...prev]);
    if (newFollowup) setFollowups(prev => [newFollowup!, ...prev]);

    // Update Health Episode Status
    setHealthEpisodes(prev =>
      prev.map(ep =>
        ep.Episode_ID === assessmentData.Episode_ID
          ? { ...ep, Status: newFollowup ? 'Follow_Up_Scheduled' : 'Assessed', Updated_At: now }
          : ep
      )
    );

    addAuditLog(
      'CREATE_ASSESSMENT',
      'Clinical_Assessments',
      newAsId,
      `บันทึกผลการประเมินทางคลินิก: ${assessmentData.Problem_Type} (จ่ายยา ${newMeds.length} รายการ)`
    );

    // Asynchronously send assessment data to Google Sheets backend
    fetch('/api/sheets/save-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createAssessment',
        role: currentUser?.Role || 'Pharmacist',
        userEmail: currentUser?.Email || 'pharmacist@system',
        data: {
          assessment: newAssessment,
          meds: newMeds,
          actions: newActions,
          sources: newSources,
          followup: newFollowup,
        },
      }),
    }).catch(err => console.warn('Background Sheets assessment save task queued:', err.message));

    return newAsId;
  };

  // Submit Feedback
  const submitFeedback = async (feedbackData: Omit<PatientFeedback, 'Feedback_ID' | 'Submitted_At'>) => {
    const newFeedback: PatientFeedback = {
      ...feedbackData,
      Feedback_ID: `FB${Date.now()}`,
      Submitted_At: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPatientFeedbacks(prev => [newFeedback, ...prev]);
    addAuditLog(
      'SUBMIT_FEEDBACK',
      'Patient_Feedback',
      newFeedback.Feedback_ID,
      `ผู้ป่วยประเมินผลลัพธ์: ${feedbackData.Outcome_Status} (${feedbackData.Satisfaction_Score} ดาว)`
    );

    // Asynchronously send feedback data to Google Sheets backend
    fetch('/api/sheets/save-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submitFeedback',
        role: currentUser?.Role || 'Patient',
        userEmail: currentUser?.Email || 'patient@system',
        data: {
          feedback: newFeedback,
        },
      }),
    }).catch(err => console.warn('Background Sheets feedback save task queued:', err.message));
  };

  // Add Patient Medication
  const addPatientMedication = (medData: Omit<PatientMedication, 'ID' | 'Created_At'>) => {
    const newMed: PatientMedication = {
      ...medData,
      ID: `PM${Date.now()}`,
      Created_At: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setPatientMedications(prev => [newMed, ...prev]);
    addAuditLog('UPDATE_EPISODE', 'Patient_Medications', newMed.ID, `เพิ่มยาประจำตัว: ${medData.Drug_Name}`);
  };

  // Update Patient Profile
  const updatePatientProfile = (updated: Patient) => {
    setPatients(prev => prev.map(p => (p.Patient_ID === updated.Patient_ID ? updated : p)));
    addAuditLog('UPDATE_USER', 'Patients', updated.Patient_ID, `ปรับปรุงข้อมูลส่วนบุคคลและประวัติแพ้ยา`);
  };

  // Add Catalog Item
  const addMedicationCatalogItem = (item: MedicationCatalogItem) => {
    setMedicationCatalog(prev => [item, ...prev]);
    addAuditLog('CREATE_EPISODE', 'Medication_Catalog', item.Med_ID, `เพิ่มยาใหม่ใน Catalog: ${item.Generic_Name}`);
  };

  // Update User Status
  const updateUserStatus = (userId: string, status: SystemUser['Status'], role?: SystemUser['Role']) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.User_ID === userId) {
          return {
            ...u,
            Status: status,
            Role: role || u.Role,
          };
        }
        return u;
      })
    );
    addAuditLog('UPDATE_USER', 'Users', userId, `เปลี่ยนสถานะบัญชีเป็น ${status} / บทบาท: ${role || 'เดิม'}`);
  };

  // Reset to Defaults
  const resetToDefaults = () => {
    setPatients(INITIAL_PATIENTS);
    setPatientMedications(INITIAL_PATIENT_MEDICATIONS);
    setHealthEpisodes(INITIAL_HEALTH_EPISODES);
    setClinicalAssessments(INITIAL_CLINICAL_ASSESSMENTS);
    setMedicationCatalog(INITIAL_MEDICATION_CATALOG);
    setEpisodeMedications(INITIAL_EPISODE_MEDICATIONS);
    setClinicalActions(INITIAL_CLINICAL_ACTIONS);
    setAssessmentDataSources(INITIAL_ASSESSMENT_DATA_SOURCES);
    setFollowups(INITIAL_FOLLOWUPS);
    setPatientFeedbacks(INITIAL_PATIENT_FEEDBACKS);
    setAttachments(INITIAL_ATTACHMENTS);
    setUsers(INITIAL_USERS);
    setPharmacists(INITIAL_PHARMACISTS);
    setLabResults(INITIAL_LAB_RESULTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId('USR001');
    localStorage.clear();
  };

  // Live Sync with Google Apps Script Web App via server proxy (CORS-free)
  const syncWithGas = async (): Promise<{ success: boolean; message: string }> => {
    if (!gasWebAppUrl || !gasWebAppUrl.trim()) {
      return {
        success: false,
        message: 'ยังไม่ได้ระบุ Web App URL กรุณากรอก Web App URL (ลงท้ายด้วย /exec) หรือเปิด Google Sheet แล้วกด Run ฟังก์ชัน setupSheetsAndDrive ใน Apps Script โดยตรง',
      };
    }

    const trimmedUrl = gasWebAppUrl.trim();
    if (trimmedUrl.includes('docs.google.com/spreadsheets')) {
      return {
        success: false,
        message: 'URL ที่ระบุคือลิงก์ Google Sheet ไม่ใช่ Web App URL กรุณาไปที่ Extensions > Apps Script > Deploy > New deployment > Web app แล้วนำลิงก์ที่ลงท้ายด้วย /exec มาใช้งาน',
      };
    }

    setIsGasSyncing(true);
    try {
      const proxyRes = await fetch('/api/sheets/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: `${trimmedUrl}${trimmedUrl.includes('?') ? '&' : '?'}action=getAllData&spreadsheetId=${SPREADSHEET_ID}`,
          method: 'GET',
        }),
      });

      const json = await proxyRes.json();
      if (json.status === 'success' && json.data) {
        // Sync all 16 relational tables if available in the spreadsheet
        if (json.data.Patients && json.data.Patients.length > 0) setPatients(json.data.Patients);
        if (json.data.Users && json.data.Users.length > 0) setUsers(json.data.Users);
        if (json.data.Pharmacists && json.data.Pharmacists.length > 0) setPharmacists(json.data.Pharmacists);
        if (json.data.Medication_Catalog && json.data.Medication_Catalog.length > 0) setMedicationCatalog(json.data.Medication_Catalog);
        if (json.data.Patient_Medications && json.data.Patient_Medications.length > 0) setPatientMedications(json.data.Patient_Medications);
        if (json.data.Health_Episodes && json.data.Health_Episodes.length > 0) setHealthEpisodes(json.data.Health_Episodes);
        if (json.data.Lab_Results && json.data.Lab_Results.length > 0) setLabResults(json.data.Lab_Results);
        if (json.data.Clinical_Assessments && json.data.Clinical_Assessments.length > 0) setClinicalAssessments(json.data.Clinical_Assessments);
        if (json.data.Episode_Medications && json.data.Episode_Medications.length > 0) setEpisodeMedications(json.data.Episode_Medications);
        if (json.data.Clinical_Actions && json.data.Clinical_Actions.length > 0) setClinicalActions(json.data.Clinical_Actions);
        if (json.data.Assessment_Data_Sources && json.data.Assessment_Data_Sources.length > 0) setAssessmentDataSources(json.data.Assessment_Data_Sources);
        if (json.data.Followups && json.data.Followups.length > 0) setFollowups(json.data.Followups);
        if (json.data.Patient_Feedback && json.data.Patient_Feedback.length > 0) setPatientFeedbacks(json.data.Patient_Feedback);
        if (json.data.Attachments && json.data.Attachments.length > 0) setAttachments(json.data.Attachments);
        if (json.data.Audit_Log && json.data.Audit_Log.length > 0) setAuditLogs(json.data.Audit_Log);

        addAuditLog('EXPORT_SHEETS', 'Google_Sheets', SPREADSHEET_ID, 'ซิงค์ข้อมูลสำเร็จกับ Google Sheets ทั้ง 16 ตาราง');
        setIsGasSyncing(false);
        return { success: true, message: 'ซิงค์ข้อมูลกับ Google Sheet 16 ตารางสำเร็จสมบูรณ์!' };
      } else {
        setIsGasSyncing(false);
        return {
          success: false,
          message: json.message || 'ไม่สามารถรับข้อมูลจาก Google Apps Script ได้ กรุณาตรวจสอบการตั้งค่า Deploy (เลือก Anyone)',
        };
      }
    } catch (err: any) {
      setIsGasSyncing(false);
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการเชื่อมต่อ (${err.message}) กรุณาตรวจสอบว่าเลือก Deploy เป็น Web app และเลือกสิทธิ์ Anyone`,
      };
    }
  };

  // Trigger Google Sheet 16-Table Creation and Drive Setup
  const triggerSetupSheets = async (): Promise<{ success: boolean; message: string }> => {
    setIsGasSyncing(true);
    addAuditLog('EXPORT_SHEETS', 'Google_Sheets', SPREADSHEET_ID, 'ส่งคำสั่งสร้างและจัดรูปแบบโครงสร้าง 16 ตารางใน Google Sheet');

    const trimmedUrl = gasWebAppUrl.trim();

    // 1. If Web App URL is configured, call via server proxy
    if (trimmedUrl && !trimmedUrl.includes('docs.google.com/spreadsheets')) {
      try {
        const proxyRes = await fetch('/api/sheets/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: trimmedUrl,
            method: 'POST',
            payload: { action: 'setupSheets', spreadsheetId: SPREADSHEET_ID },
          }),
        });
        const json = await proxyRes.json();
        if (json.status === 'success') {
          setIsGasSyncing(false);
          return {
            success: true,
            message: json.message || 'สร้างและเชื่อมโยงชีททั้ง 16 ตารางใน Google Sheet สำเร็จเรียบร้อย!',
          };
        } else if (json.message) {
          setIsGasSyncing(false);
          return {
            success: false,
            message: json.message,
          };
        }
      } catch (err: any) {
        console.warn('Proxy setupSheets error:', err.message);
      }
    }

    // 2. Also record in server proxy
    try {
      const serverRes = await fetch('/api/sheets/save-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setupSheets',
          role: currentUser?.Role || 'Admin',
          userEmail: currentUser?.Email || 'admin@system',
          data: { spreadsheetId: SPREADSHEET_ID },
        }),
      });
      const serverJson = await serverRes.json();
      setIsGasSyncing(false);

      if (!trimmedUrl) {
        return {
          success: true,
          message: 'เตรียมข้อมูลระบบเรียบร้อย! เพื่อให้ชีท 16 ตารางปรากฏใน Google Sheet ทันที: กรุณาเปิด Apps Script แล้วกดปุ่ม "Run" บนฟังก์ชัน setupSheetsAndDrive ได้โดยตรง',
        };
      }

      return {
        success: true,
        message: serverJson.message || 'บันทึกคำสั่งเตรียมโครงสร้าง 16 ตารางในระบบเรียบร้อยแล้ว',
      };
    } catch (err: any) {
      setIsGasSyncing(false);
      return {
        success: false,
        message: `ไม่สามารถส่งคำสั่งสร้างชีทได้: ${err.message}`,
      };
    }
  };

  return (
    <HealthContext.Provider
      value={{
        patients,
        patientMedications,
        healthEpisodes,
        clinicalAssessments,
        medicationCatalog,
        episodeMedications,
        clinicalActions,
        assessmentDataSources,
        followups,
        patientFeedbacks,
        attachments,
        users,
        pharmacists,
        labResults,
        drugUsageSummary,
        auditLogs,

        currentUser,
        currentPatient,
        currentPharmacist,
        isAuthenticated: Boolean(currentUser),
        login,
        register,
        logout,
        quickLoginAs,
        switchUser,
        quickSwitchRole,

        spreadsheetId: SPREADSHEET_ID,
        driveFolderId: DRIVE_FOLDER_ID,
        gasWebAppUrl,
        setGasWebAppUrl,
        isGasSyncing,
        syncWithGas,
        triggerSetupSheets,

        createEpisode,
        createAssessment,
        submitFeedback,
        addPatientMedication,
        updatePatientProfile,
        addMedicationCatalogItem,
        updateUserStatus,
        uploadAttachment,
        resetToDefaults,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealthSystem = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealthSystem must be used within a HealthProvider');
  }
  return context;
};
