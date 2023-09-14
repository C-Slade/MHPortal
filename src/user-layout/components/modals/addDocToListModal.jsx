import { React, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import file_icon from "../../../assets/file.png";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { useDropzone } from "react-dropzone";
import document_icon from "../../../assets/document.png";
import Alert from "../alert/alert.jsx";
import "./css/styles.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function AddDocToSectionModal({ uploadDoc }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [allowPrint, setAllowPrint] = useState(true);
  const [error, setError] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    acceptedFiles: ".pdf",
    onDrop: (acceptedFiles) => {
      addFile(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setFiles([]);
    setOpen(false);
  };

  const addFile = (file) => {
    if (file[0]?.type !== "application/pdf") {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 6000);
    } else {
      setFiles(file);
    }
  };

  const submitFile = () => {
    uploadDoc({ file: files[0], allowPrint: allowPrint });
    handleClose();
  };

  return (
    <>
      <div className="document-container" onClick={handleOpen}>
        <img src={file_icon} alt="uploadFile icon" />
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }} className="document-modal">
          {files.length === 0 ? (
            <h2 id="child-modal-title">Select your document</h2>
          ) : null}

          {files.length === 0 ? (
            <div {...getRootProps()} className="drop-files">
              <input {...getInputProps()} />
              <p>Drop File Here</p>
            </div>
          ) : null}

          {error ? <Alert msg="File must end with .pdf" /> : null}

          {files.length === 0 ? (
            <>
              <h4>OR</h4>
              <input
                type="file"
                id="fileUpload"
                name="Choose file"
                onChange={(event) => {
                  addFile([event.target.files[0]]);
                }}
                className="choose-file"
              />
            </>
          ) : (
            <>
              <Box
                sx={{ ...style, width: 400 }}
                className="edit-document-modal"
              >
                <h2>Confirm File</h2>
                <div className="file-name">
                  <div className="file-info-container">
                    <img src={document_icon} alt="document icon" />
                    <h6>{files[0].name}</h6>
                  </div>
                </div>
                <div className="allow-print-container">
                  <Checkbox
                    {...label}
                    checked={allowPrint}
                    onChange={() => setAllowPrint(!allowPrint)}
                  />
                  <h4>Allow Print</h4>
                </div>
                <Button variant="contained" onClick={submitFile}>
                  Confirm
                </Button>
                <Button variant="contained" onClick={handleClose} color="error">
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}
