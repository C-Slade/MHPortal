import { React, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import add_icon from "../../../assets/add.png";
import document_icon from "../../../assets/document.png";
import CircularProgress from "@mui/material/CircularProgress";
import close_icon from "../../../assets/close.png";
import TextField from "@mui/material/TextField";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import "./css/styles.css";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../firebase";
import { useDocs } from "../../../context/docContext";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
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

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const variants = {
  open: { opacity: 1, transform: "scale(1)" },
  closed: { opacity: 0, transform: "scale(0)" },
};

const metadata = {
  contentType: "application/pdf",
};

function ChildModal({ handleFiles }) {
  const [open, setOpen] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const [fileOnPreview, setFIleForUpload] = useState([]);
  const { alertError } = useApp();

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
    setOpen(false);
  };

  const addFile = (file) => {
    if (file[0].type !== "application/pdf") {
      setFIleForUpload([]);
      alertError("File must end with .pdf");
    } else {
      setFIleForUpload([file[0]]);
    }
  };

  const submitFile = () => {
    handleFiles({ file: fileOnPreview[0], allowPrint: allowPrint });
    handleClose();
    setFIleForUpload([]);
  };

  return (
    <>
      <motion.div
        className="animated-add-doc-btn-container"
        animate={"open"}
        variants={variants}
      >
        <Button onClick={handleOpen} variant="contained">
          Add Document
        </Button>
      </motion.div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }} className="document-modal">
          {fileOnPreview.length === 0 ? (
            <h2 id="child-modal-title">Select your document</h2>
          ) : null}

          {fileOnPreview.length === 0 ? (
            <div {...getRootProps()} className="drop-files">
              <input {...getInputProps()} />
              <p>Drop File Here</p>
            </div>
          ) : null}

          {fileOnPreview.length === 0 ? (
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
                    <h6>{fileOnPreview[0].name}</h6>
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

export default function NestedModal() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [upLoading, setUploading] = useState(false);
  const { alertSuccess } = useApp();
  const { addSectionsToNewPage, creatingNewPage, uploadNewSectionToDoc } =
    useDocs();
  const location = useLocation();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setFiles([]);
    setOpen(false);
  };

  const handleFiles = (doc) => {
    setFiles([...files, doc]);
  };

  // **createSection is only to preview the new section thats been added to the page the user is building. This does not send data to server. Preview only*

  const createSection = () => {
    const section = {
      docs: [],
      title: title,
    };

    for (let i = 0; i < files.length; i++) {
      section.docs.push({
        name: files[i].file.name.replace(".pdf", ""),
        file: files[i].file,
        allowPrint: files[i].allowPrint,
      });
    }

    addSectionsToNewPage(section);
    handleClose();
    setFiles([]);
    setTitle("");
  };

  // **AddSection is for doc or manual pages that has already been created. This does not fire when the user is creating a section for a new page.

  const addSection = async () => {
    setUploading(true);

    const section = {
      docs: [],
      title: title,
    };

    for (let i = 0; i < files.length; i++) {
      const randomId = uuidv4();
      const removeSpacesPath = files[i].file.name
        .replace(/ /g, "-")
        .replace(".pdf", "");
      const docRef = ref(storage, `/docs/${removeSpacesPath}-${randomId}.pdf`);

      const docName = files[i].file.name.replace(".pdf", "");

      await uploadBytes(docRef, files[i].file, metadata)
        .then((res) => {
          section.docs.push({
            name: docName,
            path: res.ref._location.path_,
            id: randomId,
            allowPrint: files[i].allowPrint,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    try {
      await uploadNewSectionToDoc(
        location.pathname.replace("/docs/", ""),
        section
      );
      setUploading(false);
      setOpen(false);
      alertSuccess("Section has been successfully uploded");
    } catch (error) {
      console.log(error);
    }

    setFiles([]);
    setTitle("");
  };

  return (
    <div className="">
      <img
        src={add_icon}
        alt="add_icon"
        className="openModal"
        onClick={handleOpen}
      />
      <Modal
        open={open}
        onClose={handleClose}
        className="addDocModal"
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: 400 }} className="section-modal">
          <motion.div
            className="uploading-animated-container"
            animate={upLoading ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
          >
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          </motion.div>
          <motion.div
            className="animated-container"
            animate={!upLoading ? "open" : "closed"}
            exit={"closed"}
            variants={variants}
          >
            <h2 id="parent-modal-title">Add Section</h2>
            <TextField
              label="Section Name"
              variant="outlined"
              onChange={(e) => setTitle(e.target.value)}
            />
            <p id="parent-modal-description">
              Leave the input field empty if you do not want this section to
              have a title*
            </p>
            <Button
              variant="contained"
              onClick={creatingNewPage ? createSection : addSection}
            >
              Create Section
            </Button>
            <Button variant="contained" color="error" onClick={handleClose}>
              Cancel
            </Button>
            <h6>Documents</h6>
            {files.length > 0
              ? files.map((file, index) => (
                  <div className="file-name" key={uuidv4()}>
                    <div className="file-info-container">
                      <img src={document_icon} alt="document icon" />
                      <h6>{file.file.name}</h6>
                    </div>
                    <img
                      src={close_icon}
                      alt="delete document"
                      onClick={() =>
                        setFiles(files.filter((file, i) => index !== i))
                      }
                    />
                  </div>
                ))
              : null}
          </motion.div>
          {upLoading ? null : <ChildModal handleFiles={handleFiles} />}
        </Box>
      </Modal>
    </div>
  );
}
