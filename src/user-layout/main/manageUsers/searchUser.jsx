import React from "react";
import TextField from "@mui/material/TextField";

const SearchUser = ({ searchUser }) => {
  return (
    <div className="searchUser-container">
      <TextField
        label="Search User..."
        variant="outlined"
        size="small"
        onChange={(e) => searchUser(e.target.value)}
      />
    </div>
  );
};

export default SearchUser;
