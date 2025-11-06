// ThemeToggle.js
import { useContext } from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "./ThemeContext";

export const ThemeToggle = () => {
  const { toggleColorMode, mode } = useContext(ColorModeContext);

  return (
    <IconButton
      sx={{
        "&:focus": {
          outline: "none",
          backgroundColor: "transparent",
        },
      }}
      onClick={toggleColorMode}
      color="inherit"
    >
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};
