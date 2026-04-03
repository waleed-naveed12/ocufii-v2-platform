import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardContent } from "../../styles/CustomerPortal/Dashboard.styled";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import { useUser } from "../../context/CustomerPortal/UserContext";
import { getDashboard } from "../../api/CustomerPortal/DashboardApi";
import SafetyImage from "../../assets/CustomerPortal/images/person-shield.png";
import SecurityImage from "../../assets/CustomerPortal/images/warningShield2.png";
import OpenImage from "../../assets/CustomerPortal/images/openFolder2.png";
import GeneralImage from "../../assets/CustomerPortal/images/warning2.svg";
import DoneImage from "../../assets/CustomerPortal/images/done2.png";
import AcknowledgeImage from "../../assets/CustomerPortal/images/Like.png";
import {
  AlertsContainer,
  AlertsContent,
  AlertsMainContent,
} from "../../styles/CustomerPortal/Alert.styled";
import AlertStats from "../../components/CustomerPortal/AlertStats/AlertStats";
import AlertTable from "../../components/CustomerPortal/AlertTable/AlertTable";
import AlertsChart from "../../components/CustomerPortal/AlertsChart";
import AlertActionModal from "../../components/CustomerPortal/AlertActionModal/AlertActionModal";
import {
  formatDate,
  formatTime,
} from "../../utility/CustomerPortal/TimeFormat";
import {
  getDeviceIcon,
  getSafetyAlertIcon,
} from "../../utility/CustomerPortal/DeviceMapping";
import { PageTitle } from "../../styles/CustomerPortal/SafetyNetwork.styled";
import { useTranslation } from "react-i18next";

