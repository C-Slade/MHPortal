import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./css/styles.css";
import logo from "../../../assets/maritimeLogo.png";
import { useDocs } from "../../../context/docContext";
import NavLink from "./navLink";
import { useAuth } from "../../../context/authContext";
import right_arrow_icon from "../../../assets/right-arrow.png";

const variants = {
  open: { transform: "rotate(90deg)" },
  closed: { transform: "rotate(0deg)" },
};

const Nav = () => {
  const { docNames } = useDocs();
  const { admin } = useAuth();

  const [openDocs, setOpenDocs] = useState(false);
  const [openManuals, setOpenManuals] = useState(false);
  const [openTraining, setOpenTraining] = useState(false);

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        width: "0%",
        opacity: 0,
      }}
      transition={{ type: "tween" }}
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
    </motion.nav>
  );
};

export default Nav;
