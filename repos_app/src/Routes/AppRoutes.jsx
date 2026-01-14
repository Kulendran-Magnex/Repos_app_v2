import { Route } from "react-router-dom";

// Components
import Homepage from "../components/MainPage/Homepage";
import Login from "../components/Auth/Login";
import Dashboard from "../components/MainPage/Dashboard";
import ViewPage from "../components/MainPage/ViewPage";
import Product from "../components/MainPage/Product/Product";
import EditProduct from "../components/MainPage/Product/EditProduct";
import TestTable from "../components/MainPage/Table";
import CategoryScreen from "../components/MainPage/Category/Category";
import PackingMasterPage from "../components/MainPage/PackingMaster/PackingMasterPage ";
import BrandMasterPage from "../components/MainPage/BrandMaster/BrandMasterPage";
import TaxSetupPage from "../components/MainPage/TaxSetup/taxSetupPage";
import CreditCardMasterPage from "../components/MainPage/CreditCardMaster/CreditCardMasterPage";
import CurrencyMasterPage from "../components/MainPage/CurrencyMaster/CurrencyMasterPage";
import CurrencyMasterTable from "../components/MainPage/CurrencyMaster/CurrencyMasterTable";
import SupplierMasterForm from "../components/MainPage/Supplier Master/SupplierMasterForm";
import SupplierMasterTable from "../components/MainPage/Supplier Master/SupplierMasterTable";
import EditSupplierMasterForm from "../components/MainPage/Supplier Master/EditSupplierMasterForm";
import AddMaterialRequest from "../components/Purchase/MaterialRequest/AddMaterialRequest";
import EditableTable from "../components/Purchase/MaterialRequest/demo";
import ProductList from "../components/Purchase/MaterialRequest/ProductList";

// Fallback components
const Home = () => <div>Home Page</div>;
const Master = () => <div>Master Page</div>;
const ContactUs = () => <div>Contact Us Page</div>;
const Menu1 = () => <div>Menu 1 Content</div>;
const Menu2 = () => <div>Menu 2 Content</div>;
const Menu3 = () => <div>Menu 3 Content</div>;

const AppRoutes = () => (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/home" element={<Homepage />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/view" element={<ViewPage />} />
    <Route path="/product" element={<Product />} />
    <Route path="/product/edit" element={<EditProduct />} />
    <Route path="/category" element={<CategoryScreen />} />
    <Route path="/master" element={<Master />} />
    <Route path="/contact-us" element={<ContactUs />} />
    <Route path="/menu1" element={<Menu1 />} />
    <Route path="/menu2" element={<Menu2 />} />
    <Route path="/menu3" element={<Menu3 />} />
    <Route path="/packingMaster" element={<PackingMasterPage />} />
    <Route path="/brandMaster" element={<BrandMasterPage />} />
    <Route path="/taxSetup" element={<TaxSetupPage />} />
    <Route path="/ccPage" element={<CreditCardMasterPage />} />
    <Route path="/currencyMaster" element={<CurrencyMasterPage />} />
    <Route path="/currencyTable" element={<CurrencyMasterTable />} />
    <Route path="/addSupplier" element={<SupplierMasterForm />} />
    <Route path="/supplierTable" element={<SupplierMasterTable />} />
    <Route path="/editSupplier" element={<EditSupplierMasterForm />} />
    <Route path="/addMR" element={<AddMaterialRequest />} />
    <Route path="/demo" element={<EditableTable />} />
    <Route path="/demo1" element={<ProductList />} />
    <Route path="/test" element={<TestTable />} />
  </>
);

export default AppRoutes;
