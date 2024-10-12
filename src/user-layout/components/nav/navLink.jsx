import React, { useRef } from "react";
import { Link } from "react-router-dom";
import folder_Icon from "../../../assets/folder.png";
import dashboard_Icon from "../../../assets/dashboard.png";
import training_Icon from "../../../assets/exam.png";
import account_Icon from "../../../assets/profile.png";
import logout_Icon from "../../../assets/logout.png";
import bug_Icon from "../../../assets/ladybug.png";
import createFolder_icon from "../../../assets/add-folder.png";
import createQuiz_icon from "../../../assets/data.png";
import userSettings_icon from "../../../assets/worker.png";
import testResults_icon from "../../../assets/result.png";
import { useAuth } from "../../../context/authContext";

const NavLink = ({ name, type, link }) => {
  const navRef = useRef();
  const { signOutUser } = useAuth();

  const getIcon = () => {
    if (type === "folder") return folder_Icon;
    if (type === "dashboard") return dashboard_Icon;
    if (type === "training") return training_Icon;
    if (type === "account") return account_Icon;
    if (type === "signout") return logout_Icon;
    if (type === "bug") return bug_Icon;
    if (type === "create-folder") return createFolder_icon;
    if (type === "create-quiz") return createQuiz_icon;
    if (type === "manage-users") return userSettings_icon;
    if (type === "test-results") return testResults_icon;
  };

  const handleLink = async () => {
    if (type === "signout") {
      await signOutUser();
    }
  };

  return (
    <div className="nav-link-container" ref={navRef} onClick={handleLink}>
      <Link to={link}>
        <img
          src={getIcon()}
          alt="Link"
          style={type === "create-quiz" ? { marginLeft: "2px" } : null}
        />
        <h4>{name.replace(/-/g, " ")}</h4>
      </Link>
    </div>
  );
};

export default NavLink;
