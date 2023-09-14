import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ellipsis_icon from "../../../assets/ellipsis.png";
import { TextField, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../../../context/authContext";
import AddDocToListModal from "../../components/modals/addDocToListModal";
import PreviewSectionOptions from "./previewSectionOptions.jsx";
import PreviewDoc from "./previewDoc";
import { useDocs } from "../../../context/docContext";

const PreviewSection = ({ docs, id }) => {
  const { admin } = useAuth();
  const { setSections, sections } = useDocs();
  const [options, toggleOptions] = useState(false);
  const [editing, toggleEditing] = useState(false);
  const [deletingFiles, toggleDeleteFiles] = useState(false);
  const [addingFiles, toggleAddingFiles] = useState(false);
  const [changingSectionTitle, toggleChangingSectionTitle] = useState(false);
  const [newSectionTitle, setSectionTitle] = useState("");
  const [docsToPreview, setDocsToPreview] = useState([]);
  const [docsToDelete, setDocsToDelete] = useState([]);

  const handleSave = () => {
    toggleEditing(false);
    toggleAddingFiles(false);
    toggleDeleteFiles(false);

    const currentSections = sections.map((section) => ({ ...section }));

    if (docsToDelete.length > 0) {
      docsToDelete.forEach((docID) => {
        currentSections[id].docs = currentSections[id].docs.filter(
          (doc, i) => i !== docID
        );
      });

      setDocsToDelete([]);
    }

    if (docsToPreview.length > 0) {
      docsToPreview.forEach((doc) => {
        currentSections[id].docs.push(doc);
      });
      setSections(currentSections);
      setDocsToPreview([]);
    }

    currentSections[id].title = newSectionTitle;

    setSections(currentSections);
  };

  const handleCancel = () => {
    toggleEditing(false);
    toggleAddingFiles(false);
    toggleDeleteFiles(false);
    setDocsToPreview([]);
    setDocsToDelete([]);
  };

  const handleSettingDocsToUpload = (file) => {
    const docObj = {
      id: uuidv4(),
      name: file.file.name.replace(".pdf", ""),
      file: file.file,
      allowPrint: file.allowPrint,
    };

    setDocsToPreview([...docsToPreview, docObj]);
  };

  const setEditing = () => {
    toggleEditing(true);
  };

  useEffect(() => {
    setSectionTitle(docs.title);
  }, []);

  return (
    <>
      <section
        className={
          admin
            ? "doc-section-container admin-doc-section"
            : "doc-section-container"
        }
        style={editing ? { border: "2px solid #466FFD" } : null}
      >
        {changingSectionTitle ? (
          <TextField
            label="Section Title"
            variant="outlined"
            size="small"
            onChange={(e) => setSectionTitle(e.target.value)}
            defaultValue={docs?.title}
          />
        ) : (
          <h4>{newSectionTitle}</h4>
        )}
        <div className="docs-container">
          {docs.docs.map((document, i) => (
            <PreviewDoc
              name={document.name}
              key={uuidv4()}
              deletingFiles={deletingFiles}
              index={i}
              setDocsToDelete={setDocsToDelete}
              docsToDelete={docsToDelete}
            />
          ))}
          {docsToPreview.map((document, i) => (
            <PreviewDoc
              name={document.name}
              editing={editing}
              key={uuidv4()}
              addingFiles={addingFiles}
              setDocsToPreview={setDocsToPreview}
              docsToPreview={docsToPreview}
              index={i}
            />
          ))}
          {addingFiles && admin ? (
            <AddDocToListModal uploadDoc={handleSettingDocsToUpload} />
          ) : null}
        </div>
        <div className="options-container">
          <img
            src={ellipsis_icon}
            alt="options_icon"
            className="options"
            onClick={() => toggleOptions(!options)}
          />
          <PreviewSectionOptions
            open={options}
            setEditing={setEditing}
            toggleOptions={toggleOptions}
            sectionIndex={id}
            toggleAddingFiles={toggleAddingFiles}
            toggleDeleteFiles={toggleDeleteFiles}
            toggleChangingSectionTitle={toggleChangingSectionTitle}
          />
        </div>
        {editing ? (
          <div className="edting-options-container">
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              size="large"
              onClick={handleSave}
            >
              <span>Save</span>
            </Button>
            <Button
              startIcon={<CloseIcon />}
              variant="outlined"
              size="large"
              onClick={handleCancel}
            >
              <span>Cancel</span>
            </Button>
          </div>
        ) : null}
      </section>
    </>
  );
};

export default PreviewSection;
