import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { getAnalytics } from "firebase/analytics";
import { AuthProvider } from "./context/authContext";
import { DataBaseProvider } from "./context/dbContext";
import { HashRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Router basename="/">
      <DataBaseProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DataBaseProvider>
    </Router>
  </>
);
getAnalytics();
reportWebVitals();
