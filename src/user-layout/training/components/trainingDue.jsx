import React, { useEffect, useState } from "react";
import "../css/styles.css";
import { doc, onSnapshot } from "firebase/firestore";
import { Button } from "@mui/material";
import { useAuth } from "../../../context/authContext";
import { collectionData } from "../../../firebase.js";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const TrainingDue = ({ currentModule }) => {
  const { currentUser } = useAuth();
  const [quizzesDue, setQuizzesDue] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const moduleScores = [];
    let sortedScores = [];
    if (currentUser !== undefined) {
      const unsub = onSnapshot(
        doc(collectionData, "training", "scores"),
        (doc) => {
          const data = doc.data();
          data.modules.map((module) => {
            if (module.name === currentModule.name) {
              module.courses.map((course, index) => {
                course.scores.map((score) => {
                  if (score.uid === currentUser.uid) {
                    const arrayDate = score.date.split(" ");
                    // minus 31535940000 in dateInMs to simulate a one minute time between quizzes for debugging.
                    moduleScores.push({
                      date: `${arrayDate[1]} ${arrayDate[2]} ${arrayDate[3]}`,
                      name: course.name,
                      score: score.score,
                      dateInMs: score.dateInMs,
                      quizID: course.id,
                    });
                  }
                  return null;
                });

                // sorts scores from most recently taken
                sortedScores = moduleScores.sort(
                  (a, b) => b.dateInMs - a.dateInMs
                );

                return null;
              });

              const uniqueQuizNames = [
                ...new Set(sortedScores.map((quiz) => quiz.name)),
              ];

              const date = new Date();
              const dateInMs = date.getTime();
              const yearInMs = 31536000000;

              const quizzesThatAreDue = [];

              uniqueQuizNames.map((name) => {
                // arrOfQuizzes is used to group same quiz names together in one array to loop over and check for scores. This is an array of same quiz objects that have their info on when they were taken and score.

                // note: sortedScores is already sorted from most recently taken to first recorded score, so this can loop from start and break when needed since the older scores are irrelevant to loop over once a quiz has been spotted for retake
                const arrOfQuizzes = sortedScores.filter((quiz) => {
                  return quiz.name === name;
                });
                for (let i = 0; i < arrOfQuizzes.length; i++) {
                  const quiz = arrOfQuizzes[i];
                  const timeSinceQuizWasTaken = dateInMs - quiz.dateInMs;

                  // checking if there has been a quiz that has been taken within the last year and has passed. It breaks if true to move onto the next set of quizzes that have not been checked.
                  if (quiz.score > 70 && timeSinceQuizWasTaken < yearInMs)
                    break;

                  // checks if the quiz was failed and was taken over 1 year ago.
                  if (quiz.score < 70 && timeSinceQuizWasTaken > yearInMs) {
                    quizzesThatAreDue.push(quiz);
                    break;
                  }
                }

                setQuizzesDue(quizzesThatAreDue);
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

  const takeTest = (quiz) => {
    const moduleName = location.pathname.split("/")[2];
    const courseName = quiz.name;
    const quizID = quiz.quizID;
    navigate(
      `/training/${moduleName}/${courseName.replaceAll(
        " ",
        "-"
      )}/test/${quizID}`
    );
  };
  return (
    <div className="trainingDue">
      <h2 className="title">Training due</h2>
      {quizzesDue.length > 0 ? (
        quizzesDue.map((quiz) => (
          <div className="quizDue-container" key={uuidv4()}>
            <div className="quizDue">
              <h2>{quiz.name}</h2>
              <Button
                variant="contained"
                className="startQuiz"
                size="small"
                onClick={() => takeTest(quiz)}
              >
                Start
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h1 className="no-content">No Training Due</h1>
      )}
    </div>
  );
};

export default TrainingDue;
