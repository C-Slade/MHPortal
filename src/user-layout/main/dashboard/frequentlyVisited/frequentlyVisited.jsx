import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import { v4 as uuidv4 } from "uuid";
import { collectionData } from "../../../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../../context/authContext.js";
import folder_icon from "../../../../assets/folder.png";
import { Link } from "react-router-dom";
import "./css/styles.css";
import { useDocs } from "../../../../context/docContext.js";

function createData(name, module, category, document) {
  return { name, module, category, document };
}

const FrequentlyVisited = () => {
  const { currentUser, fetchUser } = useAuth();
  const [docCount, setDocCount] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const { setPdfDocName, setDocOnPreview, setQueryName } = useDocs();

  const getData = async () => {
    const userData = await fetchUser(currentUser.uid);

    if (userData?.docCount) {
      const docRef = doc(collectionData, "users", `${currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      const docCount = data.docCount;
      const sortedDocCount = Object.hasOwn(data, "docCount")
        ? docCount.sort((a, b) => b.viewCount - a.viewCount)
        : [];

      const allDocs = async () => {
        return new Promise(async (resolve, reject) => {
          const docRef = doc(collectionData, "docs", "docs");
          const docSnap = await getDoc(docRef);
          resolve(docSnap.data());
        });
      };
      const allManuals = async () => {
        return new Promise(async (resolve, reject) => {
          const docRef = doc(collectionData, "manuals", "manuals");
          const docSnap = await getDoc(docRef);
          resolve(docSnap.data());
        });
      };

      const getSortedDocInfo = async () => {
        return new Promise(async (resolve, reject) => {
          let sorted = [];
          const docs = await allDocs();
          const manuals = await allManuals();
          sortedDocCount.forEach(async (docInfo) => {
            let data;

            if (docInfo.query === "docs") data = docs;
            if (docInfo.query === "manuals") data = manuals;

            for (const key in data) {
              if (Object.hasOwnProperty.call(data, key)) {
                const module = data[key];

                module.sections.forEach((section) => {
                  section.docs.forEach((document) => {
                    if (docInfo.docID === document.id) {
                      sorted.push({
                        name: document.name,
                        id: document.id,
                        module: key,
                        category: section.title,
                        docCount: docInfo.viewCount,
                        document: document,
                      });
                    }
                  });
                });
              }
            }
          });
          resolve(sorted);
        });
      };

      if (sortedDocCount.length > 0) {
        const frequentlyVisitedDocs = await getSortedDocInfo();
        setDocCount(frequentlyVisitedDocs);
      } else {
        setDocCount([]);
      }

      setLoadingData(false);
    } else {
      setLoadingData(false);
    }
  };

  const viewDoc = (docInfo) => {
    setDocOnPreview(docInfo);
    setPdfDocName(docInfo.name);

    const query = docInfo.path.split("/")[0];
    setQueryName(query);
  };

  const path = (docInfo) => {
    const typeOfDoc = docInfo.document.path.split("/")[0];
    return `/${typeOfDoc}/dashboard/view/${docInfo.document.id}`;
  };

  useEffect(() => {
    if (currentUser) {
      getData();
    }
  }, []);

  // added doc.document for the rows to be able to get path to doc. This does not appear in the table data on ui
  const rows = docCount.map((doc) => {
    return createData(doc.name, doc.module, doc.category, doc.document);
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
  return (
    <div
      className="frequentlyVisited-container"
      style={docCount.length < 1 ? { justifyContent: "flex-start" } : null}
    >
      <h2>Frequently Visited</h2>
      {docCount.length > 0 && !loadingData ? (
        <>
          <TableContainer className="frequentlyVisited-data" component={Paper}>
            <Table aria-label="custom pagination table">
              <TableHead>
                <TableRow>
                  <StyledTableCell className="folder-subHeading"></StyledTableCell>
                  <StyledTableCell className="name-subHeading">
                    Name
                  </StyledTableCell>
                  <StyledTableCell align="left" className="module-subHeading">
                    Module
                  </StyledTableCell>
                  <StyledTableCell align="left" className="category-subHeading">
                    Category
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {rows.slice(0, 10000).map((row) => (
                  <TableRow key={uuidv4()} className="row-container">
                    <TableCell className="folder-tb" component="th" scope="row">
                      <img
                        className="folder-icon"
                        src={folder_icon}
                        alt="folder-icon"
                      />
                    </TableCell>
                    <TableCell className="name" component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell className="module" component="th" scope="row">
                      {row.module}
                    </TableCell>
                    <TableCell
                      className="category"
                      style={{ width: 260 }}
                      align="left"
                    >
                      {row.category}
                    </TableCell>
                    <TableCell
                      className="view"
                      style={{ width: 160 }}
                      align="left"
                    >
                      <Link to={path(row)}>
                        <Button
                          variant="contained"
                          className="view-btn"
                          size="small"
                          onClick={() => viewDoc(row.document)}
                        >
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow style={{ height: 100 }}>
                  <TableCell colSpan={6} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : docCount.length < 1 && !loadingData ? (
        <div className="no-content-frequentlyVisited">
          View more pages for this feature to become available
        </div>
      ) : (
        <Box className="loadingData" sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  );
};

export default FrequentlyVisited;
