import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  getDoc,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import {
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, collectionData } from "../firebase.js";
import { useApp } from "./appContext.js";

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const { alertError } = useApp();
  const [loading, setLoading] = useState(true);
  const [deepLink, setDeepLink] = useState();
  const [registerKey, setRegisterKey] = useState();
  const [fetchingRegisterKey, setfetchingRegisterKey] = useState(false);
  const [loggingOut, toggleLoggingOut] = useState(false);
  const [hasAccessToRegister, setAccess] = useState(false);
  const [registering, setRegiseting] = useState();
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();

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
    setRegiseting(false);
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

    if (docSnap.exists()) {
      const keyFromURL = route.replace("/register", "").replace("/", "");
      if (docSnap.data().key === keyFromURL) {
        setRegiseting(true);
        setAccess(true);
        setRegisterKey(keyFromURL);
        navigate(`${keyFromURL}/register`);
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
      const user = doc.data();
      if (!user.settings.admin) firebaseUsers.push(doc.id);
    });

    setUsers(firebaseUsers);
  };

  const fetchUser = async (uid) => {
    const docRef = doc(collectionData, "users", `${uid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else return null;
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

    const rememberLogin = localStorage.getItem("rememberLogin");

    if (rememberLogin === "false") {
      signOutUser();
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        checkForAdminSettings(user.uid);
        navigate("/dashboard");
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
