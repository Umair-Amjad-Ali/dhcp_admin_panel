import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const C = {
  headerBg:    [30, 41, 59]   as [number, number, number], 
  headerText:  [255, 255, 255] as [number, number, number],
  headerSub:   [148, 163, 184] as [number, number, number], 
  accent:      [59, 130, 246]  as [number, number, number], 
  bodyText:    [30, 41, 59]    as [number, number, number], 
  mutedText:   [100, 116, 139] as [number, number, number], 
  lightText:   [148, 163, 184] as [number, number, number], 
  border:      [226, 232, 240] as [number, number, number], 
  surfaceLight:[248, 250, 252] as [number, number, number],
  white:       [255, 255, 255] as [number, number, number],
  green:       [16, 185, 129]  as [number, number, number], 
  red:         [239, 68, 68]   as [number, number, number], 
};

const safeId  = (id: any) => (id || 'ORDER').toString().toUpperCase().slice(0, 12);
const safeStr = (v: any, fallback = '—') => v ? v.toString() : fallback;
const toUpper = (v: any, fallback = '—') => safeStr(v, fallback).toUpperCase();

const hRule = (doc: jsPDF, y: number, x1 = 20, x2?: number) => {
  const w = x2 ?? doc.internal.pageSize.getWidth() - 20;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(x1, y, w, y);
};

const badge = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number, y: number,
  w = 60, h = 20
) => {
  doc.setFillColor(...C.surfaceLight);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.mutedText);
  doc.text(label, x + 5, y + 6);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.bodyText);
  doc.text(value, x + 5, y + 14);
};

const sectionLabel = (doc: jsPDF, text: string, x: number, y: number) => {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.mutedText);
  doc.text(text, x, y);
};

