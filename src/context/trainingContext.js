import React, { useContext, useState, useEffect } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { collectionData, storage } from "../firebase.js";
import { useAuth } from "./authContext.js";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "./appContext.js";

const trainingContext = React.createContext();

export const useTraining = () => {
  return useContext(trainingContext);
};

export const TrainingProvider = ({ children }) => {
  const [trainingModules, setTrainingModules] = useState([]);
  const [moduleNames, setModuleNames] = useState([]);
  const [currentModule, setCurrentModule] = useState();
  const [uploadingQuiz, setUploadingQuiz] = useState(false);
  const [currentModuleScores, setCurrentModuleScores] = useState([]);
  const [currentModuleTrainingDue, setCurrentModuleTrainingDue] = useState([]);
  const { currentUser, deepLink } = useAuth();
  const { alertSuccess } = useApp();
  const navigate = useNavigate();

  const createModule = (name) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "training", "training");
      const scoreRef = doc(collectionData, "training", "scores");
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      const moduleID = uuidv4();

      let removeSpacesName = name.replaceAll(" ", "-").split("");

      if (removeSpacesName[removeSpacesName.length - 1] === "-") {
        removeSpacesName.pop();
      }

      removeSpacesName = removeSpacesName.join("");

      if (docSnap.exists()) {
        if (data.modules === undefined) {
          data.modules = [];
        }
        data.modules.push({
          name: removeSpacesName,
          moduleID: moduleID,
          courses: [],
        });
      }

      try {
        await updateDoc(docRef, data);
      } catch (error) {
        reject(error);
      }

      const scoreSnap = await getDoc(scoreRef);
      const scoreData = scoreSnap.data();

      scoreData.modules.push({
        name: removeSpacesName,
        moduleID: moduleID,
        courses: [],
      });

      try {
        await updateDoc(scoreRef, scoreData);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const getAllScores = () => {
    return new Promise(async (resolve, reject) => {
      const scoreRef = doc(collectionData, "training", "scores");
      const scoreSnap = await getDoc(scoreRef);
      const data = scoreSnap.data();

      resolve(data);
    });
  };

  const getTrainingDueForModule = async () => {
    const scoreRef = doc(collectionData, "training", "scores");
    const scoreSnap = await getDoc(scoreRef);
    const data = scoreSnap.data();
    const moduleScores = [];
    let sortedScores = [];

    data.modules.map((module) => {
      if (module.name === currentModule.name) {
        module.courses.map((course, index) => {
          let hasNeverDoneQuiz = true;
          course.scores.map((score) => {
            if (score.uid === currentUser.uid) {
              hasNeverDoneQuiz = false;
              const arrayDate = score.date.split(" ");
              // minus 31535940000 in dateInMs to simulate a one minute time between quizzes for debugging.
              moduleScores.push({
                date: `${arrayDate[1]} ${arrayDate[2]} ${arrayDate[3]}`,
                name: course.name,
                score: score.score,
                dateInMs: score.dateInMs,
                quizID: course.id,
              });
            }
            return null;
          });

          if (hasNeverDoneQuiz) {
            moduleScores.push({
              name: course.name,
              quizID: course.id,
              dateInMs: 0,
            });
          }

          // sorts scores from most recently taken
          sortedScores = moduleScores.sort((a, b) => b.dateInMs - a.dateInMs);

          return null;
        });

        const uniqueQuizNames = [
          ...new Set(sortedScores.map((quiz) => quiz.name)),
        ];

        const date = new Date();
        const dateInMs = date.getTime();
        const yearInMs = 31536000000;

        const quizzesThatAreDue = [];

        uniqueQuizNames.map((name) => {
          // arrOfQuizzes is used to group same quiz names together in one array to loop over and check for scores. This is an array of same quiz objects that have their info on when they were taken and score.

          // note: sortedScores is already sorted from most recently taken to first recorded score, so this can loop from start and break when needed since the older scores are irrelevant to loop over once a quiz has been spotted for retake
          const arrOfQuizzes = sortedScores.filter((quiz) => {
            return quiz.name === name;
          });
          for (let i = 0; i < arrOfQuizzes.length; i++) {
            const quiz = arrOfQuizzes[i];
            const timeSinceQuizWasTaken = dateInMs - quiz.dateInMs;

            // checking if there has been a quiz that has been taken within the last year and has passed. It breaks if true to move onto the next set of quizzes that have not been checked.
            if (quiz.score > 70 && timeSinceQuizWasTaken < yearInMs) break;

            // checks if the quiz was failed and was taken over 1 year ago.
            if (quiz.score < 70 && timeSinceQuizWasTaken > yearInMs) {
              quizzesThatAreDue.push(quiz);
              break;
            }

            if (timeSinceQuizWasTaken > yearInMs) {
              quizzesThatAreDue.push(quiz);
              break;
            }

            if (quiz.score < 70) {
              quizzesThatAreDue.push(quiz);
              break;
            }
          }

          return null;
        });

        setCurrentModuleTrainingDue(quizzesThatAreDue);
      }
      return null;
    });
  };

  const getRecentTrainingForModule = async () => {
    const scoreRef = doc(collectionData, "training", "scores");
    const scoreSnap = await getDoc(scoreRef);
    const data = scoreSnap.data();

    const moduleScores = [];

    data.modules.forEach((module) => {
      if (module.name === currentModule.name) {
        module.courses.map((course) => {
          course.scores.map((score) => {
            if (score.uid === currentUser.uid) {
              const arrayDate = score.date.split(" ");
              moduleScores.push({
                date: `${arrayDate[1]} ${arrayDate[2]} ${arrayDate[3]}`,
                name: course.name,
                score: score.score,
                dateInMs: score.dateInMs,
              });
            }
            return null;
          });
          const sortedScores = moduleScores.sort(
            (a, b) => b.dateInMs - a.dateInMs
          );
          setCurrentModuleScores(sortedScores);
          return null;
        });
      }
      return null;
    });
  };

  const finishQuiz = (quiz, moduleName, date, timeInMs) => {
    return new Promise(async (resolve, reject) => {
      const scoreRef = doc(collectionData, "training", "scores");
      const scoreSnap = await getDoc(scoreRef);
      const scoreData = scoreSnap.data();

      const scoreModules = scoreData.modules;

      scoreModules.map((module) => {
        if (module.name === moduleName) {
          module.courses.map((course) => {
            if (course.id === quiz.id) {
              const quizToGrade = quiz.questions;
              const totalQuestions = quiz.questions.length;
              let correctAnswers = 0;

              quizToGrade.map((q) => {
                if (q.selectedAnswer === q.correctAnswer) {
                  correctAnswers++;
                } else {
                  return null;
                }

                return null;
              });

              course.scores.push({
                uid: currentUser.uid,
                score: Math.round((correctAnswers / totalQuestions) * 100),
                date: date,
                dateInMs: timeInMs,
              });

              return null;
            }

            return null;
          });
        }
        return null;
      });

      try {
        updateDoc(scoreRef, scoreData);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const uploadQuiz = (quiz, moduleName) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "training", "training");
      const scoreRef = doc(collectionData, "training", "scores");
      const data = trainingModules;
      let moduleToEdit;
      let moduleIndex;

      for (let index = 0; index < data.modules.length; index++) {
        const module = data.modules[index];
        if (moduleName === module.name) {
          moduleToEdit = module;
          moduleIndex = index;
        }
      }

      moduleToEdit.courses.push(quiz);

      data.modules[moduleIndex] = moduleToEdit;

      await updateDoc(docRef, data);

      const scoreSnap = await getDoc(scoreRef);
      const scoreData = scoreSnap.data();

      for (let index = 0; index < scoreData.modules.length; index++) {
        if (scoreData.modules[index].name === moduleName) {
          scoreData.modules[index].courses.push({
            name: quiz.name,
            id: quiz.id,
            questions: quiz.questions,
            scores: [],
          });
        }
      }

      try {
        await updateDoc(scoreRef, scoreData);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const deleteQuizModule = (moduleID) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "training", "training");
      const scoreRef = doc(collectionData, "training", "scores");
      const scoreSnap = await getDoc(scoreRef);
      const scoreData = scoreSnap.data();
      const data = trainingModules;

      scoreData.modules = scoreData.modules.filter(
        (mod) => mod.moduleID !== moduleID
      );
      data.modules = data.modules.filter((mod) => mod.moduleID !== moduleID);
      await updateDoc(docRef, data);
      await updateDoc(scoreRef, scoreData);
      navigate("/dashboard");
      alertSuccess("Page has successfully been deleted");
      resolve();
    });
  };

  const updateModuleName = (newName) => {
    return new Promise(async (resolve, reject) => {
      const trainingRef = doc(collectionData, "training", "training");
      const scoreRef = doc(collectionData, "training", "scores");
      const scoreSnap = await getDoc(scoreRef);
      const trainingSnap = await getDoc(trainingRef);

      const scoreData = scoreSnap.data();
      const trainingData = trainingSnap.data();

      let removeSpacesName = newName.replaceAll(" ", "-").split("");

      if (removeSpacesName[removeSpacesName.length - 1] === "-") {
        removeSpacesName.pop();
      }

      removeSpacesName = removeSpacesName.join("");

      let nameInUse = false;

      trainingData.modules.forEach((module) => {
        if (module.name === removeSpacesName) {
          nameInUse = true;
        }
      });
      scoreData.modules.forEach((module) => {
        if (module.name === removeSpacesName) {
          nameInUse = true;
        }
      });

      const indexOfTrainingModule = trainingData.modules.findIndex(
        (value) => value.moduleID === currentModule.moduleID
      );

      const indexOfScoreModule = scoreData.modules.findIndex(
        (value) => value.moduleID === currentModule.moduleID
      );

      trainingData.modules[indexOfTrainingModule].name = removeSpacesName;
      scoreData.modules[indexOfScoreModule].name = removeSpacesName;

      if (nameInUse) {
        reject("Name already exists");
      } else {
        await updateDoc(trainingRef, trainingData);
        await updateDoc(scoreRef, scoreData);
        resolve();
      }
    });
  };

  useEffect(() => {
    if (currentUser !== undefined) {
      const unsub = onSnapshot(
        doc(collectionData, "training", "training"),
        (doc) => {
          const data = doc.data();
          let moduleNames = [];
          if (data.modules) {
            moduleNames = data.modules.map((module) => {
              return module.name;
            });
          }

          if (deepLink !== "") {
            if (deepLink.includes("training") && deepLink.includes("test")) {
              navigate(deepLink);
            }
          }

          setTrainingModules(data);
          setModuleNames(moduleNames);
        }
      );
      return unsub;
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentModule !== undefined) {
      getRecentTrainingForModule();
      getTrainingDueForModule();
    }
  }, [currentModule]);

  const value = {
    createModule,
    moduleNames,
    trainingModules,
    uploadQuiz,
    setCurrentModule,
    currentModule,
    deleteQuizModule,
    finishQuiz,
    uploadingQuiz,
    setUploadingQuiz,
    updateModuleName,
    getRecentTrainingForModule,
    currentModuleScores,
    currentModuleTrainingDue,
    setCurrentModuleTrainingDue,
    getTrainingDueForModule,
    getAllScores,
  };

  return (
    <trainingContext.Provider value={value}>
      {children}
    </trainingContext.Provider>
  );
};
