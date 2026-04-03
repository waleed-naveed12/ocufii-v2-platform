import React, { useState } from "react";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import {
  TabsContainer,
  TabsList,
  TabButton,
  TabPanel,
} from "../../styles/AdminPortal/Security.styled";
import { TableHeader2 } from "../../styles/AdminPortal/Table.styled";
import PermissionManagement from "../../components/AdminPortal/PermissionManagement";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { ROLES } from "../../common/AdminPortal/Roles";

const Security = () => {
  const { hasPermission } = useAuth();
  const canEditPlatformConfigurations = hasPermission(ROLES.PLATFORM_CONFIG);
  const [activeTab, setActiveTab] = useState("permissions");

  return (
    <DashboardContent>
      <TableHeader2>
        <h1>Security Management</h1>
      </TableHeader2>

      <TabsContainer>
        {canEditPlatformConfigurations && (
          <>
            <TabsList>
              <TabButton
                active={activeTab === "permissions"}
                onClick={() => setActiveTab("permissions")}
              >
                Permission Management
              </TabButton>
            </TabsList>
            <TabPanel active={activeTab === "permissions"}>
              <PermissionManagement />
            </TabPanel>
          </>
        )}
      </TabsContainer>
    </DashboardContent>
  );
};

export default Security;
