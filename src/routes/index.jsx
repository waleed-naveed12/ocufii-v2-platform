import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminPortalApp from "../Layout/AdminPortal/AdminPortalApp";
import CustomerPortalApp from "../Layout/CustomerPortal/CustomerPortalApp";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin Portal Routes */}
      <Route path="/adminportal/*" element={<AdminPortalApp />} />

      {/* Customer Portal Routes */}
      <Route path="/customerportal/*" element={<CustomerPortalApp />} />

      {/* Default redirect to adminportal */}
      <Route path="/" element={<Navigate to="/adminportal" replace />} />
      <Route path="*" element={<Navigate to="/adminportal" replace />} />
    </Routes>
  );
};

export default AppRoutes;
