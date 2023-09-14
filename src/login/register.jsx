import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import maritimeLogo from "../assets/maritimeLogo.png";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import wave from "../assets/animated-trans-blue-bg-lg.svg";
import { RotatingLines } from "react-loader-spinner";
import "./css/styles.css";
import { Link } from "react-router-dom";
import { useApp } from "../context/appContext";

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)" },
};

const Register = () => {
  const { signUpUser, currentUser, signInUser, createUserProfile } = useAuth();
  const { alertError } = useApp();
  const [isRegistering, setRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const attemptSignIn = async () => {
    try {
      await signInUser(email, password);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      let data = JSON.stringify(error);
      let errorCode = JSON.parse(data).code;

      if (errorCode.includes("auth/")) {
        errorCode = errorCode.replace("auth/", "").replace(/-/g, " ");
      }

      alertError(errorCode);
      setRegister(false);
    }
  };

  const startRegisterProcess = async () => {
    if (password !== confirmPassword) {
      alertError("Passwords do not match");
      return;
    } else if (password === "" || email === "" || name === "") {
      alertError("All fields required");
      return;
    }
    try {
      setRegister(true);
      const res = await signUpUser(email, password);
      createUserProfile(res.user.uid, res.user.email, name);
      attemptSignIn();
    } catch (error) {
      let data = JSON.stringify(error);
      let errorCode = JSON.parse(data).code;

      const cleanMsg = errorCode
        .replace(/-/g, " ")
        .replace(/auth/g, " ")
        .replace("/", " ");

      alertError(cleanMsg);
      setRegister(false);
    }
  };

  return (
    <>
      <main className="login-layout">
        <motion.div
          className="register-card-container"
          animate={{ bottom: "0%" }}
          exit={{ bottom: "-250%" }}
        >
          <motion.div
            className="animation-container"
            animate={!isRegistering ? "open" : "closed"}
            variants={variants}
          >
            <div className="branding-container">
              <img src={maritimeLogo} alt="logo" />
              <h3>MHI Portal</h3>
            </div>
            <form action="">
              <h1>Register</h1>
              <div className="input-container">
                <TextField
                  label="Name"
                  variant="outlined"
                  className="login-input register"
                  onChange={(e) => setName(e.target.value)}
                  inputProps={{
                    autoComplete: "new-password",
                    form: {
                      autoComplete: "off",
                    },
                  }}
                />
                <TextField
                  label="Email"
                  variant="outlined"
                  className="login-input register"
                  onChange={(e) => setEmail(e.target.value)}
                  inputProps={{
                    autoComplete: "new-password",
                    form: {
                      autoComplete: "off",
                    },
                  }}
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input register"
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "new-password",
                    form: {
                      autoComplete: "off",
                    },
                  }}
                />
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  className="login-input register"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "new-password",
                    form: {
                      autoComplete: "off",
                    },
                  }}
                />
              </div>
              <Button
                variant="contained"
                onClick={() => {
                  startRegisterProcess();
                }}
              >
                Register
              </Button>
            </form>
            <div className="already-member-container">
              <h6>Already a member?</h6>
              <Link to="/login">Sign in</Link>
            </div>
          </motion.div>
          {isRegistering ? (
            <motion.div
              className="loading-container"
              animate={isRegistering ? "open" : "closed"}
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
        <motion.div
          className="wave"
          initial={currentUser ? { y: 0 } : { y: -400 }}
          animate={currentUser ? { opacity: 0 } : { y: 0 }}
          transition={{ duration: 2, type: "spring" }}
        >
          <img src={wave} alt="" />
        </motion.div>
      </main>
    </>
  );
};

export default Register;
