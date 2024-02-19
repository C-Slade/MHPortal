import React from "react";
import review from "../../../assets/open-book.png";
import quiz from "../../../assets/quiz.png";
import "../css/styles.css";
import { useNavigate } from "react-router-dom";
import { useDocs } from "../../../context/docContext";

const TrainingCourse = ({ course, moduleName }) => {
  const navigate = useNavigate();
  const { setDocOnPreview, setQueryName } = useDocs();

  const reviewDocument = () => {
    const path = `view/${course.reviewDocument.id}`;
    setDocOnPreview(course.reviewDocument);
    setQueryName(course.reviewDocument.path.split("/")[0]);
    navigate(path);
  };

  const takeTest = () => {
    console.log(moduleName, course.name, course.id);
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
      <div className="review-container">
        <img src={review} alt="review quiz" />
        <button className="review" onClick={reviewDocument}>
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
