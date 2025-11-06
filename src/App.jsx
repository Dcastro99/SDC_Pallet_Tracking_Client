import Home from "./Home";
import { ThemeContextProvider } from "./theme/ThemeContext.jsx";

function App() {
  return (
    <ThemeContextProvider>
      <Home />
    </ThemeContextProvider>
  );
}

export default App;
