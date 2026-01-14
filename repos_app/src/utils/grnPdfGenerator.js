// src/utils/grnPdfGenerator.js
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.default?.vfs || pdfFonts.vfs;

export function generateGRNPdf() {
  const data = {
    vendor: {
      name: "Eco Lanka Food Packing Pvt Ltd",
      address: "KTI Buliding, Kandy,Industrial Park ,pallekelle",
      phone: "081 2420295",
    },
    grnDetails: {
      invoice: "013377",
      grnNo: "GR2500000280",
      grnDate: "7/29/2025",
      poNo: "—",
      poDate: "6/4/2025",
      createdBy: "admin",
    },
    items: [
      {
        barcode: "2000000001586",
        description: "PP Lunch Box",
        um: "PCS",
        qty: 5000,
        unitPrice: 10.0,
        total: 50000.0,
      },
      {
        barcode: "2000000000503",
        description: "MicroWave 750ml",
        um: "PCS",
        qty: 3000,
        unitPrice: 30.0,
        total: 90000.0,
      },
      {
        barcode: "2000000000534",
        description: "80ml with Lid",
        um: "PCS",
        qty: 5000,
        unitPrice: 5.5,
        total: 27500.0,
      },
    ],
    summary: {
      subTotal: 167500.0,
      tax: 0,
      otherCharges: 0,
      total: 167500.0,
    },
  };

  const { vendor, grnDetails, items, summary } = data;

  const docDefinition = {
    content: [
      { text: "GOODS RECEIVED NOTE", style: "header", alignment: "center" },
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: `VENDOR\n${vendor.name}\n${vendor.address}\n${vendor.phone}`,
                style: "vendor",
              },
              {
                text: `Invoice #: ${grnDetails.invoice}`,
                margin: [0, 10, 0, 10],
              },
            ],
          },
          {
            width: "auto",
            stack: [
              { text: `GRN #: ${grnDetails.grnNo}` },
              { text: `GRN Date: ${grnDetails.grnDate}` },
              { text: `PO #: ${grnDetails.poNo}` },
              { text: `PO Date: ${grnDetails.poDate}` },
            ],
          },
        ],
        columnGap: 20,
        margin: [0, 10, 0, 10],
      },
      {
        style: "tableExample",
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Barcode", style: "tableHeader" },
              { text: "Description", style: "tableHeader" },
              { text: "UM", style: "tableHeader" },
              { text: "Qty", style: "tableHeader" },
              { text: "Unit Price", style: "tableHeader" },
              { text: "Total", style: "tableHeader" },
            ],
            ...items.map((item) => [
              item.barcode,
              item.description,
              item.um,
              item.qty,
              item.unitPrice.toFixed(2),
              item.total.toFixed(2),
            ]),
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {},
          {
            width: "auto",
            table: {
              body: [
                ["Sub Total", summary.subTotal.toFixed(2)],
                ["Tax", summary.tax.toFixed(2)],
                ["Other Charges", summary.otherCharges.toFixed(2)],
                ["Total", summary.total.toFixed(2)],
              ],
            },
            layout: "noBorders",
            margin: [0, 0, 0, 10],
          },
        ],
      },
      { text: `Printed by: ${grnDetails.createdBy}`, style: "footer" },
      {
        text: `Printed on: ${new Date().toLocaleDateString()}`,
        style: "footer",
      },
    ],
    styles: {
      header: { fontSize: 16, bold: true, border: "1px" },
      vendor: { fontSize: 10 },
      tableHeader: { bold: true, fillColor: "#eeeeee" },
      footer: { fontSize: 9, margin: [0, 5, 0, 0] },
    },
  };
  pdfMake.createPdf(docDefinition).open(); // opens PDF in a new tab for preview
  //   pdfMake.createPdf(docDefinition).download(`GRN-${grnDetails.grnNo}.pdf`);
}
