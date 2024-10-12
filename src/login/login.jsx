import React, { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import "./css/styles.css";
import { useNavigate, Link } from "react-router-dom";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { RotatingLines } from "react-loader-spinner";
import FormControl from "@mui/material/FormControl";
import logo from "../assets/maritimeLogo.png";
import wave from "../assets/animated-trans-blue-bg-lg.svg";
import { useApp } from "../context/appContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const { signInUser, currentUser } = useAuth();
  const { alertError } = useApp();
  const navigate = useNavigate();
  const [isAnimatedFormOpen] = useState(false);
  const [keepLoggedInStatus, setLoginStatus] = useState(false);
  const [loggingIn, setLogging] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

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

  const rememberLogin = (checked) => {
    if (checked) {
      localStorage.setItem("rememberLogin", "true");
      setLoginStatus(true);
    } else {
      localStorage.setItem("rememberLogin", "false");
      setLoginStatus(false);
    }
  };

  useEffect(() => {
    const local = localStorage.getItem("rememberLogin");
    if (local) {
      if (local === "false") setLoginStatus(false);
      if (local === "true") setLoginStatus(true);
    }
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
              <form action="" onSubmit={() => startLoginProccess()}>
                <div className="input-container">
                  <TextField
                    label="Email"
                    variant="outlined"
                    autoComplete="off"
                    inputProps={{
                      autoComplete: "new-password",
                      form: {
                        autoComplete: "off",
                      },
                    }}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      Password
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                    />
                  </FormControl>
                  <Link to="/forgotPass">Forgot Password?</Link>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={keepLoggedInStatus}
                        onChange={() => rememberLogin(!keepLoggedInStatus)}
                      />
                    }
                    label="Keep me logged in"
                  />
                </div>
              </form>
              <Button
                variant="contained"
                className="loginBtn"
                onClick={() => startLoginProccess()}
              >
                Login
              </Button>
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
