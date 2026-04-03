import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { getAlertSummary } from "../../../api/CustomerPortal/DashboardApi";
import moment from "moment";
import {
  AlertStatsContainer,
  StatsCardContainer,
  StatsHeader,
  StatsHeaderIcon,
  StatsHeaderContent,
  StatsCount,
  StatsLabel,
  StatsDescription,
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  CategoryTextContainer,
  CategoryLabel,
  CategoryCount,
  StatusGrid,
  StatusCard,
  StatusCardTop,
  StatusIcon,
  StatusTextContainer,
  StatusLabel,
  StatusCount,
  StatusDescription,
  ProgressText,
} from "../../../styles/CustomerPortal/AlertStats.styled";
import AlertImg from "../../../assets/CustomerPortal/images/alarm-bell-ring-1.svg";
import safetyImg from "../../../assets/CustomerPortal/images/person-shield.png";
import securityImg from "../../../assets/CustomerPortal/images/warningShield2.png";
import systemImg from "../../../assets/CustomerPortal/images/warning2.svg";
import OpenIssueImg from "../../../assets/CustomerPortal/images/openFolder2.png";
import AcknowledgedImg from "../../../assets/CustomerPortal/images/Like.png";
import ResolvedImg from "../../../assets/CustomerPortal/images/done2.png";
import { useTranslation } from "react-i18next";

