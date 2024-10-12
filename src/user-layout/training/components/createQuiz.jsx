import { React, useEffect, useState } from "react";
import add_icon from "../../../assets/add.png";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import create_icon from "../../../assets/pencil.png";
import Radio from "@mui/material/Radio";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import { collectionData } from "../../../firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import PublishIcon from "@mui/icons-material/Publish";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LoadingButton from "@mui/lab/LoadingButton";
import FormControl from "@mui/material/FormControl";
import { v4 as uuidv4 } from "uuid";
import { useDocs } from "../../../context/docContext";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import "../css/styles.css";
import { useTraining } from "../../../context/trainingContext";
import { useLocation } from "react-router-dom";
import { useApp } from "../../../context/appContext";
import { motion } from "framer-motion";
import { RotatingLines } from "react-loader-spinner";
import ListSubheader from "@mui/material/ListSubheader";
import attention_icon from "../../../assets/attention.png";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  bgcolor: "background.paper",
  borderRadius: "15px",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function CreateQuiz({ editMode, course, moduleID }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={editMode ? "editQuiz" : "createQuiz"}>
      {editMode ? (
        <Button onClick={() => setOpen(true)} size="small" variant="contained">
          Edit
        </Button>
      ) : (
        <img
          src={add_icon}
          alt="add_icon"
          className="openModal"
          onClick={() => setOpen(true)}
        />
      )}

      <Modal
        open={open}
        className="add-course"
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: "60%" }} className="create-quiz-container">
          <ChildModal
            closeModal={() => setOpen(false)}
            course={course}
            editMode={editMode}
            moduleID={moduleID}
          />
        </Box>
      </Modal>
    </div>
  );
}

function DeleteQuiz({ editMode, moduleID, course }) {
  const [open, setOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);
  const { alertSuccess } = useApp();
  const { getRecentTrainingForModule } = useTraining();

  const removeQuiz = async () => {
    setDeletingQuiz(true);
    const docRef = doc(collectionData, "training", "training");
    const scoreRef = doc(collectionData, "training", "scores");
    const scoreSnap = await getDoc(scoreRef);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    const scoreData = scoreSnap.data();

    const indexOfModule = data.modules.findIndex(
      (value) => value.moduleID === moduleID
    );

    const indexOfCourse = data.modules[indexOfModule].courses.findIndex(
      (value) => value.id === course.id
    );

    data.modules[indexOfModule].courses.splice(indexOfCourse, 1);

    const indexOfScoreModule = scoreData.modules.findIndex(
      (value) => value.moduleID === moduleID
    );

    const indexOfScoreCourse = scoreData.modules[
      indexOfScoreModule
    ].courses.findIndex((value) => value.id === course.id);

    scoreData.modules[indexOfScoreModule].courses.splice(indexOfScoreCourse, 1);

    await updateDoc(docRef, data);
    await updateDoc(scoreRef, scoreData);

    getRecentTrainingForModule();
    alertSuccess("Quiz has been successfully been deleted");
    setDeletingQuiz(false);
  };
  return (
    <>
      <LoadingButton
        onClick={() => setOpen(true)}
        size="small"
        variant="contained"
        className="deleteQuiz"
        startIcon={<DeleteForeverIcon />}
        loading={deletingQuiz}
      >
        <span>Delete Quiz</span>
      </LoadingButton>
      <Modal
        open={open}
        className="add-course"
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style }} className="delete-quiz-container">
          <DeleteQuizModal
            closeModal={() => setOpen(false)}
            removeQuiz={removeQuiz}
            deleteQuiz={deletingQuiz}
          />
        </Box>
      </Modal>
    </>
  );
}

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)" },
};

