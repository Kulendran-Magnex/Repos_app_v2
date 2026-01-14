import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const GRNReport = () => {
  const reportRef = useRef();

  const data = {
    grnNumber: "GRN-2025-001",
    date: "2025-08-01",
    supplier: "BlueLine Supplies Inc.",
    items: [
      {
        name: "Printer Paper",
        quantity: 20,
        unit: "packs",
        description: "A4, 500 sheets",
      },
      {
        name: "Ink Cartridge",
        quantity: 5,
        unit: "pcs",
        description: "Black XL",
      },
      {
        name: "Desk Chair",
        quantity: 2,
        unit: "pcs",
        description: "Ergonomic, blue fabric",
      },
    ],
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`GRN-${data.grnNumber}.pdf`);
  };

  return (
    <div>
      <button onClick={downloadPDF} style={styles.button}>
        Download PDF
      </button>
      <div ref={reportRef} style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Goods Received Note</h1>
        </div>

        <div style={styles.details}>
          <p>
            <strong>GRN No:</strong> {data.grnNumber}
          </p>
          <p>
            <strong>Date:</strong> {data.date}
          </p>
          <p>
            <strong>Supplier:</strong> {data.supplier}
          </p>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.description}</td>
                <td style={styles.td}>{item.quantity}</td>
                <td style={styles.td}>{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.footer}>
          <p>Received by: ______________________</p>
        </div>
      </div>
    </div>
  );
};

// 🔷 Light Blue Themed Styles
const styles = {
  container: {
    width: "210mm",
    minHeight: "297mm",
    padding: "15mm",
    backgroundColor: "#e3ebf1ff", // light blue background
    color: "#000",
    fontFamily: "Arial, sans-serif",
    border: "1px solid #b0d4f1",
    boxSizing: "border-box",
  },
  header: {
    borderBottom: "2px solid #87ceeb",
    paddingBottom: "10px",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#4682b4",
  },
  details: {
    marginBottom: "50px",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    marginTop: "10px",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    paddingTop: "15px",
    paddingBottom: "15px",
    textAlign: "left",
    backgroundColor: "#f0f0f0",
  },
  td: {
    paddingTop: "10px",
    textAlign: "left",
    borderBottom: "1px solid #000",
  },
  footer: {
    marginTop: "50px",
    fontSize: "14px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#4682b4",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default GRNReport;
