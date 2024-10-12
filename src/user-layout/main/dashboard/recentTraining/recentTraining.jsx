import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../context/authContext.js";
import { collectionData } from "../../../../firebase.js";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { doc, onSnapshot } from "firebase/firestore";
import Score from "./score.jsx";
import "./css/styles.css";

const RecentTraining = () => {
  const [loadingScores, setLoadingScores] = useState(true);
  const { currentUser } = useAuth();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const moduleScores = [];
    if (currentUser !== undefined) {
      const unsub = onSnapshot(
        doc(collectionData, "training", "scores"),
        (doc) => {
          const data = doc.data();
          data.modules.map((module) => {
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
              return null;
            });
            return null;
          });

          const sortedScores = moduleScores.sort(
            (a, b) => b.dateInMs - a.dateInMs
          );
          setScores(sortedScores);
          setLoadingScores(false);
        }
      );
      return unsub;
    } else {
      setLoadingScores(false);
    }
  }, []);
  return (
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
  );
};

export default RecentTraining;
