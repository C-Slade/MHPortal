import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MenuToggle } from "./menuToggle";
import { v4 as uuidv4 } from "uuid";
import logo from "../../../../assets/maritimeLogo.png";
import right_arrow_icon from "../../../../assets/right-arrow.png";
import NavLink from "../navLink";
import "./css/styles.css";
import { useDocs } from "../../../../context/docContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/authContext";
import { useTraining } from "../../../../context/trainingContext";

const sidebar = {
  open: {
    zIndex: 20,
    opacity: 1,
    width: "300px",
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
      delay: 0.5,
    },
  },
  closed: {
    zIndex: 0,
    display: "none",
    opacity: 0,
  },
};

const BGvariants = {
  open: { width: "300px" },
  closed: { width: "0px" },
};

const variants = {
  open: { transform: "rotate(90deg)" },
  closed: { transform: "rotate(0deg)" },
};

export const SmallNav = () => {
  const { admin } = useAuth();
  const [isOpen, toggleOpen] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [openManuals, setOpenManuals] = useState(false);
  const location = useLocation();
  const { docNames, manualNames } = useDocs();

  useEffect(() => {
    toggleOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        animate={isOpen ? "open" : "closed"}
        className="small-nav"
        variants={BGvariants}
      >
        <motion.div
          className="nav-info-wrapper navbar"
          animate={isOpen ? "open" : "closed"}
          variants={sidebar}
        >
          <div className="branding-container">
            <div className="logo-background">
              <img src={logo} alt="logo" />
            </div>
            <h2>MHI Portal</h2>
          </div>
          <div className="main-menu section">
            <NavLink name="dashboard" type="dashboard" link="/dashboard" />
          </div>
          <div className="docs section">
            <h6
              className="nav-category"
              onClick={() => setOpenDocs(!openDocs)}
              style={{ cursor: "pointer" }}
            >
              Docs
              <span className="drop-down">
                <motion.img
                  src={right_arrow_icon}
                  alt="open menu"
                  animate={openDocs ? "open" : "closed"}
                  variants={variants}
                />
              </span>
            </h6>
            {openDocs ? (
              <>
                {docNames
                  ? docNames.map((doc, i) => (
                      <NavLink
                        name={doc}
                        key={uuidv4()}
                        type="folder"
                        link={`/docs/${doc}`}
                      />
                    ))
                  : null}
                {admin ? (
                  <NavLink
                    name="create"
                    type="create-folder"
                    link={`/docs/createFolder`}
                  />
                ) : null}
              </>
            ) : null}
          </div>
          <div className="docs section">
            <h6
              className="nav-category"
              onClick={() => setOpenManuals(!openManuals)}
              style={{ cursor: "pointer" }}
            >
              Manuals
              <span className="drop-down">
                <motion.img
                  src={right_arrow_icon}
                  alt="open menu"
                  animate={openManuals ? "open" : "closed"}
                  variants={variants}
                />
              </span>
            </h6>
            {openManuals ? (
              <>
                {manualNames
                  ? manualNames.map((manual, i) => (
                      <NavLink
                        name={manual}
                        key={`${i + manual}`}
                        type="folder"
                        link={`/manuals/${manual}`}
                      />
                    ))
                  : null}
                {admin ? (
                  <NavLink
                    name="create"
                    type="create-folder"
                    link={`/manuals/createFolder`}
                  />
                ) : null}
              </>
            ) : null}
          </div>
          <div className="docs section">
            <h6 className="nav-category">General</h6>
            <NavLink name="Sign-Out" type="signout" link="/login" />
          </div>
        </motion.div>
        <MenuToggle toggle={() => toggleOpen(!isOpen)} />
      </motion.nav>
    </>
  );
};

export default SmallNav;
