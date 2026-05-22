/**
 * Main Route Configuration
 * Defines all application routes with lazy loading for code splitting
 */
import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Lazy load components for better performance
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Default = lazy(() => import("../pages/default/Default"));
const BotList = lazy(() =>
  import("../pages/default/components/BotList/BotList")
);
const FileUpload = lazy(() =>
  import("../pages/default/components/FileUpload/FileUpload")
);
const ChatPage = lazy(() =>
  import("../pages/default/components/ChatPage/ChatPage")
);

const MainRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - Default layout with nested routes */}
        <Route path="/default" element={<Default />}>
          <Route index element={<Navigate to="bot-list" />} />
          <Route path="bot-list" element={<BotList />} />
          <Route path="doc-upload" element={<FileUpload />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRoute;
