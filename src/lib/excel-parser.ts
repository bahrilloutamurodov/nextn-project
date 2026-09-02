import * as XLSX from 'xlsx';
import { UserProfile } from './types';

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  validStudents: Partial<UserProfile>[];
}

export function parseStudentsExcel(fileBuffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to JSON array
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const errors: string[] = [];
  const validStudents: Partial<UserProfile>[] = [];

  if (!rawRows || rawRows.length <= 1) {
    return {
      successCount: 0,
      errorCount: 1,
      errors: ["Fayl bo'sh yoki namuna jadvali topilmadi."],
      validStudents: []
    };
  }

  // Header verification (Row 0)
  // Expected headers: ["Ism Familiya", "Sinf", "Login / ID"]
  const rows = rawRows.slice(1); // skip header

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed header is line 1
    if (!row || row.length === 0) return;

    const name = String(row[0] || '').trim();
    let gradeStr = String(row[1] || '').trim();
    const login = String(row[2] || '').trim();

    if (!name) {
      errors.push(`Qator ${rowNum}: O'quvchi ismi kiritilmagan.`);
      return;
    }

    // Format grade string if user wrote "5A" -> "5-A"
    if (/^\d+[A-Za-z0-9]$/.test(gradeStr)) {
      const num = gradeStr.match(/\d+/)?.[0];
      const letter = gradeStr.match(/[A-Za-z0-9]+$/)?.[0]?.replace(/\d+/, '').toUpperCase();
      if (num && letter) gradeStr = `${num}-${letter}`;
    }

    // Validate class format: e.g. 5-A, 6-B, 11-V or 5-Sinf
    const isClassValid = /^([5-9]|1[0-1])(-[A-Z0-9a-z]+|-Sinf)$/i.test(gradeStr) || /^\d+-Sinf$/i.test(gradeStr);

    if (!isClassValid && gradeStr) {
      errors.push(`Qator ${rowNum} (${name}): Sinf formati noto'g'ri ("${gradeStr}"). Masalan: "5-A" yoki "6-B".`);
      return;
    }

    const finalGrade = gradeStr || "5-A";

    validStudents.push({
      name,
      grade: finalGrade,
      login: login || name.toLowerCase().replace(/\s+/g, '.') + Math.floor(100 + Math.random() * 900),
      currentLevel: 1,
      totalScore: 0,
      completedLevels: [],
      averageScore: 0,
      totalTime: 0,
      status: 'active',
      role: 'student',
      lastActive: new Date().toISOString()
    });
  });

  return {
    successCount: validStudents.length,
    errorCount: errors.length,
    errors,
    validStudents
  };
}

export function downloadStudentTemplate() {
  const sampleData = [
    ["Ism Familiya", "Sinf", "Login / ID"],
    ["Ali Valiev", "5-A", "ali.valiev5a"],
    ["Malika Sobirova", "6-B", "malika.6b"],
    ["Jasur Karimov", "7-A", "jasur.karimov"],
    ["Zuhra Aliyeva", "8-V", "zuhra.8v"]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar Shablon");

  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 20 }
  ];

  XLSX.writeFile(workbook, "oquvchilar_shablon.xlsx");
}
