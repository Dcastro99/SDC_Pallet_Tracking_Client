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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import AdditionalASN from "../modals/AdditionalASN";
import UnloadPallet from "../modals/UnloadPallet";
import PalletEditButton from "../modals/PalletEditButton";
import { fetchPalletByASN } from "../../services/asns";
import {
  useCreateAsns,
  useAddAdditionalAsns,
  useStagePallet,
  useLoadPalletToLocation,
  useUnloadPalletFromLocation,
} from "../../hooks/useAsns";

export default function ProcessPallets() {
  const theme = useTheme();
  const [scanInput, setScanInput] = useState("");
  const [currentPallet, setCurrentPallet] = useState(null);
  const [message, setMessage] = useState("Scan ASN ...");
  const [additionalASNOpen, setAdditionalASNOpen] = useState(false);
  const [unloadPalletOpen, setUnloadPalletOpen] = useState(false);
  const [unloadPalletError, setUnloadPalletError] = useState("");
  const [currentPalletLoc, setCurrentPalletLoc] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteAsnOpen, setDeleteAsnOpen] = useState(false);
  const [selectedAsn, setSelectedAsn] = useState(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const createAsnsMutation = useCreateAsns();
  const addAdditionalAsnsMutation = useAddAdditionalAsns();
  const stagePalletMutation = useStagePallet();
  const loadPalletToLocationMutation = useLoadPalletToLocation();
  const unloadPalletMutation = useUnloadPalletFromLocation();

  // Define your barcode prefixes/patterns
  const BARCODE_PATTERNS = {
    STAGE: /^STAGE-/i, // e.g., "STAGE-A1", "STAGE-B2"
    BAY: /^BAY-/i, // e.g., "BAY-01", "BAY-12"
    // Or use specific barcode ranges if they're numeric
    // STAGE: (code) => code >= 5000 && code < 6000,
    // BAY: (code) => code >= 6000 && code < 7000,
  };

  const handleDeleteAsn = async (asn) => {
    console.log("Deleting ASN:", asn);
    if (!asn || !asn) {
      console.error("Invalid ASN:", asn);
      setMessage("⚠️ Error: Invalid ASN");
      return;
    }
    // TODO: Add API call here to delete the ASN
    setMessage(`✓ ASN ${asn} deleted successfully.`);
  };

  const handleUnloadPallet = async (locationName, statusId) => {
    setMessage("Unloading pallet...");
    setUnloadPalletError(""); // Clear any previous errors
    try {
      const userId = "6038";
      const distroId = "SDC";
      console.log(
        `Unloading pallet ${currentPallet.id} to ${locationName} with status ${statusId}`
      );

      await unloadPalletMutation.mutateAsync({
        palletId: currentPallet.id,
        locationName: locationName,
        statusId: statusId,
        userId,
        distroId,
      });

      setMessage(`✓ Pallet unloaded to ${locationName}. Scan new ASN.`);
      setCurrentPallet(null);
      setUnloadPalletOpen(false);
    } catch (error) {
      console.error("Error unloading pallet:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setUnloadPalletError(`⚠️ ${errorMessage}`);
      // Don't close the modal so user can see the error
    }
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
      console.log("Is response an array?", Array.isArray(response));

      // If response is an array of ASNs, merge it with existing pallet
      // If response is a full pallet object, use it directly
      const updatedPallet = Array.isArray(response)
        ? { ...currentPallet, asns: response }
        : response;

      setCurrentPallet(updatedPallet);
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
    const distroId = "TDC"; // Get from auth context or props
    const userId = "5555"; // Get from auth context or props

    try {
      // Try to fetch existing pallet
      data = await fetchPalletByASN(id, distroId);
      setMessage("✓ Pallet loaded successfully"); // Add success message
    } catch (error) {
      // If ASN not found, create it
      if (error.response?.data?.message === "ASN not found") {
        setMessage("ASN not found. Creating new..."); // Optional: before creating
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

  //--------------- HANDLE CREATE NEW ASN FUNCTION -----------------//

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

    if (currentPallet) {
      setMessage("Scan new location");
    }
  };

  //--------------- HANDLE FOCUS & BLUR -----------------//

  const handleFocus = () => {
    if (message.startsWith("⚠️") || message.startsWith("✓")) {
      return;
    }
    if (!currentPallet) {
      setMessage("Scan ASN...");
    }
    if (currentPallet) {
      setMessage("Scan new location");
    }
  };

  const handleBlur = () => {
    if (message.startsWith("⚠️") || message.startsWith("✓")) {
      return;
    }
    setMessage("Select Input to scan");
  };

  //--------------- HANDLE STAGE FUNCTION -----------------//

  const handleStage = async (stageCode) => {
    console.log(`Staging pallet ${currentPallet.id} to ${stageCode}`);
    setMessage(`Staging to ${stageCode}...`);
    // setCurrentPalletLoc(stageCode);
    // let existingPallet = MOCK_DB.current[currentPallet.id];
    // existingPallet.asns.forEach((asn) => {
    //   asn.location = stageCode;
    // });

    try {
      const userId = "6038";
      const distroId = "SDC";
      await stagePalletMutation.mutateAsync({
        palletId: currentPallet.id,
        locationName: stageCode,
        userId,
        distroId,
      });
      // setCurrentPallet(result);
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error";
      setMessage(`⚠️ ${errorMessage}`);
      return;
    }

    // TODO: API call
    // await fetch('/api/stage-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ palletId: currentPallet.id, stageLocation: stageCode })
    // });

    // setTimeout(() => {
    setMessage(
      `✓ ASN ${
        currentPallet.asns?.[0]?.asn || currentPallet.id
      } loaded at ${stageCode}. Scan next pallet.`
    );
    setCurrentPallet("");
    // }, 1000);
  };

  //--------------- HANDLE LOAD FUNCTION -----------------//

  const handleLoad = async (bayCode) => {
    console.log(`Loading pallet ${currentPallet.id} to ${bayCode}`);
    setMessage(`Loading to ${bayCode}...`);
    // setCurrentPalletLoc(bayCode);
    // let existingPallet = MOCK_DB.current[currentPallet.id];
    // existingPallet.asns.forEach((asn) => {
    //   asn.location = bayCode;
    // });

    try {
      const userId = "6038";
      const distroId = "SDC";
      await loadPalletToLocationMutation.mutateAsync({
        palletId: currentPallet.id,
        bayCode: bayCode,
        userId,
        distroId,
      });
      // setCurrentPallet(result);
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setMessage(`⚠️ ${errorMessage}`);
      return;
    }

    // TODO: API call
    // await fetch('/api/load-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ palletId: currentPallet.id, bayDoor: bayCode })
    // });

    setMessage(
      `✓ ASN ${
        currentPallet.asns?.[0]?.asn || currentPallet.id
      } loaded at ${bayCode}. Scan next pallet.`
    );
    setCurrentPallet("");
  };

  //--------------- PROCESS BARCODE FUNCTION -----------------//

  const processBarcode = (code) => {
    const trimmedCode = code.trim();

    // If no current pallet, treat as pallet ID
    if (!currentPallet) {
      processPallet(trimmedCode);
      return;
    }

    // If we have a pallet and it's status_id === 1, check for stage/bay codes
    if (currentPallet) {
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

  //--------------- HANDLE INPUT CHANGE -----------------//

  const handleInputChange = (event) => {
    const value = event.target.value;
    setScanInput(value);
  };

  //--------------- KEY DOWN FUNCTION -----------------//

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
    setCurrentPallet("");
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
        } else if (currentPallet) {
          if (document.activeElement === inputRef.current) {
            setMessage("Scan new location");
          } else {
            setMessage("Select Input to scan");
          }
        }
      }, 3000);

      return () => clearTimeout(timer);
    } else if (message.startsWith("⚠️")) {
      const timer = setTimeout(() => {
        if (currentPallet) {
          setMessage("Scan new location");
        } else {
          setMessage("Scan ASN ...");
        }
      }, 3000);

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
        overflowY: "hidden",
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
              pl: 3,
              backgroundColor: theme.palette.background.header,
              borderRadius: "10px 10px 0 0",
            }}
          >
            <img
              src="/palletIcon.png"
              alt="Pallet Icon"
              style={{ height: 30, marginRight: 10, paddingRight: 10 }}
            />
            <Typography
              variant="h6"
              component="h1"
              color={theme.palette.text.primary}
              gutterBottom
              paddingTop={1}
            >
              Process Pallets
            </Typography>
          </Box>
        )}

        {/* //-------------IF PALLET EXISTS, SHOW DETAILS-----------------// */}
        {currentPallet && (
          <Box
            sx={{
              px: 1,
              width: "98%",
              maxHeight: 350,
              mb: 1,
              mt: 0.5,
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
            {currentPallet.asns?.map((asn, index) => (
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    // alignContent: "center",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ width: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.text.message,
                    }}
                  >
                    ASN: {asn.asn}
                  </Typography>

                  {index === 0 ? (
                    <MoreVertIcon
                      onClick={() => {
                        setSelectedAsn(asn);
                        setDeleteAsnOpen(true);
                      }}
                      sx={{
                        color: theme.palette.text.message,
                        cursor: "pointer",
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 24 }} />
                  )}
                </Box>
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
              ASN's on pallet:{" "}
              <strong>{currentPallet.asns?.length || 0}</strong>
            </Typography>
            {currentPallet.current_location_id !== null && (
              <Typography
                sx={{ color: theme.palette.text.message }}
                variant="body1"
              >
                Pallet location: <strong>{currentPallet.location}</strong>
              </Typography>
            )}
          </Box>
        )}

        {!currentPallet?.location?.startsWith("BAY") && (
          <TextField
            size="small"
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
              borderRadius: 1.5,
              "& .MuiInputLabel-root": {
                color: theme.palette.text.lb,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.palette.text.lb,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
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
        )}
        {currentPallet?.location?.startsWith("BAY") && (
          <Button
            size="small"
            sx={{
              mt: 2,
              color: theme.palette.background.paper,
              bgcolor: theme.palette.button.cancelBackgroundColor,
              "&:focus": {
                outline: "none",
              },
            }}
            variant="contained"
            onClick={() => setUnloadPalletOpen(true)}
          >
            Unload Pallet
          </Button>
        )}

        {/* //-------------IF PALLET EXISTS - SHOW MESSAGES & ACTION BUTTONS-----------------// */}
        {currentPallet && !currentPallet?.location?.startsWith("BAY") && (
          <Button
            size="small"
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

        {!currentPallet?.location?.startsWith("BAY") && (
          <Typography
            // variant="h6"
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
        )}

        {currentPallet && (
          <Button
            size="small"
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
        existingAsns={currentPallet?.asns || []}
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
      <UnloadPallet
        isOpen={unloadPalletOpen}
        onClose={() => {
          setUnloadPalletOpen(false);
          setUnloadPalletError(""); // Clear error when modal closes
        }}
        onUnload={handleUnloadPallet}
        asnId={currentPallet?.asns?.[0]?.asn || currentPallet?.id || ""}
        setMessage={setUnloadPalletError}
        onExited={() => inputRef.current?.focus()}
        apiError={unloadPalletError}
      />
      <PalletEditButton
        isOpen={deleteAsnOpen}
        onClose={() => {
          setDeleteAsnOpen(false);
          setSelectedAsn(null);
        }}
        asn={selectedAsn}
        onDelete={handleDeleteAsn}
      />
    </Box>
  );
}
