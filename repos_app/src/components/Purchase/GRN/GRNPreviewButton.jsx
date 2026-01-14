// src/components/GRNPreviewButton.js
import React from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const generateFromTemplate = async () => {
  const formUrl = "/GRN_Template_Base.pdf"; // relative to /public
  const existingPdfBytes = await fetch(formUrl).then((res) =>
    res.arrayBuffer()
  );

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 📝 Fill static text fields (you can customize these positions)
  page.drawText("Eco123 Lanka Food Packing Pvt Ltd", {
    x: 40,
    y: height - 95,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText("GRN # : GR2500000280", {
    x: 400,
    y: height - 135,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });

  // Add more fields here based on layout

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url); // Preview in new tab
};

export default function GRNPreviewButton() {
  return <button onClick={generateFromTemplate}>Preview GRN</button>;
}
