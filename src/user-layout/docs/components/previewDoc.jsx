import React, { useEffect, useState } from "react";
import doc from "../../../assets/pdf.png";
import trash from "../../../assets/bin.png";

const PreviewDoc = ({
  deletingFiles,
  name,
  index,
  setDocsToDelete,
  docsToDelete,
  addingFiles,
  docsToPreview,
  setDocsToPreview,
}) => {
  const [prepDelete, setDelete] = useState(false);

  const addDocToRemove = () => {
    if (addingFiles) {
      let newDocsToPreview = [...docsToPreview].filter(
        (item, i) => i !== index
      );

      setDocsToPreview(newDocsToPreview);

      return;
    }
    if (!prepDelete) {
      setDelete(true);
      setDocsToDelete([...docsToDelete, index]);
    } else {
      setDelete(false);
      const removePrepped = docsToDelete;
      removePrepped.filter((docIndex) => index !== docIndex);
    }
  };

  // Used to set documents that are preparing to be deleted to be true. This is what is used to set the styling opacity to documents that are ready to be deleted.

  useEffect(() => {
    if (docsToDelete) {
      docsToDelete.forEach((docID) => {
        if (docID === index) {
          setDelete(true);
        }
      });
    }
  }, []);
  return (
    <div
      className="document-container"
      style={prepDelete ? { opacity: "50%" } : null}
    >
      {deletingFiles || addingFiles ? (
        <img
          src={trash}
          className="deleteFIle"
          alt="delete file"
          onClick={addDocToRemove}
        />
      ) : null}
      <img src={doc} alt="icon" />
      <h6>{name}</h6>
    </div>
  );
};

export default PreviewDoc;
