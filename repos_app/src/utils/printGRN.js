// src/utils/printGRN.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateFilledGRNPdf(data) {
  const existingPdfBytes = await fetch("/GRN_Template_Clean.pdf").then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  // 🖨️ Print static fields
  page.drawText(data.vendor.name, { x: 50, y: height - 95, size: 10, font });
  page.drawText(data.grnDetails.grnNo, {
    x: 470,
    y: height - 100,
    size: 10,
    font,
  });
  page.drawText(data.grnDetails.grnDate, {
    x: 470,
    y: height - 115,
    size: 10,
    font,
  });
  page.drawText(data.grnDetails.invoice, {
    x: 470,
    y: height - 130,
    size: 10,
    font,
  });

  // 🖨️ Print summary
  page.drawText(data.summary.subTotal.toFixed(2), {
    x: 470,
    y: 150,
    size: 10,
    font,
  });
  page.drawText(data.summary.tax.toFixed(2), {
    x: 470,
    y: 135,
    size: 10,
    font,
  });
  page.drawText(data.summary.total.toFixed(2), {
    x: 470,
    y: 105,
    size: 10,
    font,
  });

  // 🖨️ Print items dynamically
  const startY = 330;
  let y = startY;
  const lineHeight = 15;

  data.items.forEach((item, index) => {
    if (y < 100) return; // avoid printing too low

    page.drawText(item.barcode, { x: 40, y, size: 9, font });
    page.drawText(item.description, { x: 110, y, size: 9, font });
    page.drawText(item.um, { x: 250, y, size: 9, font });
    page.drawText(item.qty.toString(), { x: 300, y, size: 9, font });
    page.drawText(item.focQty.toString(), { x: 350, y, size: 9, font });
    page.drawText(item.unitPrice.toFixed(2), { x: 400, y, size: 9, font });
    page.drawText(item.total.toFixed(2), { x: 470, y, size: 9, font });

    y -= lineHeight;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url); // preview
}
