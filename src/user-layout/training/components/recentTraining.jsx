import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import "../css/styles.css";
import { useAuth } from "../../../context/authContext";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { collectionData } from "../../../firebase.js";
import Score from "./score.jsx";

const RecentTraining = ({ currentModule }) => {
  const { currentUser } = useAuth();
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    setLoadingScores(true);
    const moduleScores = [];
    if (currentUser !== undefined) {
      const unsub = onSnapshot(
        doc(collectionData, "training", "scores"),
        (doc) => {
          const data = doc.data();
          data.modules.map((module) => {
            if (module.name === currentModule.name) {
              module.courses.map((course) => {
                course.scores.map((score) => {
                  if (score.uid === currentUser.uid) {
                    const arrayDate = score.date.split(" ");
                    moduleScores.push({
                      date: `${arrayDate[1]} ${arrayDate[2]} ${arrayDate[3]}`,
                      name: course.name,
                      score: score.score,
                      dateInMs: score.dateInMs,
                    });
                  }
                  return null;
                });
                const sortedScores = moduleScores.sort(
                  (a, b) => b.dateInMs - a.dateInMs
                );
                setScores(sortedScores);
                setLoadingScores(false);
                return null;
              });
            }
            return null;
          });
        }
      );
      return unsub;
    }
  }, []);
  return (
    <>
      <div className="recentTraining-container">
        <h2 className="title">Recent Training</h2>
        {scores.length === 0 ? (
          <>
            {loadingScores ? (
              <>
                <Box className="loadingScores" sx={{ display: "flex" }}>
                  <CircularProgress />
                </Box>
              </>
            ) : (
              <h1 className="no-content">No Recent Training</h1>
            )}
          </>
        ) : (
          <Score scores={scores} />
        )}
      </div>
    </>
  );
};

export default RecentTraining;
