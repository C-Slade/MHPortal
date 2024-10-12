import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const getStatusLiStyles = (value) => {
  if (value === "verified") {
    return {
      color: "#348440",
      textTransform: "capitalize",
    };
  }
  if (value === "manager") {
    return {
      color: "#FF3D00",
      textTransform: "capitalize",
    };
  }
  if (value === "view only") {
    return {
      color: "#348440",
      textTransform: "capitalize",
    };
  }
  if (value === "moderator") {
    return {
      color: "#116FFF",
      textTransform: "capitalize",
    };
  }

  if (value === "DeActivated") {
    return {
      color: "#FF6347",
      textTransform: "capitalize",
    };
  }

  if (value === "pending") {
    return {
      color: "#EB9605",
      textTransform: "capitalize",
    };
  }
};

const getStatusDivStyles = (value) => {
  if (value === "verified") {
    return {
      background: "#86ae8cb3",
      borderRadius: "10px",
      padding: "3px 10px",
    };
  }
  if (value === "pending") {
    return {
      background: "#eb970583",
      borderRadius: "10px",
      padding: "3px 10px",
    };
  }
  if (value === "DeActivated") {
    return {
      background: "#ff634781",
      borderRadius: "10px",
      padding: "3px 10px",
    };
  }
};

const columns = [
  {
    field: "fullName",
    headerName: "Full name",
    flex: 1,
  },
  {
    field: "email",
    headerName: "email",
    width: 300,
    flex: 1,
  },
  {
    field: "status",
    headerName: "status",
    width: 160,
    flex: 1,
    renderCell: (params) => {
      return (
        <div
          className="status-container"
          style={getStatusDivStyles(params.value)}
        >
          <li
            className={`status ${params.value}`}
            style={getStatusLiStyles(params.value)}
          >
            {params.value}
          </li>
        </div>
      );
    },
  },
  {
    field: "permission",
    headerName: "permission",
    width: 160,
    flex: 1,
    renderCell: (params) => {
      return (
        <li
          className={`Permission ${params.value}`}
          style={getStatusLiStyles(params.value)}
        >
          {params.value}
        </li>
      );
    },
  },
];

export default function DataTable({ rows, setSelectedUsers }) {
  return (
    <div
      style={{ height: "88%", width: "100%" }}
      className="data-grid-container"
    >
      {rows.length > 0 ? (
        <DataGrid
          autoheight
          rows={rows}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={(ids) => {
            const selectedIDs = new Set(ids);
            const selectedRowData = rows.filter((row) =>
              selectedIDs.has(row.id.toString())
            );
            setSelectedUsers(selectedRowData);
          }}
          sx={{
            "& .MuiDataGrid-columnHeader": {
              borderBottom: 1,
              fontWeight: 700,
              textTransform: "capitalize",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "0.5px solid #a3a3a3",
            },
          }}
        />
      ) : null}
    </div>
  );
}
