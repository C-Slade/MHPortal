import React from "react";
import "./css-global/styles.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { getAnalytics } from "firebase/analytics";
import { AuthProvider } from "./context/authContext";
import { AppProvider } from "./context/appContext";
import { HashRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Router>
      <AppProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppProvider>
    </Router>
  </>
);
getAnalytics();
reportWebVitals();
