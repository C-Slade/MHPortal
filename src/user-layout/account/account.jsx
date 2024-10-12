import React from "react";
import AccountTab from "./accountTab";
import "./css/styles.css";

const Account = () => {
  return (
    <div className="account-container">
      <AccountTab type="account" />
      <AccountTab type="password" />
      <AccountTab type="userName" />
      <AccountTab type="removeUser" />
    </div>
  );
};

export default Account;
