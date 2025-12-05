import { AppRoutes } from "./routes";
import { ThemeProvider } from "./context/theme";

function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
