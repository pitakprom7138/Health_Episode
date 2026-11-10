/**
 * Google Apps Script (GAS) Backend Code Generator
 * Health Episode Record System
 * Spreadsheet ID: 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 * Drive Folder ID: 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 */

export const SPREADSHEET_ID = '1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE';
export const DRIVE_FOLDER_ID = '16NAYAa6rlefbnTlIObqgdIePdG0207Dn';

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * @file Code.gs
 * @description Google Apps Script Backend for Health Episode Record System
 * @version 1.0.0
 * 
 * Target Google Sheet ID: 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 * Target Google Drive Folder: 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 */

const CONFIG = {
  SPREADSHEET_ID: '1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE',
  DRIVE_FOLDER_ID: '16NAYAa6rlefbnTlIObqgdIePdG0207Dn',
  SHEET_NAMES: [
    'Patients',
    'Patient_Medications',
    'Health_Episodes',
    'Clinical_Assessments',
    'Medication_Catalog',
    'Episode_Medications',
    'Clinical_Actions',
    'Assessment_Data_Sources',
    'Followups',
    'Patient_Feedback',
    'Attachments',
    'Users',
    'Pharmacists',
    'Lab_Results',
    'Drug_Usage_Summary',
    'Audit_Log'
  ]
};

/**
 * 1. ฟังก์ชันติดตั้งและสร้าง 16 ตารางใน Google Sheet อัตโนมัติ
 * เรียกใช้งานเพียงครั้งแรกเพื่อเตรียมฐานข้อมูลและฟอร์แมต
 */
