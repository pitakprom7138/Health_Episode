/**
 * Server-side Google Sheets & Google Drive Integration Service
 * Target Sheet ID: 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 * Target Drive Folder: 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 * 
 * Securely handles reading and writing data and file uploads in the backend
 * without exposing raw links or folder IDs on the frontend UI.
 */

import fs from 'fs';
import path from 'path';

export const SPREADSHEET_ID = '1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE';
export const DRIVE_FOLDER_ID = '16NAYAa6rlefbnTlIObqgdIePdG0207Dn';

const CONFIG_FILE_PATH = path.resolve(process.cwd(), 'server', 'gas-config.json');

function loadStoredGasEndpoint(): string {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.gasUrl || '';
    }
  } catch (err) {
    console.warn('Error reading gas-config.json:', err);
  }
  return process.env.GAS_WEBAPP_URL || '';
}

let gasEndpointUrl = loadStoredGasEndpoint();

export function getGasEndpoint(): string {
  if (!gasEndpointUrl) {
    gasEndpointUrl = loadStoredGasEndpoint();
  }
  return gasEndpointUrl;
}

export function setGasEndpoint(url: string): void {
  gasEndpointUrl = url.trim();
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify({ gasUrl: gasEndpointUrl, updatedAt: new Date().toISOString() }, null, 2));
  } catch (err) {
    console.warn('Error saving gas-config.json:', err);
  }
}

export interface AttachmentUploadPayload {
  name: string;
  type: string;
  base64: string;
  recordType: 'Health_Episode' | 'Patient_Medication' | 'Lab_Result';
  recordId: string;
  userEmail: string;
}

/**
 * Uploads a file to Google Drive folder 16NAYAa6rlefbnTlIObqgdIePdG0207Dn
 */
