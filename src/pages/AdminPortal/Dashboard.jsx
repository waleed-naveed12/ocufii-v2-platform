import React from "react";
import { useUser } from "../../context/AdminPortal/UserContext";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import UnderConstruction from "../../components/AdminPortal/UnderConstruction";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <DashboardContent>
      <UnderConstruction />
    </DashboardContent>
  );
};

export default Dashboard;