function setupSheetsAndDrive() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // โครงสร้าง Header ของทั้ง 16 ตาราง
  const schemas = {
    'Patients': [
      'Patient_ID', 'Full_Name', 'Citizen_ID_Or_HN', 'DOB', 'Gender',
      'Phone', 'Email', 'Address', 'Emergency_Contact', 'Emergency_Phone',
      'Blood_Group', 'Chronic_Diseases', 'Known_Allergies', 'Created_At', 'Updated_At'
    ],
    'Patient_Medications': [
      'ID', 'Patient_ID', 'Drug_Name', 'Category', 'Dose_Instructions',
      'Status', 'Prescriber_Source', 'Photo_Attachment_ID', 'Created_At'
    ],
    'Health_Episodes': [
      'Episode_ID', 'Patient_ID', 'Onset_DateTime', 'Chief_Complaint',
      'Symptoms_Description', 'Duration_Days', 'Emergency_Red_Flags',
      'Has_Emergency_Flags', 'Temperature_C', 'Pulse_BPM', 'Systolic_BP',
      'Diastolic_BP', 'Resp_Rate', 'Status', 'Created_At', 'Updated_At'
    ],
    'Clinical_Assessments': [
      'Assessment_ID', 'Episode_ID', 'Pharmacist_ID', 'Problem_Type',
      'Clinical_Assessment_Notes', 'Care_Plan_Recommendations', 'Followup_Needed',
      'Followup_Count', 'Followup_Outcome_Notes', 'Referral_Details',
      'Adverse_Drug_Reactions', 'Created_At', 'Updated_At'
    ],
    'Medication_Catalog': [
      'Med_ID', 'Generic_Name', 'Brand_Name', 'Dosage_Form', 'Strength',
      'Default_Unit', 'Indications', 'Precautions', 'Contraindications', 'Storage_Info'
    ],
    'Episode_Medications': [
      'ID', 'Assessment_ID', 'Episode_ID', 'Med_ID', 'Drug_Name',
      'Quantity', 'Unit', 'Sig_Instructions', 'Duration_Days', 'Created_At'
    ],
    'Clinical_Actions': [
      'Action_ID', 'Assessment_ID', 'Action_Type', 'Details', 'Action_DateTime', 'Performed_By'
    ],
    'Assessment_Data_Sources': [
      'Source_ID', 'Assessment_ID', 'Source_Type', 'Citation_Or_Link', 'Notes'
    ],
    'Followups': [
      'Followup_ID', 'Assessment_ID', 'Patient_ID', 'Scheduled_Date',
      'Status', 'Pharmacist_Notes', 'Patient_Condition_Rating', 'Completed_At'
    ],
    'Patient_Feedback': [
      'Feedback_ID', 'Assessment_ID', 'Patient_ID', 'Outcome_Status',
      'Satisfaction_Score', 'Adverse_Reactions_Reported', 'Comments', 'Submitted_At'
    ],
    'Attachments': [
      'Attachment_ID', 'Record_Type', 'Record_ID', 'File_Name', 'File_Type',
      'File_Size_KB', 'Drive_File_ID', 'Drive_View_URL', 'Uploaded_By', 'Uploaded_At'
    ],
    'Users': [
      'User_ID', 'Email', 'Full_Name', 'Role', 'Status',
      'Linked_Patient_ID', 'Linked_Pharmacist_ID', 'Last_Login', 'Created_At'
    ],
    'Pharmacists': [
      'Pharmacist_ID', 'License_No', 'Full_Name', 'Hospital_Or_Store_Affiliation',
      'Phone', 'Email', 'Specialization', 'Active_Status', 'Created_At'
    ],
    'Lab_Results': [
      'Lab_ID', 'Episode_ID', 'Patient_ID', 'Test_Date', 'Test_Type',
      'Result_Value', 'Unit', 'Reference_Range', 'Normal_Abnormal_Flag',
      'Notes', 'Attachment_ID'
    ],
    'Drug_Usage_Summary': [
      'Summary_ID', 'Med_ID', 'Drug_Name', 'Unit',
      'Total_Quantity_Recommended', 'Assessment_Count_Used', 'Last_Used_Date'
    ],
    'Audit_Log': [
      'Log_ID', 'Timestamp', 'User_ID', 'User_Email', 'Role', 'Action',
      'Table_Affected', 'Record_ID', 'Details', 'IP_Address_Or_Client'
    ]
  };

  // ข้อมูลเริ่มต้นสำหรับติดตั้งฐานข้อมูล (Seed Data)
  const initialSeeds = {
    'Patients': [
      ['PT000001', 'นายสมชาย เจริญสุข', 'HN-670124', '1982-05-14', 'ชาย', '081-234-5678', 'somchai@example.com', '128 หมู่ 4 ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000', 'นางสมศรี เจริญสุข (ภรรยา)', '089-876-5432', 'O', 'ความดันโลหิตสูง (HT), เบาหวานชนิดที่ 2 (T2DM)', 'Penicillin (ผื่นคัน ปากบวม), Aspirin (แน่นหน้าอก)', '2026-10-15 09:30:00', '2026-11-01 14:20:00'],
      ['PT000002', 'นางสาววิภาวรรณ สดใส', 'HN-670392', '1995-11-20', 'หญิง', '086-555-4321', 'wipawan@example.com', '45/2 ซอยประชาอุทิศ 12 แขวงทุ่งครุ เขตทุ่งครุ กรุงเทพฯ 10140', 'นายอนุชา สดใส (บิดา)', '081-999-8877', 'B', 'ภูมิแพ้อากาศ (Allergic Rhinitis)', 'Sulfa (Stevens-Johnson syndrome suspicion)', '2026-10-20 11:15:00', '2026-11-05 16:40:00'],
      ['PT000003', 'นางประภาศรี วัฒนานุกูล', 'HN-670815', '1960-03-08', 'หญิง', '083-444-1122', 'prapasri@example.com', '88/1 ถนนช้างคลาน ต.ช้างคลาน อ.เมือง จ.เชียงใหม่ 50100', 'นพ.กิตติ วัฒนานุกูล (บุตรชาย)', '085-333-2211', 'A', 'ไขมันในเลือดสูง (Dyslipidemia), ข้อเข่าเสื่อม (OA Knee)', 'ไม่มีประวัติแพ้ยา', '2026-11-01 10:00:00', '2026-11-06 08:30:00']
    ],
    'Users': [
      ['USR001', 'somchai@example.com', 'นายสมชาย เจริญสุข', 'Patient', 'Active', 'PT000001', '', '2026-11-08 19:45:00', '2026-10-15 09:30:00'],
      ['USR002', 'wipawan@example.com', 'นางสาววิภาวรรณ สดใส', 'Patient', 'Active', 'PT000002', '', '2026-11-07 10:15:00', '2026-10-20 11:15:00'],
      ['USR003', 'narin.rx@hospital.ac.th', 'ภก. ดร. นรินทร์ เวชบริบาล', 'Pharmacist', 'Active', '', 'PH001', '2026-11-08 21:30:00', '2026-01-10 08:00:00'],
      ['USR004', 'panwalai.pharm@health.go.th', 'ภญ. พรรณวลัย สุขเกษม', 'Pharmacist', 'Active', '', 'PH002', '2026-11-08 18:00:00', '2026-02-15 09:00:00'],
      ['USR005', 'admin@health-episode.org', 'ศ.พิเศษ พญ.อัจฉรา ชัยวิทย์ (System Director & Auditor)', 'Admin', 'Active', '', '', '2026-11-08 22:10:00', '2026-01-01 00:00:00']
    ],
    'Pharmacists': [
      ['PH001', 'ภ.19842', 'ภก. ดร. นรินทร์ เวชบริบาล', 'ฝ่ายเภสัชกรรม รพ.มหาวิทยาลัย / คลินิกยาชุมชนอบอุ่น', '089-111-2233', 'narin.rx@hospital.ac.th', 'เภสัชกรรมปฐมภูมิและการบริบาลผู้ป่วยเรื้อรัง (Ambulatory Care)', true, '2026-01-10 08:00:00'],
      ['PH002', 'ภ.24589', 'ภญ. พรรณวลัย สุขเกษม', 'ร้านยาสหการเภสัชกรรม และ ศูนย์บริการสาธารณสุข', '089-123-4567', 'panwalai.pharm@health.go.th', 'เภสัชบำบัดโรคติดเชื้อและการจัดการอาการเจ็บป่วยเฉียบพลัน', true, '2026-02-15 09:00:00']
    ],
    'Medication_Catalog': [
      ['MED001', 'Paracetamol', 'Sara, Tylenol', 'เม็ด', '500 mg', 'เม็ด', 'บรรเทาอาการปวดและลดไข้', 'ไม่ควรรับประทานเกิน 8 เม็ด/วัน ระวังในผู้ป่วยโรคตับ', 'ผู้แพ้พาราเซตามอล, ตับวายเฉียบพลัน', 'เก็บที่อุณหภูมิห้อง ไม่เกิน 30°C'],
      ['MED002', 'Amoxicillin', 'Amoxil', 'แคปซูล', '500 mg', 'แคปซูล', 'รักษาการติดเชื้อแบคทีเรียระบบทางเดินหายใจ', 'ต้องรับประทานติดต่อกันจนหมดตามคำสั่งแพทย์', 'ผู้แพ้ยากลุ่ม Penicillin', 'เก็บในที่แห้ง ป้องกันแสง'],
      ['MED003', 'Loratadine', 'Clarityne', 'เม็ด', '10 mg', 'เม็ด', 'แก้แพ้ บรรเทาอาการแพ้อากาศ ลมพิษ', 'ไม่ง่วงซึม แต่ควรระวังหากทำงานกับเครื่องจักร', 'ผู้แพ้ลอราทาดีน', 'เก็บที่อุณหภูมิห้อง'],
      ['MED004', 'Metformin', 'Glucophage', 'เม็ด', '500 mg', 'เม็ด', 'ยาลดระดับน้ำตาลในเลือดสำหรับเบาหวานชนิดที่ 2', 'รับประทานพร้อมหรือหลังอาหารทันที ลดอาการคลื่นไส้', 'โรคไตเรื้อรังระยะรุนแรง (eGFR < 30)', 'เก็บที่อุณหภูมิห้อง'],
      ['MED005', 'Amlodipine', 'Norvasc', 'เม็ด', '5 mg', 'เม็ด', 'ลดความดันโลหิตสูง ป้องกันโรคหลอดเลือดหัวใจ', 'อาจมีอาการข้อเท้าบวม วิงเวียนศีรษะช่วงเริ่มยา', 'ภาวะช็อกเหตุหัวใจ, ความดันต่ำรุนแรง', 'เก็บที่อุณหภูมิห้อง'],
      ['MED006', 'Omeprazole', 'Losec, Miracid', 'แคปซูล', '20 mg', 'แคปซูล', 'ยาลดกรด รักษาแผลในกระเพาะและกรดไหลย้อน', 'รับประทานก่อนอาหารเช้า 30 นาที กลืนทั้งแคปซูล', 'ผู้แพ้ยาในกลุ่ม PPIs', 'เก็บในที่แห้งและเย็น'],
      ['MED007', 'ฟ้าทะลายโจร (Andrographis paniculata)', 'อภัยภูเบศร', 'แคปซูล', '500 mg', 'แคปซูล', 'บรรเทาอาการหวัด เจ็บคอ และไข้', 'ไม่ควรใช้ติดต่อกันเกิน 7 วัน ห้ามใช้ในหญิงมีครรภ์/ให้นมบุตร', 'หญิงมีครรภ์และผู้แพ้สมุนไพรฟ้าทะลายโจร', 'เก็บในที่แห้ง พ้นแสงแดด'],
      ['MED008', 'ขมิ้นชัน (Curcuma longa)', 'อภัยภูเบศร', 'แคปซูล', '250 mg', 'แคปซูล', 'บรรเทาอาการท้องอืด ท้องเฟ้อ แน่นจุกเสียด', 'ระวังในผู้ป่วยท่อน้ำดีอุดตัน หรือผู้ที่ทานยาวาร์ฟาริน', 'ผู้ป่วยท่อน้ำดีอุดตัน', 'เก็บที่อุณหภูมิห้อง'],
      ['MED009', 'Vitamin C', 'Nat C, C-Vitt', 'เม็ดฟู่ / เม็ดเคลือบ', '1000 mg', 'เม็ด', 'เสริมสร้างภูมิคุ้มกัน ต่อต้านอนุมูลอิสระ', 'ดื่มน้ำตามมากๆ ระวังในผู้ป่วยโรคนิ่วในไต', 'ผู้มีภาวะเหล็กสะสมเกิน', 'เก็บในที่แห้ง ปิดฝาสนิท']
    ],
    'Patient_Medications': [
      ['PM001', 'PT000001', 'Metformin 500 mg', 'ยาแผนปัจจุบัน', '1 เม็ด วันละ 2 ครั้ง พร้อมอาหารเช้า-เย็น', 'Active', 'รพ.ศูนย์ขอนแก่น', '', '2026-10-15 09:30:00'],
      ['PM002', 'PT000001', 'Amlodipine 5 mg', 'ยาแผนปัจจุบัน', '1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า', 'Active', 'รพ.ศูนย์ขอนแก่น', '', '2026-10-15 09:30:00'],
      ['PM003', 'PT000001', 'ฟ้าทะลายโจร แคปซูล', 'ยาสมุนไพร', '3 แคปซูล วันละ 3 ครั้ง หลังอาหาร (ทานเมื่อมีอาการ)', 'Active', 'ซื้อเองจากร้านยา', 'ATT001', '2026-11-06 14:00:00']
    ],
    'Health_Episodes': [
      ['EP20261108001', 'PT000001', '2026-11-06 18:00:00', 'เจ็บคอ กลืนน้ำลายเจ็บ มีไข้ต่ำๆ 2 วัน', 'เริ่มมีอาการเจ็บคอหลังกลับจากต่างจังหวัด ไอแห้งๆ ไม่มีน้ำมูก กลืนน้ำลายลำบาก ทานอาหารได้น้อย มีไข้รุมๆ วัดไข้ได้ 37.8°C', 2, 'กลืนลำบากเจ็บมาก', false, 37.8, 84, 138, 88, 18, 'Assessed', '2026-11-08 09:15:00', '2026-11-08 10:15:00']
    ],
    'Lab_Results': [
      ['LAB001', 'EP20261108001', 'PT000001', '2026-10-28', 'FBS / FPG', '124', 'mg/dL', '70 - 99 mg/dL (เป้าหมายเบาหวาน < 130)', 'High', 'ตรวจหลังอดอาหาร 8 ชม. ควบคุมได้ระดับปานกลาง', 'ATT002'],
      ['LAB002', 'EP20261108001', 'PT000001', '2026-10-28', 'HbA1c', '6.8', '%', '< 5.7% (เป้าหมายเบาหวาน < 7.0%)', 'Normal', 'อยู่ในเกณฑ์เป้าหมายการควบคุมสำหรับผู้ใหญ่', ''],
      ['LAB003', 'EP20261108001', 'PT000001', '2026-10-28', 'Creatinine', '1.02', 'mg/dL', '0.70 - 1.20 mg/dL', 'Normal', 'การทำงานของไตอยู่ในเกณฑ์ปกติ', ''],
      ['LAB004', 'EP20261108001', 'PT000001', '2026-10-28', 'eGFR', '82', 'mL/min/1.73m²', '> 60 mL/min/1.73m²', 'Normal', 'ไตระดับ Stage 2 Mild reduction ตามอายุ', ''],
      ['LAB005', 'EP20261108001', 'PT000001', '2026-10-28', 'LDL', '142', 'mg/dL', '< 100 mg/dL', 'High', 'สูงกว่าเป้าหมายสำหรับผู้ป่วยเบาหวาน', '']
    ],
    'Clinical_Assessments': [
      ['AS20261108001', 'EP20261108001', 'PH001', 'Acute / New Problem', 'S: ผู้ป่วยชาย 44 ปี มีไข้ต่ำๆ 37.8 C เจ็บคอ 2 วัน\\nO: ตรวจคอหอยแดงเล็กน้อย ไม่มีหนอง ต่อมทอนซิลไม่โต Centor Score = 1\\nA: Viral Pharyngitis น่าจะเกิดจากเชื้อไวรัส ไม่มีความจำเป็นต้องใช้ยาปฏิชีวนะ\\nP: ให้การรักษาตามอาการ พักผ่อน ดื่มน้ำอุ่น', 'ดื่มน้ำอุ่นมากๆ พักผ่อนให้เพียงพอ กลั้วคอด้วยน้ำเกลืออุ่น เลี่ยงของทอดของมันและน้ำเย็น', 'Yes', 1, 'ติดตามอาการไข้และอาการเจ็บคอใน 3-5 วัน หากไม่ดีขึ้นหรือมีไข้สูงให้พบแพทย์', 'หากมีอาการหายใจลำบาก กลืนน้ำลายไม่ได้ ไข้สูงเกิน 38.5 C ให้ไป รพ. ทันที', 'ไม่มีอาการแพ้ยาใหม่', '2026-11-08 10:00:00', '2026-11-08 10:00:00']
    ],
    'Episode_Medications': [
      ['EM001', 'AS20261108001', 'EP20261108001', 'MED001', 'Paracetamol (500 mg)', 20, 'เม็ด', 'ทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีอาการปวดหรือมีไข้', 5, '2026-11-08 10:00:00'],
      ['EM002', 'AS20261108001', 'EP20261108001', 'MED007', 'ฟ้าทะลายโจร (500 mg)', 15, 'แคปซูล', 'ทานครั้งละ 3 แคปซูล วันละ 3 ครั้ง หลังอาหาร ไม่เกิน 5 วัน', 5, '2026-11-08 10:00:00']
    ],
    'Clinical_Actions': [
      ['ACT001', 'AS20261108001', 'ตรวจสอบประวัติแพ้ยา', 'ตรวจสอบประวัติแพ้ยา Penicillin และ Aspirin แจ้งเตือนหลีกเลี่ยงยากลุ่ม NSAIDs', '2026-11-08 09:50:00', 'ภก. ดร. นรินทร์ เวชบริบาล'],
      ['ACT002', 'AS20261108001', 'ประเมินความจำเป็นของยาปฏิชีวนะ', 'ประเมิน Centor score ได้ 1 คะแนน แนะนำไม่จำเป็นต้องใช้ยาปฏิชีวนะ Amoxicillin', '2026-11-08 09:55:00', 'ภก. ดร. นรินทร์ เวชบริบาล'],
      ['ACT003', 'AS20261108001', 'จ่ายยาและให้คำแนะนำ', 'จ่าย Paracetamol 500 mg และฟ้าทะลายโจร พร้อมแนะนำสุขอนามัยและดื่มน้ำอุ่น', '2026-11-08 10:00:00', 'ภก. ดร. นรินทร์ เวชบริบาล']
    ],
    'Assessment_Data_Sources': [
      ['SRC001', 'AS20261108001', 'แนวทางเวชปฏิบัติ (CPG)', 'แนวทางการดูแลรักษาโรคติดเชื้อเฉียบพลันของระบบทางเดินหายใจส่วนบน พ.ศ. 2567', 'เกณฑ์การใช้ยาปฏิชีวนะตาม Centor Score'],
      ['SRC002', 'AS20261108001', 'ฐานข้อมูลยา (Drug Database)', 'Micromedex / Thai FDA Drug Database', 'การตรวจสอบ Drug-Drug Interaction ระหว่าง Metformin, Amlodipine และ ฟ้าทะลายโจร']
    ],
    'Followups': [
      ['FLW001', 'AS20261108001', 'PT000001', '2026-11-12', 'Scheduled', 'ติดตามอาการเจ็บคอและระดับไข้หลังเริ่มยา 3 วัน', 4, '']
    ],
    'Patient_Feedback': [
      ['FB001', 'AS20261108001', 'PT000001', 'Improved', 5, 'ไม่มี', 'ได้รับคำแนะนำที่เข้าใจง่ายและไม่ต้องทานยาฆ่าเชื้อเกินจำเป็น อาการดีขึ้นมาก ขอบคุณเภสัชกรครับ', '2026-11-08 16:30:00']
    ],
    'Attachments': [
      ['ATT001', 'Patient_Medication', 'PM003', 'label_fah_talai_jone.jpg', 'image/jpeg', 420, '1drv_label_sample_01', 'https://drive.google.com/drive/folders/16NAYAa6rlefbnTlIObqgdIePdG0207Dn', 'somchai@example.com', '2026-11-06 14:00:00'],
      ['ATT002', 'Lab_Result', 'LAB001', 'lab_lipid_profile_2026.pdf', 'application/pdf', 1250, '1drv_lab_sample_02', 'https://drive.google.com/drive/folders/16NAYAa6rlefbnTlIObqgdIePdG0207Dn', 'somchai@example.com', '2026-11-01 10:30:00']
    ],
    'Audit_Log': [
      ['LOG001', '2026-11-08 22:15:00', 'USR005', 'admin@health-episode.org', 'Admin', 'LOGIN', 'Users', 'USR005', 'ผู้ดูแลระบบเข้าสู่ระบบเพื่อตรวจสอบสถิติและ Audit Trail ประจำวัน', '192.168.1.10 (AI Studio Web)'],
      ['LOG002', '2026-11-08 10:00:00', 'USR003', 'narin.rx@hospital.ac.th', 'Pharmacist', 'CREATE_ASSESSMENT', 'Clinical_Assessments', 'AS20261108001', 'เภสัชกรบันทึกผลการประเมิน Viral Pharyngitis และแนะนำ Paracetamol + ฟ้าทะลายโจร', '10.0.4.88 (Mobile Chrome)']
    ]
  };

  // สร้างหรือตรวจสอบแต่ละตาราง
  CONFIG.SHEET_NAMES.forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // ตั้งค่า Headers
    const headers = schemas[sheetName];
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // ตกแต่ง Header สไตล์เขียวเภสัช (#0D5C3A)
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#0D5C3A');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setFontFamily('Sarabun');
      sheet.setFrozenRows(1);
    }

    // เติมข้อมูลเริ่มต้น (Seed Data) หากชีทยังว่างอยู่
    const seeds = initialSeeds[sheetName];
    if (seeds && seeds.length > 0 && sheet.getLastRow() <= 1) {
      sheet.getRange(2, 1, seeds.length, seeds[0].length).setValues(seeds);
    }
  });

  // คำนวณสรุปยอด Drug_Usage_Summary อัตโนมัติ
  updateDrugUsageSummary(ss);

  // ลบ Sheet1 เริ่มต้นหากว่าง
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('แผ่นงาน1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  // ทดสอบการเข้าถึงโฟลเดอร์ Google Drive
  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    Logger.log('Drive folder accessible: ' + folder.getName());
  } catch (err) {
    Logger.log('Notice regarding Drive Folder: ' + err.message);
  }

  Logger.log('Setup and Seeding completed successfully for all 16 tables in Sheet: ' + CONFIG.SPREADSHEET_ID);
  return 'SUCCESS';
}

