import * as React from "react";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useApp } from "../../../context/appContext";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AlertBar({ msg }) {
  const [open, setOpen] = React.useState(false);
  const { alertMessage, clearError, alertType } = useApp();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
    setTimeout(() => {
      clearError();
    }, 250);
  };

  React.useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMessage === "" ? msg : alertMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
