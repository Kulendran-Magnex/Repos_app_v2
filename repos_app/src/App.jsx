import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import NavBar from "./components/MainPage/NavBar";
import routes from "./routes";
function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && <NavBar />}
      <Toaster reverseOrder={false} />
      <Routes>
        {routes.map(({ path, element }, idx) => (
          <Route key={idx} path={path} element={element} />
        ))}
      </Routes>
    </>
  );
}

export default App;
