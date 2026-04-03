import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../../pages/AdminPortal/auth/Login";
import Dashboard from "../../pages/AdminPortal/Dashboard";
import Reseller from "../../pages/AdminPortal/Reseller";
import PasswordManagement from "../../pages/AdminPortal/PasswordManagement";
import ProtectedRoute from "../../components/AdminPortal/ProtectedRoute";
import DashboardLayout from "../../Layout/AdminPortal/DashboardLayout";
import { ROUTE } from "../../common/AdminPortal/Routes";
import { ROUTE_PERMISSIONS } from "../../common/AdminPortal/Roles";
import Users from "../../pages/AdminPortal/Users";
import Security from "../../pages/AdminPortal/Security";
import Settings from "../../pages/AdminPortal/Settings";
import DeactivateAccount from "../../pages/AdminPortal/DeactivateAccount";
import UserDetails from "../../pages/AdminPortal/UserDetails";
import ResellerDetailView from "../../pages/AdminPortal/ResellerDetailView";
import Tenants from "../../pages/AdminPortal/Tenants";
import TenantDetails from "../../pages/AdminPortal/TenantDetails";

const AdminPortalRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTE.LOGIN} element={<Login />} />
      <Route
        path={ROUTE.DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.DASHBOARD}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.USERS}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.USERS}>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.RESELLER}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.RESELLER}>
            <DashboardLayout>
              <Reseller />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.RESELLER_DETAIL}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.RESELLER_DETAIL}>
            <DashboardLayout>
              <ResellerDetailView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.TENANTS}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.TENANTS}>
            <DashboardLayout>
              <Tenants />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.TENANT_DETAILS}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.TENANT_DETAILS}>
            <DashboardLayout>
              <TenantDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE.DEACTIVATE_ACCOUNT}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.DEACTIVATE_ACCOUNT}>
            <DashboardLayout>
              <DeactivateAccount />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.USER_DETAIL}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.USER_DETAIL}>
            <DashboardLayout>
              <UserDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.SYSTEM}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.SYSTEM}>
            <DashboardLayout>
              <Security />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.SETTINGS}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.SETTINGS}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.PASSWORD}
        element={
          <ProtectedRoute allowedRoles={ROUTE_PERMISSIONS.PASSWORD}>
            <DashboardLayout>
              <PasswordManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={ROUTE.LOGIN} replace />}
      />
    </Routes>
  );
};

export default AdminPortalRoutes;
