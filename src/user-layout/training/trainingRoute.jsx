import React, { useEffect } from "react";
import RecentTraining from "./components/recentTraining";
import TrainingDue from "./components/trainingDue";
import TrainingCourse from "./components/trainingCourse";
import CreateQuiz from "./components/createQuiz";
import { v4 as uuidv4 } from "uuid";
import "./css/styles.css";
import { useTraining } from "../../context/trainingContext";

const TrainingRoute = ({ module }) => {
  const { setCurrentModule } = useTraining();
  useEffect(() => {
    setCurrentModule(module);
  }, []);
  return (
    <div className="training-container">
      <div className="info-container">
        <RecentTraining currentModule={module} />
        <TrainingDue currentModule={module} />
      </div>
      {module.courses.map((course) => (
        <TrainingCourse
          key={uuidv4()}
          course={course}
          moduleName={module.name}
        />
      ))}
      <CreateQuiz />
    </div>
  );
};

export default TrainingRoute;
