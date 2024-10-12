import React from "react";
import "../css/styles.css";
import { Button } from "@mui/material";
import { useTraining } from "../../../context/trainingContext";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const TrainingDue = () => {
  const { currentModuleTrainingDue } = useTraining();
  const navigate = useNavigate();
  const location = useLocation();

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
      {currentModuleTrainingDue.length > 0 ? (
        currentModuleTrainingDue.map((quiz) => (
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
