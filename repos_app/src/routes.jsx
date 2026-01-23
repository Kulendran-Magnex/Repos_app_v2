import React from "react";
import Homepage from "./components/MainPage/Homepage";
import Login from "./components/Auth/Login";
import Dashboard from "./components/MainPage/Dashboard";
import ViewPage from "./components/MainPage/ViewPage";
import Navbar from "./components/Navigation/MagnexAdmin/Navbar";
import Product from "./components/MainPage/Product/Product";
import EditProduct from "./components/MainPage/Product/EditProduct";
import CategoryScreen from "./components/MainPage/Category/Category";
import PackingMasterPage from "./components/MainPage/PackingMaster/PackingMasterPage ";
import BrandMasterPage from "./components/MainPage/BrandMaster/BrandMasterPage";
import TaxSetupPage from "./components/MainPage/TaxSetup/taxSetupPage";
import CreditCardMasterPage from "./components/MainPage/CreditCardMaster/CreditCardMasterPage";
import CurrencyMasterTable from "./components/MainPage/CurrencyMaster/CurrencyMasterTable";
import CurrencyMasterPage from "./components/MainPage/CurrencyMaster/CurrencyMasterPage";
import SupplierMasterForm from "./components/MainPage/Supplier Master/SupplierMasterForm";
import SupplierMasterTable from "./components/MainPage/Supplier Master/SupplierMasterTable";
import EditSupplierMasterForm from "./components/MainPage/Supplier Master/EditSupplierMasterForm";
import AddMaterialRequest from "./components/Purchase/MaterialRequest/AddMaterialRequest";
import EditableTable from "./components/Purchase/MaterialRequest/demo";
import ViewMaterialRequest from "./components/Purchase/MaterialRequest/ViewMaterialRequest";
import EditMaterialRequest from "./components/Purchase/MaterialRequest/EditMaterialRequest";
import AddPurchaseOrder from "./components/Purchase/PurchaseOrder/AddPurchaseOrder";
import ViewPurchaseOrder from "./components/Purchase/PurchaseOrder/ViewPurchaseRequest";
import EditPurchaseOrder from "./components/Purchase/PurchaseOrder/EditPurchaseOrder";
import Example from "./components/Purchase/PurchaseOrder/testPrint";
import AddGRN from "./components/Purchase/GRN/AddGRN";
import ViewGRN from "./components/Purchase/GRN/ViewGRN";
import EditGRN from "./components/Purchase/GRN/EditGRN";
import GRNTemplate from "./components/Purchase/GRN/GRNDocument";
import GeneratePDF from "./components/Purchase/GRN/GeneratePDF";
import AddPR from "./components/Purchase/PurchaseReturn/AddPR";
import MultiSelectCheckbox from "./components/Purchase/PurchaseReturn/MultiSelectCheckbox";
import ViewPR from "./components/Purchase/PurchaseReturn/ViewPR";
import EditPR from "./components/Purchase/PurchaseReturn/EditPR";
import CreateAdjustment from "./components/Inventory/Adjustment/CreateAdjustment";
import ViewAdjustment from "./components/Inventory/Adjustment/ViewAdjustment";
import EditAdjustment from "./components/Inventory/Adjustment/EditAdjustment";
import CreateTransfer from "./components/Inventory/Transfer/CreateTransfer";
import EditTransfer from "./components/Inventory/Transfer/EditTransfer";
import { element } from "prop-types";

const routes = [
  { path: "/", element: <Homepage /> },
  { path: "/home", element: <Homepage /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/view", element: <ViewPage /> },
  { path: "/nav", element: <Navbar /> },
  { path: "/category", element: <CategoryScreen /> },
  { path: "/contact-us", element: <Homepage /> },
  { path: "/product", element: <Product /> },
  { path: "/product/edit", element: <EditProduct /> },

  // Packing, Brand, Tax, Credit Card, Currency
  { path: "/packingMaster", element: <PackingMasterPage /> },
  { path: "/brandMaster", element: <BrandMasterPage /> },
  { path: "/taxSetup", element: <TaxSetupPage /> },
  { path: "/ccPage", element: <CreditCardMasterPage /> },
  { path: "/currencyMaster", element: <CurrencyMasterPage /> },
  { path: "/currencyTable", element: <CurrencyMasterTable /> },

  // Supplier Master
  { path: "/supplier/add", element: <SupplierMasterForm /> },
  { path: "/supplier/view", element: <SupplierMasterTable /> },
  { path: "/supplier/edit", element: <EditSupplierMasterForm /> },

  // Material Request
  { path: "/material-request/add", element: <AddMaterialRequest /> },
  { path: "/material-request/view", element: <ViewMaterialRequest /> },
  { path: "/material-request/edit", element: <EditMaterialRequest /> },
  { path: "/material-request/demo", element: <EditableTable /> },

  // Purchase Order
  { path: "/purchase-order/add", element: <AddPurchaseOrder /> },
  { path: "/purchase-order/view", element: <ViewPurchaseOrder /> },
  { path: "/purchase-order/edit", element: <EditPurchaseOrder /> },
  { path: "/purchase-order/print", element: <Example /> },

  // GRN
  { path: "/grn/add", element: <AddGRN /> },
  { path: "/grn/view", element: <ViewGRN /> },
  { path: "/grn/edit", element: <EditGRN /> },
  { path: "/grn/template", element: <GRNTemplate /> },
  { path: "/grn/pdf", element: <GeneratePDF /> },

  // Purchase Return
  { path: "/purchase-return/add", element: <AddPR /> },
  { path: "/purchase-return/view", element: <ViewPR /> },
  { path: "/purchase-return/edit", element: <EditPR /> },
  { path: "/purchase-return/multiselect", element: <MultiSelectCheckbox /> },

  // Inventory Adjustment
  { path: "/adjustment/add", element: <CreateAdjustment /> },
  { path: "/adjustment/view", element: <ViewAdjustment /> },
  { path: "/adjustment/edit", element: <EditAdjustment /> },

  // Test/Utility
  { path: "/test", element: <GRNTemplate /> },
  { path: "/test2", element: <GeneratePDF /> },
  { path: "/test123", element: <MultiSelectCheckbox /> },

  // Inventory Transfer

  { path: "/transfer/create", element: <CreateTransfer />},
  {path: "/transfer/edit", element: <EditTransfer/>}
];

export default routes;