export const generateOrderReceipt = (order: any) => {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW   = doc.internal.pageSize.getWidth();   
  const PH   = doc.internal.pageSize.getHeight();  
  const ML   = 20;  
  const MR   = PW - 20; 
  const COL2 = 110; 
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PW, 46, 'F');

  doc.setFillColor(...C.accent);
  doc.rect(0, 0, 4, 46, 'F');


  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.headerText);
  doc.text('Dammam Home Service', ML + 2, 22);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.headerSub);
  doc.text('PROFESSIONAL HOME MAINTENANCE SERVICES', ML + 2, 30);

  doc.setDrawColor(255, 255, 255, 0.15);
  doc.setLineWidth(0.2);
  doc.line(ML + 2, 35, MR, 35);
  const dateStr = order.completedAt?.toDate?.()
    ? order.completedAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.headerSub);
  doc.text('DATE OF SERVICE', MR, 22, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.headerText);
  doc.text(dateStr, MR, 30, { align: 'right' });

  const badgeY = 52;
  const badgeW = 52;
  const gap    = 4;

  badge(doc, 'RECEIPT NO.',   safeId(order.id),                       ML,                   badgeY, badgeW, 22);
  badge(doc, 'MISSION TARGET',
    toUpper(order.serviceSubType || order.service?.serviceSubType || order.serviceType, 'MAINTENANCE'),
    ML + badgeW + gap,        badgeY, badgeW + 10, 22);
  badge(doc, 'SERVICE STATUS', order.status ? toUpper(order.status) : 'COMPLETED',
    ML + badgeW + gap + badgeW + 10 + gap, badgeY, badgeW - 4, 22);

  let Y = badgeY + 30;

  hRule(doc, Y);
  Y += 6;

  sectionLabel(doc, 'CLIENT IDENTITY',     ML,    Y);
  sectionLabel(doc, 'DEPLOYED SPECIALIST', COL2,  Y);
  Y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.bodyText);
  doc.text(toUpper(order.userDetails?.name || order.name, 'ANONYMOUS USER'), ML, Y);
  doc.text(toUpper(order.assignedTechName, 'UNASSIGNED'), COL2, Y);
  Y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.mutedText);

  const clientLines = [
    safeStr(order.userDetails?.email || order.email, 'No email on file'),
    safeStr(order.userDetails?.phone || order.phone, 'No phone on file'),
  ];
  doc.text(clientLines, ML, Y);

  const techLines = [
    `Email: ${safeStr(order.assignedTechEmail || order.technicianEmail, 'N/A')}`,
    `Phone: ${safeStr(order.assignedTechPhone, 'Fleet Comms')}`,
  ];
  doc.text(techLines, COL2, Y);

  Y += 14;
  hRule(doc, Y);

  Y += 6;
  sectionLabel(doc, 'MISSION SPECIFICATION & DIAGNOSTIC LOG', ML, Y);
  Y += 4;

  autoTable(doc, {
    startY: Y,
    margin: { left: ML, right: 20 },
    head: [['FIELD', 'VALUE']],
    body: [
      ['Primary Category',
        toUpper(order.serviceType, 'General Repair')],
      ['Service Label',
        toUpper(order.issue?.label || order.service?.issue?.label, 'Direct Request')],
      ['Deployment Zone',
        `${safeStr(order.location?.area, 'Zone-1')}, ${safeStr(order.location?.city, 'UAE')}`],
    ],
    showHead: false,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
    },
    columnStyles: {
      0: {
        fontStyle: 'bold',
        textColor: C.mutedText,
        fillColor: C.surfaceLight,
        cellWidth: 52,
      },
      1: {
        textColor: C.bodyText,
        fillColor: C.white,
      },
    },
    didDrawCell: (data: any) => {
      const { doc: d, cell, row } = data;
      d.setDrawColor(...C.border);
      d.setLineWidth(0.2);
      d.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
    },
  });

  Y = (doc as any).lastAutoTable.finalY + 10;

  sectionLabel(doc, 'WORK EXECUTION SUMMARY / FINAL NOTES', ML, Y);
  Y += 4;

  const reportText = safeStr(
    order.workReport,
    'Mission executed according to standard fleet protocols. Performance verified and signed off.'
  );
  const splitReport = doc.splitTextToSize(reportText, MR - ML - 10);
  const boxH = splitReport.length * 5 + 14;

  doc.setFillColor(...C.surfaceLight);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, Y, MR - ML, boxH, 2, 2, 'FD');

  doc.setFillColor(...C.accent);
  doc.rect(ML, Y, 3, boxH, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...C.mutedText);
  doc.text(splitReport, ML + 8, Y + 9);

  Y += boxH + 10;

  const initialPrice = Number(order.service?.estimatedPrice ?? order.estimatedPrice ?? 0);
  const finalPrice   = Number(order.finalPrice ?? initialPrice);
  const currency     = safeStr(order.service?.currency || order.currency, 'AED');
  const diff         = finalPrice - initialPrice;

  const finW  = 90;
  const finX  = MR - finW;
  const finH  = finalPrice !== initialPrice ? 44 : 36;

  doc.setFillColor(...C.surfaceLight);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(finX, Y, finW, finH, 3, 3, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.mutedText);
  doc.text('FINANCIAL SUMMARY', finX + 6, Y + 7);

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(finX + 6, Y + 10, finX + finW - 6, Y + 10);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.mutedText);
  doc.text('INITIAL ESTIMATE', finX + 6, Y + 18);
  doc.text(`${initialPrice} ${currency}`, finX + finW - 6, Y + 18, { align: 'right' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.bodyText);
  doc.text('FINAL SETTLEMENT', finX + 6, Y + 28);
  doc.text(`${finalPrice} ${currency}`, finX + finW - 6, Y + 28, { align: 'right' });

  if (finalPrice !== initialPrice) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    const adjustColor = diff > 0 ? C.green : C.red;
    doc.setTextColor(adjustColor[0], adjustColor[1], adjustColor[2]);
    const sign = diff > 0 ? '+' : '';
    doc.text(`ADJUSTMENT: ${sign}${diff} ${currency}`, finX + finW - 6, Y + 38, { align: 'right' });
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.mutedText);
  doc.text('PAYMENT VERIFICATION', ML, Y + 7);
  
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(1);
  doc.line(ML, Y + 10, ML + 10, Y + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.bodyText);
  const payNote = [
    'Transaction processed and verified by',
    'Dammam Home Service Registry.',
    'Mission status successfully finalized.',
  ];
  doc.text(payNote, ML, Y + 18);

 
  doc.setFillColor(...C.surfaceLight);
  doc.rect(0, PH - 18, PW, 18, 'F');
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(0, PH - 18, PW, PH - 18);

  doc.setFillColor(...C.accent);
  doc.rect(0, PH - 18, 4, 18, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.mutedText);
  doc.text(
    'THIS IS A SECURE ELECTRONICALLY GENERATED RECEIPT BY DAMMAM HOME CARE PRO. ALL OPERATIONS LOGGED & VERIFIED.',
    PW / 2, PH - 9,
    { align: 'center' }
  );


  doc.save(`DHS_RECEIPT_${safeId(order.id)}.pdf`);
};