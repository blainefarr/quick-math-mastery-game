
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import GameLayout from "./layouts/GameLayout";
import AppLayout from "./layouts/AppLayout";
import FormLayout from "./layouts/FormLayout";
import Index from "./pages/Index";
import MyAccount from "./pages/MyAccount";
import NotFound from "./pages/NotFound";
import Leaderboard from "./pages/Leaderboard";
import Progress from "./pages/Progress";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Game routes with GameProvider */}
          <Route element={<GameLayout />}>
            <Route path="/" element={<Index />} />
          </Route>

          {/* Non-game routes with Header but no GameProvider */}
          <Route element={<AppLayout />}>
            <Route element={<FormLayout />}>
              <Route path="/account" element={<MyAccount />} />
            </Route>
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/progress" element={<Progress />} />
            {/* Add future non-game pages here */}
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
