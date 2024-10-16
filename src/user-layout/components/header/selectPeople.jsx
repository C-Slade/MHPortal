import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useAuth } from "../../../context/authContext";
import { useDocs } from "../../../context/docContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/appContext";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultipleSelectCheckmarks({ sumbiting }) {
  const [personName, setPersonName] = React.useState([]);
  const [userInfo, setUsers] = React.useState([]);
  const { users, currentUserInfo, allUserNames } = useAuth();
  const { alertError } = useApp();
  const { setModeratorNames, getModeratorUids, allDocs, allManuals } =
    useDocs();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === "string" ? value.split(",") : value);
    setModeratorNames(typeof value === "string" ? value.split(",") : value);
  };

  const getNames = async (currentPage) => {
    if (
      allDocs[currentPage] === undefined &&
      allManuals[currentPage] === undefined &&
      !location.pathname.includes("createFolder")
    ) {
      navigate("/dashboard");
      alertError("The page you are trying to go to no longer exists");
      return;
    }

    const allUids = await getModeratorUids(allUserNames);
    const currentUserName = currentUserInfo.info.name;
    const allUserNamesFiltered = allUserNames.filter(
      (name) => name !== currentUserName
    );

    setUsers(allUserNamesFiltered);
    if (currentPage === "createFolder") return;

    let pageModerators;

    if (allDocs[currentPage] === undefined) {
      pageModerators = allManuals[currentPage].moderators;
    } else {
      pageModerators = allDocs[currentPage].moderators;
    }

    let listOfModerators = [];

    if (pageModerators) {
      pageModerators.forEach((mod) => {
        allUids.forEach((user) => {
          if (user.id === mod.id) {
            listOfModerators.push(user.name);
          }
        });
      });
    }
    setPersonName(listOfModerators);
    setModeratorNames(listOfModerators);
  };

  React.useEffect(() => {
    if (sumbiting) setPersonName([]);
  }, [sumbiting]);

  React.useEffect(() => {
    setPersonName([]);
    if (!location.pathname.includes("view")) {
      const currentPage = location.pathname
        .replace("/docs/", "")
        .replace("/manuals/", "")
        .replace(/ /g, "-");
      getNames(currentPage);
    }
  }, [users, location]);

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }} size="small" id="select-people">
        <InputLabel id="demo-multiple-checkbox-label">Can Modify</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={MenuProps}
        >
          {userInfo.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={personName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
