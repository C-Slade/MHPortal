import { React, useEffect, useState } from "react";
import add_icon from "../../../assets/add.png";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import create_icon from "../../../assets/pencil.png";
import Radio from "@mui/material/Radio";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import PublishIcon from "@mui/icons-material/Publish";
import upload from "../../../assets/upload.png";
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

function CreateQuiz() {
  const [open, setOpen] = useState(false);
  return (
    <div className="createQuiz">
      <img
        src={add_icon}
        alt="add_icon"
        className="openModal"
        onClick={() => setOpen(true)}
      />
      <Modal
        open={open}
        className="add-course"
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: "60%" }} className="create-quiz-container">
          <ChildModal closeModal={() => setOpen(false)} />
        </Box>
      </Modal>
    </div>
  );
}

function ChildModal({ closeModal }) {
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

  const { alertSuccess } = useApp();
  const { uploadQuiz, trainingModules } = useTraining();
  const location = useLocation();

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const addQuestion = () => {
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
    const courseID = uuidv4();
    const course = {
      name: quizName,
      id: courseID,
      questions: questions,
      reviewDocument: documentToAttach,
    };
    const moduleName = location.pathname
      .replace("/training/", "")
      .replace(" ", "-");
    await uploadQuiz(course, moduleName);
    setUpload(false);
    closeModal();
    alertSuccess("Quiz has been uploaded");
  };

  return (
    <>
      <div className="create-quiz-modal">
        <div className="title-container">
          <h1>Create New Quiz</h1>
        </div>
        <div className="quizName-container">
          <TextField
            className="quizName-input"
            label="Quiz Name"
            variant="outlined"
            size="small"
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
          </div>
        </div>
        <div className="attach-document-container">
          <h6>Attach document to review for this quiz</h6>
          <SelectCourse setDocToQuiz={setDocToAttach} />
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
              <span>Upload Quiz</span>
            </LoadingButton>
            <Button
              className="cancel"
              variant="contained"
              size="medium"
              onClick={closeModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

const SelectCourse = ({ setDocToQuiz }) => {
  const { allDocs, allManuals } = useDocs();
  const [doc, setDoc] = useState("");
  const [open, setOpen] = useState(false);
  const [documentsToAttach, setDocsToAttach] = useState([]);

  const renderDocOptions = () => {
    const docs = [];

    for (const key in allDocs) {
      if (Object.hasOwnProperty.call(allDocs, key)) {
        const sections = allDocs[key].sections;
        for (let index = 0; index < sections.length; index++) {
          const docsToPush = sections[index].docs.map((doc) => doc);
          for (let index = 0; index < docsToPush.length; index++) {
            docs.push(docsToPush[index]);
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
            docs.push(docsToPush[index]);
          }
        }
      }
    }

    setDocsToAttach(docs);
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
          <InputLabel id="demo-controlled-open-select-label">Age</InputLabel>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={doc}
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {documentsToAttach.map((document, i) => (
              <MenuItem value={i} key={uuidv4()}>
                {document.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};

export default CreateQuiz;
