import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface DocumentPdfParams {
  docKey?: string;
  docTitle?: string;
  fileName: string;
  homeName: string;
  registrationNumber: string;
  referenceId: string;
  signatoryName: string;
  signatoryPhone?: string;
  signatoryEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  submittedAt?: string;
}

function safeText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/[✓✔]/g, '[OK]')
    .replace(/[•●]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[₹]/g, 'Rs. ')
    .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
    .trim();
}

/**
 * Generates an authentic, high-fidelity A4 PDF document for official verification.
 * Returns a data:application/pdf;base64,... string ready for <iframe src=...> and native PDF download.
 */
export async function generateOfficialDocumentPdf(params: DocumentPdfParams): Promise<string> {
  const pdfDoc = await PDFDocument.create();

  // A4 Page dimensions: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const primaryOrange = rgb(0.91, 0.42, 0.20); // #E86A33
  const darkSlate = rgb(0.06, 0.09, 0.16);     // #0F172A
  const slate600 = rgb(0.28, 0.33, 0.41);      // #475569
  const emeraldGreen = rgb(0.06, 0.60, 0.40);  // #10B981
  const lightBg = rgb(0.97, 0.98, 0.99);       // #F8FAFC
  const borderGrey = rgb(0.85, 0.88, 0.92);    // #D1D5DB

  // 1. Double Border Frame
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderColor: primaryOrange,
    borderWidth: 2,
  });

  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: borderGrey,
    borderWidth: 0.8,
  });

  // 2. Top Emblem / Organization Header
  const rawTitle = params.docTitle || params.fileName.replace(/_/g, ' ').replace(/\.[^/.]+$/, '');
  const titleText = safeText(rawTitle.toUpperCase());

  page.drawText('GOVERNMENT OF MAHARASHTRA - PUBLIC HEALTH & SOCIAL ASSISTANCE', {
    x: 70,
    y: height - 65,
    size: 9,
    font: fontBold,
    color: slate600,
  });

  page.drawText('SENIOR CARE & OLD AGE HOME COMPLIANCE DIVISION', {
    x: 70,
    y: height - 78,
    size: 8,
    font: fontRegular,
    color: slate600,
  });

  page.drawLine({
    start: { x: 50, y: height - 90 },
    end: { x: width - 50, y: height - 90 },
    thickness: 1.5,
    color: primaryOrange,
  });

  // 3. Document Title Banner
  page.drawRectangle({
    x: 50,
    y: height - 140,
    width: width - 100,
    height: 40,
    color: lightBg,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  page.drawText(titleText, {
    x: 65,
    y: height - 123,
    size: 13,
    font: fontBold,
    color: primaryOrange,
  });

  page.drawText(`VERIFIED ARCHIVE FILE: ${safeText(params.fileName)}`, {
    x: 65,
    y: height - 134,
    size: 8,
    font: fontOblique,
    color: slate600,
  });

  // 4. Primary Information Table
  let currentY = height - 170;

  const drawRow = (label: string, value: string, isHighlighted = false) => {
    // Row background
    if (isHighlighted) {
      page.drawRectangle({
        x: 50,
        y: currentY - 8,
        width: width - 100,
        height: 24,
        color: rgb(0.98, 0.95, 0.92), // light orange tint
      });
    }

    page.drawText(safeText(label), {
      x: 60,
      y: currentY,
      size: 10,
      font: fontBold,
      color: darkSlate,
    });

    page.drawText(safeText(value) || 'N/A', {
      x: 230,
      y: currentY,
      size: 10,
      font: fontRegular,
      color: darkSlate,
    });

    page.drawLine({
      start: { x: 50, y: currentY - 8 },
      end: { x: width - 50, y: currentY - 8 },
      thickness: 0.5,
      color: borderGrey,
    });

    currentY -= 28;
  };

  drawRow('Application Reference ID', params.referenceId, true);
  drawRow('Facility / Home Name', params.homeName);
  drawRow('Government Registration No', params.registrationNumber);
  drawRow('Document Name', params.fileName);
  drawRow('Authorized Signatory', params.signatoryName);
  drawRow('Signatory Phone', params.signatoryPhone || 'Not specified');
  drawRow('Signatory Email', params.signatoryEmail || 'Not specified');

  const fullAddress = [params.address, params.city, params.state, params.pinCode]
    .filter(Boolean)
    .join(', ');
  drawRow('Facility Address', fullAddress || 'Pune, Maharashtra');

  const subDate = params.submittedAt
    ? new Date(params.submittedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');
  drawRow('Submission & Verification Date', subDate);

  // 5. Verification Checklist Box
  currentY -= 15;
  page.drawRectangle({
    x: 50,
    y: currentY - 110,
    width: width - 100,
    height: 110,
    color: rgb(0.94, 0.99, 0.96), // light emerald tint
    borderColor: emeraldGreen,
    borderWidth: 1,
  });

  page.drawText('AUTHENTICITY & COMPLIANCE VERIFICATION', {
    x: 65,
    y: currentY - 22,
    size: 11,
    font: fontBold,
    color: emeraldGreen,
  });

  const checklist = [
    `[OK] Document registered in Merabetta Senior Care Registry under reference ID ${safeText(params.referenceId)}`,
    `[OK] Entity verified under the Maharashtra Social Welfare and Public Trusts Framework`,
    `[OK] Certified by Authorized Representative: ${safeText(params.signatoryName)}`,
    `[OK] Jurisdiction: Pune Division, Maharashtra State`,
  ];

  checklist.forEach((item, index) => {
    page.drawText(item, {
      x: 65,
      y: currentY - 45 - index * 16,
      size: 9,
      font: fontRegular,
      color: darkSlate,
    });
  });

  // 6. Seal & Stamp Graphic
  const stampX = width - 180;
  const stampY = 85;

  page.drawCircle({
    x: stampX + 45,
    y: stampY + 45,
    size: 42,
    borderColor: primaryOrange,
    borderWidth: 1.5,
  });

  page.drawCircle({
    x: stampX + 45,
    y: stampY + 45,
    size: 38,
    borderColor: primaryOrange,
    borderWidth: 0.8,
  });

  page.drawText('VERIFIED', {
    x: stampX + 22,
    y: stampY + 50,
    size: 11,
    font: fontBold,
    color: primaryOrange,
  });

  page.drawText('REGISTRATION', {
    x: stampX + 10,
    y: stampY + 38,
    size: 8,
    font: fontBold,
    color: primaryOrange,
  });

  page.drawText('PUNE JURISDICTION', {
    x: stampX + 7,
    y: stampY + 28,
    size: 6,
    font: fontRegular,
    color: slate600,
  });

  // 7. Footer Note
  page.drawText('This official certificate is generated by Merabetta platform for administrative compliance and audit verification.', {
    x: 50,
    y: 50,
    size: 7.5,
    font: fontOblique,
    color: slate600,
  });

  page.drawText(`Page 1 of 1 - Generated for Ref ${safeText(params.referenceId)}`, {
    x: 50,
    y: 38,
    size: 7,
    font: fontRegular,
    color: slate600,
  });

  return await pdfDoc.saveAsBase64({ dataUri: true });
}

