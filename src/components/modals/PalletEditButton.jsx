import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PalletEditButton({
  isOpen,
  onClose,
  pallet,
  onDelete,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'pallet' | 'asn', data: ... }
  const theme = useTheme();

  const handleDeletePallet = () => {
    setDeleteTarget({ type: "pallet", data: pallet });
    onClose();
    setConfirmOpen(true);
  };

  const handleDeleteAsn = (asn) => {
    setDeleteTarget({ type: "asn", data: asn });
    onClose();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting:", deleteTarget);
    onDelete(deleteTarget);
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const hasMultipleAsns = pallet?.asns?.length > 1;

  return (
    <>
      <Dialog fullWidth open={isOpen} onClose={onClose}>
        <DialogTitle sx={{ color: theme.palette.text.message }}>
          Pallet Options
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              // minWidth: 250,
            }}
          >
            {/* Delete entire pallet */}
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
              onClick={handleDeletePallet}
            >
              Delete Pallet
            </Button>

            {/* Show individual ASN delete options only if multiple ASNs exist */}
            {hasMultipleAsns && (
              <>
                <Divider sx={{ my: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    or delete individual ASN
                  </Typography>
                </Divider>

                {pallet.asns.map((asn) => (
                  <Button
                    key={asn.asn}
                    variant="outlined"
                    sx={{
                      color: theme.palette.text.message,
                      borderColor: theme.palette.text.message,
                      "&:hover": {
                        borderColor: theme.palette.text.message,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                      },
                    }}
                    onClick={() => handleDeleteAsn(asn)}
                  >
                    Remove ASN: {asn.asn}
                  </Button>
                ))}
              </>
            )}
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
          {deleteTarget?.type === "pallet" ? "Delete Pallet" : "Remove ASN"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.message }}>
            {deleteTarget?.type === "pallet" ? (
              <>
                Are you sure you want to delete pallet{" "}
                <strong>{pallet?.id}</strong>?
                {hasMultipleAsns && (
                  <Box
                    component="span"
                    sx={{ display: "block", mt: 1, fontSize: "0.9em" }}
                  >
                    This will remove all {pallet?.asns?.length} ASNs on this
                    pallet.
                  </Box>
                )}
              </>
            ) : (
              <>
                Are you sure you want to remove ASN{" "}
                <strong>{deleteTarget?.data?.asn}</strong> from pallet{" "}
                <strong>{pallet?.id}</strong>?
              </>
            )}
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
            {deleteTarget?.type === "pallet" ? "Delete Pallet" : "Remove ASN"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
