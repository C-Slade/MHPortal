import React, { useEffect, useState } from "react";
import user from "../../../assets/user.png";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/styles.css";
import { useAuth } from "../../../context/authContext";
import { TextField, Button } from "@mui/material";
import SelectPeople from "./selectPeople.jsx";
import { useDocs } from "../../../context/docContext";
import edit_icon from "../../../assets/edit-document.png";
import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";
import PublishIcon from "@mui/icons-material/Publish";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { motion } from "framer-motion";
import DeletePage from "../modals/deletePageModal";
import { useApp } from "../../../context/appContext";
import EditDocModal from "../modals/editDocModal";

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)", position: "absolute" },
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setPageName,
    pageName,
    setSections,
    submitNewPageLayout,
    toggleCreatingNewPage,
    updatePageSettings,
    setModeratorNames,
    docOnPreview,
    docNames,
  } = useDocs();
  const { currentUser, admin, signOutUser, getRegisterKey } = useAuth();
  const { alertError, onPDFviewer, alertSuccess } = useApp();
  const [editingPage, toggleEdit] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultPageName, setDefaultPageName] = useState();
  const [sumbiting, setSubmiting] = useState(false);
  const [onFIlePages, setOnFIlePages] = useState(false);

  const currentPage = location.pathname;

  const savePageSettings = async () => {
    setLoading(true);
    if (currentPage.includes("docs")) {
      if (currentPage.includes("createFolder")) {
        await updatePageSettings("docs", newPageName);
      } else {
        await updatePageSettings("docs", defaultPageName);
      }
      setLoading(false);
      toggleEdit(false);
    } else if (currentPage.includes("manuals")) {
      if (currentPage.includes("createFolder")) {
        await updatePageSettings("manuals", newPageName);
      } else {
        await updatePageSettings("manuals", defaultPageName);
      }
      setLoading(false);
      toggleEdit(false);
    }
  };

  const uploadLayout = async () => {
    setLoading(true);
    if (newPageName !== "" && !docNames.includes(newPageName)) {
      setSubmiting(true);
      await submitNewPageLayout(newPageName);
      setPageName("");
      setSections([]);
      setModeratorNames([]);
      setLoading(false);
      setSubmiting(false);
      alertSuccess("Page has successfully been uploaded");
      setNewPageName("");
    } else if (newPageName === "") {
      alertError("Page name required");
      setLoading(false);
    } else {
      alertError("Page name already exists");
      setLoading(false);
    }
  };

  const headerDocSettings = () => {
    return (
      <motion.div
        className="header-doc-settings"
        animate={editingPage ? "open" : "closed"}
        exit={"closed"}
        variants={variants}
      >
        <TextField
          label="Page Name"
          variant="outlined"
          size="small"
          onChange={(e) =>
            currentPage.includes("createFolder")
              ? setNewPageName(e.target.value)
              : setPageName(e.target.value)
          }
          value={currentPage.includes("createFolder") ? newPageName : pageName}
        />
        {!onPDFviewer && admin ? <SelectPeople sumbiting={sumbiting} /> : null}
        {location.pathname.includes("/createFolder") && admin ? (
          <>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={<PublishIcon />}
              variant="contained"
              size="large"
              onClick={uploadLayout}
            >
              <span>Submit</span>
            </LoadingButton>
            <Button
              startIcon={<RestartAltIcon />}
              variant="contained"
              size="large"
              onClick={() => setSections([])}
            >
              <span>Reset</span>
            </Button>
          </>
        ) : admin ? (
          <>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
              size="large"
              onClick={savePageSettings}
            >
              <span>Save</span>
            </LoadingButton>
            <LoadingButton
              loading={loading}
              variant="contained"
              loadingPosition="start"
              size="large"
              startIcon={<CloseIcon />}
              onClick={() => toggleEdit(false)}
            >
              <span>Close</span>
            </LoadingButton>
            <DeletePage headerLoading={loading} />
          </>
        ) : null}
      </motion.div>
    );
  };

  const getTitle = () => {
    if (location.pathname.includes("view")) {
      const previousLocationsArray = location.pathname.split("/");
      const index = previousLocationsArray.indexOf("view");
      return (
        <>
          <p>
            <span className="back-btn" onClick={() => navigate(-1)}>
              {previousLocationsArray[index - 1]}
            </span>
            /{docOnPreview.name}
          </p>
        </>
      );
    } else {
      return location.pathname.replace("/", "");
    }
  };

  useEffect(() => {
    const path = location.pathname;
    setLoading(false);
    setDefaultPageName(location.pathname.replace("/docs/", ""));

    if (path.includes("login")) {
      navigate("/dashboard");
      return;
    }

    if (path.includes("register")) {
      signOutUser();
    }

    if (
      path.includes("docs") ||
      path.includes("manuals") ||
      path.includes("view")
    ) {
      setOnFIlePages(true);
    } else {
      setOnFIlePages(false);
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname.includes("/createFolder") && admin) {
      toggleEdit(true);
      setPageName("");

      /**
       * *@toggleCreatingNewPage() is in docContext and serves a way for differentiating whether to create a new page and section or just adding a new section to an existing page
       */

      toggleCreatingNewPage(true);
    } else {
      setPageName(location.pathname.replace("/docs/", ""));
      toggleCreatingNewPage(false);
      toggleEdit(false);
    }

    setLoading(false);
  }, [location]);

  return (
    <header>
      <motion.div
        className="page-name-container"
        animate={!editingPage ? "open" : "closed"}
        exit={"closed"}
        variants={variants}
      >
        <h1>{getTitle()}</h1>
        {admin && onFIlePages && !onPDFviewer ? (
          <img
            src={edit_icon}
            alt="Edit document"
            onClick={() => {
              toggleEdit(!editingPage);
            }}
          />
        ) : onPDFviewer && admin ? (
          <>
            <EditDocModal />
          </>
        ) : null}
      </motion.div>
      {location.pathname.includes("docs") ||
      location.pathname.includes("manuals")
        ? headerDocSettings()
        : null}
      <div className="user-container">
        <p>{currentUser.email}</p>
        <img src={user} alt="user" />
      </div>
    </header>
  );
};

export default Header;
