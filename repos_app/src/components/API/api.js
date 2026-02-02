import axios from "axios";
import api from "./axios";

const PackingMaster_URL = "http://localhost:5000/api/packingMaster";
const BrandMaster_URL = "http://localhost:5000/api/brandMaster";
const TaxMaster_URL = "http://localhost:5000/api/taxMaster";
const TaxGroup_URL = "http://localhost:5000/api/taxGroup";
const CreditCardMaster_URL = "http://localhost:5000/api/cardMaster";
const CurrencyMaster_URL = "http://localhost:5000/api/currencyMaster";
const VendorMaster_URL = "http://localhost:5000/api/vendorMaster";
const SupplierMaster_URL = "http://localhost:5000/api/supplierMaster";
const LocationMastrer_URL = "http://localhost:5000/api/locationInfo";
const Material_Request_URL = "http://localhost:5000/api/mr_Tran";
const Purchase_Order_URL = "/api/purchaseOrder";
const GRN_URL = "/api/GRN";
const BO_Tran_URL = "/api/bo_tran";
const PurchaseReturn_URL = "http://localhost:5000/api/purchaseReturn";
const Adjustment_URL = "http://localhost:5000/api/adjustment";
const Transfer_URL = "/api/transfer";
const Customer_URL = "http://localhost:5000/api/customers";
const Invoice_URL = "http://localhost:5000/api/invoice";

