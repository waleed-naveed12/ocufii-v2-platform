import React from "react";
import {
  AlertSummaryContainer,
  AlertSummaryHeader,
  TimeDropdown,
  TotalAlertsCard,
  AlertIcon,
  AlertCount,
  AlertLabel,
  AlertDescription,
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  CategoryLabel,
  CategoryCount,
  CategoryTextContainer,
  StatusGrid,
  StatusCard,
  StatusCardTop,
  StatusIcon,
  StatusLabel,
  StatusCount,
  StatusTextContainer,
  StatusDescription,
  ProgressText,
  LifetimeText,
} from "../../../styles/CustomerPortal/SystemOverview.styled";
import AlertImg from "../../../assets/CustomerPortal/images/alarm-bell-ring-1.svg";
import safetyImg from "../../../assets/CustomerPortal/images/person-shield.png";
import securityImg from "../../../assets/CustomerPortal/images/warningShield2.png";
import systemImg from "../../../assets/CustomerPortal/images/warning2.svg";
import OpenIssueImg from "../../../assets/CustomerPortal/images/openFolder2.png";
import AcknowledgedImg from "../../../assets/CustomerPortal/images/Like.png";
import ResolvedImg from "../../../assets/CustomerPortal/images/done2.png";
import { useTranslation } from "react-i18next";

const AlertSummaryCard = ({
  alertSummaryData,
  timeRange,
  onTimeRangeChange,
}) => {
  const { t } = useTranslation();
  // Use API data if available, otherwise fall back to default values
  const displayData = alertSummaryData || {
    totalAlerts: 0,
    safetyCount: 0,
    securityCount: 0,
    systemCount: 0,
    openCount: 0,
    acknowledgedCount: 0,
    resolvedCount: 0,
    missedCount: 0,
    lifetimeAlerts: 0,
  };

  return (
    <AlertSummaryContainer>
      <AlertSummaryHeader>
        <h3>{t("dashboard_Alert_Summary")}</h3>
        <TimeDropdown
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
        >
          <option value="24 Hours">{t("text_24")}</option>
          <option value="7 Days">{t("text_7")}</option>
          <option value="30 Days">{t("text_30")}</option>
        </TimeDropdown>
      </AlertSummaryHeader>

      {/* Total Alerts Received */}
      <TotalAlertsCard>
        <AlertIcon>
          <img src={AlertImg} alt="Alert Icon" />
        </AlertIcon>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCount>{displayData.totalAlerts}</AlertCount>
            <AlertLabel>{t("dashboard_Alerts_Received")}</AlertLabel>
          </div>
        </div>
      </TotalAlertsCard>
      <AlertDescription>
        {t("total_alerts")} {timeRange.toLowerCase()}.
      </AlertDescription>

      {/* Category Breakdown */}
      <CategoryGrid>
        <CategoryCard>
          <CategoryIcon>
            <img src={safetyImg} alt="safety Icon" />
          </CategoryIcon>
          <CategoryTextContainer>
            <CategoryLabel>{t("dashboard_Safety")}</CategoryLabel>
            <CategoryCount>{displayData.safetyCount}</CategoryCount>
          </CategoryTextContainer>
        </CategoryCard>
        <CategoryCard>
          <CategoryIcon>
            <img src={securityImg} alt="security Icon" />
          </CategoryIcon>
          <CategoryTextContainer>
            <CategoryLabel>{t("dashboard_Security")}</CategoryLabel>
            <CategoryCount>{displayData.securityCount}</CategoryCount>
          </CategoryTextContainer>
        </CategoryCard>
        <CategoryCard>
          <CategoryIcon>
            <img src={systemImg} alt="system Icon" />
          </CategoryIcon>
          <CategoryTextContainer>
            <CategoryLabel>{t("dashboard_System")}</CategoryLabel>
            <CategoryCount>{displayData.systemCount}</CategoryCount>
          </CategoryTextContainer>
        </CategoryCard>
      </CategoryGrid>
      <AlertDescription>
        {t("total_alerts")} {timeRange.toLowerCase()} {t("by_category")}
      </AlertDescription>

      {/* Status Breakdown */}
      <StatusGrid>
        <StatusCard>
          <StatusCardTop>
            <StatusIcon>
              <img src={OpenIssueImg} alt="Open Folder Icon" />
            </StatusIcon>
            <StatusTextContainer>
              <StatusLabel>{t("dashboard_Open")}</StatusLabel>
              <StatusCount>
                {(displayData?.safetyAlerts?.open || 0) +
                  (displayData?.securityAlerts?.open || 0) +
                  (displayData?.systemAlerts?.open || 0)}
              </StatusCount>
            </StatusTextContainer>
          </StatusCardTop>
          <StatusDescription>{t("dashboard_Still_Waiting")}</StatusDescription>
        </StatusCard>
        <StatusCard>
          <StatusCardTop>
            <StatusIcon>
              <img src={AcknowledgedImg} alt="Acknowledged Icon" />
            </StatusIcon>
            <StatusTextContainer>
              <StatusLabel>{t("dashboard_Acknowledged")}</StatusLabel>
              <StatusCount>
                {(displayData?.safetyAlerts?.acknowledged || 0) +
                  (displayData?.securityAlerts?.acknowledged || 0) +
                  (displayData?.systemAlerts?.acknowledged || 0)}
              </StatusCount>
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
              <StatusCount>
                {(displayData?.safetyAlerts?.resolved || 0) +
                  (displayData?.securityAlerts?.resolved || 0) +
                  (displayData?.systemAlerts?.resolved || 0)}
              </StatusCount>
            </StatusTextContainer>
          </StatusCardTop>
          <StatusDescription>{t("dashboard_Fully_Resolved")}</StatusDescription>
        </StatusCard>
      </StatusGrid>
      <ProgressText>{t("dashboard_Current_Progress")}</ProgressText>
      <LifetimeText>
        {t("dashboard_Lifetime_Alerts")}:{" "}
        {typeof displayData.lifetimeAlerts === "object"
          ? displayData.lifetimeAlerts?.total || 0
          : displayData.lifetimeAlerts || 0}
      </LifetimeText>
    </AlertSummaryContainer>
  );
};

export default AlertSummaryCard;
