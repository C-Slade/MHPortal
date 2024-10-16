import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useTraining } from "../../context/trainingContext";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { useApp } from "../../context/appContext";
import "./css/styles.css";
import { useNavigate } from "react-router-dom";

const CreateTrainingModule = () => {
  const { createModule, trainingModules } = useTraining();
  const { alertError, alertSuccess } = useApp();
  const [submitingModule, setSubmitingModule] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const navigate = useNavigate();

  const createNewModule = async () => {
    const duplicateName = trainingModules.modules.some(
      (mod) => mod.name === moduleName.toLowerCase()
    );

    if (!duplicateName) {
      setSubmitingModule(true);
      try {
        await createModule(moduleName);
        setSubmitingModule(false);
        alertSuccess(`${moduleName} has now been created`);
        navigate(`/training/${moduleName}`);
      } catch (error) {
        setSubmitingModule(false);
        alertError("There was an error getting module");
      }
    } else {
      alertError("Module name already exists");
    }
  };

  return (
    <>
      <div className="create-quiz-module-container">
        <div className="container">
          <div className="title-container">
            <h2>Create Quiz Module</h2>
          </div>
          <TextField
            id="outlined-basic"
            label="Module Name"
            variant="outlined"
            className="module-name"
            autoComplete="off"
            type="search"
            onChange={(e) => setModuleName(e.target.value)}
          />
          <LoadingButton
            loading={submitingModule}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            className="submit-module"
            size="large"
            onClick={createNewModule}
          >
            <span>Save</span>
          </LoadingButton>
        </div>
      </div>
    </>
  );
};

export default CreateTrainingModule;
