import { React, useState } from "react";
import attention_icon from "../../../assets/attention.png";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import "./css/styles.css";
import { useAuth } from "../../../context/authContext";

const style = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const Attention = () => {
  const [open, setOpen] = useState(true);

  const { setFirstTimeLogin } = useAuth();

  const closeNotice = () => {
    setOpen(false);
    setFirstTimeLogin(false);
  };

  return (
    <Box sx={{ ...style }} className="attention">
      <div className="img-container">
        <img src={attention_icon} alt="Notice icon" />
        <h4>Attention!</h4>
      </div>
      <div className="info-container">
        <h6>
          Please note that this app is still currently in beta. There are still
          features not present in this version that are still being worked on.
          Thank you.
        </h6>
      </div>
      <Button
        variant="contained"
        onClick={closeNotice}
        className="close-attention"
      >
        Close
      </Button>
    </Box>
  );
};

export default Attention;
