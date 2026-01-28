import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthorDashboard, UploadPage, AnalysisPage, ChatbotPage } from "./pages/author";
import StaffReviewPage from "./pages/staff/Review";
import { AdminDashboard, AdminConfig, AdminUsers } from "./pages/admin";
import SupportPage from "./pages/Support";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Author routes */}
          <Route path="/author/dashboard" element={<AuthorDashboard />} />
          <Route path="/author/upload" element={<UploadPage />} />
          <Route path="/author/analysis" element={<AnalysisPage />} />
          <Route path="/author/chatbot" element={<ChatbotPage />} />

          {/* Staff routes */}
          <Route path="/staff/review" element={<StaffReviewPage />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/config" element={<AdminConfig />} />
          <Route path="/admin/users" element={<AdminUsers />} />

          {/* Support route */}
          <Route path="/support" element={<SupportPage />} />

          {/* Account routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
