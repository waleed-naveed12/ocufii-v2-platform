import React from "react";
import { UserProvider } from "../../context/AdminPortal/UserContext";
import { ThemeProvider, GlobalStyles } from "../../theme/AdminPortal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminPortalRoutes from "../../routes/AdminPortal/AdminPortalRoutes";

const queryClient = new QueryClient();

const AdminPortalApp = () => {
  return (
    <UserProvider>
      <ThemeProvider>
        <GlobalStyles />
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer autoClose={5000} />
          <AdminPortalRoutes />
        </QueryClientProvider>
      </ThemeProvider>
    </UserProvider>
  );
};

export default AdminPortalApp;
