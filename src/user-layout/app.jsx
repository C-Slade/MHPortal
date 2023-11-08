import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "../login/login.jsx";
import Dashboard from "./main/dashboard/dashboard.jsx";
import { v4 as uuidv4 } from "uuid";
import Nav from "./components/nav/nav.jsx";
import SmallNav from "./components/nav/smallNav/nav.jsx";
import Register from "../login/register.jsx";
import ForgotPass from "../login/forgotPass.jsx";
import "./css/styles.css";
import ExpiredRegister from "../login/expiredRegister.jsx";
import { useDocs } from "../context/docContext.js";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../context/authContext.js";
import DocRoute from "./docs/docRoute.jsx";
import Header from "./components/header/header.jsx";
import CreateDocRoute from "./docs/createDocRoute.jsx";
import PageLoader from "./components/loading/pageLoader.jsx";
import AlertBar from "./components/alert/alert.jsx";
import { useApp } from "../context/appContext.js";
import PDFviewer from "./components/pdfViewer/PDF_Viewer.jsx";

function App() {
  const location = useLocation();
  const {
    currentUser,
    registerKey,
    hasAccessToRegister,
    admin,
    fetchingRegisterKey,
  } = useAuth();
  const { alert, alertWarning } = useApp();
  const { allDocs, uploadingNewLayout, loadingFIle, docNames, allManuals } =
    useDocs();
  const navigate = useNavigate();

  useEffect(() => {
    const onRoute = (name) => location.pathname.includes(name);
    if (onRoute("docs") && !onRoute("createFolder")) {
      const docExist = docNames.some((name) => {
        return location.pathname.includes(name);
      });
      if (!docExist) {
        navigate("/dashboard");
        alertWarning("The page you were on has been changed");
      }
    }
  }, [docNames]);

  useEffect(() => {
    const onRoute = (name) => location.pathname.includes(name);

    if (
      (onRoute("forgotPass") || onRoute("login") || onRoute("register")) &&
      !currentUser
    ) {
      console.log("Welcome to MHI Portal");
    } else if (!currentUser) {
      navigate("/login");
    }
  }, [location]);

  return (
    <>
      <div
        className="userLayout"
        style={
          currentUser ? { width: "88%" } : { width: "100%", overflow: "hidden" }
        }
      >
        {uploadingNewLayout || loadingFIle || fetchingRegisterKey ? (
          <PageLoader />
        ) : null}
        {currentUser ? <Header /> : null}
        <AnimatePresence>
          {currentUser ? <Nav key="desktopNav" /> : null}
          {currentUser ? <SmallNav key="mobileNav" /> : null}
          <Routes location={location} key={location.pathname}>
            {!currentUser ? (
              <>
                <Route exact path="/login" element={<Login />} />
                <Route exact path="/forgotPass" element={<ForgotPass />} />
                {hasAccessToRegister ? (
                  <Route
                    exact
                    path={`/${registerKey}/register`}
                    element={<Register />}
                  />
                ) : null}
                {!hasAccessToRegister && !fetchingRegisterKey ? (
                  <Route path="/:id/register" element={<ExpiredRegister />} />
                ) : null}
              </>
            ) : (
              <>
                <Route exact path="/dashboard" element={<Dashboard />} />
                <Route exact path="/notifications" element={<Dashboard />} />
                {allDocs
                  ? Object.keys(allDocs).map((key, i) => (
                      <Route
                        path={`/docs/${key}`}
                        element={
                          <DocRoute
                            docs={allDocs[key]}
                            key={uuidv4()}
                            title={key}
                          />
                        }
                        key={i}
                      />
                    ))
                  : null}
                {allManuals
                  ? Object.keys(allManuals).map((key, i) => (
                      <Route
                        path={`/manuals/${key}`}
                        element={
                          <DocRoute
                            docs={allManuals[key]}
                            key={uuidv4()}
                            title={key}
                          />
                        }
                        key={i}
                      />
                    ))
                  : null}
                {admin ? (
                  <>
                    <Route
                      path="/docs/createFolder"
                      element={<CreateDocRoute />}
                    />
                    <Route
                      path="/manuals/createFolder"
                      element={<CreateDocRoute />}
                    />
                  </>
                ) : null}
                <Route path="/training/part-135" element={<Dashboard />} />
                <Route path="/training/part-145" element={<Dashboard />} />
                <Route path="/training/fuel" element={<Dashboard />} />
                <Route path="/training/human-factors" element={<Dashboard />} />
                <Route path="/:id/:id/view/:id" element={<PDFviewer />} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </div>
      {alert ? <AlertBar /> : null}
    </>
  );
}

export default App;
