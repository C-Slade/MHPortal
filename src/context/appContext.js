import React, { useContext, useState } from "react";

const AppContext = React.createContext();

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [onPDFviewer, setPDFviewer] = useState(false);
  const [alertType, setAlertType] = useState("error");

  const alertError = (message) => {
    setAlertMessage(message);
    setAlert(true);
    setAlertType("error");
  };

  const clearError = () => {
    setAlertMessage("");
    setAlert(false);
  };

  const alertWarning = (message) => {
    setAlertMessage(message);
    setAlertType("warning");
    setAlert(true);
  };

  const alertSuccess = (message) => {
    setAlert(true);
    setAlertMessage(message);
    setAlertType("success");
  };

  const value = {
    alertError,
    alert,
    alertMessage,
    clearError,
    onPDFviewer,
    setPDFviewer,
    setAlertMessage,
    alertType,
    alertSuccess,
    alertWarning,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