const AlertStats = ({ timeRange }) => {
  const { user } = useUser();
  const { t } = useTranslation();

  // Map timeRange values to translation keys
  const getTimeRangeTranslation = (range) => {
    const rangeMap = {
      "24hours": "text_24",
      "7days": "text_7",
      "15days": "txt_15",
      "30days": "text_30",
      thisMonth: "txt_thisMonth",
    };
    return rangeMap[range] || "text_24";
  };

  // Generate dynamic description using translations
  const getAlertsDescription = (range) => {
    const timeRangeKey = getTimeRangeTranslation(range);
    const timeRangeText = t(timeRangeKey);
    return `${t("total_alerts")} ${timeRangeText.toLowerCase()} ${t("by_category")}`;
  };

  // TanStack Query for alert summary with dynamic time range
  const { data: alertSummaryApiData } = useQuery({
    queryKey: ["alertSummary", user?.email, timeRange],
    queryFn: () => {
      const endDateTime = moment().toISOString();
      let startDateTime;

      if (timeRange === "7days") {
        startDateTime = moment().subtract(7, "days").toISOString();
      } else if (timeRange === "15days") {
        startDateTime = moment().subtract(15, "days").toISOString();
      } else if (timeRange === "30days") {
        startDateTime = moment().subtract(30, "days").toISOString();
      } else if (timeRange === "thisMonth") {
        startDateTime = moment().startOf("month").toISOString();
      } else {
        // Default to 24 hours
        startDateTime = moment().subtract(24, "hours").toISOString();
      }

      return getAlertSummary(user?.email, startDateTime, endDateTime);
    },
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Use API data if available - ensure we extract data properly
  const apiData = alertSummaryApiData?.data || {};

  // Safely extract lifetime data
  const lifetimeAlerts = apiData.lifetimeAlerts || {};
  const lifetimeData = {
    totalAlerts:
      typeof lifetimeAlerts.total === "number" ? lifetimeAlerts.total : 0,
    safetyCount:
      (lifetimeAlerts?.safetyAlerts?.open || 0) +
      (lifetimeAlerts?.safetyAlerts?.acknowledged || 0) +
      (lifetimeAlerts?.safetyAlerts?.resolved || 0),
    securityCount:
      (lifetimeAlerts?.securityAlerts?.open || 0) +
      (lifetimeAlerts?.securityAlerts?.acknowledged || 0) +
      (lifetimeAlerts?.securityAlerts?.resolved || 0),
    systemCount:
      (lifetimeAlerts?.systemAlerts?.open || 0) +
      (lifetimeAlerts?.systemAlerts?.acknowledged || 0) +
      (lifetimeAlerts?.systemAlerts?.resolved || 0),
    openCount:
      (lifetimeAlerts?.safetyAlerts?.open || 0) +
      (lifetimeAlerts?.securityAlerts?.open || 0) +
      (lifetimeAlerts?.systemAlerts?.open || 0),
    acknowledgedCount:
      (lifetimeAlerts?.safetyAlerts?.acknowledged || 0) +
      (lifetimeAlerts?.securityAlerts?.acknowledged || 0) +
      (lifetimeAlerts?.systemAlerts?.acknowledged || 0),
    resolvedCount:
      (lifetimeAlerts?.safetyAlerts?.resolved || 0) +
      (lifetimeAlerts?.securityAlerts?.resolved || 0) +
      (lifetimeAlerts?.systemAlerts?.resolved || 0),
    description: "txt_lifetime_desc",
  };

  // Safely extract received data
  const receivedData = {
    totalAlerts:
      typeof apiData.totalAlerts === "number" ? apiData.totalAlerts : 0,
    safetyCount:
      typeof apiData.safetyCount === "number" ? apiData.safetyCount : 0,
    securityCount:
      typeof apiData.securityCount === "number" ? apiData.securityCount : 0,
    systemCount:
      typeof apiData.systemCount === "number" ? apiData.systemCount : 0,
    activeAlerts: {
      safety:
        typeof apiData?.safetyAlerts?.open === "number"
          ? apiData.safetyAlerts.open
          : 0,
      security:
        typeof apiData?.securityAlerts?.open === "number"
          ? apiData.securityAlerts.open
          : 0,
      system:
        typeof apiData?.systemAlerts?.open === "number"
          ? apiData.systemAlerts.open
          : 0,
    },
    description: getAlertsDescription(timeRange),
  };

  return (
    <AlertStatsContainer>
      {/* Lifetime Alerts Card */}
      <StatsCardContainer>
        <StatsHeader>
          <StatsHeaderIcon>
            <img src={AlertImg} alt="Alert Icon" />
          </StatsHeaderIcon>
          <StatsHeaderContent>
            <StatsLabel>{t("dashboard_Lifetime_Alerts")}</StatsLabel>
            <StatsCount>{lifetimeData.totalAlerts}</StatsCount>
          </StatsHeaderContent>
        </StatsHeader>
        <StatsDescription>{t(lifetimeData.description)}</StatsDescription>

        {/* Category Breakdown */}
        <CategoryGrid>
          <CategoryCard>
            <CategoryIcon>
              <img src={safetyImg} alt="Safety Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_Safety")}</CategoryLabel>
              <CategoryCount>{lifetimeData.safetyCount}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
          <CategoryCard>
            <CategoryIcon>
              <img src={securityImg} alt="Security Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_Security")}</CategoryLabel>
              <CategoryCount>{lifetimeData.securityCount}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
          <CategoryCard>
            <CategoryIcon>
              <img src={systemImg} alt="System Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_System")}</CategoryLabel>
              <CategoryCount>{lifetimeData.systemCount}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
        </CategoryGrid>
        <StatsDescription>{t("txt_lifetime_desc")}</StatsDescription>

        {/* Status Breakdown */}
        <StatusGrid>
          <StatusCard>
            <StatusCardTop>
              <StatusIcon>
                <img src={OpenIssueImg} alt="Open Folder Icon" />
              </StatusIcon>
              <StatusTextContainer>
                <StatusLabel>{t("dashboard_Open")}</StatusLabel>
                <StatusCount>{lifetimeData.openCount}</StatusCount>
              </StatusTextContainer>
            </StatusCardTop>
            <StatusDescription>
              {t("dashboard_Still_Waiting")}
            </StatusDescription>
          </StatusCard>
          <StatusCard>
            <StatusCardTop>
              <StatusIcon>
                <img src={AcknowledgedImg} alt="Acknowledged Icon" />
              </StatusIcon>
              <StatusTextContainer>
                <StatusLabel>{t("dashboard_Acknowledged")}</StatusLabel>
                <StatusCount>{lifetimeData.acknowledgedCount}</StatusCount>
              </StatusTextContainer>
            </StatusCardTop>
            <StatusDescription>
              {t("dashboard_Confirmed_Not_Resolved")}
            </StatusDescription>
          </StatusCard>
          <StatusCard>
            <StatusCardTop>
              <StatusIcon>
                <img src={ResolvedImg} alt="Resolved Icon" />
              </StatusIcon>
              <StatusTextContainer>
                <StatusLabel>{t("dashboard_Resolved")}</StatusLabel>
                <StatusCount>{lifetimeData.resolvedCount}</StatusCount>
              </StatusTextContainer>
            </StatusCardTop>
            <StatusDescription>
              {t("dashboard_Fully_Resolved")}
            </StatusDescription>
          </StatusCard>
        </StatusGrid>
        <ProgressText>{t("dashboard_Current_Progress")}</ProgressText>
      </StatsCardContainer>

      {/* Alerts Received Card */}
      <StatsCardContainer>
        <StatsHeader>
          <StatsHeaderIcon>
            <img src={AlertImg} alt="Alert Icon" />
          </StatsHeaderIcon>
          <StatsHeaderContent>
            <StatsLabel>{t("dashboard_Alerts_Received")}</StatsLabel>
            <StatsCount>{receivedData.totalAlerts}</StatsCount>
          </StatsHeaderContent>
        </StatsHeader>
        <StatsDescription>{receivedData.description}</StatsDescription>

        {/* Category Breakdown */}
        <CategoryGrid>
          <CategoryCard>
            <CategoryIcon>
              <img src={safetyImg} alt="Safety Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_Safety")}</CategoryLabel>
              <CategoryCount>{receivedData.safetyCount}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
          <CategoryCard>
            <CategoryIcon>
              <img src={securityImg} alt="Security Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_Security")}</CategoryLabel>
              <CategoryCount>{receivedData.securityCount}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
          <CategoryCard>
            <CategoryIcon>
              <img src={systemImg} alt="System Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_System")}</CategoryLabel>
              <CategoryCount>{receivedData.systemCount}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
        </CategoryGrid>
        <StatsDescription>{getAlertsDescription(timeRange)}</StatsDescription>

        {/* Active Alerts by Category */}
        <CategoryGrid>
          <CategoryCard>
            <CategoryIcon>
              <img src={safetyImg} alt="Safety Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_Safety")}</CategoryLabel>
              <CategoryCount>{receivedData.activeAlerts.safety}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
          <CategoryCard>
            <CategoryIcon>
              <img src={securityImg} alt="Security Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_Security")}</CategoryLabel>
              <CategoryCount>
                {receivedData.activeAlerts.security}
              </CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
          <CategoryCard>
            <CategoryIcon>
              <img src={systemImg} alt="System Icon" />
            </CategoryIcon>
            <CategoryTextContainer>
              <CategoryLabel>{t("dashboard_System")}</CategoryLabel>
              <CategoryCount>{receivedData.activeAlerts.system}</CategoryCount>
            </CategoryTextContainer>
          </CategoryCard>
        </CategoryGrid>
        <StatsDescription>
          {t("dashboard_Active_Alerts_By_Category")}
        </StatsDescription>
      </StatsCardContainer>
    </AlertStatsContainer>
  );
};

export default AlertStats;
