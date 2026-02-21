import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WizardLayout from "@/components/WizardLayout";
import Index from "./pages/Index";
import InstallWizard from "./pages/InstallWizard";
import MemoryWizard from "./pages/MemoryWizard";
import JsonEditorPage from "./pages/JsonEditorPage";
import TroubleshootingPage from "./pages/TroubleshootingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WizardLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/install" element={<InstallWizard />} />
            <Route path="/memory" element={<MemoryWizard />} />
            <Route path="/json-editor" element={<JsonEditorPage />} />
            <Route path="/troubleshoot" element={<TroubleshootingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WizardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
