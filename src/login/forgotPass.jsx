import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import "./css/styles.css";
import { Link } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import logo from "../assets/maritimeLogo.png";
import wave from "../assets/animated-trans-blue-bg-lg.svg";
import { useApp } from "../context/appContext";

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)" },
};

const ForgotPass = () => {
  const { sendPassReset } = useAuth();
  const { alertSuccess } = useApp();
  const [isAnimatedFormOpen, toggleAnimatedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = async () => {
    toggleAnimatedForm(true);
    setLoading(true);
    await sendPassReset(userEmail);
    alertSuccess(`Reset Password Link Sent to ${userEmail}`);
    toggleAnimatedForm(false);
    setLoading(false);
  };

  return (
    <>
      <main className="login-container">
        <div className="login-cards-container">
          <motion.div
            className="forgot-pass-container card visible"
            animate={!isAnimatedFormOpen ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
            transition={{
              ease: "linear",
              type: "spring",
              stiffness: 75,
            }}
          >
            <div className="animation-container">
              <div className="branding-container">
                <img src={logo} alt="logo" />
                <h3>MHI Portal</h3>
              </div>
              <h1>Forgot Password</h1>
              <form action="">
                <div className="input-container">
                  <TextField
                    label="Email"
                    variant="outlined"
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  <Link to="/login">Sign in</Link>
                </div>
                <Button variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
              </form>
            </div>
          </motion.div>
          {loading ? (
            <>
              <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={loading ? "open" : "closed"}
                variants={variants}
                transition={{
                  ease: "linear",
                  type: "spring",
                  stiffness: 75,
                }}
              >
                <RotatingLines
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="96"
                  visible={true}
                />
              </motion.div>
            </>
          ) : null}
          <div
            className="login-card-container card"
            style={{ opacity: "50%" }}
          ></div>
        </div>
        <div className="wave">
          <img src={wave} alt="" />
        </div>
      </main>
    </>
  );
};

export default ForgotPass;
