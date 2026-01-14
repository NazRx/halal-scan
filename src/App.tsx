import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AppHome from "./pages/AppHome";
import OTCScan from "./pages/OTCScan";
import OTCProduct from "./pages/OTCProduct";
import RxSearch from "./pages/RxSearch";
import RxMedication from "./pages/RxMedication";
import Browse from "./pages/Browse";
import Report from "./pages/Report";
import SelectManufacturer from "./pages/SelectManufacturer";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import SavedManufacturers from "./pages/SavedManufacturers";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import VerdictManagement from "./pages/admin/VerdictManagement";
import UserManagement from "./pages/admin/UserManagement";
import Analytics from "./pages/admin/Analytics";
import SeedData from "./pages/admin/SeedData";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import Feedback from "./pages/Feedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app" element={<AppHome />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/otc/scan" element={<OTCScan />} />
          <Route path="/otc/product/:id" element={<OTCProduct />} />
          <Route path="/rx/search" element={<RxSearch />} />
          <Route path="/rx/med/:id" element={<RxMedication />} />
          <Route path="/rx/select-manufacturer/:id" element={<SelectManufacturer />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/account" element={<Account />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/history" element={<History />} />
          <Route path="/saved" element={<SavedManufacturers />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="verdicts" element={<VerdictManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="seed-data" element={<SeedData />} />
            <Route path="feedback" element={<FeedbackManagement />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
