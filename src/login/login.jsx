import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import "./css/styles.css";
import { useNavigate, Link } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import logo from "../assets/maritimeLogo.png";
import wave from "../assets/animated-trans-blue-bg-lg.svg";
import { useApp } from "../context/appContext";

const Login = () => {
  const { signInUser, currentUser, loggingOut } = useAuth();
  const { alertError } = useApp();
  const navigate = useNavigate();
  const [isAnimatedFormOpen] = useState(false);
  const [loggingIn, setLogging] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const startLoginProccess = async () => {
    setLogging(true);
    try {
      await signInUser(email, password);
      setLoggedIn(true);
      navigate("/dashboard");
    } catch (error) {
      let data = JSON.stringify(error);
      let errorCode = JSON.parse(data).code;

      if (errorCode.includes("auth/")) {
        errorCode = errorCode.replace("auth/", "").replace(/-/g, " ");
      }

      alertError(errorCode);
      setLogging(false);
    }
  };

  useEffect(() => {
    console.log("render");
  }, []);

  const variants = {
    open: { opacity: 1, transform: "scale(1)" },
    closed: { opacity: 0, transform: "scale(0)" },
  };

  return (
    <>
      <main className="login-container">
        <motion.div
          className="login-cards-container"
          animate={loggedIn ? { bottom: "-250%" } : {}}
        >
          <motion.div
            className="login-card-container card visible"
            animate={!isAnimatedFormOpen ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
            transition={{
              ease: "linear",
              type: "spring",
              stiffness: 75,
            }}
          >
            <motion.div
              className="animation-container"
              animate={!loggingIn ? "open" : "closed"}
              exit={"closed"}
              variants={variants}
            >
              <div className="branding-container">
                <img src={logo} alt="logo" />
                <h3>MHI Portal</h3>
              </div>
              <h1>Login</h1>
              <form action="">
                <div className="input-container">
                  <TextField
                    label="Email"
                    variant="outlined"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Link to="/forgotPass">Forgot Password?</Link>
                </div>
                <Button
                  variant="contained"
                  onClick={() => startLoginProccess()}
                >
                  Login
                </Button>
              </form>
            </motion.div>
            {loggingIn ? (
              <motion.div
                className="loading-container"
                animate={loggingIn ? "open" : "closed"}
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
            ) : null}
          </motion.div>
          <div
            className="forgot-pass-container card"
            style={{ opacity: "50%" }}
          ></div>
        </motion.div>
        <motion.div
          className="wave"
          initial={!currentUser ? { y: 0 } : { y: 350 }}
          animate={loggedIn ? { opacity: 0 } : { y: 0 }}
          transition={{ duration: 2, type: "spring" }}
        >
          <img src={wave} alt="" />
        </motion.div>
      </main>
    </>
  );
};

export default Login;
