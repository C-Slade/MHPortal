import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth, collectionData } from "../firebase.js";
import { useApp } from "./appContext.js";

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const { alertError, alertSuccess } = useApp();
  const [loading, setLoading] = useState(true);
  const [deepLink, setDeepLink] = useState("");
  const [registerKey, setRegisterKey] = useState();
  const [fetchingRegisterKey, setfetchingRegisterKey] = useState(false);
  const [loggingOut, toggleLoggingOut] = useState(false);
  const [hasAccessToRegister, setAccess] = useState(false);
  const [registering, setRegiseting] = useState();
  const [users, setUsers] = useState([]);
  const [allUserNames, setAllUserNames] = useState("");
  const [admin, setAdmin] = useState(false);
  const [firstTimeLogin, setFirstTimeLogin] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const signUpUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const createUserProfile = async (uid, email, name) => {
    await setDoc(doc(collectionData, "users", uid), {
      info: {
        email: email,
        name: name,
      },
      settings: {
        admin: false,
      },
    });

    await checkForPendingStatus(email);
    setRegiseting(false);
  };

  const checkForPendingStatus = async (email) => {
    return new Promise(async (resolve, reject) => {
      const pendingRef = doc(collectionData, "pendingUsers", "users");
      const docSnap = await getDoc(pendingRef);
      const pending = docSnap.data().pending;

      const urlPendingID = location.pathname.split("/")[3];

      if (urlPendingID !== "newUser") {
        const removedPendingEmail = {
          pending: pending.filter((pen) => pen.id !== urlPendingID),
        };

        await updateDoc(pendingRef, removedPendingEmail);
      }

      resolve();
    });
  };

  const deleteCurrentUser = async (user) => {
    try {
      await deleteUser(user);
    } catch (error) {
      alertError("Error fetching user data");
      console.log(error);
      return;
    }
    const userRef = doc(collectionData, "users", `${user.uid}`);
    const scoreRef = doc(collectionData, "training", "scores");
    const docSnap = await getDoc(scoreRef);
    const data = docSnap.data();

    data.modules.forEach((module, modIndex) => {
      module.courses.forEach((course, courseIndex) => {
        course.scores.forEach((score, scoreIndex) => {
          if (score.uid === user.uid) {
            const newScores = data.modules[modIndex].courses[
              courseIndex
            ].scores.filter((score) => score.uid !== user.uid);

            data.modules[modIndex].courses[courseIndex].scores = newScores;
          }
        });
      });
    });

    await updateDoc(scoreRef, data);
    await deleteDoc(userRef);
  };

  const checkForDeActivationStatus = async (user) => {
    const userRef = doc(collectionData, "users", `${user.uid}`);
    const userSnap = await getDoc(userRef);
    const data = userSnap.data();

    if (data && "status" in data) {
      if (data.status === "deActivated") {
        localStorage.setItem("rememberLogin", "false");
        await deleteCurrentUser(user);
      }
    }
  };

  const signInUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const sendCustomPasswordResetEmail = async (email) => {
    const keyRef = doc(collectionData, "keys", "passResetKey");
    const docSnap = await getDoc(keyRef);
    const key = docSnap.data().key;

    await addDoc(collection(collectionData, "mail"), {
      to: `${email}`,
      message: {
        subject: "Reset Password Maritime Helicopters",
        text: "",
        html: `Welcome, click link to change password: http://localhost:3000/#/${key}/forgotPassword`,
      },
    });
  };

  const addNewUserToPendingVerification = (email, pendingID) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "pendingUsers", "users");
      const docSnap = await getDoc(docRef);
      const pendingUser = docSnap.data();
      const date = new Date();
      const dateInMs = date.getTime();

      pendingUser.pending.push({ email: email, date: dateInMs, id: pendingID });

      await updateDoc(docRef, pendingUser);
      alertSuccess("Register link sent");
      resolve();
    });
  };

  const sendRegisterLink = (email, pendingID) => {
    return new Promise(async (resolve, reject) => {
      const keyRef = doc(collectionData, "keys", "registerKey");
      const docSnap = await getDoc(keyRef);
      const key = docSnap.data().key;

      const hostName = window.location.origin;

      await addDoc(collection(collectionData, "mail"), {
        to: `${email}`,
        message: {
          subject: "Your Register Link to MHI Portal",
          text: "",
          html: `Welcome, click link to register to MHI Portal: ${hostName}/#/${key}/register/${pendingID}`,
        },
      });

      resolve();
    });
  };

  const signOutUser = () => {
    toggleLoggingOut(true);
    return signOut(auth);
  };

  const sendPassReset = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const getRegisterKey = async (route) => {
    const docRef = doc(collectionData, "keys", "registerKey");
    const docSnap = await getDoc(docRef);

    const pendingRef = doc(collectionData, "pendingUsers", "users");
    const pendingSnap = await getDoc(pendingRef);
    const pendingUsers = pendingSnap.data();

    if (docSnap.exists()) {
      const keyFromURL = route.split("/")[1];
      const idFromUrl = route.split("/")[3];

      const verifiedID = pendingUsers.pending.some(
        (user) => user.id === idFromUrl
      );

      if (docSnap.data().key === keyFromURL && verifiedID) {
        setRegiseting(true);
        setAccess(true);
        setRegisterKey(keyFromURL);
        navigate(`${keyFromURL}/register/${idFromUrl}`);
      }
    } else {
      alertError("Invalid Key");
    }

    setfetchingRegisterKey(false);
  };

  const fetchUsers = async () => {
    const firebaseUsers = [];
    const querySnapshot = await getDocs(collection(collectionData, "users"));
    querySnapshot.forEach((doc) => {
      // enable this if there are issues for admins being in the allEmployee's array
      // const user = doc.data();
      // if (!user.settings.admin) firebaseUsers.push(doc.id);
      firebaseUsers.push(doc.id);
    });

    setUsers(firebaseUsers);

    fetchAllUserNames(firebaseUsers);
  };

  const fetchUser = async (uid) => {
    const docRef = doc(collectionData, "users", `${uid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else return null;
  };

  const fetchCurrentUserInfo = async (uid) => {
    const docRef = doc(collectionData, "users", `${uid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setCurrentUserInfo(docSnap.data());
    } else return null;
  };

  const fetchAllUserNames = async (userUids) => {
    return new Promise(async (resolve, reject) => {
      const userPromises = userUids.map(async (uid) => {
        const docRef = doc(collectionData, "users", `${uid}`);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        return data.info.name;
      });

      const allUserInfo = await Promise.all(userPromises);

      setAllUserNames(allUserInfo);
    });
  };

  const fetchAllUsersInfo = () => {
    return new Promise(async (resolve, reject) => {
      const userPromises = users.map(async (user) => {
        const userInfo = await fetchUser(user);
        userInfo.uid = user;
        return userInfo;
      });

      const allUserInfo = await Promise.all(userPromises);
      resolve(allUserInfo);
    });
  };

  const updateUserEmail = (newEmail) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "users", `${currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      data.info.email = newEmail;
      try {
        await updateEmail(currentUser, newEmail);
        await updateDoc(docRef, data);
        alertSuccess("Email has been updated");
        resolve();
      } catch (error) {
        alertError("There has been an error updating email");
      }
    });
  };

  const updateUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
      try {
        await updatePassword(currentUser, password);
        alertSuccess("password has been updated");
        resolve();
      } catch (error) {
        alertError("There has been an error updating password");
      }
    });
  };

  const updateUserName = (name) => {
    return new Promise(async (resolve, reject) => {
      const docRef = doc(collectionData, "users", `${currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      data.info.name = name;

      try {
        await updateDoc(docRef, data);
        alertSuccess("Name has been updated");
        resolve();
      } catch (error) {
        alertError("There has been an error");
      }
    });
  };

  const checkForAdminSettings = async (uid) => {
    const docRef = doc(collectionData, "users", `${uid}`);
    const docSnap = await getDoc(docRef);

    const isOnLargeScreen = window.innerWidth >= 1366;

    if (docSnap.exists()) {
      if (docSnap.data().settings.admin === true && isOnLargeScreen) {
        setAdmin(true);
        fetchUsers();
      } else if (docSnap.data().settings.admin === true && !isOnLargeScreen) {
        alertError("Admin features available on larger screens");
      }
    }
  };

  useEffect(() => {
    const removeHashRoute = window.location.hash.replace("#", "");

    const urlLength = removeHashRoute.split("/").length;

    const rememberLogin = localStorage.getItem("rememberLogin");

    if (rememberLogin === "false") {
      signOutUser();
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        checkForAdminSettings(user.uid);
        checkForDeActivationStatus(user);
        fetchCurrentUserInfo(user.uid);
        navigate("/dashboard");
        if (urlLength > 3) {
          setDeepLink(removeHashRoute);
        }
      }

      if (user === null && !removeHashRoute.includes("/register"))
        navigate("/login");
    });

    if (removeHashRoute.includes("/register")) {
      setfetchingRegisterKey(true);
      getRegisterKey(removeHashRoute);
    }

    if (currentUser && registering) {
      createUserProfile(currentUser.uid);
    }

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signUpUser,
    signInUser,
    signOutUser,
    sendPassReset,
    deepLink,
    toggleLoggingOut,
    loggingOut,
    hasAccessToRegister,
    createUserProfile,
    registering,
    admin,
    users,
    fetchUser,
    fetchingRegisterKey,
    registerKey,
    setRegisterKey,
    sendRegisterLink,
    addNewUserToPendingVerification,
    fetchAllUsersInfo,
    updateUserEmail,
    updateUserPassword,
    updateUserName,
    deleteCurrentUser,
    allUserNames,
    setDeepLink,
    firstTimeLogin,
    setFirstTimeLogin,
    currentUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
