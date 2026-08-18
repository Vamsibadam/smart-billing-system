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
import Ingredients from "./pages/Ingredients";
import DashboardExpenses from "./pages/DashboardExpenses";
import Discounts from "./pages/Discounts";
import Engagement from "./pages/Engagement";
import WhatsApp from "./pages/WhatsApp";
import PublicInvoice from "./pages/PublicInvoice";
import { recoverPendingInventory } from "./utils/inventoryRecovery";
import { useState, useEffect, useRef } from "react";
function App() {
  useEffect(() => {

    recoverPendingInventory();

  }, []);
  
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
        <Route path="/ingredients" element={<ProtectedRoute><Ingredients /></ProtectedRoute>}/>
        <Route path="/dashboard/expenses" element={<ProtectedRoute><DashboardExpenses /></ProtectedRoute>}/>
        <Route path="/engagement" element={<ProtectedRoute><Engagement /></ProtectedRoute>}/>
        <Route path="/engagement/whatsapp" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>}/>
        <Route path="/engagement/discounts" element={<ProtectedRoute><Discounts  /></ProtectedRoute>}/>
        <Route path="/invoice/public/:token" element={<PublicInvoice />}/>


        </Routes>
    </BrowserRouter>
  );
}

export default App;