/**
 * 2. API GET Handler
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'ping';
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    if (action === 'ping') {
      return createJsonResponse({
        status: 'success',
        message: 'Health Episode Record System Backend is Online',
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        driveFolderId: CONFIG.DRIVE_FOLDER_ID,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getAllData') {
      const data = {};
      CONFIG.SHEET_NAMES.forEach(function(name) {
        data[name] = getSheetDataAsObjects(ss, name);
      });
      return createJsonResponse({ status: 'success', data: data });
    }

    if (action === 'getTable') {
      const tableName = e.parameter.table;
      if (!CONFIG.SHEET_NAMES.includes(tableName)) {
        return createJsonResponse({ status: 'error', message: 'Table not found: ' + tableName }, 404);
      }
      const records = getSheetDataAsObjects(ss, tableName);
      return createJsonResponse({ status: 'success', table: tableName, data: records });
    }

    if (action === 'setupSheets') {
      setupSheetsAndDrive();
      return createJsonResponse({
        status: 'success',
        message: 'ระบบได้สร้างและเชื่อมโยงชีททั้ง 16 ตารางใน Google Sheet พร้อมจัดรูปแบบ Emerald เรียบร้อยแล้ว',
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        driveFolderId: CONFIG.DRIVE_FOLDER_ID
      });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action }, 400);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

/**
 * 3. API POST Handler
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

    // ตรวจสอบความปลอดภัย Role-Based เบื้องต้น
    const userRole = requestData.role || 'Guest';
    const userEmail = requestData.userEmail || 'system';

    if (action === 'createEpisode') {
      const episode = requestData.episode;
      const sheet = ss.getSheetByName('Health_Episodes');
      appendObjectToSheet(sheet, episode);
      
      // บันทึกผลแล็บถ้ามี
      if (requestData.labs && requestData.labs.length > 0) {
        const labSheet = ss.getSheetByName('Lab_Results');
        requestData.labs.forEach(function(lab) {
          appendObjectToSheet(labSheet, lab);
        });
      }

      writeAudit(ss, {
        User_ID: episode.Patient_ID,
        User_Email: userEmail,
        Role: userRole,
        Action: 'CREATE_EPISODE',
        Table_Affected: 'Health_Episodes',
        Record_ID: episode.Episode_ID,
        Details: 'สร้าง Episode อาการสำคัญ: ' + episode.Chief_Complaint
      });

      return createJsonResponse({ status: 'success', message: 'Episode created', episodeId: episode.Episode_ID });
    }

    if (action === 'createAssessment') {
      if (userRole !== 'Pharmacist' && userRole !== 'Admin') {
        return createJsonResponse({ status: 'error', message: 'Unauthorized: Pharmacist role required' }, 403);
      }

      const assessment = requestData.assessment;
      const asSheet = ss.getSheetByName('Clinical_Assessments');
      appendObjectToSheet(asSheet, assessment);

      // อัปเดตสถานะ Episode เป็น Assessed
      updateRecordStatus(ss, 'Health_Episodes', 'Episode_ID', assessment.Episode_ID, 'Status', 'Assessed');

      // บันทึกยาที่แนะนำ (Episode_Medications)
      if (requestData.medications && requestData.medications.length > 0) {
        const emSheet = ss.getSheetByName('Episode_Medications');
        requestData.medications.forEach(function(med) {
          appendObjectToSheet(emSheet, med);
        });
        // ปรับปรุงยอดคำนวณ Drug_Usage_Summary อัตโนมัติ
        updateDrugUsageSummary(ss);
      }

      // บันทึก Clinical_Actions
      if (requestData.actions && requestData.actions.length > 0) {
        const actSheet = ss.getSheetByName('Clinical_Actions');
        requestData.actions.forEach(function(act) {
          appendObjectToSheet(actSheet, act);
        });
      }

      // บันทึก Data Sources
      if (requestData.sources && requestData.sources.length > 0) {
        const srcSheet = ss.getSheetByName('Assessment_Data_Sources');
        requestData.sources.forEach(function(src) {
          appendObjectToSheet(srcSheet, src);
        });
      }

      // บันทึก Follow-up
      if (requestData.followup) {
        const flwSheet = ss.getSheetByName('Followups');
        appendObjectToSheet(flwSheet, requestData.followup);
      }

      writeAudit(ss, {
        User_ID: assessment.Pharmacist_ID,
        User_Email: userEmail,
        Role: userRole,
        Action: 'CREATE_ASSESSMENT',
        Table_Affected: 'Clinical_Assessments',
        Record_ID: assessment.Assessment_ID,
        Details: 'ประเมินปัญหา: ' + assessment.Problem_Type
      });

      return createJsonResponse({ status: 'success', message: 'Assessment created', assessmentId: assessment.Assessment_ID });
    }

    if (action === 'submitFeedback') {
      const feedback = requestData.feedback;
      const fbSheet = ss.getSheetByName('Patient_Feedback');
      appendObjectToSheet(fbSheet, feedback);

      writeAudit(ss, {
        User_ID: feedback.Patient_ID,
        User_Email: userEmail,
        Role: userRole,
        Action: 'SUBMIT_FEEDBACK',
        Table_Affected: 'Patient_Feedback',
        Record_ID: feedback.Feedback_ID,
        Details: 'ผลลัพธ์: ' + feedback.Outcome_Status + ' ความพึงพอใจ: ' + feedback.Satisfaction_Score + ' ดาว'
      });

      return createJsonResponse({ status: 'success', message: 'Feedback submitted' });
    }

    if (action === 'uploadFileToDrive') {
      const fileData = requestData.fileData; // { name, type, base64, recordType, recordId }
      const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      const decodedBytes = Utilities.base64Decode(fileData.base64);
      const blob = Utilities.newBlob(decodedBytes, fileData.type, fileData.name);
      const createdFile = folder.createFile(blob);
      
      const attachmentId = 'ATT' + new Date().getTime();
      const attachmentRecord = {
        Attachment_ID: attachmentId,
        Record_Type: fileData.recordType,
        Record_ID: fileData.recordId,
        File_Name: fileData.name,
        File_Type: fileData.type,
        File_Size_KB: Math.round(blob.getBytes().length / 1024),
        Drive_File_ID: createdFile.getId(),
        Drive_View_URL: createdFile.getUrl(),
        Uploaded_By: userEmail,
        Uploaded_At: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss')
      };

      const attSheet = ss.getSheetByName('Attachments');
      appendObjectToSheet(attSheet, attachmentRecord);

      return createJsonResponse({
        status: 'success',
        attachment: attachmentRecord
      });
    }

    if (action === 'registerUser') {
      const user = requestData.user;
      const userSheet = ss.getSheetByName('Users');
      appendObjectToSheet(userSheet, user);

      if (requestData.patient) {
        const ptSheet = ss.getSheetByName('Patients');
        appendObjectToSheet(ptSheet, requestData.patient);
      }

      if (requestData.pharmacist) {
        const phSheet = ss.getSheetByName('Pharmacists');
        appendObjectToSheet(phSheet, requestData.pharmacist);
      }

      writeAudit(ss, {
        User_ID: user.User_ID,
        User_Email: user.Email,
        Role: user.Role,
        Action: 'REGISTER',
        Table_Affected: 'Users',
        Record_ID: user.User_ID,
        Details: 'ลงทะเบียนผู้ใช้ใหม่: ' + user.Full_Name + ' (' + user.Role + ')'
      });

      return createJsonResponse({ status: 'success', message: 'User registered', userId: user.User_ID });
    }

    if (action === 'setupSheets') {
      setupSheetsAndDrive();
      return createJsonResponse({
        status: 'success',
        message: 'ระบบได้สร้างและเชื่อมโยงชีททั้ง 16 ตารางใน Google Sheet พร้อมจัดรูปแบบ Emerald เรียบร้อยแล้ว',
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        driveFolderId: CONFIG.DRIVE_FOLDER_ID
      });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown POST action: ' + action }, 400);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}

/**
 * 4. ฟังก์ชันคำนวณสรุปการใช้ยา (Drug_Usage_Summary) รวมยอดอัตโนมัติ
 */
