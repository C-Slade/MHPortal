import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MenuToggle } from "./menuToggle";
import logo from "../../../../assets/maritimeLogo.png";
import right_arrow_icon from "../../../../assets/right-arrow.png";
import NavLink from "../navLink";
import "./css/styles.css";
import { useDocs } from "../../../../context/docContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../context/authContext";

const sidebar = {
  open: {
    zIndex: 20,
    opacity: 1,
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
  const [openTraining, setOpenTraining] = useState(false);
  const [openManuals, setOpenManuals] = useState(false);
  const location = useLocation();
  const { docNames } = useDocs();

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
            <NavLink
              name="notifications"
              type="notifications"
              link="/notifications"
            />
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
                        key={i}
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
              onClick={() => setOpenTraining(!openTraining)}
              style={{ cursor: "pointer" }}
            >
              Training
              <span className="drop-down">
                <motion.img
                  src={right_arrow_icon}
                  alt="open menu"
                  animate={openTraining ? "open" : "closed"}
                  variants={variants}
                />
              </span>
            </h6>
            {openTraining ? (
              <>
                <NavLink
                  name="part-135"
                  type="training"
                  link="/training/part-135"
                />
                <NavLink
                  name="part-145"
                  type="training"
                  link="/training/part-145"
                />
                <NavLink name="fuel" type="training" link="/training/fuel" />
                <NavLink
                  name="Human-Factors"
                  type="training"
                  link="/training/human-factors"
                />
              </>
            ) : null}
          </div>
          <div className="docs section">
            <h6 className="nav-category">General</h6>
            <NavLink name="settings" type="settings" link="/settings" />
            <NavLink name="account" type="account" link="/account" />
            <NavLink name="Sign-Out" type="signout" link="/login" />
          </div>
          <div className="docs section">
            <h6 className="nav-category">Help</h6>
            <NavLink name="report bug" type="bug" link="/report-bug" />
          </div>
        </motion.div>
        <MenuToggle toggle={() => toggleOpen(!isOpen)} />
      </motion.nav>
    </>
  );
};

export default SmallNav;
