import Home from "./Home";
import { ThemeContextProvider } from "./theme/ThemeContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <Home />
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}

export default App;
