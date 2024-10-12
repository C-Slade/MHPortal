import React, { useEffect, useState } from "react";
import "./css/styles.css";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@mui/material";
import { useAuth } from "../../../../context/authContext";
import { collectionData } from "../../../../firebase.js";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import notification_icon from "../../../../assets/notification.png";

const TrainingDue = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quizzesDue, setQuizzesDue] = useState([]);

  const getScores = async () => {
    const docRef = doc(collectionData, "training", "scores");
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const scores = [];

    data.modules.forEach((module) => {
      module.courses.forEach((course) => {
        let hasNeverDoneQuiz = true;
        course.scores.forEach((score) => {
          if (score.uid === currentUser.uid) {
            hasNeverDoneQuiz = false;
            const arrayDate = score.date.split(" ");
            scores.push({
              date: `${arrayDate[1]} ${arrayDate[2]} ${arrayDate[3]}`,
              name: course.name,
              score: score.score,
              dateInMs: score.dateInMs,
              quizID: course.id,
              moduleName: module.name,
            });
          }
        });
        if (hasNeverDoneQuiz) {
          scores.push({
            name: course.name,
            quizID: course.id,
            dateInMs: 0,
            moduleName: module.name,
          });
        }
      });
    });

    const groupedIDs = scores
      .map((item) => item.quizID)
      .filter((value, index, self) => self.indexOf(value) === index);

    const groupedQuizzes = {};

    groupedIDs.forEach((quizID) => {
      scores.forEach((score) => {
        if (score.quizID === quizID) {
          if (groupedQuizzes.hasOwnProperty(quizID)) {
            groupedQuizzes[quizID].push(score);
          } else {
            groupedQuizzes[quizID] = [score];
          }
        }
      });
    });

    const date = new Date();
    const dateInMs = date.getTime();
    const yearInMs = 31536000000;

    const quizzesThatAreDue = [];

    groupedIDs.forEach((id) => {
      const sortedScores = groupedQuizzes[id].sort(
        (a, b) => b.dateInMs - a.dateInMs
      );

      for (let i = 0; i < sortedScores.length; i++) {
        const quiz = sortedScores[i];
        const timeSinceQuizWasTaken = dateInMs - quiz.dateInMs;

        if (quiz.score > 70 && timeSinceQuizWasTaken < yearInMs) break;

        if (quiz.score < 70 && timeSinceQuizWasTaken > yearInMs) {
          quizzesThatAreDue.push(quiz);
          break;
        }

        if (timeSinceQuizWasTaken > yearInMs) {
          quizzesThatAreDue.push(quiz);
          break;
        }

        if (quiz.score < 70) {
          quizzesThatAreDue.push(quiz);
          break;
        }
      }
    });
    setQuizzesDue(quizzesThatAreDue);
  };

  const takeTest = (quiz) => {
    const moduleName = quiz.moduleName;
    const courseName = quiz.name;
    const quizID = quiz.quizID;

    navigate(
      `/training/${moduleName}/${courseName.replaceAll(
        " ",
        "-"
      )}/test/${quizID}`
    );
  };

  useEffect(() => {
    if (currentUser) {
      getScores();
    }
  }, []);
  return (
    <div className="trainingDue-container">
      <div className="heading">
        <img src={notification_icon} alt="notification icon" />
        <h2>Training Due</h2>
      </div>
      {quizzesDue.length > 0 ? (
        <>
          {quizzesDue.map((quiz) => (
            <div className="quizLink-container" key={uuidv4()}>
              <h4>{quiz.name}</h4>
              <Button
                variant="contained"
                className="startQuiz"
                size="small"
                onClick={() => takeTest(quiz)}
              >
                Start
              </Button>
            </div>
          ))}
        </>
      ) : (
        <h1 className="no-content">No Training Due</h1>
      )}
    </div>
  );
};

export default TrainingDue;
