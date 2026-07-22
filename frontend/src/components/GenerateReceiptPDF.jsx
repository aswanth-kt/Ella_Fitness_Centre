import jsPDF from "jspdf";
import logo from "../assets/logo/logo.png";
import {
  gym_first_name,
  gym_full_name,
  gym_slogan,
  address,
  phone_number,
  whatsapp_number,
  email,
  website_link,
} from "../constants/constants";

// ── Helper: turn an imported image (webpack/vite URL) into a base64
//    dataURL that jsPDF's addImage() can consume ─────────────────
function loadImageAsDataURL(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function GenerateReceiptPDF(receiptData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();   // 210mm
  const ph = doc.internal.pageSize.getHeight();  // 297mm

  // ── Color palette ──────────────────────────────────────────────
  const BLACK     = [20, 20, 24];
  const RED       = [200, 24, 55];
  const WHITE     = [255, 255, 255];
  const PAGE_BG   = [255, 255, 255];
  const LGRAY     = [226, 226, 232];
  const XLGRAY    = [247, 247, 250];
  const MGRAY     = [140, 140, 152];
  const DGRAY     = [70, 70, 80];
  const GREEN     = [22, 163, 116];
  const GREEN_BG  = [232, 250, 244];

  // ── Page background (clean white, no outer black frame) ────────
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pw, ph, "F");

  // ── Card with a soft border only (no heavy frame) ───────────────
  const card = { x: 14, y: 14, w: pw - 28, h: ph - 28 };
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.4);
  doc.roundedRect(card.x, card.y, card.w, card.h, 3, 3, "FD");

  // ══════════════════════ HEADER ══════════════════════════════
  const headerH = 40;

  // thin red top accent line spanning the card
  doc.setFillColor(...RED);
  doc.roundedRect(card.x, card.y, card.w, 3, 1.5, 1.5, "F");
  doc.rect(card.x, card.y, card.w, 1.6, "F");

  // Logo (left)
  try {
    const logoData = await loadImageAsDataURL(logo);
    doc.addImage(logoData, "PNG", card.x + 12, card.y + 10, 20, 20);
  } catch (e) {
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.6);
    doc.circle(card.x + 22, card.y + 20, 9, "S");
  }

  // Gym name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BLACK);
  doc.text(`${gym_first_name || gym_full_name || "D'CORE"}`, card.x + 38, card.y + 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...RED);
  doc.text("FITNESS ZONE", card.x + 38, card.y + 23);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...MGRAY);
  doc.text(`${gym_slogan || "DISCIPLINE  •  DEDICATION  •  DOMINANCE"}`, card.x + 38, card.y + 29);

  // RECEIPT label (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...BLACK);
  doc.text("PAYMENT RECEIPT", card.x + card.w - 14, card.y + 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MGRAY);
  doc.text(`#${receiptData?.invoiceNumber || "—"}`, card.x + card.w - 14, card.y + 24, { align: "right" });

  // header bottom divider
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(card.x + 8, card.y + headerH, card.x + card.w - 8, card.y + headerH);

  // ── small round icon helper ─────────────────────────────────
  function iconCircle(cx, cy, r, fillColor) {
    doc.setFillColor(...fillColor);
    doc.circle(cx, cy, r, "F");
  }

  // ── Invoice meta row (icons) ────────────────────────────────
  let y = card.y + headerH + 16;
  const metaX = card.x + 16;

  // Invoice number icon
  iconCircle(metaX, y - 2, 5.5, RED);
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.5);
  doc.rect(metaX - 2, y - 4.5, 4, 5, "S");
  doc.line(metaX - 1.2, y - 5.2, metaX + 1.2, y - 5.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("Invoice Number", metaX + 10, y - 3.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text(receiptData?.invoiceNumber || "—", metaX + 10, y + 2.5);

  y += 15;
  // Payment date icon
  iconCircle(metaX, y - 2, 5.5, RED);
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.5);
  doc.rect(metaX - 2.2, y - 4.5, 4.4, 4.4, "S");
  doc.line(metaX - 2.2, y - 3.2, metaX + 2.2, y - 3.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("Payment Date", metaX + 10, y - 3.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text(receiptData?.paymentDate || "—", metaX + 10, y + 2.5);

  // Vertical divider between meta block and PAID badge
  const dividerX = card.x + card.w * 0.56;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(dividerX, card.y + headerH + 6, dividerX, card.y + headerH + 34);

  // ── PAID badge (right) ──────────────────────────────────────
  const badgeX = dividerX + 8;
  const badgeY = card.y + headerH + 8;
  const badgeW = card.x + card.w - 12 - badgeX;
  doc.setFillColor(...GREEN_BG);
  doc.roundedRect(badgeX, badgeY, badgeW, 22, 2.5, 2.5, "F");

  const chX = badgeX + 12;
  const chY = badgeY + 11;
  doc.setFillColor(...GREEN);
  doc.circle(chX, chY, 5.2, "F");
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.7);
  doc.line(chX - 2.4, chY, chX - 0.6, chY + 2);
  doc.line(chX - 0.6, chY + 2, chX + 2.6, chY - 2.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...GREEN);
  doc.text("PAID", chX + 10, chY - 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...DGRAY);
  doc.text("Payment completed successfully", chX + 10, chY + 4);

  // ── Divider ───────────────────────────────────────────────────
  y = card.y + headerH + 42;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(card.x + 8, y, card.x + card.w - 8, y);

  // ── Bill To ───────────────────────────────────────────────────
  y += 12;
  iconCircle(metaX, y - 2.5, 5.5, RED);
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.6);
  doc.circle(metaX, y - 4.2, 1.4, "S");
  doc.line(metaX - 2.4, y - 0.8, metaX + 2.4, y - 0.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...RED);
  doc.text("BILLED TO", metaX + 10, y - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BLACK);
  doc.text(receiptData?.name || "—", metaX + 10, y + 2.5);

  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MGRAY);
  doc.text(`Membership Plan: ${receiptData?.membershipPlan || "—"}`, metaX + 10, y);

  // ── Table header ──────────────────────────────────────────────
  y += 12;
  doc.setFillColor(...XLGRAY);
  doc.rect(card.x + 8, y, card.w - 16, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...RED);
  doc.text("DESCRIPTION", card.x + 14, y + 6.5);
  doc.text("DETAILS", card.x + card.w - 14, y + 6.5, { align: "right" });

  // ── Table rows ────────────────────────────────────────────────
  const tableRows = [
    ["Membership Plan", receiptData?.membershipPlan],
    ["Plan Start Date", receiptData?.startDate],
    ["Plan End Date", receiptData?.endDate],
    ["Payment Method", receiptData?.paymentMethod],
    ["Payment Date", receiptData?.paymentDate],
  ];

  y += 10;
  tableRows.forEach(([label, value], i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DGRAY);
    doc.text(label, card.x + 14, y + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BLACK);
    doc.text(value || "—", card.x + card.w - 14, y + 6.5, { align: "right" });

    if (i < tableRows.length - 1) {
      doc.setDrawColor(...LGRAY);
      doc.setLineWidth(0.15);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(card.x + 8, y + 11, card.x + card.w - 8, y + 11);
      doc.setLineDashPattern([], 0);
    }

    y += 12;
  });

  // ── Total box ─────────────────────────────────────────────────
  y += 6;
  doc.setFillColor(...XLGRAY);
  doc.roundedRect(card.x + 8, y, card.w - 16, 26, 2, 2, "F");
  doc.setFillColor(...RED);
  doc.rect(card.x + 8, y, 1.6, 26, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BLACK);
  doc.text("TOTAL AMOUNT PAID", card.x + 16, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text(`via ${receiptData?.paymentMethod || "—"}`, card.x + 16, y + 18);

  const totalDivX = card.x + card.w - 78;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(totalDivX, y + 5, totalDivX, y + 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...RED);
  // NOTE: jsPDF's built-in "helvetica" font has no ₹ glyph — using the unicode
  // symbol renders as a broken/garbled character. "Rs." always renders correctly.
  const rawAmount = (receiptData?.amount || "—").toString().replace("₹", "").trim();
  doc.text(`Rs. ${rawAmount}`, card.x + card.w - 16, y + 14, { align: "right" });

  if (receiptData?.amountInWords) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MGRAY);
    doc.text(`(${receiptData.amountInWords})`, card.x + card.w - 16, y + 20, { align: "right" });
  }

  // ── Dumbbell divider icon ───────────────────────────────────
  y += 32;
  const dx = pw / 2;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(dx - 40, y, dx - 8, y);
  doc.line(dx + 8, y, dx + 40, y);
  doc.setFillColor(...RED);
  doc.rect(dx - 1, y - 3, 2, 6, "F");
  doc.rect(dx - 6, y - 4.5, 3, 9, "F");
  doc.rect(dx + 3, y - 4.5, 3, 9, "F");

  // ── Thank you note ────────────────────────────────────────────
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...RED);
  doc.text("Thank you for your membership!", pw / 2, y, { align: "center" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MGRAY);
  doc.text("This is a computer-generated receipt and does not require a physical signature.", pw / 2, y, { align: "center" });

  y += 5;
  doc.text(`Membership active from ${receiptData?.startDate || "—"} to ${receiptData?.endDate || "—"}.`, pw / 2, y, { align: "center" });

  // ── Footer bar ────────────────────────────────────────────────
  const fy = card.y + card.h - 16;
  doc.setDrawColor(...LGRAY);
  doc.setLineWidth(0.3);
  doc.line(card.x + 8, fy - 6, card.x + card.w - 8, fy - 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...BLACK);
  doc.text(gym_full_name || "D'Core Fitness Zone", pw / 2, fy, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...DGRAY);
  const footerLine1 = [
    phone_number ? `Ph: ${phone_number}` : null,
    whatsapp_number ? `WhatsApp: ${whatsapp_number}` : null,
    email || null,
  ].filter(Boolean).join("   |   ");
  doc.text(footerLine1, pw / 2, fy + 5, { align: "center" });

  const footerLine2 = [address || null, website_link || null].filter(Boolean).join("   |   ");
  doc.setTextColor(...MGRAY);
  doc.text(footerLine2, pw / 2, fy + 10, { align: "center" });

  doc.save(`Dcore-receipt-${receiptData?.invoiceNumber || "invoice"}.pdf`);
}