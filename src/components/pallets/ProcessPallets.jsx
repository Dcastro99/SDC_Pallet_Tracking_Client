import { useState, useEffect, useRef } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import PalletIcon from "../../assets/palletIcon.png";
import { useTheme } from "@mui/material/styles";

export default function ProcessPallets() {
  const theme = useTheme();
  const [scanInput, setScanInput] = useState("");
  const [currentPallet, setCurrentPallet] = useState(null);
  const [message, setMessage] = useState("Scan ASN ...");
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  console.log("color", theme.palette.text.label);
  // Define your barcode prefixes/patterns
  const BARCODE_PATTERNS = {
    STAGE: /^STAGE-/i, // e.g., "STAGE-A1", "STAGE-B2"
    BAY: /^BAY-/i, // e.g., "BAY-01", "BAY-12"
    // Or use specific barcode ranges if they're numeric
    // STAGE: (code) => code >= 5000 && code < 6000,
    // BAY: (code) => code >= 6000 && code < 7000,
  };

  const processPallet = async (id) => {
    console.log(`Fetching Pallet ID: ${id}`);
    setMessage("Loading pallet information...");

    // TODO: Replace with actual API call
    // const response = await fetch('/api/process-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ palletId: id })
    // });
    // const data = await response.json();

    // Simulate API response
    const data = {
      id: 1000017,
      asns: [
        {
          asn: "1105208",
          sequence_order: 1,
          item_id: "CBO P17 ATX 4 14 6",
          po_no: 803601,
          quantity: 192,
          company_no: "SLK1",
          destination: "Elk Grove",
        },
        // {
        //   asn: "1105290",
        //   sequence_order: 2,
        //   item_id: "GPF HP8 14 25 1",
        //   po_no: 803589,
        //   quantity: 360,
        //   company_no: "SLK1",
        //   destination: "Elk Grove",
        // },
        // {
        //   asn: "1105290",
        //   sequence_order: 2,
        //   item_id: "CEL 4 26 90",
        //   po_no: 803545,
        //   quantity: 120,
        //   company_no: "SLK1",
        //   destination: "Elk Grove",
        // },
      ],
      status_id: 1,
    };

    setCurrentPallet(data);

    if (data.status_id === 1) {
      setMessage("Pallet ready! Scan STAGE barcode or BAY DOOR barcode");
    } else {
      setMessage(`Pallet status: ${data.status_id}. Scan next pallet.`);
    }
  };

  const handleStage = async (stageCode) => {
    console.log(`Staging pallet ${currentPallet.id} to ${stageCode}`);
    setMessage(`Staging to ${stageCode}...`);

    // TODO: API call
    // await fetch('/api/stage-pallet', {
    //   method: 'POST',
    //   body: JSON.stringify({ palletId: currentPallet.id, stageLocation: stageCode })
    // });

    setMessage(
      `✓ Pallet ${currentPallet.id} staged at ${stageCode}. Scan next pallet.`
    );
    setCurrentPallet(null);
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
          "⚠️ Invalid barcode. Scan STAGE or BAY barcode, or press RESET."
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

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-submit after 150ms of no input (scan gun completes)
    if (value.trim()) {
      timeoutRef.current = setTimeout(() => {
        processBarcode(value);
        setScanInput(""); // Clear for next scan
        inputRef.current?.focus();
      }, 150);
    }
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      <Container
        sx={{
          height: "100%",
          width: "100%",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          border: 1,
          borderColor: theme.palette.background.header,
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
              src={PalletIcon}
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
              mb: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "#000000ff",
              p: 2,
              borderRadius: 2,
              border: "2px solid #8f8f8fff",
              maxWidth: "500px",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Pallet ID: {currentPallet.id}
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
                <Typography variant="body1">ASN: {asn.asn}</Typography>
                <Typography variant="body1">Item: {asn.item_id}</Typography>
                <Typography variant="body1">Qty: {asn.quantity}</Typography>
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
          sx={{
            mb: 2,
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

        <Typography
          variant="h6"
          sx={{
            mb: 2,
            textAlign: "center",
            color: message.startsWith("✓")
              ? "#4caf50"
              : message.startsWith("⚠️")
              ? "#ff9800"
              : theme.palette.text.message,
          }}
        >
          {message}
        </Typography>

        {currentPallet && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            sx={{ mt: 2 }}
          >
            Cancel
          </Button>
        )}
      </Container>
    </Box>
  );
}
