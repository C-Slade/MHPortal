import React, { useEffect, useState } from "react";
import "./css/styles.css";

const Row = ({ employee, module, course, score, allEmployees, date }) => {
  const [name, setName] = useState("");
  const getScoreColor = () => {
    if (score >= 90) return { backgroundColor: "#10ae20" };
    if (score >= 80) return { backgroundColor: "#90d40a" };
    if (score >= 70) return { backgroundColor: "#cdc724" };
    if (score > 60) return { backgroundColor: "#FE9901" };
    if (score <= 60) return { backgroundColor: "#FF2E00" };
  };

  useEffect(() => {
    let employeeName = "";
    allEmployees.forEach((e) =>
      e.uid === employee ? (employeeName = e.name) : null
    );
    setName(employeeName);
  }, []);

  return (
    <div className="row-container">
      <div className="info-container">
        <h3>{name}</h3>
      </div>
      <div className="info-container">
        <h4>{module}</h4>
      </div>
      <div className="info-container">
        <h4>{course}</h4>
      </div>
      <div className="info-container">
        <h4>{date}</h4>
      </div>
      <div className="info-container">
        <div className="score-color-container" style={getScoreColor()}>
          <h3 style={{ color: "white" }}>{score}%</h3>
        </div>
      </div>
    </div>
  );
};

export default Row;
