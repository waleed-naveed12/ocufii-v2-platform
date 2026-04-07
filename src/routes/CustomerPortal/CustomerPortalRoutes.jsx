import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../../pages/CustomerPortal/auth/Login";
import ForgotPassword from "../../pages/CustomerPortal/auth/ForgotPassword";
import ResetPassword from "../../pages/CustomerPortal/auth/ResetPassword";
import Dashboard from "../../pages/CustomerPortal/Dashboard";
import Alerts from "../../pages/CustomerPortal/Alerts";
import Devices from "../../pages/CustomerPortal/Devices";
import DeviceDetails from "../../pages/CustomerPortal/device/DeviceDetails";
import History from "../../pages/CustomerPortal/History";
import AddRecipient from "../../pages/CustomerPortal/recipients/AddRecipient";
import ProtectedRoute from "../../components/CustomerPortal/ProtectedRoute";
import { useUser } from "../../context/CustomerPortal/UserContext";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import AlertDetails from "../../pages/CustomerPortal/AlertDetails";
import SafetyNetwork from "../../pages/CustomerPortal/SafetyNetwork";
import Recipients from "../../pages/CustomerPortal/Recipients";
import ResendEmail from "../../pages/CustomerPortal/email/ResendEmail";
import EmailVerified from "../../pages/CustomerPortal/email/EmailVerified";
import SignUp from "../../pages/CustomerPortal/auth/SignUp";
import AccountSetup from "../../pages/CustomerPortal/auth/AccountSetup";
import TermsOfServiceSignUp from "../../pages/CustomerPortal/auth/TermsOfServiceSignUp";
import InviteContact from "../../pages/CustomerPortal/safetyNetwork/InviteContact";
import Account from "../../pages/CustomerPortal/Account";
import PersonalSafetyService from "../../pages/CustomerPortal/PersonalSafetyService";
import AcceptInvite from "../../pages/CustomerPortal/safetyNetwork/AcceptInvite";
import Shop from "../../pages/CustomerPortal/Shop";
import Help from "../../pages/CustomerPortal/Help";
import Settings from "../../pages/CustomerPortal/Settings";
import Map from "../../pages/CustomerPortal/Map";
import { LoadingContainer } from "../../styles/CustomerPortal/App.styled";

// Helper function to convert absolute paths to relative paths for nested routes
const toRelativePath = (path) => {
  if (!path) return path;
  // Skip external URLs and relative paths
  if (path.includes("://") || path.startsWith("#")) return path;
  // Remove leading slash and portal prefix
  return path.startsWith("/")
    ? path.substring(1).split("/").slice(1).join("/")
    : path;
};

const CustomerPortalRoutes = () => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return <LoadingContainer></LoadingContainer>;
  }

  return (
    <Routes>
      <Route path={toRelativePath(ROUTE.LOGIN)} element={<Login />} />
      <Route path={toRelativePath(ROUTE.SIGN_UP)} element={<SignUp />} />
      <Route path={toRelativePath(ROUTE.ACCOUNT_SETUP)} element={<AccountSetup />} />
      <Route path={toRelativePath(ROUTE.TERMS_OF_SERVICE_SIGNUP)} element={<TermsOfServiceSignUp />} />
      <Route
        path={toRelativePath(ROUTE.FORGOT_PASSWORD)}
        element={<ForgotPassword />}
      />
      <Route
        path={toRelativePath(ROUTE.RESET_PASSWORD)}
        element={<ResetPassword />}
      />
      <Route
        path={ROUTE.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.ALERT}
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.ALERT_DETAILS}
        element={
          <ProtectedRoute>
            <AlertDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.SAFETY_NETWORK}
        element={
          <ProtectedRoute>
            <SafetyNetwork />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.DEVICES}
        element={
          <ProtectedRoute>
            <Devices />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.HISTORY}
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.RECIPIENTS}
        element={
          <ProtectedRoute>
            <Recipients />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.ADD_RECIPIENT}
        element={
          <ProtectedRoute>
            <AddRecipient />
          </ProtectedRoute>
        }
      />
      <Route
        path={toRelativePath(ROUTE.RESEND_EMAIL)}
        element={<ResendEmail />}
      />
      <Route
        path={toRelativePath(ROUTE.EMAIL_VERIFIED)}
        element={<EmailVerified />}
      />
      <Route
        path={ROUTE.INVITE_CONTACT}
        element={
          <ProtectedRoute>
            <InviteContact />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.PERSONAL_SAFETY}
        element={
          <ProtectedRoute>
            <PersonalSafetyService />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.ACCEPT_INVITE}
        element={
          <ProtectedRoute>
            <AcceptInvite />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.SHOP}
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.HELP}
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.DEVICEDETAILS}
        element={
          <ProtectedRoute>
            <DeviceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.ACCOUNT}
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.SETTINGS}
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE.MAP}
        element={
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? ROUTE.DASHBOARD : ROUTE.LOGIN}
            replace
          />
        }
      />
    </Routes>
  );
};

export default CustomerPortalRoutes;