function updateDrugUsageSummary(ss) {
  const emSheet = ss.getSheetByName('Episode_Medications');
  const catSheet = ss.getSheetByName('Medication_Catalog');
  const sumSheet = ss.getSheetByName('Drug_Usage_Summary');

  const emData = getSheetDataAsObjects(ss, 'Episode_Medications');
  const catData = getSheetDataAsObjects(ss, 'Medication_Catalog');

  const drugTotals = {};

  emData.forEach(function(row) {
    const medId = row.Med_ID;
    if (!drugTotals[medId]) {
      drugTotals[medId] = {
        Med_ID: medId,
        Drug_Name: row.Drug_Name,
        Unit: row.Unit || 'หน่วย',
        Total_Quantity_Recommended: 0,
        Assessment_Count_Used: 0,
        Last_Used_Date: row.Created_At || ''
      };
    }
    drugTotals[medId].Total_Quantity_Recommended += Number(row.Quantity || 0);
    drugTotals[medId].Assessment_Count_Used += 1;
    if (row.Created_At && row.Created_At > drugTotals[medId].Last_Used_Date) {
      drugTotals[medId].Last_Used_Date = row.Created_At;
    }
  });

  // ล้างข้อมูลเดิมตั้งแต่แถวที่ 2
  const lastRow = sumSheet.getLastRow();
  if (lastRow > 1) {
    sumSheet.getRange(2, 1, lastRow - 1, 7).clearContent();
  }

  // เขียนข้อมูลใหม่ที่คำนวณแล้ว
  const rowsToWrite = Object.keys(drugTotals).map(function(medId, index) {
    const item = drugTotals[medId];
    return [
      'DUS' + String(index + 1).padStart(3, '0'),
      item.Med_ID,
      item.Drug_Name,
      item.Unit,
      item.Total_Quantity_Recommended,
      item.Assessment_Count_Used,
      item.Last_Used_Date
    ];
  });

  if (rowsToWrite.length > 0) {
    sumSheet.getRange(2, 1, rowsToWrite.length, 7).setValues(rowsToWrite);
  }
}

