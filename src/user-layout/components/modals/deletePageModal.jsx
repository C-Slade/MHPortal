import { React, useState } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import "./css/styles.css";
import { useDocs } from "../../../context/docContext";
import { useTraining } from "../../../context/trainingContext";

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

export default function DeletePage({ headerLoading, onTrainingPage }) {
  const [open, setOpen] = useState(false);
  const { deletePage, pageName } = useDocs();
  const { deleteQuizModule, currentModule } = useTraining();
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    if (onTrainingPage) {
      await deleteQuizModule(currentModule.moduleID);
    } else {
      await deletePage(pageName);
    }
    setLoading(false);
    handleClose();
  };

  return (
    <>
      <LoadingButton
        loading={headerLoading}
        variant="contained"
        loadingPosition="start"
        color="error"
        size="large"
        startIcon={<DeleteIcon />}
        onClick={handleOpen}
      >
        <span>Delete</span>
      </LoadingButton>
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
            <h2>Are you sure you want to delete this page?</h2>
            <div className="button-container">
              <Button
                variant="contained"
                className="delete"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                className="cancel"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </Box>
      </Modal>
    </>
  );
}
