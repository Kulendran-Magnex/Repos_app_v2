import dayjs from "dayjs";

const GRNReport = ({ selectGRNCode, seletedGRN, selectedItems }) => {
  return `
<html>
  <head>
    <title>GRN - ${selectGRNCode}</title>
    <style>
      body { background: #f5f5f5; }
      .a4-page {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: white;
        padding: 25mm 20mm;
        box-sizing: border-box;
        box-shadow: 0 0 10px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }
      .header-title {
        font-size: 22px;
        font-weight: bold;
        background: #eaeaea;
        padding: 8px 0;
        text-align: center;
        margin-bottom: 16px;
        border: 1px solid #bbb;
      }
      .location-info {
        margin-bottom: 8px;
      }
      .vendor-section {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .vendor-box, .details-box {
        flex: 1;
        border: 1px solid #333;
        padding: 8px;
        min-height: 70px;
        font-size: 14px;
      }
      .vendor-label {
        background: #eaeaea;
        font-weight: bold;
        padding: 4px 8px;
        border: 1px solid #bbb;
        margin-bottom: -1px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        font-size: 14px;
      }
      th, td {
        border: 1px solid #333;
        padding: 6px 8px;
        text-align: right;
      }
      th {
        background-color: #eee;
        font-weight: bold;
      }
      td.left {
        text-align: left;
      }
      @media print {
        body { background: white; }
        .a4-page { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <div class="a4-page">
      <div class="header-title">GOODS RECEIVED NOTE</div>
      <div class="header-row">
        <div>
          <div class="location-info"><strong>Sample Location</strong></div>
          <div class="location-info">Branch : Branch Name</div>
          <div class="location-info">123456</div>
          <div class="location-info">VAT No:</div>
        </div>
        <div style="text-align: right;">
          <div><strong>Invoice #:</strong> ${
            seletedGRN?.Invoice_No || "-"
          }</div>
          <div><strong>GRN #:</strong> ${selectGRNCode}</div>
          <div><strong>GRN Date:</strong> ${dayjs(seletedGRN?.GRN_Date).format(
            "YYYY-MM-DD"
          )}</div>
        </div>
      </div>
      <div class="vendor-label">Supplier</div>
      <div class="vendor-section">
        <div class="vendor-box">
          ${seletedGRN?.Supplier_Name || "-"}<br>
          ${seletedGRN?.Supplier_Address || ""}<br>
          ${seletedGRN?.Supplier_Phone || ""}
        </div>
        <div class="details-box">
          PO #: ${seletedGRN?.PO_No || "-"}<br>
          PO Date: ${dayjs(seletedGRN?.PO_Date).format("YYYY-MM-DD")}<br>
          Created by: ${seletedGRN?.Created_By || "-"}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Description</th>
            <th>UM</th>
            <th>Qty</th>
            <th>FOC QTY</th>
            <th>Unit Price</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${selectedItems
            .map(
              (item) => `
            <tr>
              <td>${item.Barcode}</td>
              <td class="left">${item.Description}</td>
              <td>${item.Product_UM}</td>
              <td>${parseFloat(item.GRN_Qty).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}</td>
              <td>${parseFloat(item.FOC || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}</td>
              <td>${parseFloat(item.Unit_Price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}</td>
              <td>${parseFloat(item.Total_Amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <script>
      window.onload = () => window.print();
    </script>
  </body>
</html>
`;
};

export default GRNReport;
