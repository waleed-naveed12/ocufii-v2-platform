import React, { useState, useEffect } from "react";
import Switch from "react-ios-switch";
import {
  DetailsContainer,
  EmailField,
  DescriptionText,
  PermissionSection,
  PermissionHeader,
  PermissionTitle,
  PermissionBadge,
  PermissionRow,
  TestAlertSection,
  TestAlertText,
  TestAlertButton,
  TestAlertLink,
} from "../../../styles/CustomerPortal/Recipients.styled";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import {
  updateRecipient,
  sendRecipientTestAlert,
} from "../../../api/CustomerPortal/RecipientsApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import { ROUTE } from "../../../common/CustomerPortal/Routes";

const RecipientDetails = ({ recipient }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const [safetyAlerts, setSafetyAlerts] = useState(recipient.enableSafety);
  const [locationSharing, setLocationSharing] = useState(
    recipient.enableLocation,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    recipient.enableSecurity,
  );

  // Update state when recipient prop changes
  useEffect(() => {
    setSafetyAlerts(recipient.enableSafety);
    setLocationSharing(recipient.enableLocation);
    setSecurityAlerts(recipient.enableSecurity);
  }, [
    recipient.enableSafety,
    recipient.enableLocation,
    recipient.enableSecurity,
  ]);

  // Location Sharing must be OFF when Safety Alerts is OFF
  useEffect(() => {
    if (!safetyAlerts) {
      setLocationSharing(false);
    }
  }, [safetyAlerts]);

  const callUpdateRecipient = async (overrides) => {
    try {
      const result = await updateRecipient({
        email: user?.email,
        recipient: recipient.email,
        senderName: recipient.senderName || "",
        recipientName: recipient.name || "",
        deviceToken: recipient.mobileDevice || "",
        mobileDevice: recipient.deviceToken || "",
        enableSafety: safetyAlerts,
        enableSecurity: securityAlerts,
        enableLocation: locationSharing,
        ...overrides,
      });
      if (result?.status !== 200 && result?.status !== 201) {
        Toast.error(result?.message || "Failed to update recipient.");
      }
    } catch (err) {
      console.error("Error updating recipient:", err);
      Toast.error("Failed to update recipient. Please try again.");
    }
  };

  const redirect2FA = () => {
    sessionStorage.setItem(
      "pendingRecipientUpdate",
      JSON.stringify({
        email: user?.email,
        recipient: recipient.email,
        senderName: recipient.senderName || "",
        recipientName: recipient.name || "",
        deviceToken: recipient.deviceToken || "",
        mobileDevice: recipient.mobileDevice || "",
        enableLocation: locationSharing,
        enableSafety: safetyAlerts,
        enableSecurity: securityAlerts,
      }),
    );
    navigate(ROUTE.RESEND_EMAIL, { state: { flow: "updateRecipient" } });
  };

  const handleSafetyAlertsChange = (value) => {
    if (value && recipient.safetyStatus === 0) {
      redirect2FA();
      return;
    }
    setSafetyAlerts(value);
    const newLocation = value ? locationSharing : false;
    if (!value) setLocationSharing(false);
    callUpdateRecipient({ enableSafety: value, enableLocation: newLocation });
  };

  const handleLocationSharingChange = (value) => {
    setLocationSharing(value);
    callUpdateRecipient({ enableLocation: value });
  };

  const handleSecurityAlertsChange = (value) => {
    if (value && recipient.securityStatus === 0) {
      redirect2FA();
      return;
    }
    setSecurityAlerts(value);
    callUpdateRecipient({ enableSecurity: value });
  };

  const handleSendTestAlert = async () => {
    try {
      const result = await sendRecipientTestAlert({
        email: user?.email,
        recipient: recipient.email,
        userId: user?.userId || user?.id || "",
      });
      if (
        result?.status === 200 ||
        result?.status === 201 ||
        result?.code === 200
      ) {
        Toast.success(result?.message || "Test alert sent.");
      } else {
        Toast.error(result?.message || "Failed to send test alert.");
      }
    } catch (err) {
      console.error("Error sending test alert:", err);
      Toast.error("Failed to send test alert. Please try again.");
    }
  };

  return (
    <DetailsContainer>
      <EmailField>{recipient.email}</EmailField>

      <DescriptionText>{t("txt_text1")}</DescriptionText>

      <PermissionSection>
        <PermissionHeader>
          <PermissionTitle>{t("txt_safety_alerts")}</PermissionTitle>
          <PermissionRow>
            <PermissionBadge status={recipient.safetyStatus}>
              {recipient.safetyStatus === 0
                ? ""
                : recipient.safetyStatus === 1
                  ? t("status_pending")
                  : recipient.safetyStatus === 2
                    ? t("recipients_Accepted")
                    : recipient.safetyStatus === 3
                      ? t("txt_reject")
                      : ""}
            </PermissionBadge>
            <Switch
              checked={safetyAlerts}
              onChange={handleSafetyAlertsChange}
              onColor="rgb(76, 217, 100)"
              offColor="rgb(200, 199, 204)"
            />
          </PermissionRow>
        </PermissionHeader>
      </PermissionSection>

      <PermissionSection>
        <PermissionRow>
          <PermissionTitle>
            {t("recipients_Location_Sharing_Permission")}
          </PermissionTitle>

          <Switch
            checked={locationSharing}
            onChange={handleLocationSharingChange}
            onColor="rgb(76, 217, 100)"
            offColor="rgb(200, 199, 204)"
            disabled={!safetyAlerts}
          />
        </PermissionRow>
      </PermissionSection>

      <DescriptionText>
        {t("recipients_Enable_Location_Sharing")}
      </DescriptionText>

      <DescriptionText>
        {t("recipients_Enable_Security_Alerts")}
      </DescriptionText>

      <PermissionSection>
        <PermissionHeader>
          <PermissionTitle>{t("dashboard_Security_Alerts")}</PermissionTitle>
          <PermissionRow>
            <PermissionBadge status={recipient.securityStatus}>
              {recipient.securityStatus === 0
                ? ""
                : recipient.securityStatus === 1
                  ? t("status_pending")
                  : recipient.securityStatus === 2
                    ? t("recipients_Accepted")
                    : recipient.securityStatus === 3
                      ? t("txt_reject")
                      : ""}
            </PermissionBadge>
            <Switch
              checked={securityAlerts}
              onChange={handleSecurityAlertsChange}
              onColor="rgb(76, 217, 100)"
              offColor="rgb(200, 199, 204)"
            />
          </PermissionRow>
        </PermissionHeader>
      </PermissionSection>

      <TestAlertSection>
        <TestAlertText>{t("recipients_Test_Alert_Message")}</TestAlertText>
        <TestAlertButton onClick={handleSendTestAlert}>
          {t("recipients_Send_Test_Alert")}
        </TestAlertButton>
      </TestAlertSection>

      <TestAlertLink href="#test-alert">
        Test Alert Message Sent to Recipient.
      </TestAlertLink>
    </DetailsContainer>
  );
};

export default RecipientDetails;
