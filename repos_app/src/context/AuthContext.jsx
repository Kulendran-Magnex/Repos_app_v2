import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // initialize the token from localStorage so we always use the single
  // JWT string that comes from the backend. cookies were adding a second
  // copy and caused confusion, so we persist only once here.
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // keep localStorage in sync with React state
  useEffect(() => {
    if (authToken) {
      localStorage.setItem("token", authToken);
    } else {
      localStorage.removeItem("token");
    }
  }, [authToken]);

  const value = { currentUser, setCurrentUser, authToken, setAuthToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
