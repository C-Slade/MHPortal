import React, { useEffect, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
//delete
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { ProgressBar } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { useLocation } from "react-router-dom";
import "./css/styles.css";
import { useDocs } from "../../../context/docContext";
import { useApp } from "../../../context/appContext";

const PDF_Viewer = () => {
  const location = useLocation();
  const [docURL, setURL] = useState("");
  const [docExists, setDocExists] = useState(false);
  const [print, setPrint] = useState(false);
  const {
    fetchDocUrl,
    loadingFIle,
    toggleLoadingFile,
    getStoragePath,
    docOnPreview,
  } = useDocs();
  const { setPDFviewer, alertError } = useApp();
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const TransformToolbarSlotNoPrint = (slot) => ({
    ...slot,
    Download: () => <></>,
    EnterFullScreen: () => <></>,
    SwitchTheme: () => <></>,
    Print: () => <></>,
    Open: () => <></>,
  });
  const TransformToolbarSlotPrint = (slot) => ({
    ...slot,
    Download: () => <></>,
    EnterFullScreen: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  const getUrl = async (url) => {
    try {
      toggleLoadingFile(true);
      const doc_url = await fetchDocUrl(url);
      toggleLoadingFile(false);
      setURL(doc_url);
    } catch (error) {
      toggleLoadingFile(false);
      alertError("Error fetching file");
    }
  };

  const getIDFrom_url = () => {
    const arrURL = location.pathname.split("/");
    return arrURL[4];
  };

  const getDocPath = async () => {
    console.log(getIDFrom_url());
    try {
      const path = await getStoragePath(getIDFrom_url());
      setDocExists(true);
      getUrl(path);
    } catch (error) {
      alertError(error);
      setDocExists(false);
    }
  };

  useEffect(() => {
    setPDFviewer(true);
    getDocPath();

    setPrint(docOnPreview.allowPrint);

    return () => setPDFviewer(false);
  }, [docOnPreview]);
  return (
    <>
      {loadingFIle ? null : docExists ? (
        <>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div className={print ? "pdf-viewer" : "pdf-viewer pdf-no-print"}>
              <div
                className="rpv-core__viewer"
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    backgroundColor: "#eeeeee",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    padding: "0.25rem",
                  }}
                >
                  <Toolbar>
                    {print
                      ? renderDefaultToolbar(TransformToolbarSlotPrint)
                      : renderDefaultToolbar(TransformToolbarSlotNoPrint)}
                  </Toolbar>
                </div>
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <Viewer
                    fileUrl={docURL}
                    plugins={[toolbarPluginInstance]}
                    renderLoader={(percentages) => (
                      <div style={{ width: "75%" }}>
                        <ProgressBar progress={Math.round(percentages)} />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </Worker>
        </>
      ) : null}
    </>
  );
};

export default PDF_Viewer;
