import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PalletEditButton({ isOpen, onClose, asn, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [asnToDelete, setAsnToDelete] = useState(null);
  const theme = useTheme();

  const handleDeleteClick = () => {
    setAsnToDelete(asn); // Save ASN before closing
    onClose(); // Close the main dialog first
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(asnToDelete.asn);
    setConfirmOpen(false);
    setAsnToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setAsnToDelete(null);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle sx={{ color: theme.palette.text.message }}>
          Pallet Options
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: 200,
            }}
          >
            <Button
              variant="outlined"
              sx={{
                color: theme.palette.button.cancelBackgroundColor,
                borderColor: theme.palette.button.cancelBackgroundColor,
                "&:hover": {
                  borderColor: theme.palette.button.cancelBackgroundColor,
                  backgroundColor: "rgba(255, 0, 0, 0.04)",
                },
              }}
              onClick={handleDeleteClick}
            >
              Delete ASN
            </Button>
            {/* Add more buttons here in the future */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            sx={{ color: theme.palette.secondary.main }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle sx={{ color: theme.palette.text.message }}>
          Delete ASN
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.message }}>
            Are you sure you want to delete ASN:{" "}
            <strong>{asnToDelete?.asn}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            sx={{ color: theme.palette.secondary.main }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              color: theme.palette.background.paper,
              backgroundColor: theme.palette.button.cancelBackgroundColor,
            }}
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
