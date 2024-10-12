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
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { motion } from "framer-motion";
import DeletePage from "../modals/deletePageModal";
import { useApp } from "../../../context/appContext";
import EditDocModal from "../modals/editDocModal";
import { useTraining } from "../../../context/trainingContext.js";

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)", position: "absolute" },
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setPageName,
    setSections,
    submitNewPageLayout,
    toggleCreatingNewPage,
    updatePageSettings,
    setModeratorNames,
    docOnPreview,
    docNames,
    manualNames,
  } = useDocs();
  const { updateModuleName } = useTraining();
  const { currentUser, admin, signOutUser } = useAuth();
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
    if (currentPage.includes("docs") || currentPage.includes("manuals")) {
      try {
        await updatePageSettings(defaultPageName, newPageName);
      } catch (error) {
        alertError(error);
      }
      setLoading(false);
      toggleEdit(false);
    } else {
      try {
        await updateModuleName(newPageName);
      } catch (error) {
        alertError(error);
      }
      let removeSpacesName = newPageName.replaceAll(" ", "-").split("");

      if (removeSpacesName[removeSpacesName.length - 1] === "-") {
        removeSpacesName.pop();
      }

      removeSpacesName = removeSpacesName.join("");

      setLoading(false);
      toggleEdit(false);
      navigate(`training/${removeSpacesName}`);
    }
  };

  const uploadLayout = async () => {
    setLoading(true);

    const onManualsPage = currentPage.includes("manuals");
    const onDocsPage = currentPage.includes("docs");
    let duplicateName = false;

    if (onManualsPage && manualNames.includes(newPageName.toLowerCase()))
      duplicateName = true;
    if (onDocsPage && docNames.includes(newPageName.toLowerCase()))
      duplicateName = true;

    if (newPageName !== "" && !duplicateName) {
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
          onChange={(e) => setNewPageName(e.target.value)}
          value={newPageName}
        />
        {!onPDFviewer && admin && !location.pathname.includes("training") ? (
          <SelectPeople sumbiting={sumbiting} />
        ) : null}
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
              className="reset"
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
            <DeletePage
              headerLoading={loading}
              onTrainingPage={location.pathname.includes("training")}
            />
          </>
        ) : null}
      </motion.div>
    );
  };

  const getTitle = () => {
    const arrayPathname = location.pathname.split("/");
    const onView = arrayPathname.includes("view");
    const onTest = arrayPathname.includes("test");
    const onDocs = arrayPathname.includes("docs");
    const onTraining = arrayPathname.includes("training");
    const onManuals = arrayPathname.includes("manuals");

    if (onView) {
      return <>{docOnPreview?.name.replaceAll("-", " ")}</>;
    } else if (onTest && (!onDocs || !onManuals) && arrayPathname.length > 3) {
      return <>{arrayPathname[3].replaceAll("-", " ")}</>;
    } else if (onDocs || onManuals || onTraining) {
      return <>{arrayPathname[2].replaceAll("-", " ")}</>;
    } else {
      return <>{arrayPathname[1].replaceAll("-", " ")}</>;
    }
  };

  useEffect(() => {
    const path = location.pathname;
    setLoading(false);
    setDefaultPageName(path.replace("/docs/", "").replace("/manuals/", ""));
    if (path.includes("createFolder")) {
      setNewPageName("");
    } else {
      setNewPageName(
        path
          .replace("/docs/", "")
          .replace("/manuals/", "")
          .replace("/training/", "")
          .replaceAll("-", " ")
      );
    }

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
      setPageName(
        location.pathname.replace("/docs/", "").replace("/manuals/", "")
      );
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
        {(admin && onFIlePages && !onPDFviewer) ||
        (location.pathname.includes("/training") &&
          admin &&
          !location.pathname.includes("createQuiz")) ? (
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
      location.pathname.includes("manuals") ||
      location.pathname.includes("training")
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
