// theme.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    typography: {
      fontFamily: ["Montserrat", "Poppins"].join(","),
    },
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Light mode colors (you can customize these later)
            primary: {
              main: "#3d8ddd75",
            },
            selected: {
              main: "#6e49f5f1",
            },
            secondary: {
              main: "#dc004e",
            },
            input: {
              main: "#8f8d96ff",
            },
            text: {
              primary: "#dbdadaff",
              secondary: "#cacccfff",
              message: "#595c61ff",
              lb: "#0e0d0dff",
            },
            background: {
              // default: "#e0e0e0ff",
              default: "#eceaecff",
              paper: "#ffffff",
              header: "#545769ff",
            },
            border: {
              main: "#e0e0e0ff", // Borders
            },
          }
        : {
            // Dark mode colors - your custom scheme
            primary: {
              main: "#0f172a", // Button background
              contrastText: "#e2e2e2", // Button text
            },
            selected: {
              main: "#6e49f5f1",
            },
            background: {
              default: "#020617", // Main background
              paper: "#181f2b", // Subtitle/card background
              header: "#3f4856",
            },
            input: {
              main: "#53586dff",
            },
            //
            text: {
              primary: "#ffffff", // Main title text
              secondary: "#e2e2e2", // Secondary text
              message: "#ccced1ff",
              lb: "#e2e2e2",
            },
            border: {
              main: "#282e38", // Borders
            },
            divider: "#282e38", // Border color
          }),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderColor: "#282e38",
          },
          contained: {
            backgroundColor: "#0f172a",
            color: "#e2e2e2",
            "&:hover": {
              backgroundColor: "#1e293b", // Slightly lighter on hover
            },
          },
          outlined: {
            borderColor: "#282e38",
            color: "#e2e2e2",
            "&:hover": {
              borderColor: "#3f4856",
              backgroundColor: "rgba(15, 23, 42, 0.1)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // Remove MUI's default overlay
          },
        },
      },
    },
  });
