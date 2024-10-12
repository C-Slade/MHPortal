import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import addUser_icon from "../../../assets/add-user.png";
import { useAuth } from "../../../context/authContext";
import { v4 as uuidv4 } from "uuid";
import CircularProgress from "@mui/material/CircularProgress";
import "./css/styles.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  bgcolor: "background.paper",
  borderRadius: "15px",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const AddUser = ({ allUsers, rows, fetchUsers }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className="addUser-btn"
        startIcon={<img src={addUser_icon} alt="addUser_icon" />}
        size="small"
        onClick={() => setOpen(true)}
      >
        Add User
      </Button>
      <Modal
        open={open}
        className="addUser-modal"
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: "30%" }} className="addUser-container">
          <AddUserModal
            allUsers={allUsers}
            rows={rows}
            closeModal={() => setOpen(false)}
            fetchUsers={fetchUsers}
          />
        </Box>
      </Modal>
    </>
  );
};

function AddUserModal({ closeModal, allUsers, rows, fetchUsers }) {
  const [email, setEmail] = useState("");
  const [errorWithEmail, setErrorWithEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    sendRegisterLink,
    addNewUserToPendingVerification,
    fetchAllUsersInfo,
  } = useAuth();

  const sendLink = async () => {
    setLoading(true);
    setErrorMessage("");
    setErrorWithEmail(false);

    if (email === "" || !email.includes("@")) {
      setErrorWithEmail(true);
      setErrorMessage("Must be a valid email");
      setLoading(false);
      return;
    }
    const allUserInfo = await fetchAllUsersInfo();
    const email_inUse = allUserInfo.some((user) => user.info.email === email);
    const pending_email_inUse = rows.some((user) => user.email === email);
    const pendingID = uuidv4();

    if (email_inUse || pending_email_inUse) {
      setErrorWithEmail(true);
      setErrorMessage("Email already in use");
      setLoading(false);
    } else {
      await sendRegisterLink(email, pendingID);
      await addNewUserToPendingVerification(email, pendingID);
      await fetchUsers();
      closeModal();
      setLoading(false);
    }

    setEmail("");
  };

  return (
    <>
      <div className="addUserModal-container">
        {loading ? (
          <Box className="loading">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <h2>Add User</h2>
            <TextField
              className="email"
              label="Email"
              variant="outlined"
              error={errorWithEmail}
              helperText={errorMessage}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="button-container">
              <Button
                variant="contained"
                size="medium"
                onClick={() => sendLink()}
              >
                Add User
              </Button>
              <Button
                variant="contained"
                size="medium"
                className="cancel-add-user"
                onClick={closeModal}
              >
                Cancel
              </Button>
            </div>
            <h5>
              Note: <span>Register links are only valid for 8 hours</span>
            </h5>
          </>
        )}
      </div>
    </>
  );
}

export default AddUser;
