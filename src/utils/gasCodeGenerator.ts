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
  });

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

  Logger.log('Setup completed successfully for all 16 tables in Sheet: ' + CONFIG.SPREADSHEET_ID);
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
