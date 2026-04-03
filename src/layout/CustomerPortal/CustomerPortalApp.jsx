import React from "react";
import { UserProvider } from "../../context/CustomerPortal/UserContext";
import { ThemeProvider } from "../../theme/CustomerPortal/ThemeContext";
import { GlobalStyles } from "../../theme/CustomerPortal/GlobalStyles";
import { AppContainer } from "../../styles/CustomerPortal/App.styled";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerPortalRoutes from "../../routes/CustomerPortal/CustomerPortalRoutes";

const queryClient = new QueryClient();

const CustomerPortalApp = () => {
  return (
    <UserProvider>
      <ThemeProvider>
        <GlobalStyles />
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer autoClose={4000} />
          <AppContainer>
            <CustomerPortalRoutes />
          </AppContainer>
        </QueryClientProvider>
      </ThemeProvider>
    </UserProvider>
  );
};

export default CustomerPortalApp;
