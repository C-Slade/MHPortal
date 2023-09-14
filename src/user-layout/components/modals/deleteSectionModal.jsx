import { React, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
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

export default function NestedModal({ pageID, sectionIndex }) {
  const [open, setOpen] = useState(false);
  const { deleteSection } = useDocs();
  const [loading, setLoading] = useState(false);
  const { alertError, alertSuccess } = useApp();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSection(pageID, sectionIndex);
      alertSuccess("Section has been successfully deleted");
    } catch (error) {
      alertError(error);
    }
    setLoading(false);
    handleClose();
  };

  return (
    <>
      <li onClick={handleOpen}>Delete Section</li>
      <Modal
        open={open}
        onClose={handleClose}
        className="addDocModal"
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box
          sx={{ ...style, width: 400 }}
          className="section-modal delete-section"
        >
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
            <h2>Are you sure you want to delete this section?</h2>
            <Button variant="contained" onClick={handleDelete}>
              Delete
            </Button>
          </motion.div>
        </Box>
      </Modal>
    </>
  );
}
