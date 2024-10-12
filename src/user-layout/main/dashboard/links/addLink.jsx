import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import add_icon from "../../../../assets/add.png";
import TextField from "@mui/material/TextField";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./css/styles.css";
import { collectionData } from "../../../../firebase";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const AddLink = () => {
  const [open, setOpen] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [link, setLink] = useState("");
  const [errorName, setErrorForName] = useState(false);
  const [errorLink, setErrorForLink] = useState(false);
  const [nameErrorHelper, setHelperForName] = useState("");
  const [linkErrorHelper, setHelperForLink] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addLink = async () => {
    const docRef = doc(collectionData, "links", "links");
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    if (docSnap.exists()) {
      let copyOfData = data;
      let error = false;

      setErrorForLink(false);
      setErrorForName(false);
      setHelperForLink("");
      setHelperForName("");

      if (link === "") {
        error = true;
        setErrorForLink(true);
        setHelperForLink("Link required");
      }

      if (linkName === "") {
        error = true;
        setErrorForName(true);
        setHelperForName("Name required");
      }

      if (copyOfData.links !== undefined) {
        copyOfData.links.forEach((copyLink) => {
          if (copyLink.name === linkName) {
            error = true;
            setErrorForName(true);
            setHelperForName("No duplicate names");
          }
        });
      }

      if (error === false && copyOfData.links === undefined) {
        handleClose();
        await updateDoc(docRef, {
          links: [
            {
              link: link,
              name: linkName,
            },
          ],
        });

        setLink("");
        setLinkName("");
      } else if (error === false) {
        copyOfData.links.push({
          link: link,
          name: linkName,
        });

        handleClose();
        await updateDoc(docRef, copyOfData);

        setLink("");
        setLinkName("");
      }
    }
  };

  return (
    <>
      <div className="addLink" onClick={handleOpen}>
        <img src={add_icon} alt="Add link" />
        <h4>Add Link</h4>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="addLink-modal">
          <h2>Create new link</h2>
          <TextField
            error={errorName}
            helperText={nameErrorHelper}
            className="linkName"
            label="Link Name"
            variant="standard"
            size="small"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
          />
          <TextField
            error={errorLink}
            helperText={linkErrorHelper}
            className="link"
            label="Link"
            variant="standard"
            size="small"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <div className="button-container">
            <Button
              className="accept"
              variant="outlined"
              size="medium"
              onClick={addLink}
            >
              Accept
            </Button>
            <Button
              className="cancel"
              variant="outlined"
              size="medium"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default AddLink;
