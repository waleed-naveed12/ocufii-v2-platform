import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Switch from "react-ios-switch";
import DashboardLayout from "../../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../../styles/CustomerPortal/Dashboard.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import EmailInvitation from "../../../components/CustomerPortal/EmailInvitation";
import LocationSharingModal from "../../../components/CustomerPortal/LocationSharingModal";
import Toast from "../../../utility/CustomerPortal/Toast";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { getUserSettings } from "../../../api/CustomerPortal/SettingsApi";
import {
  AddRecipientContainer,
  Breadcrumb,
  BreadcrumbLink,
  FormCard,
  FormTitle,
  DescriptionText,
  ToggleSection,
  ToggleRow,
  ToggleLabel,
  InputField,
  InfoText,
  SectionTitle,
  BoldText,
  SendButton,
} from "../../../styles/CustomerPortal/AddRecipient.styled";

const AddRecipient = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [safetyAlerts, setSafetyAlerts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [email, setEmail] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleLocationSharingToggle = (checked) => {
    if (checked) {
      setShowLocationModal(true);
    } else {
      setLocationSharing(false);
    }
  };

  const handleLocationConsent = () => {
    setLocationSharing(true);
    setShowLocationModal(false);
  };

  const handleLocationCancel = () => {
    setLocationSharing(false);
    setShowLocationModal(false);
  };

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      Toast.error("Please enter the recipient's email address.");
      return;
    }

    try {
      const settingsRes = await getUserSettings(user?.email);
      const personalSafetyUserName = settingsRes?.data?.personalSafetyUserName;
      if (!personalSafetyUserName || personalSafetyUserName.trim() === "") {
        Toast.error("Please Add Personal Safety Name");
        navigate(ROUTE.PERSONAL_SAFETY);
        return;
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }

    const pendingRecipient = {
      recipient: email.trim(),
      senderName: senderName.trim(),
      recipientName: recipientName.trim(),
      enableLocation: locationSharing,
      enableSafety: safetyAlerts,
      enableSecurity: securityAlerts,
    };
    sessionStorage.setItem(
      "pendingRecipient",
      JSON.stringify(pendingRecipient),
    );

    const message = {
      line1:
        "Your email has been confirmed, and your recipient has been successfully added to your account.",
      line2:
        'Click "Continue" to finish the process and return to the main dashboard.',
    };

    navigate(ROUTE.RESEND_EMAIL, {
      state: {
        flow: "addRecipient",
        message,
      },
    });
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <AddRecipientContainer>
          <Breadcrumb>
            <BreadcrumbLink onClick={() => navigate(ROUTE.RECIPIENTS)}>
              My Recipients
            </BreadcrumbLink>
            <span> / </span>
            <span>Add My Recipients</span>
          </Breadcrumb>

          <FormCard>
            <FormTitle>Recipient - 1</FormTitle>

            <DescriptionText>
              Enabling the Safety Alerts feature allows the recipient to receive
              real-time personal safety alerts when you need help. If Location
              Sharing Permission is also enabled, the recipient will be able to
              view your location only when a safety alert is triggered.
            </DescriptionText>

            <ToggleSection>
              <ToggleRow>
                <ToggleLabel>Safety Alerts</ToggleLabel>
                <Switch
                  checked={safetyAlerts}
                  onChange={(checked) => setSafetyAlerts(checked)}
                  onColor="#22c55e"
                />
              </ToggleRow>

              <ToggleRow>
                <ToggleLabel>Location Sharing Permission</ToggleLabel>
                <Switch
                  checked={locationSharing}
                  onChange={handleLocationSharingToggle}
                  onColor="#22c55e"
                />
              </ToggleRow>
            </ToggleSection>

            <DescriptionText>
              Enabling the Security Alerts feature allows the recipient to
              receive real-time security alerts when movement is detected on a
              monitored asset.
            </DescriptionText>

            <ToggleSection>
              <ToggleRow>
                <ToggleLabel>Security Alerts</ToggleLabel>
                <Switch
                  checked={securityAlerts}
                  onChange={(checked) => setSecurityAlerts(checked)}
                  onColor="#22c55e"
                />
              </ToggleRow>
            </ToggleSection>

            <InputField
              type="text"
              placeholder="Optional Recipient's Name (optional)"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />

            <InfoText>
              This name is displayed in the Alert Recipient's List.
            </InfoText>

            <EmailInvitation
              safetyAlerts={safetyAlerts}
              locationSharing={locationSharing}
              securityAlerts={securityAlerts}
              senderName={senderName}
              setSenderName={setSenderName}
              email={email}
              setEmail={setEmail}
              onSendInvitation={handleSendInvitation}
            />
          </FormCard>
        </AddRecipientContainer>

        <LocationSharingModal
          isOpen={showLocationModal}
          onCancel={handleLocationCancel}
          onConsent={handleLocationConsent}
        />
      </DashboardContent>
    </DashboardLayout>
  );
};

export default AddRecipient;
