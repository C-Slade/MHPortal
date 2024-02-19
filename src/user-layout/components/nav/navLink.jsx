import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import folder_Icon from "../../../assets/folder.png";
import dashboard_Icon from "../../../assets/dashboard.png";
import notifications_Icon from "../../../assets/notification.png";
import training_Icon from "../../../assets/exam.png";
import settings_Icon from "../../../assets/settings.png";
import account_Icon from "../../../assets/profile.png";
import logout_Icon from "../../../assets/logout.png";
import bug_Icon from "../../../assets/ladybug.png";
import createFolder_icon from "../../../assets/add-folder.png";
import createQuiz_icon from "../../../assets/data.png";
import { useAuth } from "../../../context/authContext";

const NavLink = ({ name, type, link }) => {
  const navRef = useRef();
  const { signOutUser } = useAuth();

  const getIcon = () => {
    if (type === "folder") return folder_Icon;
    if (type === "dashboard") return dashboard_Icon;
    if (type === "notifications") return notifications_Icon;
    if (type === "training") return training_Icon;
    if (type === "settings") return settings_Icon;
    if (type === "account") return account_Icon;
    if (type === "signout") return logout_Icon;
    if (type === "bug") return bug_Icon;
    if (type === "create-folder") return createFolder_icon;
    if (type === "create-quiz") return createQuiz_icon;
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