function DeleteQuizModal({ closeModal, removeQuiz, deleteQuiz }) {
  return (
    <>
      <div className="deleteQuiz-modal">
        {deleteQuiz ? (
          <Box className="loading-container">
            <CircularProgress />
          </Box>
        ) : (
          <motion.div animate={"open"} exit={"closed"}>
            <h3>Are you sure you want to delete this quiz?</h3>
            <div className="button-container">
              <Button
                size="small"
                variant="contained"
                className="deleteQuiz"
                onClick={() => removeQuiz()}
              >
                Delete
              </Button>
              <Button
                onClick={() => closeModal()}
                size="small"
                variant="contained"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

function ChildModal({ closeModal, course, editMode, moduleID }) {
  const [quizName, setQuizName] = useState("");
  const [uploadingQuiz, setUpload] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionToEdit, setQuestionToEdit] = useState();
  const [onCreateQuestionTab, toggleCreateQuestion] = useState(true);
  const [selectedValue, setSelectedValue] = useState("1");
  const [question, setQuestion] = useState("");
  const [documentToAttach, setDocToAttach] = useState();
  const [answerOne, setAnswerOne] = useState("");
  const [answerTwo, setAnswerTwo] = useState("");
  const [answerThree, setAnswerThree] = useState("");
  const [answerFour, setAnswerFour] = useState("");
  const [questionInputError, setQuestionInputError] = useState(false);
  const [quizNameInputError, setQuizNameInputError] = useState(false);
  const [errorHelper, setErrorHelper] = useState("");

  const { alertSuccess } = useApp();
  const { uploadQuiz, getRecentTrainingForModule, getTrainingDueForModule } =
    useTraining();
  const location = useLocation();

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  useEffect(() => {
    if (editMode) {
      setQuestions(course.questions);
      setDocToAttach(course.reviewDocument);
      setQuestionToEdit(0);
      toggleCreateQuestion(false);
      setQuizName(course.name);

      setQuestion(course.questions[0].question);
      setAnswerOne(course.questions[0].answers[0].answer);
      setAnswerTwo(course.questions[0].answers[1].answer);
      setAnswerThree(course.questions[0].answers[2].answer);
      setAnswerFour(course.questions[0].answers[3].answer);
      setSelectedValue(course.questions[0].correctAnswer);
    }
  }, []);

  const addQuestion = () => {
    setQuestionInputError(false);
    if (quizName !== "") {
      setQuizNameInputError(false);
      setErrorHelper("");
    } else {
      setErrorHelper("Must add name to quiz before saving");
    }
    if (onCreateQuestionTab) {
      const allQuestions = [
        ...questions,
        {
          questionID: uuidv4(),
          question: question,
          answers: [
            { answer: answerOne, value: 1 },
            { answer: answerTwo, value: 2 },
            { answer: answerThree, value: 3 },
            { answer: answerFour, value: 4 },
          ],
          correctAnswer: selectedValue,
        },
      ];
      setQuestions(allQuestions);
      setQuestion("");
      setAnswerOne("");
      setAnswerTwo("");
      setAnswerThree("");
      setAnswerFour("");
    } else {
      const allQuestions = [...questions];

      allQuestions[questionToEdit].question = question;
      allQuestions[questionToEdit].answers[0].answer = answerOne;
      allQuestions[questionToEdit].answers[1].answer = answerTwo;
      allQuestions[questionToEdit].answers[2].answer = answerThree;
      allQuestions[questionToEdit].answers[3].answer = answerFour;
      allQuestions[questionToEdit].correctAnswer = selectedValue;
    }
  };

  const viewQuestion = (i) => {
    setQuestionToEdit(i);
    toggleCreateQuestion(false);
    setQuestion(questions[i].question);
    setAnswerOne(questions[i].answers[0].answer);
    setAnswerTwo(questions[i].answers[1].answer);
    setAnswerThree(questions[i].answers[2].answer);
    setAnswerFour(questions[i].answers[3].answer);
    setSelectedValue(questions[i].correctAnswer);
  };

  const createQuestion = () => {
    toggleCreateQuestion(true);
    setQuestion("");
    setAnswerOne("");
    setAnswerTwo("");
    setAnswerThree("");
    setAnswerFour("");
  };

  const deleteQuestion = () => {
    const allQuestions = [...questions];
    const newQuestions = allQuestions.filter(
      (question, i) => i !== questionToEdit
    );
    setQuestions(newQuestions);
    createQuestion();
  };

  const startUploadingQuiz = async () => {
    setUpload(true);
    if (questions.length > 0) setQuestionInputError(false);
    if (quizName !== "") setQuizNameInputError(false);
    if (questions.length === 0) {
      setQuestionInputError(true);
      setErrorHelper("Must add at least one question to quiz");
      setUpload(false);
      return;
    } else if (quizName === "") {
      setErrorHelper("Must add name to quiz before saving");
      setUpload(false);
      setQuizNameInputError(true);
      return;
    }
    if (editMode) {
      const docRef = doc(collectionData, "training", "training");
      const scoreRef = doc(collectionData, "training", "scores");
      const docSnap = await getDoc(docRef);
      const scoreSnap = await getDoc(scoreRef);
      const scoreData = scoreSnap.data();
      const data = docSnap.data();
      const currentCourseID = course.id;

      const indexOfModule = data.modules.findIndex(
        (value) => value.moduleID === moduleID
      );

      const indexOfCourse = data.modules[indexOfModule].courses.findIndex(
        (value) => value.id === course.id
      );

      const docToAttach =
        documentToAttach === undefined ? {} : documentToAttach;

      data.modules[indexOfModule].courses[indexOfCourse] = {
        name: quizName,
        id: currentCourseID,
        questions: questions,
        reviewDocument: docToAttach,
      };

      const indexOfScoreModule = scoreData.modules.findIndex(
        (value) => value.moduleID === moduleID
      );

      const indexOfScoreCourse = scoreData.modules[
        indexOfScoreModule
      ].courses.findIndex((value) => value.id === course.id);

      const scores =
        scoreData.modules[indexOfScoreModule].courses[indexOfScoreCourse]
          .scores;

      scoreData.modules[indexOfScoreModule].courses[indexOfScoreCourse] = {
        name: quizName,
        id: currentCourseID,
        questions: questions,
        scores: scores,
      };

      await updateDoc(docRef, data);
      await updateDoc(scoreRef, scoreData);
      getRecentTrainingForModule();
      getTrainingDueForModule();
      setUpload(false);
      closeModal();
      alertSuccess("Quiz has been updated");
    } else {
      if (quizName === "") {
        setQuizNameInputError(true);
        setUpload(false);
        return;
      } else {
        setQuizNameInputError(false);
      }
      if (questions.length === 0) {
        setQuestionInputError(true);
        setErrorHelper("Must save at least one question to quiz");
        setUpload(false);
      } else {
        const courseID = uuidv4();

        const course = {
          name: quizName,
          id: courseID,
          questions: questions,
          reviewDocument: {},
        };

        if (documentToAttach !== undefined) {
          course.reviewDocument = documentToAttach;
        }
        const moduleName = location.pathname
          .replace("/training/", "")
          .replace(" ", "-");
        await uploadQuiz(course, moduleName);
        getTrainingDueForModule();
        setUpload(false);
        closeModal();
        alertSuccess("Quiz has been uploaded");
      }
    }
  };

  return (
    <>
      <div className="create-quiz-modal">
        <div className="title-container">
          <h1>{editMode ? "Edit Quiz" : "Create New Quiz"}</h1>
        </div>
        <div className="quizName-container">
          <TextField
            className="quizName-input"
            label="Quiz Name"
            variant="outlined"
            size="small"
            error={quizNameInputError}
            value={quizName === undefined ? "" : quizName}
            onChange={(e) => setQuizName(e.target.value)}
          />
          {questions.map((question, i) => (
            <div
              key={uuidv4()}
              onClick={() => viewQuestion(i)}
              className="questionTab"
              style={
                !onCreateQuestionTab && i === questionToEdit
                  ? { border: "none", background: "#466FFD", color: "#fff" }
                  : null
              }
            >{`Question ${i + 1}`}</div>
          ))}
          <div
            className="create-question"
            style={
              onCreateQuestionTab
                ? { border: "none", background: "#466FFD" }
                : null
            }
            onClick={() => createQuestion()}
          >
            <img src={create_icon} alt="create-question" />
            <h5 style={onCreateQuestionTab ? { color: "white" } : null}>
              Create Question
            </h5>
          </div>
        </div>
        <div className="create-question-container">
          <TextField
            className="question-input"
            label="Question"
            variant="outlined"
            size="small"
            error={questionInputError}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <h6>Create & select correct answer</h6>
          <div className="answer-container">
            <div className="answer-1">
              <Radio
                checked={selectedValue === "1"}
                onChange={handleChange}
                value="1"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />
              <TextField
                className="answer"
                label="Answer 1"
                variant="standard"
                size="small"
                value={answerOne}
                onChange={(e) => setAnswerOne(e.target.value)}
              />
            </div>
            <div className="answer-2">
              <Radio
                checked={selectedValue === "2"}
                onChange={handleChange}
                value="2"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />
              <TextField
                className="answer"
                label="Answer 2"
                variant="standard"
                size="small"
                value={answerTwo}
                onChange={(e) => setAnswerTwo(e.target.value)}
              />
            </div>
            <div className="answer-3">
              <Radio
                checked={selectedValue === "3"}
                onChange={handleChange}
                value="3"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />
              <TextField
                className="answer"
                label="Answer 3"
                variant="standard"
                size="small"
                value={answerThree}
                onChange={(e) => setAnswerThree(e.target.value)}
              />
            </div>
            <div className="answer-4">
              <Radio
                checked={selectedValue === "4"}
                onChange={handleChange}
                value="4"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />
              <TextField
                className="answer"
                label="Answer 4"
                variant="standard"
                size="small"
                value={answerFour}
                onChange={(e) => setAnswerFour(e.target.value)}
              />
            </div>
            <div className="button-container">
              <Button
                className="add"
                variant="outlined"
                size="medium"
                onClick={addQuestion}
              >
                {onCreateQuestionTab ? "Add Question" : "Save Question"}
              </Button>
              <Button
                className="delete"
                variant="outlined"
                size="medium"
                onClick={() => deleteQuestion()}
              >
                Delete Question
              </Button>
            </div>
            {questionInputError || quizNameInputError ? (
              <ErrorHelper error={errorHelper} />
            ) : null}
          </div>
        </div>
        <div className="attach-document-container">
          <h6>Attach document to review for this quiz</h6>
          <SelectCourse
            setDocToQuiz={setDocToAttach}
            editMode={editMode}
            document={editMode ? course.reviewDocument : null}
          />
          <div className="create-quiz-button-container">
            <LoadingButton
              loading={uploadingQuiz}
              loadingPosition="start"
              className="create"
              startIcon={<PublishIcon />}
              variant="contained"
              size="medium"
              onClick={startUploadingQuiz}
            >
              <span>{editMode ? "Save Quiz" : "Upload Quiz"}</span>
            </LoadingButton>
            <Button
              className="cancel"
              variant="contained"
              size="medium"
              onClick={closeModal}
            >
              Cancel
            </Button>
            {editMode ? (
              <DeleteQuiz
                editMode={editMode}
                moduleID={moduleID}
                course={course}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

const SelectCourse = ({ setDocToQuiz, editMode, document }) => {
  const { allDocs, allManuals } = useDocs();
  const [doc, setDoc] = useState("");
  const [open, setOpen] = useState(false);
  const [documentsToAttach, setDocsToAttach] = useState([]);
  const [documentSections, setDocumentSections] = useState([]);

  const renderDocOptions = () => {
    const docs = [];

    for (const key in allDocs) {
      if (Object.hasOwnProperty.call(allDocs, key)) {
        const sections = allDocs[key].sections;
        for (let index = 0; index < sections.length; index++) {
          const docsToPush = sections[index].docs.map((doc) => doc);
          for (let index = 0; index < docsToPush.length; index++) {
            const obj = docsToPush[index];
            obj.section = key;
            docs.push(obj);
          }
        }
      }
    }
    for (const key in allManuals) {
      if (Object.hasOwnProperty.call(allManuals, key)) {
        const sections = allManuals[key].sections;
        for (let index = 0; index < sections.length; index++) {
          const docsToPush = sections[index].docs.map((doc) => doc);
          for (let index = 0; index < docsToPush.length; index++) {
            const obj = docsToPush[index];
            obj.section = key;
            docs.push(obj);
          }
        }
      }
    }

    const groupingQuizzes = [...new Set(docs.map((doc) => doc.section))];

    setDocumentSections(groupingQuizzes);
    setDocsToAttach(docs);

    if (editMode && document) {
      const indexOfDocument = docs.findIndex(
        (value) => value.name === document.name
      );

      setDoc(indexOfDocument);
    }
  };

  useEffect(() => {
    renderDocOptions();
  }, []);

  const handleChange = (event) => {
    setDoc(event.target.value);
    setDocToQuiz(documentsToAttach[event.target.value]);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <div className="select-document">
        <FormControl sx={{ m: 1, minWidth: "50%" }}>
          <InputLabel id="demo-controlled-open-select-label">
            Document
          </InputLabel>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={doc}
            label="Document"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {documentsToAttach.map((document, i) => (
              <MenuItem value={i} key={uuidv4()}>
                <p>
                  {document.name}
                  <span style={{ fontSize: "12px" }}>
                    {" "}
                    - {document.section.replaceAll("-", " ")}
                  </span>
                </p>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};

const ErrorHelper = ({ error }) => {
  return (
    <div className="quiz-errorHelper">
      <img src={attention_icon} alt="error" />
      <h4>{error}</h4>
    </div>
  );
};

function MyListSubheader({ ListSubheaderProps }) {
  return <ListSubheader {...ListSubheaderProps} />;
}

MyListSubheader.muiSkipListHighlight = true;

export default CreateQuiz;
