import React from "react";
import { generateFilledGRNPdf } from "../../../utils/printGRN";

export default function PrintButton() {
  const handleClick = () => {
    const data = {
      vendor: {
        name: "Eco Lanka Food Packing Pvt Ltd",
      },
      grnDetails: {
        grnNo: "GR2500000280",
        grnDate: "7/29/2025",
        invoice: "013377",
      },
      items: [
        {
          barcode: "2000000001586",
          description: "PP Lunch Box",
          um: "PCS",
          qty: 5000,
          focQty: 0,
          unitPrice: 10.0,
          total: 50000.0,
        },
        {
          barcode: "2000000000503",
          description: "MicroWave 750ml",
          um: "PCS",
          qty: 3000,
          focQty: 0,
          unitPrice: 30.0,
          total: 90000.0,
        },
        {
          barcode: "2000000000534",
          description: "80ml with Lid",
          um: "PCS",
          qty: 5000,
          focQty: 0,
          unitPrice: 5.5,
          total: 27500.0,
        },
      ],
      summary: {
        subTotal: 167500.0,
        tax: 0.0,
        total: 167500.0,
      },
    };

    generateFilledGRNPdf(data);
  };

  return <button onClick={handleClick}>Preview GRN PDF</button>;
}