const Alerts = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("24hours");
  const [selectedAlertType, setSelectedAlertType] = useState("all");
  const [alertActionAlert, setAlertActionAlert] = useState(null);
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", user?.email, selectedFilter],
    queryFn: () => getDashboard(user?.email || "", 1000, selectedFilter),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Transform API data to table format (with acknowledge filter)
  const transformAlertData = (alerts, filterUnacknowledged = false) => {
    const filteredAlerts = filterUnacknowledged
      ? alerts.filter((alert) => alert.acknowledge === "0")
      : alerts;

    return filteredAlerts.map((alert) => ({
      sender: alert.title || "N/A",
      alert: alert.notificationReason || "No reason provided",
      alertIcon:
        alert.type === "safety"
          ? getSafetyAlertIcon(alert.notificationReason)
          : alert.type === "security"
            ? getDeviceIcon(alert.deviceType)
            : getDeviceIcon(alert.deviceType),
      time: formatTime(alert.duration),
      date: formatDate(alert.duration),
      ...alert, // Keep original data for actions
    }));
  };

  // Transform acknowledge alerts (where acknowledge is 1 or 2)
  const transformAcknowledgeAlerts = (alerts) => {
    return alerts
      .filter((alert) => alert.acknowledge === "1" || alert.acknowledge === "2")
      .map((alert) => ({
        sender: alert.title || "N/A",
        alert: alert.notificationReason || "No reason provided",
        alertIcon:
          alert.type === "safety"
            ? getSafetyAlertIcon(alert.notificationReason)
            : alert.type === "security"
              ? getDeviceIcon(alert.deviceType)
              : getDeviceIcon(alert.deviceType),
        time: formatTime(alert.duration),
        date: formatDate(alert.duration),
        ...alert, // Keep original data for actions
      }));
  };

  // Transform resolved alerts (where acknowledge is 3)
  const transformResolvedAlerts = (alerts) => {
    return alerts
      .filter((alert) => alert.acknowledge === "3")
      .map((alert) => ({
        sender: alert.title || "N/A",
        alert: alert.notificationReason || "No reason provided",
        alertIcon:
          alert.type === "safety"
            ? getSafetyAlertIcon(alert.notificationReason)
            : alert.type === "security"
              ? getDeviceIcon(alert.deviceType)
              : getDeviceIcon(alert.deviceType),
        time: formatTime(alert.duration),
        date: formatDate(alert.duration),
        ...alert, // Keep original data for actions
      }));
  };

  // Extract alert data from API response
  const safetyAlerts = transformAlertData(data?.data?.safety?.alerts || []);
  const securityAlerts = transformAlertData(data?.data?.security?.alerts || []);
  const systemAlerts = transformAlertData(data?.data?.system?.alerts || []);

  // Combine all alerts for Open Alerts (only unacknowledged)
  const allAlertsRaw = [
    ...(data?.data?.safety?.alerts || []),
    ...(data?.data?.security?.alerts || []),
    ...(data?.data?.system?.alerts || []),
  ];
  const openAlerts = transformAlertData(allAlertsRaw, true);

  // Acknowledge Alerts (where acknowledge is 1 or 2)
  const acknowledgeAlerts = transformAcknowledgeAlerts(allAlertsRaw);

  // Resolved Alerts (where acknowledge is 3)
  const resolvedAlerts = transformResolvedAlerts(allAlertsRaw);

  // Handler for action button clicks
  const handleAlertAction = (row, index) => {
    console.log("Action clicked for:", row);
    setAlertActionAlert(row);
  };

  // Handler for view button clicks
  const handleViewAlert = (row, index) => {
    console.log("View clicked for:", row);
    // Remove non-serializable properties (like React components) before navigating
    const { alertIcon, ...serializableAlert } = row;
    navigate(ROUTE.ALERT_DETAILS, { state: { alert: serializableAlert } });
  };

  // Handler for removing alert after resolution
  const handleRemoveAlert = () => {
    // Invalidate dashboard query to refresh data
    queryClient.invalidateQueries(["dashboard", user?.email, selectedFilter]);
    setAlertActionAlert(null);
  };

  return (
    <>
      <DashboardLayout>
        <DashboardContent>
          <AlertsContainer>
            <div className="alerts-header">
              <PageTitle>{t("menu_alerts")}</PageTitle>
              <div className="filters-section">
                <label htmlFor="alert-filter">{t("devices_Filter")}:</label>
                <select
                  id="alert-filter"
                  className="filter-dropdown"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="24hours">{t("text_24")}</option>
                  <option value="7days">{t("text_7")}</option>
                  <option value="15days">{t("txt_15")}</option>
                  <option value="30days">{t("text_30")}</option>
                  <option value="thisMonth">{t("txt_thisMonth")}</option>
                </select>
              </div>
            </div>

            <AlertStats timeRange={selectedFilter} />
            <AlertsChart />
            <AlertsContent>
              <AlertsMainContent>
                <div
                  className="filters-section"
                  style={{ marginBottom: "24px" }}
                >
                  <label htmlFor="alert-type-filter">
                    {t("devices_Filter")}:
                  </label>
                  <select
                    id="alert-type-filter"
                    className="filter-dropdown"
                    value={selectedAlertType}
                    onChange={(e) => setSelectedAlertType(e.target.value)}
                  >
                    <option value="all">{t("dashboard_All_Alerts")}</option>
                    <option value="safety">
                      {t("dashboard_Safety_Alerts")}
                    </option>
                    <option value="security">
                      {t("dashboard_Security_Alerts")}
                    </option>
                    <option value="system">
                      {t("dashboard_System_Alerts")}
                    </option>
                    <option value="open">{t("dashboard_Open_Alerts")}</option>
                    <option value="acknowledge">
                      {t("dashboard_Acknowledge_Alerts")}
                    </option>
                    <option value="resolved">
                      {t("dashboard_Resolved_Alerts")}
                    </option>
                  </select>
                </div>

                {(selectedAlertType === "all" ||
                  selectedAlertType === "safety") && (
                  <AlertTable
                    icon={SafetyImage}
                    title="txt_safety_alerts"
                    count={safetyAlerts.length}
                    headerColor="rgba(0, 181, 226, 1)"
                    data={safetyAlerts}
                    onView={handleViewAlert}
                    onAction={handleAlertAction}
                    actionButtonText="dashboard_Alert_Action"
                    actionButtonColor="#007bff"
                  />
                )}

                {(selectedAlertType === "all" ||
                  selectedAlertType === "security") && (
                  <AlertTable
                    icon={SecurityImage}
                    title="dashboard_Security_Alerts"
                    count={securityAlerts.length}
                    headerColor="rgba(255, 0, 0, 1)"
                    data={securityAlerts}
                    onAction={handleAlertAction}
                    actionButtonText="dashboard_Alert_Action"
                    actionButtonColor="#007bff"
                  />
                )}

                {(selectedAlertType === "all" ||
                  selectedAlertType === "system") && (
                  <AlertTable
                    icon={GeneralImage}
                    title="dashboard_System_Alerts"
                    count={systemAlerts.length}
                    headerColor="rgba(252, 196, 0, 1)"
                    data={systemAlerts}
                    onAction={handleAlertAction}
                    actionButtonText="dashboard_Alert_Action"
                    actionButtonColor="#007bff"
                  />
                )}

                {(selectedAlertType === "all" ||
                  selectedAlertType === "open") && (
                  <AlertTable
                    icon={OpenImage}
                    title="dashboard_Open_Alerts"
                    count={openAlerts.length}
                    headerColor="rgba(237, 139, 0, 1)"
                    data={openAlerts}
                    onAction={handleAlertAction}
                    actionButtonText="dashboard_Alert_Action"
                    actionButtonColor="#007bff"
                  />
                )}

                {(selectedAlertType === "all" ||
                  selectedAlertType === "acknowledge") && (
                  <AlertTable
                    icon={AcknowledgeImage}
                    title="dashboard_Acknowledge_Alerts"
                    count={acknowledgeAlerts.length}
                    headerColor="rgba(0, 181, 226, 1)"
                    data={acknowledgeAlerts}
                    onAction={handleAlertAction}
                    actionButtonText="dashboard_Alert_Action"
                    actionButtonColor="#007bff"
                  />
                )}

                {(selectedAlertType === "all" ||
                  selectedAlertType === "resolved") && (
                  <AlertTable
                    icon={DoneImage}
                    title="dashboard_Resolved_Alerts"
                    count={resolvedAlerts.length}
                    headerColor="rgba(54, 190, 167, 1)"
                    data={resolvedAlerts}
                    actionButtonColor="#007bff"
                    showActionButton={false}
                  />
                )}
              </AlertsMainContent>
            </AlertsContent>
          </AlertsContainer>
        </DashboardContent>
      </DashboardLayout>
      {alertActionAlert && (
        <AlertActionModal
          alert={alertActionAlert}
          onClose={() => setAlertActionAlert(null)}
          onRemoveAlert={handleRemoveAlert}
        />
      )}
    </>
  );
};

export default Alerts;
