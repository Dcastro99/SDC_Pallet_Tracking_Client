import { useState, useEffect, useRef } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AdditionalASN from "../modals/AdditionalASN";

export default function ProcessPallets() {
  const theme = useTheme();
  const [scanInput, setScanInput] = useState("");
  const [currentPallet, setCurrentPallet] = useState(null);
  const [message, setMessage] = useState("Scan ASN ...");
  const [additionalASNOpen, setAdditionalASNOpen] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Mock database - simulates pallets stored in the backend
  const MOCK_DB = useRef({
    1000017: {
      id: 1000017,
      asns: [
        {
          asn: "ASN-001",
          sequence_order: 1,
          item_id: "CBO P17 ATX 4 14 6",
          po_no: 803601,
          quantity: 192,
          company_no: "SLK1",
          destination: "Elk Grove",
        },
      ],
      status_id: 1,
    },
    1000018: {
      id: 1000018,
      asns: [
        {
          asn: "ASN-100",
          sequence_order: 1,
          item_id: "XYZ P20 BTX 5 16 8",
          po_no: 803602,
          quantity: 144,
          company_no: "SLK1",
          destination: "Sacramento",
        },
        {
          asn: "ASN-101",
          sequence_order: 2,
          item_id: "ABC P15 CTX 3 12 4",
          po_no: 803603,
          quantity: 96,
          company_no: "SLK2",
          destination: "Elk Grove",
        },
      ],
      status_id: 1,
    },
  });

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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Replace with actual API call
    // const response = await fetch('/api/save-additional-asns', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     palletId: currentPallet.id,
    //     additionalAsns: data.additionalAsns
    //   })
    // });
    // const updatedPallet = await response.json();

    // Simulate updating the "database" with new ASNs
    const existingPallet = MOCK_DB.current[currentPallet.id];
    const newAsns = data.additionalAsns.map((asn, index) => ({
      ...asn,
      sequence_order: existingPallet.asns.length + index + 1,
    }));

    // Update mock database
    MOCK_DB.current[currentPallet.id] = {
      ...existingPallet,
      asns: [...existingPallet.asns, ...newAsns],
    };

    // Simulate API response returning the updated pallet
    const updatedPallet = MOCK_DB.current[currentPallet.id];

    console.log("Updated pallet from API:", updatedPallet);

    // Update state with data from "API"
    setCurrentPallet(updatedPallet);
    setMessage(`✓ ${newAsns.length} additional ASN(s) saved.`);
  };

  const processPallet = async (id) => {
    console.log(`Fetching Pallet ID: ${id}`);
    setMessage("Loading pallet information...");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // TODO: Replace with actual API call
    // const response = await fetch('/api/process-pallet', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ palletId: id })
    // });
    // const data = await response.json();

    // Simulate API response from mock database
    let data = MOCK_DB.current[id];

    // If pallet not found in database, create a new one
    if (!data) {
      data = {
        id: parseInt(id) || id,
        asns: [
          {
            asn: scanInput || `ASN-${id}`,
            sequence_order: 1,
            item_id: "CBO P17 ATX 4 14 6",
            po_no: 803601,
            quantity: 192,
            company_no: "SLK1",
            destination: "Elk Grove",
          },
        ],
        status_id: 1,
      };
      // Store in mock database
      MOCK_DB.current[id] = data;
    }

    console.log("Pallet data from API:", data);
    setCurrentPallet(data);

    if (data.status_id === 1) {
      setMessage("Scan new location");
    } else {
      setMessage(`Pallet status: ${data.status_id}. Scan next pallet.`);
    }
  };
  const handleFocus = () => {
    if (!currentPallet) {
      setMessage("Scan ASN...");
    }
    if (currentPallet && currentPallet.status_id === 1) {
      setMessage("Scan new location");
    }
  };

  const handleBlur = () => {
    setMessage("Select Input to scan");
  };

  const handleStage = async (stageCode) => {
    console.log(`Staging pallet ${currentPallet.id} to ${stageCode}`);
    setMessage(`Staging to ${stageCode}...`);

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

  const handleReset = () => {
    setCurrentPallet(null);
    setScanInput("");
    setMessage("Scan ASN...");
  };

  // Keep input focused for continuous scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, [scanInput]);

  useEffect(() => {
    if (message.startsWith("✓")) {
      const timer = setTimeout(() => {
        setMessage("Scan ASN...");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Cleanup timeout on unmount
  //   useEffect(() => {
  //     return () => {
  //       if (timeoutRef.current) {
  //         clearTimeout(timeoutRef.current);
  //       }
  //     };
  //   }, []);

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

        {currentPallet && (
          <Box
            sx={{
              p: 2,
              width: "98%",
              mb: 2,
              mt: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: theme.palette.background.default,

              borderRadius: 2,
              border: "2px solid #3dcf44ff",
              //   maxWidth: "500px",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.text.message }}
            >
              ASN: {currentPallet.asns[0].asn}
            </Typography>
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
                <Typography
                  sx={{ color: theme.palette.text.message }}
                  variant="body1"
                >
                  ASN's on pallet: {currentPallet.asns.length}
                </Typography>
              </Box>
            ))}
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
            mt: 2,
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
        {currentPallet && (
          <Box>
            <Button
              sx={{
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
          </Box>
        )}

        <Typography
          variant="h6"
          sx={{
            mb: 2,
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
            variant="outlined"
            // color={theme.palette.secondary.main}
            onClick={handleReset}
            sx={{
              my: 1,
              color: theme.palette.secondary.main,
              "&:focus": {
                outline: "none",
                backgroundColor: "transparent",
              },
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
      />
    </Box>
  );
}
