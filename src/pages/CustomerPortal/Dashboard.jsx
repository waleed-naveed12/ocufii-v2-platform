import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../context/CustomerPortal/UserContext";
import {
  getDashboard,
  pingRecipients,
  getSafetyNetworkLocations,
  getAssistRequestStatus,
  getAlertSummary,
  getDeviceHealth,
  getAlertNotes,
  addAlertNote,
} from "../../api/CustomerPortal/DashboardApi";
import moment from "moment";
import Toast from "../../utility/CustomerPortal/Toast";
import {
  DashboardContent,
  ActiveAlertsSection,
  AlertCardsGrid,
} from "../../styles/CustomerPortal/Dashboard.styled";
import {
  SystemOverviewSection,
  SystemOverviewHeader,
  SystemOverviewGrid,
} from "../../styles/CustomerPortal/SystemOverview.styled";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import AlertCard from "../../components/CustomerPortal/AlertCard";
import SafetyAlertItem from "../../components/CustomerPortal/AlertCard/SafetyAlertItem";
import SecurityAlertItem from "../../components/CustomerPortal/AlertCard/SecurityAlertItem";
import SystemAlertItem from "../../components/CustomerPortal/AlertCard/SystemAlertItem";
import AlertsChart from "../../components/CustomerPortal/AlertsChart";
import AlertDetailMap from "../../components/CustomerPortal/AlertDetailMap";
import AlertActionModal from "../../components/CustomerPortal/AlertActionModal";
import {
  DeviceHealthCard,
  AlertSummaryCard,
} from "../../components/CustomerPortal/SystemOverview";
import {
  alertsChartData,
  deviceHealthData,
  alertSummaryData,
} from "../../common/CustomerPortal/ExampleData";
import { Loader } from "../../styles/CustomerPortal/Loader";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import { useTranslation } from "react-i18next";
import { PageTitle } from "../../styles/CustomerPortal/SafetyNetwork.styled";

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showRecipients, setShowRecipients] = useState(false);
  const [showEmergencyServices, setShowEmergencyServices] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [shouldFetchLocations, setShouldFetchLocations] = useState(false);
  const [currentNotificationId, setCurrentNotificationId] = useState(null);
  const [currentSenderEmail, setCurrentSenderEmail] = useState(null);
  const [timeRange, setTimeRange] = useState("24 Hours");
  const [alertActionAlert, setAlertActionAlert] = useState(null);
  const timerRef = useRef(null);
  const fetchIntervalRef = useRef(null);
  const { t } = useTranslation();

  // TanStack Query for fetching safety network locations
  const {
    data: safetyNetworkData,
    refetch: refetchSafetyNetwork,
    isRefetching,
  } = useQuery({
    queryKey: ["safetyNetwork", user?.email, currentNotificationId, currentSenderEmail],
    queryFn: () =>
      getSafetyNetworkLocations(user?.email, currentNotificationId, currentSenderEmail),
    enabled: false, // Don't fetch automatically
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    retry: 2, // Retry up to 2 times on failure
  });

  // TanStack Query for alert summary with dynamic time range
  const { data: alertSummaryApiData } = useQuery({
    queryKey: ["alertSummary", user?.email, timeRange],
    queryFn: () => {
      const endDateTime = moment().toISOString();
      let startDateTime;

      if (timeRange === "7 Days") {
        startDateTime = moment().subtract(7, "days").toISOString();
      } else if (timeRange === "30 Days") {
        startDateTime = moment().subtract(30, "days").toISOString();
      } else {
        // Default to 24 Hours
        startDateTime = moment().subtract(24, "hours").toISOString();
      }

      return getAlertSummary(user?.email, startDateTime, endDateTime);
    },
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 2, // Retry up to 2 times on failure
  });

  // TanStack Query for device health
  const { data: deviceHealthApiData } = useQuery({
    queryKey: ["deviceHealth", user?.email],
    queryFn: () => getDeviceHealth(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 2, // Retry up to 2 times on failure
  });

  // Fetch dashboard data using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", user?.email],
    queryFn: () => getDashboard(user?.email || ""),
    enabled: !!user?.email && !alertActionAlert, // Only run query if user email exists and modal is not open
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 2, // Retry up to 2 times on failure
  });

  // Use API data if available, otherwise fall back to example data
  const activeAlerts = data?.data || {
    safety: {
      category: "Safety",
      color: "rgba(0, 181, 226, 1)",
      count: 0,
      alerts: [],
    },
    security: { category: "Security", color: "#E91E63", count: 0, alerts: [] },
    system: { category: "System", color: "#FFC107", count: 0, alerts: [] },
  };

  const handleViewAlert = (alert) => {
    console.log("View Emergency Services for alert:", alert);
    setSelectedAlert(alert);
    setShowRecipients(false);
    setShowEmergencyServices(true);
    setSelectedCategory("safety"); // Open the map for this specific alert
  };

  const handleSeeRecipients = async (alert) => {
    console.log("Show recipients for alert:", alert);
    setSelectedAlert(alert);
    setShowRecipients(true);
    setShowEmergencyServices(false);
    setSelectedCategory("safety");
    setRecipients([]);
    setIsLoadingRecipients(true);
    setCurrentNotificationId(alert.id);
    setCurrentSenderEmail(alert.senderEmail);

    try {
      // Call ping recipients API
      await pingRecipients(user?.email, alert.id, alert.senderEmail);
      // Toast.success("Safety network pinged successfully");

      // Start 20 second timer
      setTimer(20);

      // Clear any existing timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (fetchIntervalRef.current) clearTimeout(fetchIntervalRef.current);

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Single call after 20 seconds delay
      fetchIntervalRef.current = setTimeout(async () => {
        const result = await refetchSafetyNetwork();
        if (result.data && result.data.members) {
          console.log("Recipients fetched at 20s:", result.data.members);
          setRecipients(result.data.members);
          if (result.data.members.length > 0) {
            Toast.success(t("toast_safety_network_retrieved"));
          } else {
            Toast.info(t("toast_no_safety_network_members"));
          }
        } else {
          Toast.info(t("toast_no_safety_network_members"));
          setRecipients([]);
        }
        setIsLoadingRecipients(false);
      }, 20000);
    } catch (error) {
      console.error("Error in handleSeeRecipients:", error);
      setIsLoadingRecipients(false);
      Toast.error(t("toast_safety_network_fetch_failed"));
    }
  };

  const handleAlertClick = (alert, alertType) => {
    console.log("Alert clicked:", alert);
    setSelectedAlert(alert);
    setShowRecipients(false);
    setShowEmergencyServices(false);
    // Only open the map for safety alerts
    if (alertType === "safety") {
      setSelectedCategory("safety");
    } else {
      setSelectedCategory(null);
    }
  };

  const handleViewAll = (category) => {
    console.log("View all alerts for:", category);
    // Add your navigation logic here
    navigate(ROUTE.ALERT);
  };

  const handleActiveAlertsClick = () => {
    console.log("Show all active Safety alerts on map");
    setSelectedCategory("safety");
    setSelectedAlert(null); // null indicates showing all alerts
    setShowRecipients(false);
    setShowEmergencyServices(false);
  };

  const handleUpdateRecipientStatus = useCallback((email, status) => {
    setRecipients((prevRecipients) => {
      // Check if status actually changed to prevent unnecessary re-renders
      const recipient = prevRecipients.find((r) => r.email === email);
      if (recipient && recipient.assistStatus === status) {
        return prevRecipients; // No change, return same reference
      }

      return prevRecipients.map((recipient) =>
        recipient.email === email
          ? { ...recipient, assistStatus: status }
          : recipient,
      );
    });
  }, []);

  const handleCloseMap = () => {
    setSelectedCategory(null);
    setSelectedAlert(null);
    setShowRecipients(false);
    setShowEmergencyServices(false);
    setRecipients([]);
    setTimer(0);
    setIsLoadingRecipients(false);
    setCurrentNotificationId(null);
    setCurrentSenderEmail(null);

    // Clear timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
  };

  const handleAlertAction = (alert) => {
    setAlertActionAlert(alert);
  };

  const handleRemoveAlert = () => {
    // Close the modal and the data will refresh on next interval
    setAlertActionAlert(null);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
  }, []);

  // Show toast on error
  useEffect(() => {
    if (isError) {
      Toast.error(
        `Error loading dashboard: ${error?.message || "Unknown error"}`,
      );
    }
  }, [isError, error]);

  return (
    <DashboardLayout>
      <DashboardContent>
        {/* Loading overlay for recipients fetch */}
        {isLoadingRecipients && timer > 0 && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "40px 60px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                }}
              >
                <Loader size="24px" />
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {t("loading_location")}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Loader />
          </div>
        ) : (
          <>
            <ActiveAlertsSection>
              <PageTitle>{t("active_alerts")}</PageTitle>

              <AlertCardsGrid $hasSelectedCard={selectedCategory !== null}>
                {/* Safety Card */}
                <div
                  className={`alert-card-wrapper ${
                    selectedCategory === "safety" ? "selected" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <AlertCard
                    category={activeAlerts.safety.category}
                    color={"rgba(0, 181, 226, 1)"}
                    count={activeAlerts.safety.count}
                    alerts={activeAlerts.safety.alerts}
                    onViewAll={() => handleViewAll("safety")}
                    onActiveClick={handleActiveAlertsClick}
                  >
                    {activeAlerts.safety.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert, "safety")}
                      >
                        <SafetyAlertItem
                          alert={alert}
                          onView={handleViewAlert}
                          onSeeRecipients={handleSeeRecipients}
                          onAlertAction={handleAlertAction}
                          isSelected={selectedAlert?.id === alert.id}
                          showRecipients={
                            showRecipients && selectedAlert?.id === alert.id
                          }
                          showEmergencyServices={
                            showEmergencyServices &&
                            selectedAlert?.id === alert.id
                          }
                        />
                      </div>
                    ))}
                  </AlertCard>
                </div>

                {/* Map for selected card - Pass only the selected alert or all alerts */}
                {selectedCategory === "safety" && (
                  <div className="map-wrapper">
                    <AlertDetailMap
                      alerts={
                        selectedAlert
                          ? [{ ...selectedAlert, recipients }]
                          : activeAlerts.safety.alerts.filter(
                              (alert) => alert.acknowledge === "0",
                            )
                      }
                      onClose={handleCloseMap}
                      category={activeAlerts.safety.category}
                      selectedAlert={
                        selectedAlert ? { ...selectedAlert, recipients } : null
                      }
                      showRecipients={showRecipients}
                      showEmergencyServices={showEmergencyServices}
                      isLoadingRecipients={isLoadingRecipients}
                      onUpdateRecipientStatus={handleUpdateRecipientStatus}
                    />
                  </div>
                )}

                {/* Security Card */}
                <div
                  className={`alert-card-wrapper ${
                    selectedCategory === "security" ? "selected" : ""
                  }`}
                  // onClick={() => handleCardClick("security")}
                  style={{
                    cursor: "default",
                  }}
                >
                  <AlertCard
                    category={activeAlerts.security.category}
                    color={"#E10600"}
                    count={activeAlerts.security.count}
                    alerts={activeAlerts.security.alerts}
                    onViewAll={() => handleViewAll("security")}
                  >
                    {activeAlerts.security.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert, "security")}
                      >
                        <SecurityAlertItem
                          alert={alert}
                          onView={handleViewAlert}
                          onAlertAction={handleAlertAction}
                          isSelected={selectedAlert?.id === alert.id}
                        />
                      </div>
                    ))}
                  </AlertCard>
                </div>

                {/* System Card */}
                <div
                  className={`alert-card-wrapper ${
                    selectedCategory === "system" ? "selected" : ""
                  }`}
                  // onClick={() => handleCardClick("system")}
                  style={{
                    cursor: "default",
                  }}
                >
                  <AlertCard
                    category={activeAlerts.system.category}
                    color={"rgba(252, 196, 0, 1)"}
                    count={activeAlerts.system.count}
                    alerts={activeAlerts.system.alerts}
                    onViewAll={() => handleViewAll("system")}
                  >
                    {activeAlerts.system.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert, "system")}
                      >
                        <SystemAlertItem
                          alert={alert}
                          onView={handleViewAlert}
                          onAlertAction={handleAlertAction}
                          isSelected={selectedAlert?.id === alert.id}
                        />
                      </div>
                    ))}
                  </AlertCard>
                </div>
              </AlertCardsGrid>
            </ActiveAlertsSection>

            {/* Alerts Summary Chart */}
            {/* <AlertsChart data={alertsChartData} /> */}

            {/* System Overview Section */}
            <SystemOverviewSection>
              <SystemOverviewHeader>
                {t("dashboard_System_Overview")}
              </SystemOverviewHeader>
              <SystemOverviewGrid>
                <DeviceHealthCard
                  devices={deviceHealthData}
                  deviceHealthData={deviceHealthApiData?.data}
                />
                <AlertSummaryCard
                  alertSummaryData={alertSummaryApiData?.data}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </SystemOverviewGrid>
            </SystemOverviewSection>
          </>
        )}
      </DashboardContent>
      {alertActionAlert && (
        <AlertActionModal
          alert={alertActionAlert}
          onClose={() => setAlertActionAlert(null)}
          onRemoveAlert={handleRemoveAlert}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
