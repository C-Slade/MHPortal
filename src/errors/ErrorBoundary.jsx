import React from "react";
import { Button } from "@mui/material";
import "./css/styles.css";
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="error-container">
            <h1>There has been an error with MHI Portal</h1>
            <p>Please click reload page and try again</p>
            <Button
              variant="contained"
              size="small"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
