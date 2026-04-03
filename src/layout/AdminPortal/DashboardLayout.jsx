import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import { AiOutlineHome, AiOutlineUser } from "react-icons/ai";
import { MdOutlineGroupAdd, MdLogout, MdOutlineLock } from "react-icons/md";
import { useUser } from "../../context/AdminPortal/UserContext";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { MENU_PERMISSIONS, ROLES } from "../../common/AdminPortal/Roles";
import ocufiiLogo from "../../assets/AdminPortal/images/ocufii_logo_2.png";
import { ROUTE } from "../../common/AdminPortal/Routes";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineSettings } from "react-icons/md";
import { BsPeople } from "react-icons/bs";
import {
  DashboardContainer,
  DashboardHeader,
  HeaderLogo,
  MobileMenuToggle,
  HeaderUser,
  HeaderNavLinks,
  NavLink,
  UserInitials,
  VerticalSidebar,
  MenuItem,
  MobileOverlay,
  MainContent,
  DashboardFooter,
} from "../../styles/AdminPortal/Layout.styled";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { canViewMenuItem, hasPermission } = useAuth();
  const canShowPlatformAdminsMenu =
    hasPermission(ROLES.PLATFORM_USERS_VIEW) ||
    hasPermission(ROLES.PLATFORM_USERS_CREATE);
  const canShowResellerMenu =
    hasPermission(ROLES.RESELLERS_VIEW) ||
    hasPermission(ROLES.RESELLERS_CREATE);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTE.LOGIN);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Menu items configuration
  const menuItems = [
    {
      id: "home",
      label: "Home",
      path: ROUTE.DASHBOARD,
      icon: <AiOutlineHome />,
      permissions: MENU_PERMISSIONS.DASHBOARD,
    },
    {
      id: "platform_admin",
      label: "Platform Admins",
      path: ROUTE.USERS,
      icon: <FaRegUser />,
      permissions: MENU_PERMISSIONS.USERS,
    },
    {
      id: "reseller",
      label: "Reseller Admins",
      path: ROUTE.RESELLER,
      icon: <MdOutlineGroupAdd />,
      permissions: MENU_PERMISSIONS.RESELLER,
    },
    {
      id: "tenants",
      label: "Tenant ",
      path: ROUTE.TENANTS,
      icon: <BsPeople />,
      permissions: MENU_PERMISSIONS.TENANTS,
    },

    {
      id: "system",
      label: "System",
      path: ROUTE.SYSTEM,
      icon: <MdOutlineLock />,
      permissions: MENU_PERMISSIONS.SYSTEM,
    },

    {
      id: "settings",
      label: "Settings",
      path: ROUTE.SETTINGS,
      icon: <MdOutlineSettings />,
      permissions: MENU_PERMISSIONS.SETTINGS,
    },
    {
      id: "logout",
      label: "Logout",
      path: null,
      icon: <MdLogout />,
      permissions: [], // Logout should always be visible
    },
  ];

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.id === "platform_admin") {
      return canShowPlatformAdminsMenu;
    }

    if (item.id === "reseller") {
      return canShowResellerMenu;
    }

    return canViewMenuItem(item.permissions);
  });

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div className="header-content">
          <HeaderLogo>
            <MobileMenuToggle onClick={toggleSidebar}>
              {isSidebarOpen ? <RxCross2 /> : <RxHamburgerMenu />}
            </MobileMenuToggle>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img src={ocufiiLogo} alt="Ocufii" />
              <span
                style={{ color: "#000000", fontSize: "16px", fontWeight: 400 }}
              >
                BE IN THE KNOW
              </span>
            </div>
          </HeaderLogo>
          <HeaderUser>
            <HeaderNavLinks>
              {/* <NavLink onClick={() => navigate("/settings")}>Settings</NavLink> */}
              {/* <NavLink onClick={() => navigate("/account")}>Account</NavLink> */}
              <UserInitials title={user?.email || "User"}>
                {getUserInitials()}
              </UserInitials>
            </HeaderNavLinks>
          </HeaderUser>
        </div>
      </DashboardHeader>

      <div className="main-layout">
        <VerticalSidebar className={isSidebarOpen ? "open" : ""}>
          <div className="menu-items">
            {visibleMenuItems
              .filter((item) => item.id !== "logout")
              .map((item) => (
                <MenuItem
                  key={item.id}
                  className={location.pathname === item.path ? "active" : ""}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </MenuItem>
              ))}
          </div>
          <div className="logout-section">
            {visibleMenuItems
              .filter((item) => item.id === "logout")
              .map((item) => (
                <MenuItem key={item.id} onClick={handleLogout}>
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </MenuItem>
              ))}
          </div>
        </VerticalSidebar>

        <MobileOverlay
          className={isSidebarOpen ? "active" : ""}
          onClick={closeSidebar}
        />

        <div className="content-area">
          <MainContent>{children}</MainContent>

          {/* <DashboardFooter>
            <div>
              <p>Ocufii {RightsReserved}, All Rights Reserved</p>
              <div>
                <a
                  href="https://www.ocufii.com/terms-of-service/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Use
                </a>
                <a
                  href="https://www.ocufii.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </DashboardFooter> */}
        </div>
      </div>
    </DashboardContainer>
  );
};

export default DashboardLayout;
