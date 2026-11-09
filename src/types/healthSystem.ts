/**
 * Health Episode Record System
 * Data Models & Types for 16 Google Sheets Tables
 * Google Sheet ID: 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 * Google Drive Folder: 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 */

// 1. Patients Table
export interface Patient {
  Patient_ID: string; // PK: e.g. PT000001
  Full_Name: string;
  Citizen_ID_Or_HN: string;
  DOB: string; // YYYY-MM-DD
  Gender: 'ชาย' | 'หญิง' | 'อื่นๆ';
  Phone: string;
  Email: string;
  Address: string;
  Emergency_Contact: string;
  Emergency_Phone: string;
  Blood_Group: 'A' | 'B' | 'AB' | 'O' | 'Unknown';
  Chronic_Diseases: string[]; // e.g. ["เบาหวาน", "ความดันโลหิตสูง"]
  Known_Allergies: string[]; // e.g. ["Penicillin", "Sulfa"]
  Created_At: string;
  Updated_At: string;
}

// 2. Patient_Medications Table
export interface PatientMedication {
  ID: string; // PK
  Patient_ID: string; // FK -> Patients.Patient_ID
  Drug_Name: string;
  Category: 'ยาแผนปัจจุบัน' | 'ยาสมุนไพร' | 'ผลิตภัณฑ์เสริมอาหาร';
  Dose_Instructions: string;
  Status: 'Active' | 'Discontinued';
  Prescriber_Source: string; // e.g. "รพ.ประจำอำเภอ", "คลินิก", "ซื้อเอง"
  Photo_Attachment_ID?: string; // FK -> Attachments.Attachment_ID
  Created_At: string;
}

// 3. Health_Episodes Table
export interface HealthEpisode {
  Episode_ID: string; // PK: e.g. EP20261108001
  Patient_ID: string; // FK -> Patients.Patient_ID
  Onset_DateTime: string;
  Chief_Complaint: string; // อาการสำคัญ
  Symptoms_Description: string; // รายละเอียดอาการ
  Duration_Days: number; // ระยะเวลาที่มีอาการ (วัน)
  Emergency_Red_Flags: string[]; // สัญญาณอันตราย/อาการฉุกเฉิน
  Has_Emergency_Flags: boolean;
  // Vital Signs
  Temperature_C?: number; // อุณหภูมิ (°C)
  Pulse_BPM?: number; // ชีพจร (ครั้ง/นาที)
  Systolic_BP?: number; // ความดันตัวบน (mmHg)
  Diastolic_BP?: number; // ความดันตัวล่าง (mmHg)
  Resp_Rate?: number; // อัตราการหายใจ (ครั้ง/นาที)
  Status: 'Pending_Assessment' | 'Assessed' | 'Follow_Up_Scheduled' | 'Closed';
  Created_At: string;
  Updated_At: string;
}

// 4. Clinical_Assessments Table
export interface ClinicalAssessment {
  Assessment_ID: string; // PK: e.g. AS20261108001
  Episode_ID: string; // FK -> Health_Episodes.Episode_ID
  Pharmacist_ID: string; // FK -> Pharmacists.Pharmacist_ID
  Problem_Type: 'Acute / New Problem' | 'Chronic Problem' | 'Medication-related Problem' | 'Treatment-related Problem';
  Clinical_Assessment_Notes: string; // บันทึกผลการประเมินทางคลินิก (SOAP/Structured)
  Care_Plan_Recommendations: string; // คำแนะนำการดูแลสุขภาพและการปรับพฤติกรรม
  Followup_Needed: 'Yes' | 'No';
  Followup_Count: number;
  Followup_Outcome_Notes?: string;
  Referral_Details?: string; // การส่งต่อแพทย์/สถานพยาบาล
  Adverse_Drug_Reactions?: string; // อาการไม่พึงประสงค์จากยา
  Created_At: string;
  Updated_At: string;
}

// 5. Medication_Catalog Table
export interface MedicationCatalogItem {
  Med_ID: string; // PK: e.g. MED001
  Generic_Name: string;
  Brand_Name: string;
  Dosage_Form: string; // e.g. เม็ด, แคปซูล, ยาน้ำ, ครีม
  Strength: string; // e.g. 500 mg, 10 mg
  Default_Unit: string; // e.g. เม็ด, ขวด, หลอด
  Indications: string; // ข้อบ่งใช้
  Precautions: string; // ข้อควรระวัง
  Contraindications: string; // ข้อห้ามใช้
  Storage_Info: string; // การเก็บรักษา
}

// 6. Episode_Medications Table
export interface EpisodeMedication {
  ID: string; // PK
  Assessment_ID: string; // FK -> Clinical_Assessments.Assessment_ID
  Episode_ID: string; // FK -> Health_Episodes.Episode_ID
  Med_ID: string; // FK -> Medication_Catalog.Med_ID
  Drug_Name: string;
  Quantity: number;
  Unit: string;
  Sig_Instructions: string; // วิธีรับประทาน
  Duration_Days: number;
  Created_At: string;
}

// 7. Clinical_Actions Table
export interface ClinicalAction {
  Action_ID: string; // PK
  Assessment_ID: string; // FK -> Clinical_Assessments.Assessment_ID
  Action_Type: 'Dispensing' | 'Patient Counseling' | 'Dose Adjustment' | 'Referral to Physician' | 'Drug Discontinuation';
  Details: string;
  Action_DateTime: string;
  Performed_By: string; // Pharmacist Name or ID
}

