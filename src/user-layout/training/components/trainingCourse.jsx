import React, { useEffect } from "react";
import review from "../../../assets/open-book.png";
import quiz from "../../../assets/quiz.png";
import "../css/styles.css";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDocs } from "../../../context/docContext";
import { useAuth } from "../../../context/authContext";
import CreateQuiz from "./createQuiz";

const TrainingCourse = ({ course, moduleName, moduleID }) => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { setDocOnPreview, setQueryName } = useDocs();

  const reviewDocument = () => {
    const path = `view/${course.reviewDocument.id}`;
    setDocOnPreview(course.reviewDocument);
    setQueryName(course.reviewDocument.path.split("/")[0]);
    navigate(path);
  };

  const takeTest = () => {
    navigate(
      `/training/${moduleName}/${course.name.replaceAll(" ", "-")}/test/${
        course.id
      }`
    );
  };

  return (
    <div className="trainingCourse">
      <div className="title-container">
        <span>{course.name}</span>
      </div>
      {admin ? (
        <>
          <CreateQuiz editMode={true} course={course} moduleID={moduleID} />
        </>
      ) : null}
      <div className="review-container">
        <img src={review} alt="review quiz" />
        <button
          className={
            course.reviewDocument.hasOwnProperty("path")
              ? "review"
              : "review no-document"
          }
          onClick={course.reviewDocument !== undefined ? reviewDocument : null}
        >
          Review
        </button>
      </div>
      <div className="takeTest-container">
        <img src={quiz} alt="take test" />
        <button className="takeTest" onClick={takeTest}>
          Take Test
        </button>
      </div>
    </div>
  );
};

export default TrainingCourse;
