import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../page/Dashboard";
import Users from "../page/Users";
import Explore from "../page/Explore";
import Login from "../page/Login";
import NotFound from "../page/NotFound";


import { ProtectedRoute } from "../components/layout/ProtectedRoute";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
