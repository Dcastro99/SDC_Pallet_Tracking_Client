import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const UnloadPallet = ({
  isOpen,
  onClose,
  onUnload,
  asnId,
  setMessage,
  onExited,
}) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [placeholder, setPlaceholder] = useState("Enter location...");
  const [newStatusId, setNewStatusId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);
  const theme = useTheme();

  const areas = [
    { id: "STAGE", label: "Stage Area" },
    { id: "DAMAGE", label: "Damage Area" },
    { id: "HOLD", label: "Hold Area" },
  ];

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedArea(null);
      setTextInput("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleAreaSelect = (areaId) => {
    console.log("Selected area:", areaId);
    setSelectedArea(areaId);
    setErrorMessage(""); // Clear error when user selects an area
    areaId === "STAGE"
      ? (setPlaceholder("Scan stage location..."), setNewStatusId(4))
      : areaId === "DAMAGE"
      ? (setPlaceholder("Scan damage location..."), setNewStatusId(10))
      : (setPlaceholder("Scan hold location..."), setNewStatusId(13));
  };

  const handleDone = () => {
    if (!selectedArea) {
      setErrorMessage("⚠️ Please select an area");
      return;
    }

    if (!textInput.trim()) {
      setErrorMessage("⚠️ Please enter a location");
      return;
    }

    const locationName = textInput.trim();

    // Validate that the scan starts with the selected area
    if (!locationName.startsWith(selectedArea)) {
      console.log(
        `Invalid barcode scanned: ${locationName} for area ${selectedArea}`
      );
      setErrorMessage(
        `⚠️ Invalid barcode. Scan ${selectedArea} barcode, or press Cancel.`
      );
      setTextInput("");
      return;
    }

    onUnload(locationName, newStatusId);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      disableRestoreFocus
      slotProps={{
        paper: {
          bgcolor: "#4a4a4a",
          color: "white",
          borderradius: 3,
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
          sx={{ mb: 3, fontWeight: 500, color: theme.palette.text.message }}
        >
          Unload Pallet
        </Typography>

        {/* Display ASN ID */}
        <Typography>ASN</Typography>
        <Box
          sx={{
            bgcolor: "#3a3a3a",
            border: "1px solid #5a5a5a",
            borderRadius: 1,
            // p: 2,
            mb: 1,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{ fontWeight: 500, fontSize: "1.25rem", color: "white" }}
          >
            {asnId}
          </Typography>
        </Box>

        {/* Area Selection Buttons */}
        <Typography>Select Destination</Typography>
        <Stack spacing={1.5} sx={{ mb: 1 }}>
          {areas.map((area) => (
            <Button
              key={area.id}
              onClick={() => handleAreaSelect(area.id)}
              fullWidth
              variant="contained"
              sx={{
                px: 1,
                fontSize: "1rem",
                textTransform: "none",
                bgcolor: selectedArea === area.id ? "#6e49f5f1" : "#2a2a2a",
                color: selectedArea === area.id ? "white" : "#999",
                border:
                  selectedArea === area.id
                    ? "2px solid #6e49f5f1"
                    : "1px solid #5a5a5a",
                "&:hover": {
                  bgcolor: selectedArea === area.id ? "#4b23dbf1" : "#3a3a3a",
                },
                "&:active": {
                  bgcolor: selectedArea === area.id ? "#6e49f5f1" : "#2a2a2a",
                },
                "&:focus": {
                  outline: "none",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  // border: "1px solid red",
                }}
              >
                <Typography>{area.label}</Typography>
                {selectedArea === area.id && (
                  <img
                    src="/checkMark.png"
                    alt="checkMark"
                    style={{ height: 30 }}
                  />
                )}
              </Box>
            </Button>
          ))}
        </Stack>

        {/* Text Input Field */}
        <Typography>Scan Location</Typography>
        <TextField
          size="small"
          fullWidth
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            setErrorMessage(""); // Clear error when user types
          }}
          onKeyDown={(e) => e.key === "Enter" && handleDone()}
          placeholder={placeholder}
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

        {/* Error Message */}
        {errorMessage && (
          <Typography
            sx={{
              mt: 2,
              color: "#ff9800",
              textAlign: "center",
              fontSize: "0.95rem",
            }}
          >
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      {/* Action buttons */}
      <DialogActions
        sx={{ flexDirection: "column", gap: 1.5, px: 3, pb: 3, pt: 0 }}
      >
        <Button
          onClick={handleDone}
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#6e49f5f1",
            py: 1.5,
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

export default UnloadPallet;
