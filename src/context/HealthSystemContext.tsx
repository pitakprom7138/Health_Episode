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
  currentUser: SystemUser;
  currentPatient: Patient | null;
  currentPharmacist: Pharmacist | null;
  switchUser: (userId: string) => void;
  quickSwitchRole: (role: 'Patient' | 'Pharmacist' | 'Admin') => void;

  // Google Sheets & Drive Config
  spreadsheetId: string;
  driveFolderId: string;
  gasWebAppUrl: string;
  setGasWebAppUrl: (url: string) => void;
  isGasSyncing: boolean;
  syncWithGas: () => Promise<{ success: boolean; message: string }>;

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

  // Current User (Defaults to Patient Somchai for friendly initial view)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUserId`);
    return saved || 'USR001';
  });

  const [gasWebAppUrl, setGasWebAppUrl] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_gasUrl`) || '';
  });

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
    localStorage.setItem(`${STORAGE_KEY}_currentUserId`, currentUserId);
  }, [currentUserId]);
  // Attempt silent background synchronization from Google Sheet on mount
  useEffect(() => {
    fetch('/api/sheets/fetch-all')
      .then(res => res.json())
      .then(result => {
        if (result && result.success && result.data) {
          if (result.data.Patients && result.data.Patients.length > 0) setPatients(result.data.Patients);
          if (result.data.Health_Episodes && result.data.Health_Episodes.length > 0) setHealthEpisodes(result.data.Health_Episodes);
          if (result.data.Clinical_Assessments && result.data.Clinical_Assessments.length > 0) setClinicalAssessments(result.data.Clinical_Assessments);
          if (result.data.Medication_Catalog && result.data.Medication_Catalog.length > 0) setMedicationCatalog(result.data.Medication_Catalog);
        }
      })
      .catch(() => {
        // Fallback to local storage
      });
  }, []);

  // Derived: Current User Object
  const currentUser = useMemo(() => {
    return users.find(u => u.User_ID === currentUserId) || users[0];
  }, [users, currentUserId]);

  // Derived: Current Linked Patient (if role == Patient)
  const currentPatient = useMemo(() => {
    if (currentUser.Role !== 'Patient') return null;
    return patients.find(p => p.Patient_ID === currentUser.Linked_Patient_ID) || patients[0];
  }, [currentUser, patients]);

  // Derived: Current Linked Pharmacist (if role == Pharmacist)
  const currentPharmacist = useMemo(() => {
    if (currentUser.Role !== 'Pharmacist') return null;
    return pharmacists.find(ph => ph.Pharmacist_ID === currentUser.Linked_Pharmacist_ID) || pharmacists[0];
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
      User_ID: currentUser.User_ID,
      User_Email: currentUser.Email,
      Role: currentUser.Role,
      Action: action,
      Table_Affected: table,
      Record_ID: recordId,
      Details: details,
      IP_Address_Or_Client: 'Web Client / AI Studio Session',
    };
    setAuditLogs(prev => [newLog, ...prev]);
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
    const target = users.find(u => u.Role === role);
    if (target) {
      setCurrentUserId(target.User_ID);
      addAuditLog('LOGIN', 'Users', target.User_ID, `สลับสิทธิ์การใช้งานเป็น ${role} (${target.Full_Name})`);
    }
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
      Uploaded_By: currentUser.Email,
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
          userEmail: currentUser.Email,
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
        role: currentUser.Role,
        userEmail: currentUser.Email,
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
      Performed_By: currentPharmacist ? currentPharmacist.Full_Name : currentUser.Full_Name,
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
        role: currentUser.Role,
        userEmail: currentUser.Email,
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
        role: currentUser.Role,
        userEmail: currentUser.Email,
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

  // Live Sync with Google Apps Script Web App
  const syncWithGas = async (): Promise<{ success: boolean; message: string }> => {
    if (!gasWebAppUrl) {
      return { success: false, message: 'กรุณากรอก URL ของ Google Apps Script Web App ในหน้าตั้งค่าก่อนซิงค์' };
    }

    setIsGasSyncing(true);
    try {
      const res = await fetch(`${gasWebAppUrl}?action=getAllData`);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        // Sync tables if received
        if (json.data.Patients && json.data.Patients.length > 0) setPatients(json.data.Patients);
        if (json.data.Health_Episodes && json.data.Health_Episodes.length > 0) setHealthEpisodes(json.data.Health_Episodes);
        if (json.data.Clinical_Assessments && json.data.Clinical_Assessments.length > 0) setClinicalAssessments(json.data.Clinical_Assessments);
        if (json.data.Medication_Catalog && json.data.Medication_Catalog.length > 0) setMedicationCatalog(json.data.Medication_Catalog);
        
        addAuditLog('EXPORT_SHEETS', 'Google_Sheets', SPREADSHEET_ID, 'ซิงค์ข้อมูลสำเร็จกับ Google Sheets');
        setIsGasSyncing(false);
        return { success: true, message: 'ซิงค์ข้อมูลกับ Google Sheet 16 ตารางสำเร็จเรียบร้อย!' };
      } else {
        setIsGasSyncing(false);
        return { success: false, message: json.message || 'ไม่สามารถรับข้อมูลจาก Google Apps Script ได้' };
      }
    } catch (err: any) {
      setIsGasSyncing(false);
      return { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}` };
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
        switchUser,
        quickSwitchRole,

        spreadsheetId: SPREADSHEET_ID,
        driveFolderId: DRIVE_FOLDER_ID,
        gasWebAppUrl,
        setGasWebAppUrl,
        isGasSyncing,
        syncWithGas,

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
