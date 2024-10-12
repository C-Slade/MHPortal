import React, { useEffect, useState } from "react";
import SearchUser from "./searchUser";
import AddUser from "./addUser";
import UserTable from "./userTable";
import { Box, Button, Modal } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { collectionData } from "../../../firebase.js";
import { v4 as uuidv4 } from "uuid";
import "./css/styles.css";
import { useAuth } from "../../../context/authContext.js";
import { useApp } from "../../../context/appContext.js";
import { useDocs } from "../../../context/docContext.js";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)", display: "none" },
};

const DeleteUserButton = ({ loading, deActivateUsers, selectedUsers }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  return (
    <>
      <LoadingButton
        loading={loading}
        variant="contained"
        size="medium"
        className="deleteUser"
        onClick={() => handleOpen()}
      >
        <span>{selectedUsers.length > 1 ? "delete users" : "delete user"}</span>
      </LoadingButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="delete-user-container" sx={{ ...style }}>
          <motion.div
            className="removing-user-loading-animated-container"
            animate={loading ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
          >
            <Box className="loading">
              <CircularProgress />
            </Box>
          </motion.div>
          <motion.div
            className="delete-users-modal"
            animate={!loading ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
          >
            <h2>
              {selectedUsers.length > 1
                ? `Are you sure you want to delete users?`
                : "Are you sure you want to delete user?"}
            </h2>
            <div className="button-container">
              <Button
                variant="outlined"
                size="small"
                className="deleteUser"
                onClick={() => deActivateUsers(handleClose)}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClose}
                className="cancel"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </Box>
      </Modal>
    </>
  );
};

const ManageUsers = () => {
  const [rows, setRows] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { sendPassReset } = useAuth();
  const { alertSuccess, alertWarning } = useApp();
  const { allDocs, allManuals } = useDocs();

  const fetchUsers = async () => {
    const firebaseUsers = [];
    const querySnapshot = await getDocs(collection(collectionData, "users"));
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      if (!user.settings.admin) firebaseUsers.push(doc.id);
    });

    if (firebaseUsers.length !== 0) {
      const userData = await getUserData(firebaseUsers);
      setRows(userData);
      setAllUsers(userData);
    }

    getPendingUser();
    setLoadingPage(false);
  };

  const getUserData = (firebaseUsers) => {
    return new Promise(async (resolve, reject) => {
      const users = [];
      let finishedFetchingUserData = false;
      firebaseUsers.forEach(async (user, index) => {
        const docRef = doc(collectionData, "users", `${user}`);
        const userSnap = await getDoc(docRef);
        const data = userSnap.data();

        if (userSnap.exists()) {
          let isModerator = false;
          // let hasMods = data.settings.hasOwnProperty("canEdit");
          // if (hasMods && data.settings.canEdit.length > 0) isModerator = true;

          for (const key in allDocs) {
            if (Object.hasOwnProperty.call(allDocs, key)) {
              const module = allDocs[key];
              for (let index = 0; index < module.moderators.length; index++) {
                const mod = module.moderators[index];
                if (mod.id === user) {
                  isModerator = true;
                  break;
                }
              }
            }
          }
          for (const key in allManuals) {
            if (Object.hasOwnProperty.call(allManuals, key)) {
              const module = allManuals[key];
              for (let index = 0; index < module.moderators.length; index++) {
                const mod = module.moderators[index];
                if (mod.id === user) {
                  isModerator = true;
                  break;
                }
              }
            }
          }

          let permission = () => (isModerator ? "moderator" : "view only");

          const userData = {
            id: user,
            fullName: data.info.name,
            email: data.info.email,
            status: "verified",
            permission: permission(),
          };

          if (!data.hasOwnProperty("status") && data.status !== "deActivated") {
            users.push(userData);
          }

          if (index === firebaseUsers.length - 1) {
            finishedFetchingUserData = true;
          }

          check_if_done_fetching();
        }
      });

      const check_if_done_fetching = () =>
        finishedFetchingUserData ? resolve(users) : null;
    });
  };

  const searchUser = (value) => {
    const users = allUsers;
    let filteredUsers = [];
    users.forEach((user) => {
      const userName = user.fullName.toLowerCase();
      const searchedUser = value.toLowerCase();
      if (userName.includes(searchedUser)) {
        filteredUsers.push(user);
      }
    });

    if (value === "") {
      setRows(allUsers);
      getPendingUser();
    } else {
      setRows(filteredUsers);
    }
  };

  const getPendingUser = async () => {
    const docRef = doc(collectionData, "pendingUsers", "users");
    const userSnap = await getDoc(docRef);
    const data = userSnap.data();

    let changeInPendingUsers = false;

    const date = new Date();
    const dateInMs = date.getTime();
    const eightHoursInMs = 28800000;
    const twentyFourHoursInMs = 86400000;

    data.pending.forEach((pending, index) => {
      if (dateInMs - pending.date > twentyFourHoursInMs) {
        changeInPendingUsers = true;
        data.pending.splice(index, 1);
      }
    });

    const allPendingUsers = [];

    if (data.pending.length !== 0) {
      data.pending.forEach((pendingEmail) => {
        const userDataObj = {
          id: uuidv4(),
          fullName: "",
          email: pendingEmail.email,
          status: "pending",
          permission: "pending",
        };

        allPendingUsers.push(userDataObj);
      });
    }

    setRows((prevState) => [...allPendingUsers, ...prevState]);

    if (changeInPendingUsers) {
      await updateDoc(docRef, data);
    }
  };

  const deActivateUsers = async (handleClose) => {
    setLoading(true);
    const verifiedSelectedUsers = selectedUsers.filter(
      (user) => user.status !== "pending"
    );

    const containesPendingUsers = selectedUsers.some(
      (user) => user.status === "pending"
    );

    verifiedSelectedUsers.forEach(async (user, index) => {
      const docRef = doc(collectionData, "users", `${user.id}`);
      const userSnap = await getDoc(docRef);
      const data = userSnap.data();

      data.status = "deActivated";

      await updateDoc(docRef, data);

      if (verifiedSelectedUsers.length - 1 === index) {
        fetchUsers();
        setLoading(false);
      }
    });

    if (containesPendingUsers) {
      alertWarning("Error removing pending users");
    } else {
      alertSuccess(
        `${
          verifiedSelectedUsers.length > 1 ? "Users" : "User"
        } has been deleted`
      );
    }

    setLoading(false);
    handleClose();
  };

  const sendPasswordReset = () => {
    const verifiedSelectedUsers = selectedUsers.filter(
      (user) => user.status !== "pending"
    );

    const containesPendingUsers = selectedUsers.some(
      (user) => user.status === "pending"
    );

    verifiedSelectedUsers.forEach(async (user) => {
      await sendPassReset(user.email);
    });

    if (containesPendingUsers) {
      alertWarning("Error sending pass reset to pending users");
    } else {
      alertSuccess("Password Reset link sent");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="manage-users-container">
      {loadingPage ? (
        <Box className="loadingData" sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <div className="top-container">
            <div className="left-container">
              <SearchUser searchUser={searchUser} />
              {selectedUsers.length > 0 ? (
                <div className="button-container">
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    size="medium"
                    onClick={() => sendPasswordReset()}
                  >
                    <span>Send Password Reset Email</span>
                  </LoadingButton>
                  <DeleteUserButton
                    loading={loading}
                    deActivateUsers={deActivateUsers}
                    selectedUsers={selectedUsers}
                  />
                </div>
              ) : null}
            </div>
            <AddUser allUsers={allUsers} rows={rows} fetchUsers={fetchUsers} />
          </div>
          <UserTable rows={rows} setSelectedUsers={setSelectedUsers} />
        </>
      )}
    </div>
  );
};

export default ManageUsers;
