import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase.js";

const DBcontext = React.createContext();

export const useDatabase = () => {
  return useContext(DBcontext);
};

export const DataBaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return <DBcontext.Provider value={value}>{children}</DBcontext.Provider>;
};
