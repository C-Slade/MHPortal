import React, { useEffect, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useAuth } from "../../../context/authContext";
import { useTraining } from "../../../context/trainingContext";
import Row from "./row";
import { v4 as uuidv4 } from "uuid";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import "./css/styles.css";

const TestResults = () => {
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterModule, setFilterModule] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [allTestResults, setTestResults] = useState([]);
  const [filteredTestResults, setFilteredTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { users, fetchUser, fetchAllUsersInfo } = useAuth();
  const { getAllScores } = useTraining();

  const handleModuleChange = (event) => {
    setFilterModule(event.target.value);
    filter("module", event.target.value);
  };
  const handleEmplyeeChange = (event) => {
    setFilterEmployee(event.target.value);
    filter("employee", event.target.value);
  };
  const handleCourseChange = (event) => {
    setFilterCourse(event.target.value);
    filter("course", event.target.value);
  };

  const filter = (filterType, event) => {
    let filteredScores = allTestResults;

    if (filterType === "module") {
      if (filterCourse !== "") {
        setFilterCourse("");
      }

      if (filterEmployee !== "") {
        filteredScores = filteredScores.filter(
          (test) => test.uid === filterEmployee
        );
      }
      if (event !== "") {
        filteredScores = filteredScores.filter((test) => test.module === event);
      }

      const unique = [...new Set(filteredScores.map((item) => item.course))];
      setCourses(unique);
    }

    if (filterType === "course") {
      if (filterEmployee !== "") {
        filteredScores = filteredScores.filter(
          (test) => test.uid === filterEmployee
        );
      }
      if (event !== "") {
        filteredScores = filteredScores.filter((test) => test.course === event);
      }

      if (filterModule === "" && filteredScores.length > 0) {
        setFilterModule(filteredScores[0].module);
      }

      if (
        filteredScores.length > 0 &&
        filteredScores[0].module !== filterModule
      ) {
        setFilterModule(filteredScores[0].module);
      }
    }

    if (filterType === "employee") {
      if (filterModule !== "") {
        filteredScores = filteredScores.filter(
          (test) => test.module === filterModule
        );
      }

      if (filterCourse !== "") {
        filteredScores = filteredScores.filter(
          (test) => test.course === filterCourse
        );
      }

      if (event !== "") {
        filteredScores = filteredScores.filter((test) => test.uid === event);
      }
    }

    setFilteredTestResults(filteredScores);
  };

  const getAllUserInfo = async () => {
    setLoading(true);
    const allUsers = await fetchAllUsersInfo();
    const userInfo = [];
    allUsers.forEach((e) => {
      userInfo.push({ name: e.info.name, uid: e.uid });
    });

    setEmployees(userInfo);
    getScores();
  };

  const getEmployeeName = (uid) => {
    let name = "";
    employees.forEach((e) => {
      if (e.uid === uid) name = e.name;
    });
    return name;
  };

  const getScores = async () => {
    const unSortedScores = [];
    const moduleNames = [];
    const courseNames = [];

    const data = await getAllScores();
    data.modules.forEach((module) => {
      moduleNames.push(module.name);
      module.courses.forEach((course) => {
        courseNames.push(course.name);
        course.scores.forEach((quiz) => {
          const condenseDateArray = quiz.date.split(" ");
          const date = `${condenseDateArray[1]} ${condenseDateArray[2]} ${condenseDateArray[3]}`;

          const quizInfo = {
            score: quiz.score,
            module: module.name,
            course: course.name,
            uid: quiz.uid,
            dateInMs: quiz.dateInMs,
            date: date,
          };
          unSortedScores.push(quizInfo);
        });
      });
    });

    const sortedScores = unSortedScores.sort((a, b) => b.dateInMs - a.dateInMs);

    setTestResults(sortedScores);
    setFilteredTestResults(sortedScores);
    setModules(moduleNames);
    setCourses(courseNames);
    setLoading(false);
  };

  useEffect(() => {
    getAllUserInfo();
  }, []);

  return (
    <div className="test-results-container">
      {loading ? (
        <>
          <Box className="loadingData" sx={{ display: "flex" }}>
            <CircularProgress />
          </Box>
        </>
      ) : (
        <>
          <div className="selection-container">
            <FormControl sx={{ m: 1, minWidth: 120 }} className="selection">
              <InputLabel id="select-helper-label">Training Module</InputLabel>
              <Select
                labelId="select-helper-label"
                id="simple-select-helper"
                value={filterModule}
                label="Training Module"
                onChange={handleModuleChange}
              >
                <MenuItem value="">
                  <em>All modules</em>
                </MenuItem>
                {modules.map((module) => (
                  <MenuItem key={uuidv4()} value={module}>
                    {module}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }} className="selection">
              <InputLabel id="select-helper-label">Course</InputLabel>
              <Select
                labelId="select-helper-label"
                id="simple-select-helper"
                value={filterCourse}
                label="Course"
                onChange={handleCourseChange}
              >
                <MenuItem value="">
                  <em>All Courses</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={uuidv4()} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }} className="selection">
              <InputLabel id="select-helper-label">Employee</InputLabel>
              <Select
                labelId="select-helper-label"
                id="simple-select-helper"
                value={filterEmployee}
                label="Employee"
                onChange={handleEmplyeeChange}
              >
                <MenuItem value="">
                  <em>All Employees</em>
                </MenuItem>
                {employees.map((e) => (
                  <MenuItem key={uuidv4()} value={e.uid}>
                    {getEmployeeName(e.uid)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="table-container">
            <div className="header">
              <div className="helper-container">
                <h4>Employee</h4>
              </div>
              <div className="helper-container">
                <h4>Module</h4>
              </div>
              <div className="helper-container">
                <h4>Course</h4>
              </div>
              <div className="helper-container">
                <h4>Date</h4>
              </div>
              <div className="helper-container">
                <h4>Score</h4>
              </div>
            </div>
            {filteredTestResults.map((info) => (
              <Row
                key={uuidv4()}
                employee={info.uid}
                module={info.module}
                course={info.course}
                score={info.score}
                allEmployees={employees}
                date={info.date}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TestResults;
