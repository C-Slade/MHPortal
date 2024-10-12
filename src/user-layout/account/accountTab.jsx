import React, { useEffect, useState } from "react";
import email_icon from "../../assets/mail.png";
import password_icon from "../../assets/lock.png";
import userProfile_icon from "../../assets/profile.png";
import removeUser_icon from "../../assets/remove-user.png";
import { motion } from "framer-motion";
import { TextField, Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../../context/authContext";

const AccountTab = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDeleteProfile, setConfirmDeleteProfile] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [settingName, setSettingName] = useState("");
  const [labelName, setLabelName] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [errorHelper, setErrorHelper] = useState("");

  const {
    updateUserEmail,
    updateUserPassword,
    updateUserName,
    deleteCurrentUser,
    currentUser,
  } = useAuth();

  const updateTextFeild = (e) => {
    if (type === "account") setEmail(e);
    if (type === "password") setPassword(e);
    if (type === "userName") setFirstName(e);
    if (type === "removeUser") setConfirmDeleteProfile(e.toLowerCase());
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (type === "account") {
      if (email.includes("@")) {
        await updateUserEmail(email);
        setEmail("");
        setOpen(false);
      } else {
        setError(true);
        setErrorHelper("Must be a valid email");
      }

      setLoading(false);
    }

    if (type === "password") {
      if (password !== confirmPassword) {
        setError(true);
        setErrorHelper("Passwords do not match");
      } else if (password.length < 6) {
        setError(true);
        setErrorHelper("Password not strong enough");
      } else {
        await updateUserPassword(password);
        setPassword("");
        setConfirmPassword("");
        setOpen(false);
      }
      setLoading(false);
    }

    if (type === "removeUser") {
      await deleteCurrentUser(currentUser);
      setLoading(false);
    }

    if (type === "userName") {
      if (firstName === "" || lastName === "") {
        setError(true);
        setErrorHelper("Name required");
        setLoading(false);
      } else {
        const capFirstName = firstName[0].toUpperCase() + firstName.slice(1);
        const capLastName = lastName[0].toUpperCase() + lastName.slice(1);
        const name = capFirstName + " " + capLastName;
        await updateUserName(name);
        setLoading(false);
        setOpen(false);
        setFirstName("");
        setLastName("");
      }
    }
  };

  const closeTab = () => {
    setOpen(!open);
    setError(false);

    setConfirmPassword("");
    setPassword("");
    setEmail("");
    setFirstName("");
    setLastName("");
  };

  const getIcon = () => {
    if (type === "account") return email_icon;
    if (type === "password") return password_icon;
    if (type === "userName") return userProfile_icon;
    if (type === "removeUser") return removeUser_icon;
  };

  useEffect(() => {
    if (type === "account") {
      setSettingName("Change Email Address");
      setLabelName("New Email");
    }
    if (type === "password") {
      setSettingName("Update Password");
      setLabelName("New Password");
    }
    if (type === "userName") {
      setSettingName("Update User Name");
      setLabelName("First Name");
    }
    if (type === "removeUser") {
      setSettingName("Delete Account");
      setLabelName("Type 'Delete' to confirm");
    }
  }, []);

  return (
    <motion.div className="account-tab-container">
      <img src={getIcon()} alt="email" />
      <h2 onClick={() => setOpen(!open)}>{settingName}</h2>
      <Button
        variant="contained"
        style={open ? { display: "none" } : null}
        onClick={() => setOpen(!open)}
      >
        open
      </Button>

      <motion.div
        className="animate-feilds"
        initial={{ width: 0, opacity: 0 }}
        animate={
          open ? { opacity: "100%", width: "30%" } : { opacity: 0, width: 0 }
        }
      >
        <TextField
          label={error ? errorHelper : labelName}
          variant="outlined"
          onChange={(e) => updateTextFeild(e.target.value)}
          size="small"
          type={type === "password" ? "password" : null}
          error={error}
          style={
            type === "password" || type === "userName"
              ? { width: "50%" }
              : { width: "98%" }
          }
        />
        {type === "password" || type === "userName" ? (
          <TextField
            label={type === "userName" ? "Last Name" : "Confirm password"}
            variant="outlined"
            size="small"
            inputProps={{
              autoComplete: "new-password",
              form: {
                autoComplete: "off",
              },
            }}
            error={error}
            type={type === "password" ? "password" : null}
            style={
              open
                ? { opacity: "100%", margin: "0 5px 0 5px", width: "60%" }
                : { opacity: "0%" }
            }
            onChange={(e) =>
              type === "userName"
                ? setLastName(e.target.value)
                : setConfirmPassword(e.target.value)
            }
          />
        ) : null}
      </motion.div>
      <motion.div
        className="animate-button"
        animate={open ? { opacity: "100%" } : { opacity: 0 }}
      >
        <LoadingButton
          variant="contained"
          loading={loading}
          loadingPosition="start"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={
            type === "removeUser"
              ? confirmDeleteProfile === "delete"
                ? false
                : true
              : type === "password"
              ? password === confirmPassword && password !== ""
                ? false
                : true
              : false
          }
        >
          <span>Save</span>
        </LoadingButton>
        <Button
          variant="contained"
          style={{ margin: "0 5px" }}
          onClick={closeTab}
        >
          close
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AccountTab;
