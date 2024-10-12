import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./css/styles.css";
import logo from "../../../assets/maritimeLogo.png";
import { v4 as uuidv4 } from "uuid";
import { useDocs } from "../../../context/docContext";
import NavLink from "./navLink";
import { useAuth } from "../../../context/authContext";
import right_arrow_icon from "../../../assets/right-arrow.png";
import { useTraining } from "../../../context/trainingContext";

const variants = {
  open: { transform: "rotate(90deg)" },
  closed: { transform: "rotate(0deg)" },
};

const Nav = () => {
  const { docNames, manualNames } = useDocs();
  const { moduleNames } = useTraining();
  const { admin } = useAuth();

  const [openDocs, setOpenDocs] = useState(false);
  const [openManuals, setOpenManuals] = useState(false);
  const [openTraining, setOpenTraining] = useState(false);

  return (
    <motion.nav
      className="navbar desktop-nav"
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
        {admin ? (
          <NavLink
            name="manage users"
            type="manage-users"
            link="/manage-users"
          />
        ) : null}
        {admin ? (
          <NavLink
            name="test results"
            type="test-results"
            link="/test-results"
          />
        ) : null}
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
                    key={`${i + doc}`}
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
            {moduleNames.map((name) => (
              <NavLink
                name={name}
                type="training"
                link={`/training/${name}`}
                key={uuidv4()}
              />
            ))}
            {admin ? (
              <NavLink
                name="Create"
                type="create-quiz"
                link="/training/createQuiz"
              />
            ) : null}
          </>
        ) : null}
      </div>
      <div className="docs section">
        <h6 className="nav-category">General</h6>
        <NavLink name="account" type="account" link="/account" />
        <NavLink name="Sign-Out" type="signout" link="/login" />
      </div>
    </motion.nav>
  );
};

export default Nav;
