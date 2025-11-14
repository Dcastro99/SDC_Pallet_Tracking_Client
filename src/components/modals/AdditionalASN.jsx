import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const AdditionalASN = ({
  isOpen,
  onClose,
  palletId,
  existingAsns,
  onSave,
  onExited,
}) => {
  const [additionalAsns, setAdditionalAsns] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const inputRef = useRef(null);

  // Clear additionalAsns array when palletId becomes null (Cancel is clicked)
  useEffect(() => {
    if (palletId === null) {
      setAdditionalAsns([]);
      setScanInput("");
    }
  }, [palletId]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure dialog animation completes
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (onClose) {
      setScanInput("");
    }
  }, [onClose]);

  const handleAddAsn = () => {
    if (scanInput.trim()) {
      const newAsn = {
        asn: scanInput.trim(),
        sequence_order: additionalAsns.length + existingAsns.length + 1,
        tempId: Date.now(), // Temporary ID for tracking
      };
      setAdditionalAsns([...additionalAsns, newAsn]);
      setScanInput("");
    }
  };

  const handleDelete = (index) => {
    const updated = additionalAsns.filter((_, i) => i !== index);
    // Reorder sequence numbers
    const reordered = updated.map((asn, i) => ({
      ...asn,
      sequence_order: i + existingAsns.length + 1,
    }));
    setAdditionalAsns(reordered);
  };

  const handleTouchStart = (e, index) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e, index) => {
    if (draggedIndex !== index) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;

    // Only start dragging if horizontal movement is dominant
    if (
      !isDragging.current &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > 10
    ) {
      isDragging.current = true;
    }

    if (isDragging.current && deltaX < 0) {
      setDragOffset(Math.max(deltaX, -100));
      // e.preventDefault();
    }
  };

  const handleTouchEnd = (index) => {
    if (dragOffset < -60) {
      handleDelete(index);
    }
    setDragOffset(0);
    setDraggedIndex(null);
    isDragging.current = false;
  };

  const handleDone = async () => {
    // Prepare data to send to database
    const dataToSend = {
      id: palletId,
      additionalAsns: additionalAsns.map((asn) => ({
        asn: asn.asn,
      })),
    };

    // Call the save handler passed from parent
    if (onSave) {
      try {
        await onSave(dataToSend);
        // Only close if save was successful
        onClose();
        setAdditionalAsns([]);
        setScanInput("");
      } catch (error) {
        // Clear the additional ASNs on error
        setAdditionalAsns([]);
        setScanInput("");
        // Close the dialog so user can see the error message
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      // maxWidth="md"
      fullScreen
      disableRestoreFocus
      slotProps={{
        paper: {
          bgcolor: "#4a4a4a",
          color: "white",
          borderradius: 3,
          // maxWidth: 400,
        },
        transition: {
          onEntered: () => {
            inputRef.current?.focus();
          },
          onExited: () => {
            onExited?.();
          },
        },
      }}
    >
      <DialogContent sx={{ px: 3, py: 4 }}>
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, fontWeight: 500, color: "gray" }}
        >
          Add ASN
        </Typography>

        {/* Display existing ASNs */}
        <Box
          sx={{
            maxHeight: 250,
            overflowY: "auto",
            mb: 2,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#2a2a2a",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#5a5a5a",
              borderRadius: "3px",
            },
          }}
        >
          {existingAsns.map((asn, index) => (
            <Paper
              key={asn.asn || index}
              elevation={0}
              sx={{
                bgcolor: "#3a3a3a",
                border: "1px solid #5a5a5a",
                borderRadius: 1,
                p: 1,
                mb: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography sx={{ color: "#999" }}>
                  {asn.sequence_order || index + 1}
                </Typography>
                <Typography sx={{ color: "#999" }}>ASN:</Typography>
                <Typography
                  sx={{ fontWeight: 500, fontSize: "1.125rem", color: "white" }}
                >
                  {asn.asn}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* Display additional ASNs with swipe to delete */}
        <Box
          sx={{
            maxHeight: 250,
            overflowY: "auto",
            mb: 2,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#2a2a2a",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#5a5a5a",
              borderRadius: "3px",
            },
          }}
        >
          {additionalAsns.map((asn, index) => (
            <Box
              key={asn.tempId}
              sx={{
                position: "relative",
                mb: 1.5,
                overflow: "hidden",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "#2a2a2a",
                  borderRadius: 1,
                  p: 2,
                  position: "relative",
                  zIndex: 2,
                  transform:
                    draggedIndex === index
                      ? `translateX(${dragOffset}px)`
                      : "translateX(0)",
                  transition:
                    draggedIndex === index && dragOffset !== 0
                      ? "none"
                      : "transform 0.3s ease",
                  touchAction: "pan-y",
                }}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onTouchEnd={() => handleTouchEnd(index)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ color: "#999" }}>
                    {asn.sequence_order}
                  </Typography>
                  <Typography sx={{ color: "#999" }}>ASN:</Typography>
                  <Typography
                    sx={{ fontWeight: 500, fontSize: "1.125rem", flex: 1 }}
                  >
                    {asn.asn}
                  </Typography>
                </Stack>
              </Paper>

              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  pr: 2.5,
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={() => handleDelete(index)}
                  sx={{
                    bgcolor: "#ff4757",
                    color: "white",
                    width: 50,
                    height: 50,
                    "&:hover": {
                      bgcolor: "#ff3838",
                    },
                    "&:active": {
                      bgcolor: "#ee2f3f",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Scan input */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAsn()}
            placeholder="scan ASN..."
            variant="outlined"
            inputRef={inputRef}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#5a5a5a",
                color: "white",
                borderRadius: 1,
                "& fieldset": {
                  border: "none",
                },
                "& input::placeholder": {
                  color: "#999",
                  opacity: 1,
                },
              },
            }}
          />
        </Stack>

        <Typography
          align="center"
          sx={{ color: "#999", fontSize: "0.875rem", mb: 3 }}
        >
          Scan all ASN's on pallet
        </Typography>
      </DialogContent>

      {/* Action buttons */}
      <DialogActions
        sx={{ flexDirection: "column", gap: 1.5, px: 3, pb: 3, pt: 0 }}
      >
        <Button
          size="small"
          onClick={handleDone}
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#6e49f5f1",
            // py: 1.5,
            fontSize: "1rem",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#4b23dbf1",
            },
            "&:active": {
              bgcolor: "#6e49f5f1",
            },
          }}
        >
          Done
        </Button>
        <Button
          size="small"
          onClick={onClose}
          fullWidth
          sx={{
            color: "#999",
            textTransform: "none",
            "&:hover": {
              color: "#ccc",
              bgcolor: "transparent",
            },
            "&:active": {
              color: "white",
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdditionalASN;
