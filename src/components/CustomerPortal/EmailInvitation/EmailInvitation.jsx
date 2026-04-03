import React from "react";
import {
  SectionTitle,
  BoldText,
  DescriptionText,
  InputField,
  SendButton,
} from "../../../styles/CustomerPortal/AddRecipient.styled";

const EmailInvitation = ({
  safetyAlerts,
  locationSharing,
  securityAlerts,
  senderName,
  setSenderName,
  email,
  setEmail,
  onSendInvitation,
}) => {
  const handleSendInvitation = () => {
    if (onSendInvitation) {
      onSendInvitation();
    }
  };

  const getInvitationTitle = () => {
    const alerts = [];

    if (safetyAlerts && securityAlerts) {
      alerts.push("Safety & Security Alerts");
    } else if (safetyAlerts) {
      alerts.push("Safety Alerts");
    } else if (securityAlerts) {
      alerts.push("Security Alerts");
    }

    if (locationSharing) {
      alerts.push("Location Sharing");
    }

    return alerts.join(" and ");
  };

  const title = getInvitationTitle();

  // Only show the section if at least one toggle is enabled
  if (!safetyAlerts && !securityAlerts && !locationSharing) {
    return null;
  }

  return (
    <>
      <SectionTitle>Email Invitation</SectionTitle>
      <BoldText>{title}</BoldText>

      <DescriptionText>
        An email invitation is sent out to your recipient to{" "}
        <BoldText style={{ display: "inline" }}>opt</BoldText> in to receive{" "}
        {safetyAlerts && "safety alerts"}
        {safetyAlerts && securityAlerts && " and security alerts"}
        {!safetyAlerts && securityAlerts && "security alerts"} when you trigger
        an alert. This is part of the initial setup process and not the message
        sent during an active event.
      </DescriptionText>

      <InputField
        type="text"
        placeholder="Optional Sender's Name (You) - (optional)"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
      />

      <InputField
        type="email"
        placeholder="Recipient's Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <SendButton onClick={handleSendInvitation}>Send Invitation</SendButton>
      </div>
    </>
  );
};

export default EmailInvitation;
