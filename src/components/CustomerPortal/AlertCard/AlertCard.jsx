import React, { useState, useMemo } from "react";
import {
  AlertCardContainer,
  AlertCardHeader,
  AlertCount,
  AlertList,
  ViewAllButton,
  AlertFilterDropdown,
} from "../../../styles/CustomerPortal/Dashboard.styled";
import { useTranslation } from "react-i18next";

const AlertCard = ({
  category,
  color,
  count,
  alerts,
  onViewAll,
  children,
  onActiveClick = () => {},
}) => {
  const [selectedFilter, setSelectedFilter] = useState("All Alerts");
  const { t } = useTranslation();
  const showDropdown =
    category === "Safety" || category === "System" || category === "Security";

  // Get dropdown options based on category
  const getDropdownOptions = () => {
    switch (category) {
      case "Safety":
        return [
          { value: "All Alerts", label: "dashboard_All_Alerts" },
          { value: "Emergency", label: "dashboard_Emergency_Alert" },
          {
            value: "Feeling Unsafe",
            label: "dashboard_Feeling_Unsafe_Alert",
          },
          {
            value: "Active Shooter",
            label: "dashboard_Active_Shooter_Alert",
          },
          {
            value: "911 Auto-Dial",
            label: "dashboard_911_Auto_Dial_Alerts",
          },
          {
            value: "988 Auto-Dial",
            label: "dashboard_988_Auto_Dial_Alerts",
          },
        ];
      case "Security":
        return [
          { value: "All Alerts", label: "dashboard_All_Alerts" },
          { value: "Beacon Alert", label: "beacon_alert" },
          { value: "Connected Lock Alert", label: "connected_lock_alert" },
        ];
      case "System":
        return [
          { value: "All Alerts", label: "dashboard_All_Alerts" },
          { value: "Beacon Alert", label: "beacon_alert" },
          { value: "Connected Lock Alert", label: "connected_lock_alert" },
          { value: "Safety Card Alert", label: "safety_card_alert" },
          { value: "Wifi", label: "wifi_hub_alert" },
        ];
      default:
        return [{ value: "All Alerts", label: "dashboard_All_Alerts" }];
    }
  };

  // Filter alerts based on selected filter
  const filteredAlerts = useMemo(() => {
    // First filter out acknowledged alerts and resolved alerts
    const activeAlerts = alerts.filter((alert) => alert.acknowledge === "0");

    if (selectedFilter === "All Alerts") {
      return activeAlerts;
    }

    // Safety alerts - use includes for notificationReason
    if (category === "Safety") {
      console.log("Filtering Safety Alerts by:", selectedFilter, activeAlerts);
      return activeAlerts.filter((alert) =>
        alert.notificationReason?.includes(selectedFilter),
      );
    }

    // Security - use deviceType
    if (category === "Security") {
      if (selectedFilter === "Beacon Alert") {
        return activeAlerts.filter((alert) =>
          ["0", "2", "3", "03"].includes(alert.deviceType),
        );
      }
      if (selectedFilter === "Connected Lock Alert") {
        return activeAlerts.filter((alert) =>
          ["4", "5", "6"].includes(alert.deviceType),
        );
      }
    }

    //System alerts - use deviceType
    if (category === "System") {
      if (selectedFilter === "Beacon Alert") {
        console.log("Filtering System Alerts for beacon alert");
        return activeAlerts.filter((alert) =>
          ["0", "2", "3", "03"].includes(String(alert.deviceType)),
        );
      }
      if (selectedFilter === "Connected Lock Alert") {
        console.log("Filtering System Alerts for connected lock alert");
        return activeAlerts.filter((alert) =>
          ["4", "5", "6"].includes(String(alert.deviceType)),
        );
      }
      if (selectedFilter === "Safety Card Alert") {
        console.log("Filtering System Alerts for safety card alert");
        return activeAlerts.filter((alert) => String(alert.deviceType) === "7");
      }
      if (selectedFilter === "Wifi") {
        console.log("Filtering System Alerts for Wifi Hub");
        return activeAlerts.filter((alert) => String(alert.deviceType) === "1");
      }
    }

    return activeAlerts;
  }, [alerts, selectedFilter, category]);

  const dropdownOptions = getDropdownOptions();

  return (
    <AlertCardContainer>
      <AlertCardHeader>
        <h3>{t(`dashboard_${category}`)}</h3>
      </AlertCardHeader>

      <AlertCount
        color={color}
        onClick={() => {
          if (category === "Safety") {
            onActiveClick();
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="count-circle">
          <span className="count">{count}</span>
          <span className="label">{t("dashboard_Active")}</span>
        </div>
      </AlertCount>
      {/* Divider above the alerts list */}
      <div
        style={{
          height: "1px",
          background: "#888",
          width: "100%",
          margin: "12px 0",
        }}
      />

      {showDropdown && (
        <AlertFilterDropdown>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
        </AlertFilterDropdown>
      )}

      <AlertList>
        {filteredAlerts.slice(0, 3).map((alert) => {
          // Find the matching child for this specific alert
          const childrenArray = React.Children.toArray(children);
          const matchingChild = childrenArray.find(
            (child) => child.props.children?.props?.alert?.id === alert.id,
          );

          if (matchingChild) {
            // Return the matching child as-is (it already has the correct props)
            return matchingChild;
          }
          return null;
        })}
      </AlertList>

      <ViewAllButton color={color} onClick={onViewAll}>
        {t("view_all")}
      </ViewAllButton>
    </AlertCardContainer>
  );
};

export default AlertCard;
