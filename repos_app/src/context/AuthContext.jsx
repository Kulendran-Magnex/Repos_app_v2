import { createContext, useState,useEffect } from "react";
import Cookies from 'js-cookie';

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => {
    return Cookies.get('authToken') || null; // Retrieve token from cookie
  });

  useEffect(() => {
    if (authToken) {
      Cookies.set('authToken', authToken, { expires: 7 });  // Set cookie for 7 days
      console.log("render1")
    } else {
      Cookies.remove('authToken');  // Remove cookie when logged out
      console.log("render2")
    }
  }, [authToken]);
  
  const value = { currentUser, setCurrentUser, authToken, setAuthToken };



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
