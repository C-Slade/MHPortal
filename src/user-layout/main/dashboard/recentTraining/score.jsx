import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { v4 as uuidv4 } from "uuid";
import quiz_icon from "../../../../assets/exam.png";
import "../css/styles.css";

function createData(name, date, score) {
  return { name, date, score };
}

export default function Score({ scores }) {
  const rows = scores.map((score) => {
    return createData(score.name, score.date, score.score);
  });

  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "transparent",
      color: "black",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const getScoreColor = (score) => {
    if (score >= 90) return { backgroundColor: "#10ae20" };
    if (score >= 80) return { backgroundColor: "#90d40a" };
    if (score >= 70) return { backgroundColor: "#cdc724" };
    if (score > 60) return { backgroundColor: "#FE9901" };
    if (score <= 60) return { backgroundColor: "#FF2E00" };
  };

  return (
    <TableContainer className="score-data" component={Paper}>
      <Table aria-label="custom pagination table">
        <TableHead>
          <TableRow>
            <StyledTableCell className="folder-subHeading"></StyledTableCell>
            <StyledTableCell className="category">Name</StyledTableCell>
            <StyledTableCell align="left" className="category">
              Date
            </StyledTableCell>
            <StyledTableCell align="left" className="category">
              Score
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, 10000).map((row) => (
            <TableRow key={uuidv4()} className="score-row">
              <TableCell className="quiz-tb" component="th" scope="row">
                <img className="exam-icon" src={quiz_icon} alt="quiz-icon" />
              </TableCell>
              <TableCell className="name" component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell className="date" style={{ width: 360 }} align="left">
                {row.date}
              </TableCell>
              <TableCell className="score" style={{ width: 160 }} align="left">
                <div
                  className="score-container"
                  style={getScoreColor(row.score)}
                >
                  {`${row.score}%`}
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow style={{ height: 100 }}>
            <TableCell colSpan={6} />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
