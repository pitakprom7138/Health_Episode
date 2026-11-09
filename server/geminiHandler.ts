import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function summarizeEpisodeForPharmacist(data: {
  patientName: string;
  ageOrDob: string;
  gender: string;
  chronicDiseases: string[];
  allergies: string[];
  chiefComplaint: string;
  symptoms: string;
  durationDays: number;
  vitals: { temp?: number; pulse?: number; bp?: string; rr?: number };
  currentMeds: string[];
  labs?: Array<{ type: string; value: string; unit: string; flag: string }>;
  redFlags?: string[];
}): Promise<string> {
  const ai = getAIClient();
  const labText = data.labs && data.labs.length > 0
    ? data.labs.map(l => `${l.type}: ${l.value} ${l.unit} (${l.flag})`).join(', ')
    : 'ไม่มี';

  const prompt = `
โปรดสรุปข้อมูลผู้ป่วยและเหตุการณ์เจ็บป่วย (Health Episode) สำหรับเภสัชกร เพื่อใช้ประกอบการประเมินทางคลินิก (Clinical Assessment):

- ผู้ป่วย: ${data.patientName} (${data.gender}, เกิด/อายุ: ${data.ageOrDob})
- โรคประจำตัว: ${data.chronicDiseases.join(', ') || 'ปฏิเสธโรคประจำตัว'}
- ประวัติแพ้ยา: ${data.allergies.join(', ') || 'ปฏิเสธประวัติแพ้ยา'}
- ยาและอาหารเสริมที่ใช้อยู่: ${data.currentMeds.join(' | ') || 'ไม่มี'}
- สัญญาณชีพ: Temp ${data.vitals.temp ?? '-'} °C, HR ${data.vitals.pulse ?? '-'} bpm, BP ${data.vitals.bp ?? '-'} mmHg, RR ${data.vitals.rr ?? '-'} /min
- อาการสำคัญ (Chief Complaint): ${data.chiefComplaint}
- ระยะเวลาที่เป็น: ${data.durationDays} วัน
- รายละเอียดอาการ: ${data.symptoms}
- สัญญาณอันตรายที่ระบุ (Red Flags): ${data.redFlags && data.redFlags.length > 0 ? data.redFlags.join(', ') : 'ไม่พบ'}
- ผลตรวจทางห้องปฏิบัติการ: ${labText}

ข้อกำหนดในการตอบ:
1. ให้โครงสร้างสรุป:
   - สรุปอาการสำคัญและลำดับเวลา
   - ปัจจัยเสี่ยงและจุดที่ต้องเฝ้าระวัง (รวมถึงข้อควรระวังเรื่องยาเดิม/การแพ้ยา)
   - ประเด็นคำถามที่เภสัชกรควรถามเพิ่มเติม (Clarifying questions)
   - ข้อมูลวิชาการหรือแนวทางที่เกี่ยวข้อง (เช่น RDU, CPG)
2. ย้ำคำเตือนทางการแพทย์อย่างเคร่งครัดว่า: "เอกสารสรุปนี้จัดทำโดย AI ช่วยประมวลผลข้อมูลเบื้องต้นสำหรับเภสัชกร ไม่ใช่การวินิจฉัยโรคและไม่สามารถใช้ทดแทนการตัดสินใจทางคลินิกของเภสัชกรหรือแพทย์"
3. ใช้ภาษาไทยทางการ สุภาพ ถูกต้องตามศัพท์เภสัชศาสตร์
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'คุณคือผู้ช่วยเภสัชกรด้านสารสนเทศสุขภาพ (Pharmacy Informatics & Clinical Support AI) มีหน้าที่ช่วยเรียบเรียงและสรุปประวัติสุขภาพอย่างเป็นระบบ ห้ามทำการวินิจฉัยโรคเด็ดขาด',
    },
  });

  return response.text || 'ไม่สามารถสร้างสรุปได้';
}

export async function organizeSymptomDescription(text: string): Promise<string> {
  const ai = getAIClient();
  const prompt = `
ผู้ป่วยกรอกข้อความบรรยายอาการเจ็บป่วยต่อไปนี้:
"${text}"

ช่วยจัดระเบียบข้อความนี้ให้อ่านง่าย ชัดเจน โดยแบ่งเป็น:
1. ลักษณะอาการที่เป็น (What)
2. ตำแหน่งที่เกิดอาการ (Where)
3. ปัจจัยที่ทำให้อาการดีขึ้นหรือแย่ลง (Aggravating/Relieving factors)
4. ผลกระทบต่อชีวิตประจำวันหรือการนอนหลับ

ตอบเป็นภาษาไทยที่กระชับ ไม่เพิ่มข้อความที่ผู้ป่วยไม่ได้กล่าวถึง และลงท้ายด้วยข้อความแนะนำให้ปรึกษาเภสัชกรหรือพบแพทย์หากมีอาการรุนแรง
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'คุณคือผู้ช่วยจัดระเบียบข้อมูลอาการสำหรับระบบบันทึกสุขภาพ เพื่อให้เภสัชกรและแพทย์อ่านได้รวดเร็ว',
    },
  });

  return response.text || text;
}
