import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import NavBar from "./components/MainPage/NavBar";
import routes from "./routes";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authToken } = useContext(AuthContext);

  // Protected routes that require authentication
  const publicRoutes = ["/login", "/", "/home", "/contact-us"];

  useEffect(() => {
    // If not authenticated and trying to access protected route, redirect to login
    if (!authToken && !publicRoutes.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [authToken, location.pathname, navigate]);

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