export const fetchPackingMaster = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/packingMaster");
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addPackingMaster = async (pack_id, pack_description) => {
  try {
    const response = await axios.post(PackingMaster_URL, {
      pack_id,
      pack_description,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to add data");
  }
};

export const updatePackingMaster = async (id, pack_description) => {
  try {
    const response = await axios.put(`${PackingMaster_URL}/${id}`, {
      pack_description,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update data: ${error.message} `);
  }
};

export const deletePackingMaster = async (id) => {
  try {
    const response = await axios.delete(`${PackingMaster_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data: ${error.message}`);
  }
};

///////////////Brand Master //////////////////////////////////////
export const fetchBrandMaster = async () => {
  try {
    const response = await axios.get(BrandMaster_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addBrandMaster = async (brandCode, brandName) => {
  try {
    const response = await axios.post(BrandMaster_URL, {
      brandCode,
      brandName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data : ${error.message}`);
  }
};

export const updateBrandMaster = async (id, brandName) => {
  try {
    const response = await axios.put(`${BrandMaster_URL}/${id}`, {
      brandName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update data: ${error.message}`);
  }
};

export const deleteBrandMaster = async (id) => {
  try {
    const response = await axios.delete(`${BrandMaster_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data: ${error.message}`);
  }
};

////////////////////////Tax Master //////////////////////////////////////
export const fetchTaxMaster = async () => {
  try {
    const response = await axios.get(TaxMaster_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addTaxMaster = async (taxName, taxRate, formula) => {
  try {
    const response = await axios.post(TaxMaster_URL, {
      taxName,
      taxRate,
      formula,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

export const updateTaxMaster = async (tCode, taxName, taxRate, formula) => {
  try {
    const response = await axios.put(`${TaxMaster_URL}/${tCode}`, {
      taxName,
      taxRate,
      formula,
    });
    return response.data;
  } catch (error) {
    throw new Error(error, "Failed to update data");
  }
};

export const deleteTaxMaster = async (tCode) => {
  try {
    const response = await axios.delete(`${TaxMaster_URL}/${tCode}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data: ${error.message}`);
  }
};

/////////////////////////Tax Group /////////////////////////////////////
export const fetchTaxGroup = async () => {
  try {
    const response = await axios.get(TaxGroup_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addTaxGroup = async (taxGroupName, taxCodes) => {
  try {
    const response = await axios.post(TaxGroup_URL, {
      taxCodes,
      taxGroupName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

export const updateTaxGroup = async (taxCode, tax_group_code, taxGroupName) => {
  try {
    const response = await axios.put(`${TaxGroup_URL}/${tax_group_code}`, {
      taxCode,
      taxGroupName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update data: ${error.message}`);
  }
};

export const deleteTaxGroup = async (tCode) => {
  try {
    const response = await axios.delete(`${TaxGroup_URL}/${tCode}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data: ${error.message}`);
  }
};

////////////////////////////CreditCard Master /////////////////////////////////
export const fetchCreditCardMaster = async () => {
  try {
    const response = await axios.get(CreditCardMaster_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addCreditCardMaster = async (ccName) => {
  try {
    const response = await axios.post(CreditCardMaster_URL, {
      ccName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

export const updateCreditCardMaster = async (id, ccName) => {
  try {
    const response = await axios.put(`${CreditCardMaster_URL}/${id}`, {
      ccName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update data: ${error.message}`);
  }
};

export const deleteCreditCardMaster = async (id) => {
  try {
    const response = await axios.delete(`${CreditCardMaster_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data : ${error.message}`);
  }
};

//////////////////////////Currency Master ///////////////////////////////
export const fetchCurrencyMaster = async () => {
  try {
    const response = await axios.get(CurrencyMaster_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addCurrencyMaster = async (currencyRate, currencyName) => {
  try {
    const response = await axios.post(CurrencyMaster_URL, {
      currencyRate,
      currencyName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

export const updateCurrencyMaster = async (id, currencyRate, currencyName) => {
  try {
    const response = await axios.put(`${CurrencyMaster_URL}/${id}`, {
      currencyRate,
      currencyName,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update data: ${error.message}`);
  }
};

export const deleteCurrencyMaster = async (id) => {
  try {
    const response = await axios.delete(`${CurrencyMaster_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data: ${error.message}`);
  }
};

///////////////////////////Supplier Master ////////////////////////////////

export const fetchSupplierMaster = async () => {
  try {
    const response = await axios.get(SupplierMaster_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const fetchSupplierList = async () => {
  try {
    const response = await axios.get(`${SupplierMaster_URL}List`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const getCurrentSupplier = async (id) => {
  try {
    const response = await axios.get(`${SupplierMaster_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};
export const addSupplierMaster = async (SupplierData) => {
  try {
    const response = await axios.post(SupplierMaster_URL, SupplierData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

export const updateSupplierMaster = async (id, SupplierData) => {
  try {
    const response = await axios.put(
      `${SupplierMaster_URL}/${id}`,
      SupplierData,
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update data: ${error.message}`);
  }
};

export const deleteSupplierMaster = async (id) => {
  try {
    const response = await axios.delete(`${SupplierMaster_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete data: ${error.message}`);
  }
};

////////////////////////Location Master /////////////////////////////////

export const fetchLocationMaster = async () => {
  try {
    const response = await axios.get(LocationMastrer_URL);
    return response.data;
  } catch (error) {
    console.error(`Error fetching Location Master: ${error.message}`);
  }
};

///////////////////////////Matrerial Request /////////////////////////////

export const fetchMRList = async () => {
  try {
    const response = await axios.get(Material_Request_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addMaterialRequest = async (payload) => {
  try {
    const response = await axios.post(Material_Request_URL, payload);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add MR data: ${error.message}`);
  }
};

export const updateMaterialRequest = async (id, payload) => {
  try {
    const response = await axios.put(`${Material_Request_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update MR data:  ${error.message}`);
  }
};

export const closeMaterialRequest = async (mrCodes, poCode) => {
  try {
    const response = await axios.post(`${Material_Request_URL}_Close`, {
      mrCodes, // this will be sent as { mrCodes: [...] }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to close MR: ${error.message}`);
  }
};

/////////////////////////Purchase Order /////////////////////////////////////////////////

export const addPurchaseOrder01 = async (payload) => {
  try {
    const response = await api.post(Purchase_Order_URL, payload);
    return response.data;
  } catch (error) {
    throw new Error(`Failed add data: ${error.message}`); // Ensure error message is clear
  }
};

export const addPurchaseOrder = async (payload) => {
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const po_header_data = payload.poHeaderData;
  const total_tax = payload.taxSum;
  const total_sum = payload.totalSum;
  // Build the safe data object to send
  const dataToSend = {
    product_list,
    po_header_data,
    total_tax,
    total_sum,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await api.post(Purchase_Order_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

export const updatePurchaseOrder = async (id, payload) => {
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const po_header_data = payload.poHeaderData;
  const total_tax = payload.totalTax;
  const total_sum = payload.totalAmount;
  // Build the safe data object to send
  const dataToSend = {
    product_list,
    po_header_data,
    total_tax,
    total_sum,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await api.put(`${Purchase_Order_URL}/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
};

///////////////////////////////////////GRN//////////////////////////////////////////

export const fetchGRNHeaderbyID = async (id) => {
  try {
    const response = await api.get(`${GRN_URL}/Header/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const fetchGRNTranbyID = async (id) => {
  try {
    const response = await api.get(`${GRN_URL}/Tran/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const addGRN = async (payload) => {
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const grnHeadertData = payload.grnHeadertData;
  const total_tax = payload.taxSum;
  const total_sum = payload.totalSum;
  const poCode_list = payload.addedPOCodes;
  // Build the safe data object to send
  const dataToSend = {
    product_list,
    grnHeadertData,
    total_tax,
    total_sum,
    poCode_list,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await api.post(GRN_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const editGRN = async (GRN_Code, payload) => {
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const grnHeaderData = payload.grnHeaderData;
  const total_tax = payload.taxSum;
  const total_sum = payload.totalSum;
  const poCode_list = payload.addedPOCodes;
  // Build the safe data object to send
  const dataToSend = {
    product_list,
    grnHeaderData,
    total_tax,
    total_sum,
    poCode_list,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await api.put(`${GRN_URL}/${GRN_Code}`, dataToSend);

    return response.data;
  } catch (error) {
    throw new Error(`Failed to edit data: ${error.message}`);
  }
};

/////////////////////////////////////BO_Tran///////////////////////////////////////////////////////////

export const insertBO_Tran = async (id) => {
  try {
    const response = await api.post(`${BO_Tran_URL}withGRN/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to insert BO data: ${error.message}`);
  }
};

export const insertBO_Tran_PR = async (id) => {
  try {
    const response = await api.post(`${BO_Tran_URL}withPR/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to insert BO data: ${error.message}`);
  }
};

export const insertBO_Tran_Adjustment = async (id) => {
  try {
    const response = await api.post(`${BO_Tran_URL}withAdjustment/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to insert BO data: ${error.message}`);
  }
};

export const insertBO_Tran_Transfer = async (id) => {
  try {
    const response = await api.post(`${BO_Tran_URL}withTransfer/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to insert BO data: ${error.message}`);
  }
};

//////////////////////////////////////////////////////////////////Purchase Return //////////////////////////////////////////////////////
export const addPurchaseReturn = async (payload) => {
  console.log("Payload in addPurchaseReturn:", payload);
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const prHeaderData = payload.prHeaderData;
  const total_tax = payload.taxSum;
  const total_sum = payload.totalSum;

  // Build the safe data object to send
  const dataToSend = {
    product_list,
    prHeaderData,
    total_tax,
    total_sum,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await axios.post(PurchaseReturn_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const editPurchaseReturn = async (PR_Code, payload) => {
  console.log("entered to editPR");
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const prHeaderData = payload.prHeaderData;
  const total_tax = payload.taxSum;
  const total_sum = payload.totalSum;
  const grnCode_list = payload.addedGRNCodes;
  // Build the safe data object to send
  const dataToSend = {
    product_list,
    prHeaderData,
    total_tax,
    total_sum,
    grnCode_list,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await axios.put(
      `${PurchaseReturn_URL}/${PR_Code}`,
      dataToSend,
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to edit data: ${error.message}`);
  }
};

/////////////////////////////////////Adjustment///////////////////////////////////////////////////////////

export const addAdjustment = async (payload) => {
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const adjHeaderData = payload.adjHeaderData;

  // Build the safe data object to send
  const dataToSend = {
    product_list,
    adjHeaderData,

    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await axios.post(Adjustment_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const editAdjustment = async (adj_Code, payload) => {
  console.log("entered to editPR");
  // Map original variable names to internal ones
  // const product_list = payload.productList;
  // const adjHeaderData = payload.adjHeaderData;

  // Build the safe data object to send
  // const dataToSend = {
  //   product_list,
  //   prHeaderData,
  //   total_tax,
  //   total_sum,
  //   grnCode_list,
  //   // Include any other necessary fields from payload, renamed if needed
  // };

  try {
    const response = await axios.put(`${Adjustment_URL}/${adj_Code}`, payload);

    return response.data;
  } catch (error) {
    throw new Error(`Failed to edit data: ${error.message}`);
  }
};

////////////////////////////////Transfer////////////////////////////////////////////////////////////

export const addTransfer = async (payload) => {
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const transferHeaderData = payload.headerData;
  const total_tax = payload.taxSum;
  const total_sum = payload.totalSum;
  const poCode_list = payload.addedPOCodes;

  // Build the safe data object to send
  const dataToSend = {
    product_list,
    transferHeaderData,
    total_tax,
    total_sum,
    poCode_list,
    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await api.post(Transfer_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const editTransfer = async (transfer_Code, payload) => {
  try {
    const response = await api.put(`${Transfer_URL}/${transfer_Code}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to edit data: ${error.message}`);
  }
};

export const fetchCustomers = async () => {
  try {
    const response = await axios.get(Customer_URL);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

export const createCustomer = async (data) => {
  try {
    const response = await axios.post(Customer_URL, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to add data");
  }
};

export const addInvoice = async (payload) => {
  console.log("Payload in addInvoice:", payload);
  // Map original variable names to internal ones
  const product_list = payload.productList;
  const header_data = payload.headerData;

  // Build the safe data object to send
  const dataToSend = {
    product_list,
    header_data,

    // Include any other necessary fields from payload, renamed if needed
  };

  try {
    const response = await axios.post(Invoice_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};