// 8. Assessment_Data_Sources Table
export interface AssessmentDataSource {
  Source_ID: string; // PK
  Assessment_ID: string; // FK -> Clinical_Assessments.Assessment_ID
  Source_Type: 'Micromedex' | 'UpToDate' | 'Thai FDA / บัญชียาหลัก' | 'CPG / Guideline' | 'Lexicomp' | 'Pharmacotherapy Textbook';
  Citation_Or_Link: string;
  Notes: string;
}

// 9. Followups Table
export interface Followup {
  Followup_ID: string; // PK
  Assessment_ID: string; // FK -> Clinical_Assessments.Assessment_ID
  Patient_ID: string; // FK -> Patients.Patient_ID
  Scheduled_Date: string; // YYYY-MM-DD
  Status: 'Scheduled' | 'Completed' | 'Missed' | 'Cancelled';
  Pharmacist_Notes?: string;
  Patient_Condition_Rating?: 'ดีขึ้นมาก' | 'ดีขึ้นเล็กน้อย' | 'ทรงตัว' | 'แย่ลง';
  Completed_At?: string;
}

// 10. Patient_Feedback Table
export interface PatientFeedback {
  Feedback_ID: string; // PK
  Assessment_ID: string; // FK -> Clinical_Assessments.Assessment_ID
  Patient_ID: string; // FK -> Patients.Patient_ID
  Outcome_Status: 'อาการดีขึ้น ชัดเจน' | 'อาการทรงตัว' | 'อาการไม่ดีขึ้น / แย่ลง';
  Satisfaction_Score: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  Adverse_Reactions_Reported?: string;
  Comments: string;
  Submitted_At: string;
}

// 11. Attachments Table
export interface Attachment {
  Attachment_ID: string; // PK
  Record_Type: 'Health_Episode' | 'Patient_Medication' | 'Lab_Result';
  Record_ID: string; // FK to Episode_ID, Medication ID, or Lab_ID
  File_Name: string;
  File_Type: string;
  File_Size_KB: number;
  Drive_File_ID: string; // Google Drive File ID
  Drive_View_URL: string; // Google Drive Web Link
  Preview_Data_URL?: string; // Local preview or base64
  Uploaded_By: string; // User email / Name
  Uploaded_At: string;
}

// 12. Users Table
export interface SystemUser {
  User_ID: string; // PK
  Email: string;
  Full_Name: string;
  Role: 'Patient' | 'Pharmacist' | 'Admin';
  Status: 'Active' | 'Inactive' | 'Pending';
  Linked_Patient_ID?: string; // FK -> Patients.Patient_ID
  Linked_Pharmacist_ID?: string; // FK -> Pharmacists.Pharmacist_ID
  Last_Login: string;
  Created_At: string;
}

// 13. Pharmacists Table
export interface Pharmacist {
  Pharmacist_ID: string; // PK: e.g. PH001
  License_No: string; // ภ.เลขที่ใบประกอบวิชาชีพเภสัชกรรม
  Full_Name: string;
  Hospital_Or_Store_Affiliation: string;
  Phone: string;
  Email: string;
  Specialization: string; // e.g. เภสัชกรรมคลินิก, เภสัชกรรมปฐมภูมิ, บริบาลเภสัชกรรม
  Active_Status: boolean;
  Created_At: string;
}

// 14. Lab_Results Table
export interface LabResult {
  Lab_ID: string; // PK
  Episode_ID: string; // FK -> Health_Episodes.Episode_ID
  Patient_ID: string; // FK -> Patients.Patient_ID
  Test_Date: string;
  Test_Type: 'LDL' | 'Cholesterol' | 'Triglycerides' | 'FBS / FPG' | 'HbA1c' | 'Creatinine' | 'eGFR' | 'Urinalysis' | 'Electrolytes' | 'Special Laboratory Tests';
  Result_Value: string;
  Unit: string;
  Reference_Range: string;
  Normal_Abnormal_Flag: 'Normal' | 'High' | 'Low' | 'Abnormal';
  Notes?: string;
  Attachment_ID?: string; // FK -> Attachments.Attachment_ID
}

// 15. Drug_Usage_Summary Table (Aggregated calculation)
export interface DrugUsageSummary {
  Summary_ID: string;
  Med_ID: string;
  Drug_Name: string;
  Unit: string;
  Total_Quantity_Recommended: number;
  Assessment_Count_Used: number;
  Last_Used_Date: string;
}

// 16. Audit_Log Table
export interface AuditLog {
  Log_ID: string; // PK
  Timestamp: string;
  User_ID: string;
  User_Email: string;
  Role: 'Patient' | 'Pharmacist' | 'Admin';
  Action: 'LOGIN' | 'LOGOUT' | 'CREATE_EPISODE' | 'UPDATE_EPISODE' | 'CREATE_ASSESSMENT' | 'UPDATE_ASSESSMENT' | 'SUBMIT_FEEDBACK' | 'UPLOAD_FILE' | 'UPDATE_USER' | 'EXPORT_SHEETS' | 'DISPENSE_DRUG';
  Table_Affected: string;
  Record_ID: string;
  Details: string;
  IP_Address_Or_Client: string;
}
