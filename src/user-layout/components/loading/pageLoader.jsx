import React from "react";
import "./css/styles.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const PageLoader = () => {
  return (
    <>
      <div className="page-loader">
        <Box sx={{ display: "flex" }} className="loader">
          <CircularProgress />
        </Box>
      </div>
    </>
  );
};

export default PageLoader;
