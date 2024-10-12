import React, { useEffect } from "react";
import "./css/styles.css";
import RecentTraining from "./recentTraining/recentTraining";
import Links from "./links/links";
import FrequentlyVisited from "./frequentlyVisited/frequentlyVisited";
import TrainingDue from "./trainingDue/trainingDue";
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { useDocs } from "../../../context/docContext";

const Dashboard = () => {
  const { deepLink } = useAuth();
  const {
    setDocOnPreview,
    toggleLoadingFile,
    setPfdDocName,
    allDocs,
    allManuals,
  } = useDocs();
  const navigate = useNavigate();

  return (
    <>
      <div className="dashboard-container">
        <div className="top-container">
          <RecentTraining />
          <Links />
        </div>
        <div className="bottom-container">
          <FrequentlyVisited />
          <TrainingDue />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
