import React from "react";
import { motion } from "framer-motion";
import { useDocs } from "../../../context/docContext";

const SectionOptions = ({
  open,
  setEditing,
  toggleOptions,
  sectionIndex,
  toggleAddingFiles,
  toggleDeleteFiles,
  toggleChangingSectionTitle,
}) => {
  const { setSections, sections } = useDocs();
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

  const handleDeleteSection = () => {
    const filteredSections = sections.filter(
      (section, i) => i !== sectionIndex
    );
    setSections(filteredSections);
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
        <li onClick={handleDeleteSection}>Delete Section</li>
      </ul>
    </motion.div>
  );
};

export default SectionOptions;
