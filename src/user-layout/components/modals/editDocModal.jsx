import { React, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import upload_icon from "../../../assets/upload.png";
import close_icon from "../../../assets/close.png";
import { useDropzone } from "react-dropzone";
import document_icon from "../../../assets/document.png";
import { motion } from "framer-motion";
import "./css/styles.css";
import { useDocs } from "../../../context/docContext";
import { useApp } from "../../../context/appContext";

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

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)" },
};

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function EditDocModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [originalFile, setDefaultFile] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const { docOnPreview, updateFile, toggleNewDocToPreview } = useDocs();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setFiles([]);
    setOpen(false);
  };

  const handleUpdate = async () => {
    // checking if an id is present to determine if its already uploaded with an id. if not, its a new file the user is going to replace with

    // if user did not upload a new file, this will only change the print state in the doc when user selects update

    setLoading(true);

    if (files[0] && !files[0].id) {
      await updateFile(originalFile.id, {
        allowPrint: allowPrint,
        file: files[0],
      });
      toggleNewDocToPreview(true);
      handleClose();
    } else {
      await updateFile(originalFile.id, {
        allowPrint: allowPrint,
      });
      toggleNewDocToPreview(true);
      handleClose();
    }
  };

  useEffect(() => {
    setDefaultFile(docOnPreview);
    setFiles([docOnPreview]);
    setAllowPrint(docOnPreview.allowPrint);
  }, [docOnPreview]);

  return (
    <>
      <img src={upload_icon} alt="Upload New File" onClick={handleOpen} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 400 }} className="edit-document-modal">
          <motion.div
            className="uploading-animated-container"
            animate={loading ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
          >
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          </motion.div>
          <motion.div
            className="animated-container"
            animate={!loading ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
          >
            <h2>Update File</h2>
            <div className="file-name">
              <div className="file-info-container">
                <img src={document_icon} alt="document icon" />
                <h6>
                  {files[0] && files[0].name
                    ? files[0].name
                    : docOnPreview.name}
                </h6>
              </div>
              <UploadDoc setFiles={setFiles} />
            </div>
            <div className="allow-print-container">
              <Checkbox
                {...label}
                checked={allowPrint}
                onChange={() => setAllowPrint(!allowPrint)}
              />
              <h4>Allow Print</h4>
            </div>
            <Button variant="contained" onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="contained" color="error" onClick={handleClose}>
              Cancel
            </Button>
          </motion.div>
        </Box>
      </Modal>
    </>
  );
}

const UploadDoc = ({ setFiles }) => {
  const [open, setOpen] = useState(false);
  const { alertError } = useApp();

  const { getRootProps, getInputProps } = useDropzone({
    acceptedFiles: ".pdf",
    onDrop: (acceptedFiles) => {
      submitFile(
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
    setOpen(false);
  };

  const submitFile = (file) => {
    if (file[0].type !== "application/pdf") {
      alertError("File must end with .pdf");
    } else {
      setFiles(file);
      handleClose();
    }
  };

  return (
    <>
      <img
        src={close_icon}
        className="change-file"
        alt="Upload New File"
        onClick={handleOpen}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }} className="document-modal">
          <h2 id="child-modal-title">Select your document</h2>

          <div {...getRootProps()} className="drop-files">
            <input {...getInputProps()} />
            <p>Drop File Here</p>
          </div>
          <>
            <h4>OR</h4>
            <input
              type="file"
              id="fileUpload"
              name="Choose file"
              onChange={(event) => {
                submitFile([event.target.files[0]]);
              }}
              className="choose-file"
            />
          </>
        </Box>
      </Modal>
    </>
  );
};
