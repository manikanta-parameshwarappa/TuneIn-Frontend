import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar/Navbar";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";
import { AdminRoute } from "./routes/AdminRoute";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import { Signup } from "./pages/Signup/Signup";
import { NotFound } from "./pages/NotFound/NotFound";
import { AdminDashboard } from "./pages/AdminDashboard/AdminDashboard";
import { Artists } from "./pages/Artists/Artists";
import { Albums } from "./pages/Albums/Albums";
import { Songs } from "./pages/Songs/Songs";
import { Profile } from "./pages/Profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <Routes>
            {/* Always-public route */}
            <Route path="/" element={<Home />} />

            {/* Guest-only routes — authenticated users are redirected to "/" */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin-only routes — requires authenticated user with role="admin" */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/artists" element={<Artists />} />
              <Route path="/admin/albums" element={<Albums />} />
              <Route path="/admin/songs" element={<Songs />} />
            </Route>

            {/* Catch-all */}
            <Route path="/403" element={<NotFound variant="forbidden" />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;