import React from "react";
import "../css/styles.css";
import Score from "./score.jsx";
import { useTraining } from "../../../context/trainingContext.js";

const RecentTraining = () => {
  const { currentModuleScores } = useTraining();

  return (
    <>
      <div className="recentTraining-container">
        <h2 className="title">Recent Training</h2>
        {currentModuleScores.length === 0 ? (
          <>
            <h1 className="no-content">No Recent Training</h1>
          </>
        ) : (
          <Score scores={currentModuleScores} />
        )}
      </div>
    </>
  );
};

export default RecentTraining;