/**
 * Helper: บันทึก Audit Log
 */
function writeAudit(ss, entry) {
  try {
    const logSheet = ss.getSheetByName('Audit_Log');
    const logId = 'LOG' + new Date().getTime();
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
    appendObjectToSheet(logSheet, {
      Log_ID: logId,
      Timestamp: timestamp,
      User_ID: entry.User_ID || '',
      User_Email: entry.User_Email || '',
      Role: entry.Role || '',
      Action: entry.Action || '',
      Table_Affected: entry.Table_Affected || '',
      Record_ID: entry.Record_ID || '',
      Details: entry.Details || '',
      IP_Address_Or_Client: 'Google Apps Script Webhook'
    });
  } catch (e) {
    Logger.log('Audit Log error: ' + e.message);
  }
}

/**
 * Helper: แปลง Sheet เป็น Array of Objects
 */
function getSheetDataAsObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(function(row) {
    const obj = {};
    headers.forEach(function(header, colIndex) {
      obj[header] = row[colIndex];
    });
    return obj;
  });
}

/**
 * Helper: เพิ่ม Object ลงใน Sheet ตาม Header
 */
function appendObjectToSheet(sheet, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
  sheet.appendRow(row);
}

/**
 * Helper: อัปเดตคอลัมน์ใน Sheet
 */
function updateRecordStatus(ss, sheetName, idColName, idValue, targetColName, targetValue) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColIdx = headers.indexOf(idColName);
  const targetColIdx = headers.indexOf(targetColName);

  if (idColIdx === -1 || targetColIdx === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIdx]) === String(idValue)) {
      sheet.getRange(i + 1, targetColIdx + 1).setValue(targetValue);
      break;
    }
  }
}

/**
 * Helper: สร้าง JSON Response พร้อม CORS
 */
function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
