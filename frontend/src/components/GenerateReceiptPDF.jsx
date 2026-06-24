import jsPDF from "jspdf";
import { email, gym_first_name, gym_slogan, website_link, whatsapp_number } from "../constants/constants";

export function GenerateReceiptPDF(receiptData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();   // 210mm
  const ph = doc.internal.pageSize.getHeight();  // 297mm

  // ── Color palette ──────────────────────────────────────────────
  const BLACK     = [10, 10, 10];
  const RED       = [225, 29, 72];
  const RED_DARK  = [159, 18, 57];
  const WHITE     = [255, 255, 255];
  const OFFWHITE  = [250, 250, 252];
  const LGRAY     = [230, 230, 235];
  const MGRAY     = [160, 160, 170];
  const DGRAY     = [80, 80, 90];
  const GREEN     = [16, 185, 129];
  const GREEN_BG  = [236, 253, 245];

  // ── Page background ────────────────────────────────────────────
  doc.setFillColor(...OFFWHITE);
  doc.rect(0, 0, pw, ph, "F");

  // ── Left red sidebar accent ────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, 0, 6, ph, "F");

  // ── White card ────────────────────────────────────────────────
  const card = { x: 18, y: 18, w: pw - 36, h: ph - 36 };
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.roundedRect(card.x, card.y, card.w, card.h, 3, 3, "FD");

  // ── Header band ───────────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.roundedRect(card.x, card.y, card.w, 28, 3, 3, "F");
  // flat bottom corners
  doc.rect(card.x, card.y + 20, card.w, 8, "F");

  // Gym name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text(`${gym_first_name}`, card.x + 14, card.y + 12);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 180, 195);
  doc.text(`${gym_slogan}`, card.x + 14, card.y + 19);

  // RECEIPT label right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("PAYMENT RECEIPT", card.x + card.w - 14, card.y + 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 180, 195);
  doc.text(`#${receiptData?.invoiceNumber || "—"}`, card.x + card.w - 14, card.y + 19, { align: "right" });

  // ── PAID stamp ────────────────────────────────────────────────
  const stampX = card.x + card.w - 52;
  const stampY = card.y + 34;
  doc.setFillColor(...GREEN_BG);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(stampX, stampY, 34, 11, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREEN);
  doc.text("PAID", stampX + 17, stampY + 7.5, { align: "center" });

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(stampX + 5, stampY + 6, stampX + 7.5, stampY + 8.5);   // short stroke
  doc.line(stampX + 7.5, stampY + 8.5, stampX + 12, stampY + 4);  // long stroke

  // ── Invoice meta block ────────────────────────────────────────
  let y = card.y + 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("Invoice Number", card.x + 14, y);
  doc.text("Payment Date", card.x + 14, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  doc.text(receiptData?.invoiceNumber || "—", card.x + 55, y);
  doc.text(receiptData?.paymentDate || "—", card.x + 55, y + 7);

  // ── Divider ───────────────────────────────────────────────────
  y = card.y + 60;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(card.x + 8, y, card.x + card.w - 8, y);

  // ── Bill To ───────────────────────────────────────────────────
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...RED);
  doc.text("BILLED TO", card.x + 14, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text(receiptData?.name || "—", card.x + 14, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MGRAY);
  doc.text(`Membership Plan: ${receiptData?.membershipPlan || "—"}`, card.x + 14, y);

  // ── Table header ──────────────────────────────────────────────
  y += 12;
  doc.setFillColor(245, 245, 248);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.2);
  doc.rect(card.x + 8, y, card.w - 16, 10, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...DGRAY);
  doc.text("DESCRIPTION", card.x + 14, y + 6.5);
  doc.text("DETAILS", card.x + card.w - 14, y + 6.5, { align: "right" });

  // ── Table rows ────────────────────────────────────────────────
  const tableRows = [
    ["Membership Plan",   receiptData?.membershipPlan, false],
    ["Plan Start Date",   receiptData?.startDate,      false],
    ["Plan End Date",     receiptData?.endDate,        false],
    ["Payment Method",    receiptData?.paymentMethod,  false],
    ["Payment Date",      receiptData?.paymentDate,    false],
  ];

  y += 10;
  tableRows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(252, 252, 254);
      doc.rect(card.x + 8, y, card.w - 16, 10, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...DGRAY);
    doc.text(label, card.x + 14, y + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BLACK);
    doc.text(value || "—", card.x + card.w - 14, y + 6.5, { align: "right" });

    doc.setDrawColor(...LGRAY);
    doc.setLineWidth(0.1);
    doc.line(card.x + 8, y + 10, card.x + card.w - 8, y + 10);

    y += 10;
  });

  // ── Total box ─────────────────────────────────────────────────
  y += 6;
  doc.setFillColor(...RED);
  doc.roundedRect(card.x + 8, y, card.w - 16, 18, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 180, 195);
  doc.text("TOTAL AMOUNT PAID", card.x + 14, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  const rawAmount = (receiptData?.amount || "—").toString().replace("₹", "").trim();
  doc.text(`Rs. ${rawAmount}`, card.x + card.w - 14, y + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 180, 195);
  doc.text(`via ${receiptData?.paymentMethod || "—"}`, card.x + 14, y + 14);

  // ── Thank you note ────────────────────────────────────────────
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...RED);
  doc.text("Thank you for your membership!", pw / 2, y, { align: "center" });

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("This is a computer-generated receipt and does not require a physical signature.", pw / 2, y, { align: "center" });

  y += 5;
  doc.text(`Membership active from ${receiptData?.startDate || "—"} to ${receiptData?.endDate || "—"}.`, pw / 2, y, { align: "center" });

  // ── Footer bar ────────────────────────────────────────────────
  const fy = card.y + card.h - 14;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(card.x + 8, fy - 2, card.x + card.w - 8, fy - 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MGRAY);
  doc.text(`${gym_first_name}  ·  ${email}  ·  ${website_link}  ·  ${whatsapp_number}`, pw / 2, fy + 4, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, pw / 2, fy + 9, { align: "center" });

  // ── Red bottom accent ──────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, ph - 6, pw, 6, "F");

  doc.save(`Dcore-receipt-${receiptData?.invoiceNumber || "invoice"}.pdf`);
}