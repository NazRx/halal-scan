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
import SeedData from "./pages/admin/SeedData";
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
          <Route path="/admin/seed-data" element={<SeedData />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
