import React, { useEffect, useState } from "react";
import Radio from "@mui/material/Radio";
import "../css/styles.css";
import { useLocation, useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTraining } from "../../../context/trainingContext";
import { useApp } from "../../../context/appContext";

const Test = () => {
  const [selectedValue, setSelectedValue] = useState("0");
  const [questionCounter, setQuestionCounter] = useState(1);
  const [currentQuiz, setCurrentQuiz] = useState({});
  const { trainingModules, finishQuiz, setUploadingQuiz, uploadingQuiz } =
    useTraining();
  const { alertError, alertSuccess } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const fetchTest = () => {
    const url = location.pathname;
    const testID = url.split("/")[5];
    const moduleName = url.split("/")[2];
    const modules = trainingModules.modules;

    for (let i = 0; i < modules.length; i++) {
      if (modules[i].name === moduleName) {
        for (let index = 0; index < modules[i].courses.length; index++) {
          if (modules[i].courses[index].id === testID) {
            setCurrentQuiz(modules[i].courses[index]);
          }
        }
      }
    }
  };

  const submitAnswer = () => {
    if (selectedValue < 1 || selectedValue > 4) {
      alertError("Must select at least one answer");
    } else {
      const copyOfQuiz = { ...currentQuiz };
      copyOfQuiz.questions[questionCounter - 1]["selectedAnswer"] =
        selectedValue;
      setCurrentQuiz(copyOfQuiz);

      if (currentQuiz.questions.length !== questionCounter) {
        setQuestionCounter(questionCounter + 1);
        setSelectedValue("0");
      } else {
        finishTest();
      }
    }
  };

  const finishTest = async () => {
    const date = new Date();
    const n = date.toDateString();
    const time = date.toLocaleTimeString();
    const formatted = n + " " + time;
    const unixTimeStamp = date.toISOString();
    const timeInMs = new Date(unixTimeStamp).valueOf();

    const moduleName = location.pathname
      .replace("/training/", "")
      .split("/")[0];

    setUploadingQuiz(true);

    try {
      await finishQuiz(currentQuiz, moduleName, formatted, timeInMs);
      setUploadingQuiz(false);
      alertSuccess("Quiz completed");
      navigate(-1);
    } catch (error) {
      setUploadingQuiz(false);
      alertError("There was an error uploading quiz");
    }
  };

  useEffect(() => {
    fetchTest();
  }, []);
  return (
    <div className="test-container">
      <div className="test-modal">
        {currentQuiz.questions !== undefined ? (
          <>
            <div className="header">
              <h2>{currentQuiz.name}</h2>
              <div className="question-counter">{`${questionCounter}/${currentQuiz.questions.length}`}</div>
            </div>
            <h3>{currentQuiz.questions[questionCounter - 1].question}</h3>
            <div className="questions-container">
              <div className="question">
                <Radio
                  checked={selectedValue === "1"}
                  onChange={handleChange}
                  value="1"
                  name="radio-buttons"
                  inputProps={{ "aria-label": "A" }}
                />
                <h4>
                  {currentQuiz.questions[questionCounter - 1].answers[0].answer}
                </h4>
              </div>
              <div className="question">
                <Radio
                  checked={selectedValue === "2"}
                  onChange={handleChange}
                  value="2"
                  name="radio-buttons"
                  inputProps={{ "aria-label": "A" }}
                />
                <h4>
                  {currentQuiz.questions[questionCounter - 1].answers[1].answer}
                </h4>
              </div>
              <div className="question">
                <Radio
                  checked={selectedValue === "3"}
                  onChange={handleChange}
                  value="3"
                  name="radio-buttons"
                  inputProps={{ "aria-label": "A" }}
                />
                <h4>
                  {currentQuiz.questions[questionCounter - 1].answers[2].answer}
                </h4>
              </div>
              <div className="question">
                <Radio
                  checked={selectedValue === "4"}
                  onChange={handleChange}
                  value="4"
                  name="radio-buttons"
                  inputProps={{ "aria-label": "A" }}
                />
                <h4>
                  {currentQuiz.questions[questionCounter - 1].answers[3].answer}
                </h4>
              </div>
            </div>
            <div className="button-container">
              <LoadingButton
                loading={uploadingQuiz}
                loadingPosition="start"
                startIcon={
                  currentQuiz.questions.length === questionCounter ? (
                    <CheckCircleIcon />
                  ) : (
                    <NavigateNextIcon />
                  )
                }
                variant="contained"
                size="large"
                onClick={submitAnswer}
              >
                <span>
                  {currentQuiz.questions.length === questionCounter
                    ? "Finish Test"
                    : "Next Question"}
                </span>
              </LoadingButton>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Test;
