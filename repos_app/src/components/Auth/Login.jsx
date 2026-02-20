/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Login.css";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const defaultFormFields = {
  username: "",
  password: "",
};
const Login = () => {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { username, password } = formFields;

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { setAuthToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  // const handleSubmit = async () => {
  //   setErrorMessage("");
  //   console.log(formFields);
  //   if (!username || !password) {
  //     setErrorMessage("Username and password are required");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await axios.post("http://localhost:5000/auth/login", {
  //       username,
  //       password,
  //     });

  //     // Handle success, you might want to store the JWT token in localStorage or Context
  //     const { token } = response.data;
  //     console.log(token);
  //     setAuthToken(token);
  //     Cookies.set("authToken", token, { expires: 1 });
  //     localStorage.setItem("token", token); // Store the token in localStorage
  //     navigate("/");
  //     // Redirect user or update UI
  //     // window.location.href = "/dashboard"; // Redirect to a protected page
  //   } catch (error) {
  //     setErrorMessage(
  //       error.response?.data?.message || "An error occurred during login"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/auth/login`, {
        username,
        password,
      });

      const { token, client_id } = response.data;

      if (!token) {
        throw new Error("Token not received from server");
      }

      // the only copy of the token we keep is in context; the provider
      // itself will persist it to localStorage for us. this prevents the
      // "two token" confusion you noted.
      setAuthToken(token);

      // optionally keep client_id if your UI needs it
      if (client_id) {
        localStorage.setItem("client_id", client_id);
      }

      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page border-1">
        <div className="container">
          <div className="design">
            <div className="pill-1 rotate-45"></div>
            <div className="pill-2 rotate-45"></div>
            <div className="pill-3 rotate-45"></div>
            <div className="pill-4 rotate-45"></div>
          </div>
          <div className="login">
            <h3 className="title">User Login</h3>
            <div className="text-input">
              <i className="ri-user-fill"></i>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={username}
                onChange={handleChange}
              />
            </div>
            <div className="text-input">
              <i className="ri-lock-fill"></i>
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={handleChange}
              />
            </div>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <button className="login-btn" onClick={handleSubmit}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <a href="#" className="forgot">
              Forgot Username/Password?
            </a>
            {/* <div className="create">
            <a href="#">Create Your Account</a>
            <i className="ri-arrow-right-fill"></i>
          </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
