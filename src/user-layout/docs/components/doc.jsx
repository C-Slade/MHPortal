import React, { useEffect, useState } from "react";
import doc from "../../../assets/pdf.png";
import trash from "../../../assets/bin.png";
import { useDocs } from "../../../context/docContext";
import { Link } from "react-router-dom";

const Doc = ({ document, editing }) => {
  const {
    setFilesToDelete,
    filesToDelete,
    toggleLoadingFile,
    setPdfDocName,
    setDocOnPreview,
  } = useDocs();
  const [path, setPath] = useState("");
  const [deleteDoc, setDelete] = useState(false);

  // toggle document to be prepped to be deleted or not
  const deleteFIle = () => {
    if (deleteDoc) {
      const files = filesToDelete;
      setFilesToDelete(files.filter((file) => file.id !== document.id));
    } else {
      setDelete(true);
      const files = filesToDelete;
      files.push(document);
      setFilesToDelete(files);
    }
  };

  const setDoc = () => {
    setDocOnPreview(document);
    toggleLoadingFile(true);
    setPdfDocName(document.name);
  };

  useEffect(() => {
    console.log("render doc");
    setPath(`view/${document.id}`);
  }, []);

  return (
    <>
      {editing ? (
        <div
          className="document-container"
          style={deleteDoc ? { opacity: "50%" } : null}
        >
          {editing ? (
            <img
              src={trash}
              className="deleteFIle"
              alt="delete file"
              onClick={deleteFIle}
            />
          ) : null}
          <img src={doc} alt="icon" />
          <h6>{document.name}</h6>
        </div>
      ) : (
        <Link
          className="document-container"
          style={deleteDoc ? { opacity: "50%" } : null}
          to={path}
          onClick={setDoc}
        >
          {editing ? (
            <img
              src={trash}
              className="deleteFIle"
              alt="delete file"
              onClick={deleteFIle}
            />
          ) : null}
          <img src={doc} alt="icon" />
          <h6>{document.name}</h6>
        </Link>
      )}
    </>
  );
};

export default Doc;
