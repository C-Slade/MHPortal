import React, { useEffect, useState } from "react";
import Doc from "./doc";
import { v4 as uuidv4 } from "uuid";
import ellipsis_icon from "../../../assets/ellipsis.png";
import { TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAuth } from "../../../context/authContext";
import AddDocToListModal from "../../components/modals/addDocToListModal";
import SectionOptions from "./sectionOptions";
import { useDocs } from "../../../context/docContext";
import PreviewDoc from "./previewDoc";
import { useApp } from "../../../context/appContext";

const Section = ({ docs, pageID, sectionIndex, moderator }) => {
  const { admin } = useAuth();
  const { uploadDocsToSection, deleteDocs, filesToDelete, updateSectionTitle } =
    useDocs();
  const { alertError, alertSuccess } = useApp();
  const [options, toggleOptions] = useState(false);
  const [editing, toggleEditing] = useState(false);
  const [loading, setUploading] = useState(false);
  const [deletingFiles, toggleDeleteFiles] = useState(false);
  const [addingFiles, toggleAddingFiles] = useState(false);
  const [changingSectionTitle, toggleChangingSectionTitle] = useState(false);
  const [newSectionTitle, setSectionTitle] = useState(null);
  const [docsToPreview, setDocsToPreview] = useState([]);

  const handleSave = async () => {
    setUploading(true);

    if (filesToDelete.length >= 1) {
      try {
        await deleteDocs(sectionIndex);
        alertSuccess("Files has been successfully deleted");
      } catch (error) {
        alertError(error);
      }
    }
    if (docsToPreview.length >= 1) {
      try {
        await uploadDocsToSection(docsToPreview, pageID, sectionIndex);
        alertSuccess("Files has been successfully uploded");
      } catch (error) {
        alertError(error);
      }
    }
    if (newSectionTitle !== null) {
      try {
        await updateSectionTitle(pageID, sectionIndex, newSectionTitle);
        alertSuccess(
          `${docs.title} has been successfully updated to ${newSectionTitle}`
        );
      } catch (error) {
        alertError(error);
      }
    }

    setUploading(false);
    toggleEditing(false);
  };

  const handleCancel = () => {
    toggleEditing(false);
    toggleAddingFiles(false);
    toggleDeleteFiles(false);
    toggleChangingSectionTitle(false);
    setDocsToPreview([]);
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

  return (
    <>
      <section
        className={
          admin || moderator
            ? "doc-section-container admin-doc-section"
            : "doc-section-container"
        }
        style={editing ? { border: "2px solid #466FFD" } : null}
      >
        {changingSectionTitle ? (
          <TextField
            label="Section Title"
            className="change-title"
            variant="outlined"
            size="small"
            onChange={(e) => setSectionTitle(e.target.value)}
            defaultValue={docs?.title}
          />
        ) : (
          <h4>{docs.title}</h4>
        )}
        <div className="docs-container">
          {docs.docs.map((document) => (
            <Doc document={document} editing={deletingFiles} key={uuidv4()} />
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
          {addingFiles && (admin || moderator) ? (
            <AddDocToListModal uploadDoc={handleSettingDocsToUpload} />
          ) : null}
        </div>
        {admin || moderator ? (
          <div className="options-container">
            <img
              src={ellipsis_icon}
              alt="options_icon"
              className="options"
              onClick={() => toggleOptions(!options)}
            />
            <SectionOptions
              open={options}
              setEditing={setEditing}
              toggleOptions={toggleOptions}
              sectionIndex={sectionIndex}
              pageID={pageID}
              toggleAddingFiles={toggleAddingFiles}
              toggleDeleteFiles={toggleDeleteFiles}
              toggleChangingSectionTitle={toggleChangingSectionTitle}
            />
          </div>
        ) : null}
        {editing ? (
          <div className="edting-options-container">
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
              size="large"
              onClick={handleSave}
            >
              <span>Save</span>
            </LoadingButton>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={<CloseIcon />}
              variant="outlined"
              size="large"
              onClick={handleCancel}
            >
              <span>Cancel</span>
            </LoadingButton>
          </div>
        ) : null}
      </section>
    </>
  );
};

export default Section;
