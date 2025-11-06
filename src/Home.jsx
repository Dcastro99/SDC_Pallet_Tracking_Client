import { useState } from "react";
import { Button, Box, Grid, Typography } from "@mui/material";
import ProcessPallets from "./components/pallets/ProcessPallets";
import ProcessSpecialFab from "./components/specialFab/ProcessSpecialFab";
import Trucks from "./components/trucks/Index";
import Header from "./header/Header";
import { useTheme } from "@mui/material/styles";

export default function Home() {
  const [view, setView] = useState("home");
  const buttonSize = 140;
  const theme = useTheme();
  console.log("Current theme:", theme.palette.border.main);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default, // Uses your theme
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Header onNavigate={setView} currentView={view} />

      {/* Single content container */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pt: 4,
          pb: 2,
          overflow: "auto",
        }}
      >
        {view === "home" && (
          <Grid
            container
            rowSpacing={2}
            columnSpacing={{ xs: 2, sm: 2, md: 3 }}
            justifyContent="center"
          >
            <Button
              variant="contained"
              sx={{
                minHeight: buttonSize,
                width: buttonSize,
                backgroundColor: theme.palette.background.header, // #0f172a
                color: theme.palette.text.secondary, // #e2e2e2
                border: 1,
                borderColor: theme.palette.border.main, // #282e38
                borderRadius: 3,
                boxShadow: "none",
              }}
              onClick={() => setView("pallets")}
            >
              Process Pallets
            </Button>
            <Button
              variant="contained"
              sx={{
                minHeight: buttonSize,
                width: buttonSize,
                backgroundColor: theme.palette.background.header, // #0f172a
                color: theme.palette.text.secondary, // #e2e2e2
                border: 1,
                borderColor: theme.palette.border.main, // #282e38
                borderRadius: 3,
                boxShadow: "none",
                fontFamily: theme.typography.fontFamily,
              }}
              onClick={() => setView("specialFab")}
            >
              Process Special FAB
            </Button>
            <Button
              variant="contained"
              sx={{
                minHeight: buttonSize,
                width: buttonSize,
                backgroundColor: theme.palette.background.header, // #0f172a
                color: theme.palette.text.secondary, // #e2e2e2
                border: 1,
                borderColor: theme.palette.border.main, // #282e38
                borderRadius: 3,
                boxShadow: "none",
              }}
              onClick={() => setView("trucks")}
            >
              Trucks
            </Button>
          </Grid>
        )}

        {view === "pallets" && <ProcessPallets />}
        {view === "specialFab" && <ProcessSpecialFab />}
        {view === "trucks" && <Trucks />}
      </Box>
    </Box>
  );
}
