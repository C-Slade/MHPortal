import React, { useContext, useState, useEffect } from "react";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteField,
  onSnapshot,
} from "firebase/firestore";
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
  const { currentUser } = useAuth();
  const { alertSuccess } = useApp();
  const navigate = useNavigate();

  const createModule = (name) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "training", "training");
      const scoreRef = doc(collectionData, "training", "scores");
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      const moduleID = uuidv4();

      const removeSpacesName = name.replace(" ", "-");

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
      const data = trainingModules;
      data.modules = data.modules.filter((mod) => mod.moduleID !== moduleID);
      await updateDoc(docRef, data);
      navigate("/dashboard");
      alertSuccess("Page has successfully been deleted");
      resolve();
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

          setTrainingModules(data);
          setModuleNames(moduleNames);
        }
      );
      return unsub;
    }
  }, [currentUser]);

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
  };

  return (
    <trainingContext.Provider value={value}>
      {children}
    </trainingContext.Provider>
  );
};
