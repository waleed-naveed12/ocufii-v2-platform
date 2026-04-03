// Menu items for the sidebar navigation
import dashboardLogo from "../../assets/CustomerPortal/images/dashboard.png";
import selectedDashboardLogo from "../../assets/CustomerPortal/images/bold-img/Dashboard.png";
import notificationLogo from "../../assets/CustomerPortal/images/notification.svg";
import selectedNotificationLogo from "../../assets/CustomerPortal/images/bold-img/Alarm-Bell-1--Streamline-Ultimate 1.png";
import devicesLogo from "../../assets/CustomerPortal/images/devices.svg";
import selectedDevicesLogo from "../../assets/CustomerPortal/images/bold-img/Devices.png";
import historyLogo from "../../assets/CustomerPortal/images/history.svg";
import selectedHistoryLogo from "../../assets/CustomerPortal/images/bold-img/History.png";
import recipientLogo from "../../assets/CustomerPortal/images/recipients.png";
import selectedRecipientLogo from "../../assets/CustomerPortal/images/bold-img/Recipients.png";
import personalLogo from "../../assets/CustomerPortal/images/person-shield2.svg";
import selectedPersonalLogo from "../../assets/CustomerPortal/images/bold-img/Personal Safety Service.png";
import safetyNetworkLogo from "../../assets/CustomerPortal/images/safetyNetwork.png";
import selectedNetworkLogo from "../../assets/CustomerPortal/images/bold-img/Business Network.png";
import shopLogo from "../../assets/CustomerPortal/images/shop.png";
import helpLogo from "../../assets/CustomerPortal/images/help.png";
import logoutLogo from "../../assets/CustomerPortal/images/logout2.png";
import { ROUTE } from "./Routes";
import moment from "moment";
export const MenuItems = [
  {
    id: "dashboard",
    label: "menu_dashboard",
    icon: dashboardLogo,
    selectedIcon: selectedDashboardLogo,
    path: ROUTE.DASHBOARD,
  },
  {
    id: "alerts",
    label: "menu_alerts",
    icon: notificationLogo,
    selectedIcon: selectedNotificationLogo,
    path: ROUTE.ALERT,
  },
  {
    id: "devices",
    label: "menu_devices",
    icon: devicesLogo,
    selectedIcon: selectedDevicesLogo,
    path: ROUTE.DEVICES,
  },
  {
    id: "history",
    label: "menu_history",
    icon: historyLogo,
    selectedIcon: selectedHistoryLogo,
    path: ROUTE.HISTORY,
  },
  {
    id: "safetyNetwork",
    label: "menu_mySafetyNetwork",
    icon: safetyNetworkLogo,
    selectedIcon: selectedNetworkLogo,
    path: ROUTE.SAFETY_NETWORK,
  },
  {
    id: "recipient",
    label: "menu_myRecipients",
    icon: recipientLogo,
    selectedIcon: selectedRecipientLogo,
    path: ROUTE.RECIPIENTS,
  },
  {
    id: "personalSafety",
    label: "menu_personalSafetyService",
    icon: personalLogo,
    selectedIcon: selectedPersonalLogo,
    path: ROUTE.PERSONAL_SAFETY,
  },
  {
    id: "separator-1",
    type: "separator",
  },
  {
    id: "shop",
    label: "menu_shop",
    icon: shopLogo,
    path: ROUTE.SHOP,
  },
  {
    id: "help",
    label: "menu_helpSupport",
    icon: helpLogo,
    path: ROUTE.HELP,
  },
  {
    id: "separator-2",
    type: "separator",
  },
  {
    id: "logout",
    label: "menu_logout",
    icon: logoutLogo,
  },
];

export const dateRangeMap = {
  all: "all",
  "24hours": "24hours",
  "7days": "7",
  "15days": "15",
  "30days": "30",
  lastMonth: "30",
  last3Months: "90",
  lastWeek: "7",
  thisMonth: (moment().diff(moment().startOf("month"), "days") + 1).toString(),
};
