import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import BillHistory from "./pages/BillHistory";
import StoreSettings from "./pages/StoreSettings";
import InvoicePreview from "./pages/InvoicePreview";


function App() {
  
  
  return (
    
    <BrowserRouter>
  
      <Routes>
        <Route path="/dashboard"element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<Login />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>}/>
        <Route path="/bill-history" element={<ProtectedRoute><BillHistory /></ProtectedRoute>}/>
        <Route path="/settings" element={<ProtectedRoute><StoreSettings /></ProtectedRoute>}/>
        <Route path="/invoice/:id" element={<ProtectedRoute><InvoicePreview /></ProtectedRoute>}/>
      </Routes>
   
    </BrowserRouter>
  );
}

export default App;