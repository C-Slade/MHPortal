import React from "react";
import maritimeLogo from "../assets/maritimeLogo.png";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import "./css/styles.css";
import { useAuth } from "../context/authContext";

const ExpiredRegister = () => {
  const { fetchingRegisterKey } = useAuth();
  return (
    <>
      {fetchingRegisterKey ? null : (
        <main className="invalid-register-key">
          <div className="expired-register-info-container">
            <img src={maritimeLogo} alt="Company Logo" className="logo" />
            <h2>Invalid Key</h2>
            <Link to={"/login"}>
              <Button variant="contained">Go to Login</Button>
            </Link>
          </div>
        </main>
      )}
    </>
  );
};

export default ExpiredRegister;
