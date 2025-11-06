import { useState, useEffect, useRef } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";

export default function ProcessSpecialFab() {
  const [poNo, setpoNo] = useState("");
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const processPallet = (id) => {
    console.log(`Processing Pallet ID: ${id}`);
    // TODO: Send to API
    // await fetch('/api/process-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ poNo: id })
    // });
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setpoNo(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-submit after 150ms of no input (scan gun completes)
    if (value.trim()) {
      timeoutRef.current = setTimeout(() => {
        processPallet(value);
        setpoNo(""); // Clear for next scan
        inputRef.current?.focus();
      }, 150);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // Clear timeout if user manually presses Enter
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (poNo.trim()) {
        processPallet(poNo);
        setpoNo(""); // Clear for next scan
      }
    }
  };

  // Keep input focused for continuous scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, [poNo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Container
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Scan PO
      </Typography>
      <TextField
        label="PO Number"
        variant="outlined"
        value={poNo}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        autoFocus
        sx={{
          mb: 2,
          width: "300px",
          backgroundColor: "#727272ff",
          borderRadius: 2,
        }}
      />
      <Box sx={{ height: "20px" }} />
    </Container>
  );
}