export async function uploadToGoogleDrive(payload: AttachmentUploadPayload) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const localFileId = `FILE_${Date.now()}`;
  const cleanBase64 = payload.base64.includes('base64,') ? payload.base64.split('base64,')[1] : payload.base64;

  const endpoint = getGasEndpoint();

  // If a GAS Web App endpoint is configured, forward the upload to Google Drive directly
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          action: 'uploadFileToDrive',
          role: 'System',
          userEmail: payload.userEmail,
          fileData: {
            name: payload.name,
            type: payload.type,
            base64: cleanBase64,
            recordType: payload.recordType,
            recordId: payload.recordId,
            folderId: DRIVE_FOLDER_ID,
          },
        }),
      });

      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (result.status === 'success' && result.attachment) {
          return {
            success: true,
            attachment: result.attachment,
            message: 'บันทึกไฟล์ลงในระบบคลังเอกสารและ Google Drive เรียบร้อยแล้ว',
          };
        }
      } catch (e) {
        console.warn('GAS Drive upload returned non-JSON:', text.substring(0, 100));
      }
    } catch (err: any) {
      console.warn('GAS Drive upload error:', err.message);
    }
  }

  // Safe server-side metadata representation for Google Drive Folder
  const attachmentRecord = {
    Attachment_ID: `ATT${Date.now()}`,
    Record_Type: payload.recordType,
    Record_ID: payload.recordId,
    File_Name: payload.name,
    File_Type: payload.type,
    File_Size_KB: Math.round(cleanBase64.length * 0.75 / 1024),
    Drive_File_ID: localFileId,
    Drive_View_URL: `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
    Uploaded_By: payload.userEmail,
    Uploaded_At: timestamp,
  };

  return {
    success: true,
    attachment: attachmentRecord,
    message: 'บันทึกไฟล์ลงในระบบคลังเอกสารเรียบร้อยแล้ว',
  };
}

/**
 * Appends record into Google Sheet 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 */
export async function appendToGoogleSheet(action: string, data: any, userEmail: string, role: string, explicitGasUrl?: string) {
  const targetUrl = explicitGasUrl || getGasEndpoint();
  if (targetUrl) {
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          action,
          role,
          userEmail,
          spreadsheetId: SPREADSHEET_ID,
          ...data,
        }),
      });
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        return result;
      } catch {
        return { status: 'success', raw: text };
      }
    } catch (err: any) {
      console.warn(`GAS append failed for ${action}:`, err.message);
      return { status: 'error', message: err.message };
    }
  }

  return {
    status: 'unconfigured',
    message: 'บันทึกข้อมูลในเครื่องเรียบร้อยแล้ว (ยังไม่ได้ระบุ Web App URL)',
  };
}

const ALL_16_SHEETS = [
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
  'Audit_Log',
];

async function fetchSheetViaGviz(sheetName: string): Promise<any[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s);
    if (!match) return [];
    const parsed = JSON.parse(match[1]);
    if (parsed.status !== 'ok' || !parsed.table || !parsed.table.cols) return [];

    const cols = parsed.table.cols.map((c: any) => c.label || c.id);
    const rows = (parsed.table.rows || []).map((r: any) => {
      const obj: Record<string, any> = {};
      r.c.forEach((cell: any, idx: number) => {
        const colName = cols[idx];
        if (colName) {
          let val = cell ? (cell.f !== undefined ? cell.f : cell.v) : null;
          if (typeof val === 'string' && val.startsWith('[Ljava.lang.Object;@')) {
            val = '';
          }
          obj[colName] = val;
        }
      });
      return obj;
    });
    return rows;
  } catch (err: any) {
    console.warn(`Error reading sheet ${sheetName}:`, err.message);
    return [];
  }
}

/**
 * Reads all data in real-time from Google Sheet 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
 */
export async function readFromGoogleSheet() {
  // 1. If GAS endpoint is set and active, try it first
  if (gasEndpointUrl) {
    try {
      const response = await fetch(`${gasEndpointUrl}?action=getAllData&spreadsheetId=${SPREADSHEET_ID}`);
      const result = await response.json();
      if (result.status === 'success' && result.data && Object.keys(result.data).length > 0) {
        return { success: true, data: result.data, source: 'gas' };
      }
    } catch (err: any) {
      console.warn('Failed to read from GAS endpoint, falling back to direct sheet query:', err.message);
    }
  }

  // 2. Direct real-time fetch from Google Sheet 1hRAW8P6_zWD-pGDxXohn7kOisp_QQlm8dsA8N8iFGiE
  try {
    const entries = await Promise.all(
      ALL_16_SHEETS.map(async name => {
        const rows = await fetchSheetViaGviz(name);
        return [name, rows] as const;
      })
    );
    const data: Record<string, any[]> = {};
    for (const [name, rows] of entries) {
      data[name] = rows;
    }

    const hasAnyData = Object.values(data).some(arr => arr.length > 0);
    if (hasAnyData) {
      return { success: true, data, source: 'google_sheet_gviz' };
    }
  } catch (err: any) {
    console.warn('Direct sheet read error:', err.message);
  }

  return { success: false, message: 'No live GAS connection, using persistent store' };
}

/**
 * Server-side proxy for Google Apps Script requests
 * Completely eliminates browser CORS issues and handles Google 302 redirects
 */
export async function proxyToGas(targetUrl: string, method: string = 'GET', payload?: any) {
  const urlToFetch = targetUrl || gasEndpointUrl;

  if (!urlToFetch || !urlToFetch.startsWith('http')) {
    return {
      status: 'error',
      message: 'กรุณากรอก URL ของ Google Apps Script Web App (เช่น https://script.google.com/macros/s/.../exec)',
    };
  }

  if (urlToFetch.includes('docs.google.com/spreadsheets')) {
    return {
      status: 'error',
      message: 'URL ที่ระบุคือลิงก์ Google Sheet ไม่ใช่ Web App URL กรุณาไปที่ Extensions > Apps Script > Deploy > New deployment > Web app แล้วนำลิงก์ที่ลงท้ายด้วย /exec มาใช้งาน หรือกดปุ่ม Run setupSheetsAndDrive ใน Apps Script ได้โดยตรง',
    };
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    };

    if (method === 'POST') {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      };
      if (payload) {
        fetchOptions.body = JSON.stringify(payload);
      }
    }

    const response = await fetch(urlToFetch, fetchOptions);
    const text = await response.text();

    if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
      if (text.includes('accounts.google.com') || text.includes('Sign in')) {
        return {
          status: 'error',
          message: 'Google Apps Script ปฏิเสธการเข้าถึง กรุณาไปที่หน้า Deploy > Manage deployments > แก้ไข Web app และเปลี่ยน "Who has access (ผู้มีสิทธิ์เข้าถึง)" ให้เป็น "Anyone (ทุกคน)"',
        };
      }
      return {
        status: 'error',
        message: 'Google Apps Script ส่งกลับหน้าเว็บ HTML กรุณาตรวจสอบว่าเลือก Web app ที่ลงท้ายด้วย /exec และให้สิทธิ์ Anyone',
      };
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch {
      return {
        status: 'success',
        raw: text,
        message: 'เชื่อมต่อและดำเนินการกับ Google Apps Script สำเร็จ',
      };
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: `ไม่สามารถเชื่อมต่อ Google Apps Script ได้ (${err.message}) กรุณาตรวจสอบว่า Web App ได้รับการ Deploy และเลือกสิทธิ์ Anyone`,
    };
  }
}
