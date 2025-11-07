import { useState, useEffect, useRef } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AdditionalASN from "../modals/AdditionalASN";
import { fetchPalletByASN } from "../../services/asns";
import { getLocationNameById } from "../../constants/LocationIds";
import { useCreateAsns, useAddAdditionalAsns } from "../../hooks/useAsns";

export default function ProcessPallets() {
  const theme = useTheme();
  const [scanInput, setScanInput] = useState("");
  const [currentPallet, setCurrentPallet] = useState(null);
  const [message, setMessage] = useState("Scan ASN ...");
  const [additionalASNOpen, setAdditionalASNOpen] = useState(false);
  const [currentPalletLoc, setCurrentPalletLoc] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const createAsnsMutation = useCreateAsns();
  const addAdditionalAsnsMutation = useAddAdditionalAsns();

  // Mock database - simulates pallets stored in the backend
  // const MOCK_DB = useRef({
  //   1000017: {
  //     id: 1000017,
  //     asns: [
  //       {
  //         asn: "ASN-001",
  //         sequence_order: 1,
  //         item_id: "CBO P17 ATX 4 14 6",
  //         po_no: 803601,
  //         quantity: 192,
  //         company_no: "SLK1",
  //         destination: "Elk Grove",
  //         location: currentPalletLoc,
  //       },
  //     ],
  //     status_id: 1,
  //   },
  //   1000018: {
  //     id: 1000018,
  //     asns: [
  //       {
  //         asn: "ASN-100",
  //         sequence_order: 1,
  //         item_id: "XYZ P20 BTX 5 16 8",
  //         po_no: 803602,
  //         quantity: 144,
  //         company_no: "SLK1",
  //         destination: "Sacramento",
  //         location: currentPalletLoc,
  //       },
  //       {
  //         asn: "ASN-101",
  //         sequence_order: 2,
  //         item_id: "ABC P15 CTX 3 12 4",
  //         po_no: 803603,
  //         quantity: 96,
  //         company_no: "SLK2",
  //         destination: "Elk Grove",
  //         location: currentPalletLoc,
  //       },
  //     ],
  //     status_id: 1,
  //   },
  // });

  // Define your barcode prefixes/patterns
  const BARCODE_PATTERNS = {
    STAGE: /^STAGE-/i, // e.g., "STAGE-A1", "STAGE-B2"
    BAY: /^BAY-/i, // e.g., "BAY-01", "BAY-12"
    // Or use specific barcode ranges if they're numeric
    // STAGE: (code) => code >= 5000 && code < 6000,
    // BAY: (code) => code >= 6000 && code < 7000,
  };

  const handleSaveAsns = async (data) => {
    console.log("Saving additional ASNs:", data);
    setMessage("Saving additional ASNs...");

    const userId = "6038";
    const asn = data.additionalAsns.map((item) => item.asn).join(",");
    console.log("New ASNs to add:", asn);

    try {
      const response = await addAdditionalAsnsMutation.mutateAsync({
        asn,
        palletId: currentPallet.id,
        userId,
      });

      console.log("Updated pallet from API:", response);
      setCurrentPallet(response);
      setMessage(`✓ ${data.additionalAsns.length} additional ASN(s) saved.`);
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);

      // Extract error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error";

      setMessage(`⚠️ ${errorMessage}`);
      throw error;
    }
  };

  //------------------- PROCESS PALLET FUNCTION -------------------//

  const processPallet = async (id) => {
    console.log(`Fetching Pallet ID: ${id}`);
    setMessage("Loading pallet information...");

    let data;
    const distroId = "SDC"; // Get from auth context or props
    const userId = "5555"; // Get from auth context or props

    try {
      // Try to fetch existing pallet
      data = await fetchPalletByASN(id, distroId);
    } catch (error) {
      // If ASN not found, create it
      if (error.response?.data?.message === "ASN not found") {
        return await handleCreateNewAsn(id, distroId, userId);
      }

      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message;
      setMessage(`⚠️ Error: ${errorMessage}`);
      return;
    }

    // Process the fetched pallet
    processFetchedPallet(data);
  };

  const handleCreateNewAsn = async (id, distroId, userId) => {
    setMessage("ASN not found. Creating new pallet...");

    try {
      await createAsnsMutation.mutateAsync({
        asnList: [id],
        distroId,
        userId,
      });

      const data = await fetchPalletByASN(id, distroId);
      processFetchedPallet(data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage(`⚠️ Error: ${errorMsg}`);
    }
  };

  const processFetchedPallet = (data) => {
    console.log("Pallet data:", data);
    setCurrentPallet(data);

    if (data.status_id === 1) {
      setMessage("Scan new location");
    } else {
      setMessage(`Pallet status: ${data.status_id}. Scan next pallet.`);
    }
  };

  const handleFocus = () => {
    // Don't overwrite error or success messages
    if (message.startsWith("⚠️") || message.startsWith("✓")) {
      return;
    }
    if (!currentPallet) {
      setMessage("Scan ASN...");
    }
    if (currentPallet && currentPallet.status_id === 1) {
      setMessage("Scan new location");
    }
  };

  const handleBlur = () => {
    // Don't overwrite error or success messages
    if (message.startsWith("⚠️") || message.startsWith("✓")) {
      return;
    }
    setMessage("Select Input to scan");
  };

  const handleStage = async (stageCode) => {
    console.log(`Staging pallet ${currentPallet.id} to ${stageCode}`);
    setMessage(`Staging to ${stageCode}...`);
    setCurrentPalletLoc(stageCode);
    let existingPallet = MOCK_DB.current[currentPallet.id];
    existingPallet.asns.forEach((asn) => {
      asn.location = stageCode;
    });

    // TODO: API call
    // await fetch('/api/stage-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ palletId: currentPallet.id, stageLocation: stageCode })
    // });

    // setTimeout(() => {
    setMessage(
      `✓ Pallet ${currentPallet.id} staged at ${stageCode}. Scan next pallet.`
    );
    setCurrentPallet(null);
    // }, 1000);
  };

  const handleLoad = async (bayCode) => {
    console.log(`Loading pallet ${currentPallet.id} to ${bayCode}`);
    setMessage(`Loading to ${bayCode}...`);
    setCurrentPalletLoc(bayCode);
    let existingPallet = MOCK_DB.current[currentPallet.id];
    existingPallet.asns.forEach((asn) => {
      asn.location = bayCode;
    });

    // TODO: API call
    // await fetch('/api/load-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ palletId: currentPallet.id, bayDoor: bayCode })
    // });

    setMessage(
      `✓ Pallet ${currentPallet.id} loaded at ${bayCode}. Scan next pallet.`
    );
    setCurrentPallet(null);
  };

  const processBarcode = (code) => {
    const trimmedCode = code.trim();

    // If no current pallet, treat as pallet ID
    if (!currentPallet) {
      processPallet(trimmedCode);
      return;
    }

    // If we have a pallet and it's status_id === 1, check for stage/bay codes
    if (currentPallet.status_id === 1) {
      if (BARCODE_PATTERNS.STAGE.test(trimmedCode)) {
        handleStage(trimmedCode);
      } else if (BARCODE_PATTERNS.BAY.test(trimmedCode)) {
        handleLoad(trimmedCode);
      } else {
        // Might be a new pallet scan - confirm or treat as error
        setMessage(
          "⚠️ Invalid barcode. Scan STAGE or BAY barcode, or press CANCEL."
        );
      }
    } else {
      // Status not 1, start new pallet
      processPallet(trimmedCode);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setScanInput(value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scanInput.trim()) {
        processBarcode(scanInput);
        setScanInput("");
      }
    }
  };

  //--------------- CANCEL FUNCTION -----------------//

  const handleCancel = () => {
    console.log("CANCEL CALLED - Before:", currentPallet);
    // if (currentPallet?.id) {
    //   delete MOCK_DB.current[currentPallet.id];
    // }
    setCurrentPallet(null);
    setCurrentPalletLoc("");
    setCancelDialogOpen(false);
    setScanInput("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    // setMessage("Scan ASN...");
    console.log("RESET CALLED - After setting to null");
  };

  // Keep input focused for continuous scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, [scanInput]);

  //--------------- MESSAGE TIMEOUT EFFECT -----------------//

  useEffect(() => {
    if (message.startsWith("✓")) {
      const timer = setTimeout(() => {
        if (!currentPallet) {
          setMessage("Scan ASN ...");
        } else if (currentPallet && currentPallet.status_id === 1) {
          if (document.activeElement === inputRef.current) {
            handleFocus();
          } else {
            setMessage("Select Input to scan");
          }
        }
      }, 3000);

      return () => clearTimeout(timer);
    } else if (message.startsWith("⚠️")) {
      const timer = setTimeout(() => {
        if (currentPallet && currentPallet.status_id === 1) {
          setMessage("Scan new location");
        } else {
          setMessage("Scan ASN ...");
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 1,
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: "100%",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          border: 1,
          borderColor: theme.palette.background.header,
          //   theme.palette.background.header
          // backgroundColor: "#0f172a",

          borderRadius: 3,
          p: 0,
        }}
      >
        {!currentPallet && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              pl: 2,
              backgroundColor: theme.palette.background.header,
              borderRadius: "10px 10px 0 0",
            }}
          >
            <img
              src="/palletIcon.png"
              alt="Pallet Icon"
              style={{ height: 40, marginRight: 10, paddingRight: 10 }}
            />
            <Typography
              variant="h5"
              component="h1"
              color={theme.palette.text.primary}
              gutterBottom
              paddingTop={2}
            >
              Process Pallets
            </Typography>
          </Box>
        )}

        {/* //-------------IF PALLET EXISTS, SHOW DETAILS-----------------// */}
        {currentPallet && (
          <Box
            sx={{
              p: 2,
              width: "98%",
              maxHeight: 300,
              mb: 2,
              mt: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: theme.palette.background.default,

              borderRadius: 2,
              border: "2px solid #3dcf44ff",
              overflowY: "auto",
              //   maxWidth: "500px",
            }}
          >
            {currentPallet.asns.map((asn) => (
              <Box
                key={asn.asn}
                sx={{
                  width: "100%",
                  mb: 1,
                  pb: 1,
                  borderBottom: "1px solid #444",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography
                  variant="h6"
                  textAlign="center"
                  gutterBottom
                  sx={{ color: theme.palette.text.message }}
                >
                  ASN: {asn.asn}
                </Typography>
                <Typography
                  sx={{ color: theme.palette.text.message }}
                  variant="body1"
                >
                  PO: {asn.po_no}
                </Typography>
                <Typography
                  sx={{ color: theme.palette.text.message }}
                  variant="body1"
                >
                  Item: {asn.item_id}
                </Typography>
                <Typography
                  sx={{ color: theme.palette.text.message }}
                  variant="body1"
                >
                  Qty: {asn.quantity}
                </Typography>
              </Box>
            ))}
            <Typography
              sx={{ color: theme.palette.text.message }}
              variant="body1"
            >
              ASN's on pallet: {currentPallet.asns.length}
            </Typography>
            {currentPallet.current_location_id !== 0 && (
              <Typography
                sx={{ color: theme.palette.text.message }}
                variant="body1"
              >
                Pallet location: {""}
                {getLocationNameById(currentPallet.current_location_id)}
              </Typography>
            )}
          </Box>
        )}

        <TextField
          label="Scan Barcode"
          variant="outlined"
          value={scanInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          autoFocus
          onFocus={handleFocus}
          onBlur={handleBlur}
          sx={{
            // mt: 1,
            width: "95%",
            backgroundColor: theme.palette.input.main,
            borderRadius: 3.5,
            "& .MuiInputLabel-root": {
              color: theme.palette.text.lb,
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: theme.palette.text.lb,
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.border.main,
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: theme.palette.background.header,
              },
          }}
        />
        {/* //-------------IF PALLET EXISTS - SHOW MESSAGES & ACTION BUTTONS-----------------// */}
        {currentPallet && (
          <Button
            sx={{
              mt: 1,
              color: theme.palette.background.paper,
              bgcolor: "#6e49f5f1",
              "&:focus": {
                outline: "none",
              },
            }}
            variant="contained"
            onClick={() => setAdditionalASNOpen(true)}
          >
            Additional ASN's
          </Button>
        )}

        <Typography
          variant="h6"
          sx={{
            mb: 1,
            textAlign: "center",
            color: message.startsWith("✓")
              ? "#4caf50"
              : message.startsWith("⚠️")
              ? "#ff9800"
              : message.startsWith("Select Input")
              ? "#d34e4eff"
              : theme.palette.text.message,
          }}
        >
          {message}
        </Typography>

        {currentPallet && (
          <Button
            // variant="outlined"
            // color={theme.palette.secondary.main}
            onClick={() => setCancelDialogOpen(true)}
            sx={{
              // my: 1,
              mb: 1,
              color: theme.palette.secondary.main,
              "&:focus": {
                outline: "none",
                backgroundColor: "transparent",
              },
              backgroundColor: "transparent",
              boxShadow: "1px 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
      <AdditionalASN
        isOpen={additionalASNOpen}
        onClose={() => setAdditionalASNOpen(false)}
        palletId={currentPallet ? currentPallet.id : null}
        existingAsn={currentPallet ? currentPallet.asns[0] : 0}
        onSave={handleSaveAsns}
        onExited={() => inputRef.current?.focus()}
      />
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle sx={{ color: theme.palette.text.message }}>
          Confirm Cancel
        </DialogTitle>
        <DialogContent sx={{ color: theme.palette.button.backgroundColor }}>
          Are you sure you want to cancel?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            sx={{ color: theme.palette.secondary.main }}
          >
            No
          </Button>
          <Button
            onClick={handleCancel}
            sx={{
              color: theme.palette.background.paper,
              backgroundColor: theme.palette.button.backgroundColor,
            }}
            variant="contained"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
