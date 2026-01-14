import React from "react";
import { generateGRNPdf } from "../../../utils/grnPdfGenerator";
import GRNPreviewButton from "./GRNPreviewButton";
import PrintButton from "./PrintButton";

const GeneratePDF = () => {
  return (
    <div>
      <h1>Goods Received Note</h1>
      <button onClick={generateGRNPdf}>Print</button>
    </div>
  );
};

export default GeneratePDF;
