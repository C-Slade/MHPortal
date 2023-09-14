import React from "react";
import DeleteSectionModal from "../../components/modals/deleteSectionModal.jsx";
import { motion } from "framer-motion";

const SectionOptions = ({
  open,
  setEditing,
  toggleOptions,
  pageID,
  sectionIndex,
  toggleDeleteFiles,
  toggleAddingFiles,
  toggleChangingSectionTitle,
}) => {
  const handleAddFiles = () => {
    setEditing(true);
    toggleOptions(false);
    toggleAddingFiles(true);
    toggleDeleteFiles(false);
  };
  const handleDeleteFIles = () => {
    setEditing(true);
    toggleOptions(false);
    toggleDeleteFiles(true);
    toggleAddingFiles(false);
  };

  const handleEditTitle = () => {
    setEditing(true);
    toggleOptions(false);
    toggleChangingSectionTitle(true);
  };
  return (
    <motion.div
      className="options-list-container"
      initial={{ opacity: 0 }}
      animate={open ? { opacity: 1 } : { opacity: 0 }}
    >
      <ul>
        <li onClick={handleAddFiles}>Add files</li>
        <li onClick={handleEditTitle}>Edit Title</li>
        <li onClick={handleDeleteFIles}>Delete Files</li>
        <DeleteSectionModal
          pageID={pageID}
          sectionIndex={sectionIndex}
          toggleOptions={toggleOptions}
        />
      </ul>
    </motion.div>
  );
};

export default SectionOptions;
