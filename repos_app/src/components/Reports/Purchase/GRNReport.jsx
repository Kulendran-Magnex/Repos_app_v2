import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../../API/axios";
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { parseJwt } from "../../../utils/clientDetailsHelper";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const groupByCategory = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.Category_Lv1]) {
      acc[item.Category_Lv1] = {
        categoryName: item.Cat_Name,
        products: [],
      };
    }

    acc[item.Category_Lv1].products.push(item);

    return acc;
  }, {});
};

const groupByGRN = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.GRN_Code]) {
      acc[item.GRN_Code] = {
        GRN_Date: item.GRN_Date,
        Location_ID: item.Location_ID,
        items: [],
      };
    }

    acc[item.GRN_Code].items.push(item);

    return acc;
  }, {});
};

export default function GRNReport() {
  const [products, setProducts] = useState([]);
  const [catList, setCatList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [headData, setHeadData] = useState([]);
  const [tranData, setTranData] = useState([]);
  // default both dates to today (selectors only)
  const todayStr = dayjs().format("YYYY-MM-DD");
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [filtered, setFiltered] = useState(false); // whether user has applied date filter
  const groupedProducts = groupByCategory(products);
  const groupedGRN = groupByGRN(tranData);
  const token = localStorage.getItem("token");
  const clientName = token ? parseJwt(token)?.client_name : null;

  // Fetch data, optionally with date range if filtered=true
  useEffect(() => {
    axios.get("http://localhost:5000/fetchProducts").then((res) => {
      setProducts(res.data);
      setFiltered(res.data);
      console.log("Fetched product:", res.data);
    });

    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/catlvl1");
        setCatList(response.data);
      } catch (err) {
        console.log("Error fetching Category LVL1:", err.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    api
      .get("/api/GRN_Header")
      .then((res) => {
        setHeadData(res.data);
        console.log("Fetched GRN Header:", res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching GRN data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    api
      .get("/api/GRN/Tran_all")
      .then((res) => {
        setTranData(res.data);
        console.log("Fetched GRN Tran:", res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching GRN data:", err);
        setLoading(false);
      });
  }, []);
  const handleSearch = () => {
    setFiltered(true);
  };

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const currency = "LKR";

  // calculate date range from input
  const startDateDisplay = fromDate
    ? dayjs(fromDate).format("DD MMM YYYY")
    : "";
  const endDateDisplay = toDate ? dayjs(toDate).format("DD MMM YYYY") : "";
  console.log("Grouped products:", groupedProducts);

  console.log("Grouped GRN: ", groupedGRN);

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4"); // landscape looks better for reports

    const pageWidth = doc.internal.pageSize.width;

    // Company Name
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(clientName || "Company Name", pageWidth / 2, 15, {
      align: "center",
    });

    // Report Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Product Summary Report", pageWidth / 2, 23, { align: "center" });

    // Date
    doc.setFontSize(10);
    doc.text(
      `Generated: ${dayjs().format("DD MMM YYYY")}`,
      pageWidth - 20,
      15,
      {
        align: "right",
      },
    );

    let rows = [];

    Object.entries(groupedProducts).forEach(([catCode, category]) => {
      // Category Header
      rows.push([
        {
          content: category.categoryName,
          colSpan: 6,
          styles: {
            fillColor: [220, 220, 220],
            textColor: 0,
            fontStyle: "bold",
            halign: "left",
          },
        },
      ]);

      category.products.forEach((product) => {
        rows.push([
          product.Product_ID,
          product.Barcode,
          product.Description,
          product.Cat_Name,
          product.Stock_UM,
          fmt(product.Unit_Cost),
        ]);
      });
    });

    autoTable(doc, {
      startY: 30,

      head: [
        [
          "Product ID",
          "Barcode",
          "Description",
          "Category",
          "UOM",
          "Unit Price (LKR)",
        ],
      ],

      body: rows,

      tableWidth: "auto", // makes table expand full width

      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },

      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        halign: "center",
        fontStyle: "bold",
      },

      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "left" },
        3: { halign: "left" },
        4: { halign: "center" },
        5: { halign: "right" },
      },

      theme: "grid",
    });

    doc.save(`Product_Report_${dayjs().format("YYYYMMDD")}.pdf`);
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "left",
          m: 2,

          flexWrap: "wrap",
        }}
      >
        <Autocomplete
          options={catList}
          getOptionLabel={(option) => option.Cat_Name || ""}
          value={
            catList.find(
              (cat) => cat.Cat_Code === selectedCategory?.Cat_Code,
            ) || null
          }
          onChange={(event, newValue) => {
            setSelectedCategory(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category
                        "
            />
          )}
          sx={{ width: 250 }}
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
          size="small"
        >
          Search
        </Button>
        <Button variant="contained" disabled={loading} size="small">
          Print
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          size="small"
          onClick={downloadPDF}
        >
          Download PDF
        </Button>
      </Box>

      <Paper elevation={3} sx={{ margin: 2, height: "88vh" }}>
        <Box p={2}>
          {/* header section */}
          {/** show title and range when not loading */}
          <Box textAlign="center" mb={2}>
            <Typography variant="h6">{clientName}</Typography>
            <Typography variant="h5">GRN Report</Typography>
            <Typography variant="subtitle2" textAlign="center" sx={{ mb: 2 }}>
              {dayjs(todayStr).format("DD MMM YYYY")}
            </Typography>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#1976d2" }}>
                  <TableRow>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Barcode
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Description
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      UM
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      QTY
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      FOC
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Unit Price
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "white", fontWeight: "bold" }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedGRN).map(([grnCode, grn]) => (
                    <React.Fragment key={grnCode}>
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          sx={{ fontWeight: "bold", background: "#f5f5f5" }}
                        >
                          GRN Number: {grnCode}
                        </TableCell>
                      </TableRow>

                      {grn.items.map((item) => (
                        <TableRow key={grnCode}>
                          <TableCell align="right">{item.Barcode}</TableCell>
                          <TableCell align="right">
                            {item.Description}
                          </TableCell>
                          <TableCell align="right">{item.Product_UM}</TableCell>
                          <TableCell align="right">{item.GRN_Qty}</TableCell>
                          <TableCell align="right">{item.FOC}</TableCell>
                          <TableCell align="right">{item.Unit_Price}</TableCell>
                          <TableCell align="right">
                            {item.Total_Amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </>
  );
}
