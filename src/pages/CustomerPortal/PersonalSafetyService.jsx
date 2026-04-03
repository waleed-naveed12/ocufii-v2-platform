import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../styles/CustomerPortal/Dashboard.styled";
import { MdChevronRight, MdInfo } from "react-icons/md";
import PersonalSafetyModal from "../../components/CustomerPortal/PersonalSafetyModal";
import RecipientRequiredModal from "../../components/CustomerPortal/RecipientRequiredModal/RecipientRequiredModal";
import AlertButtonsSettings from "../../components/CustomerPortal/AlertButtonsSettings/AlertButtonsSettings";
import {
  SafetyContainer,
  ServiceCard,
  ServiceLeft,
  InfoIcon,
  ServiceText,
  StatusBadge,
  OptionItem,
  OptionText,
  AlertSection,
  AlertHeader,
  AlertRight,
  AlertTitle,
  AlertTitleText,
  AlertDescription,
  InfoText,
  ManageContactsCard,
  SectionTitle,
  SectionDescription,
  ContactSection,
  ContactLeft,
  ContactTitle,
  ContactDescription,
  ManageButton,
  NameEditCard,
  NameEditRow,
  NameEditLeft,
  NameEditTitle,
  NameEditDescription,
  NameInputWrapper,
  NameInput,
  NameEditArrow,
  NameSubtext,
} from "../../styles/CustomerPortal/PersonalSafety.styled";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import { useUser } from "../../context/CustomerPortal/UserContext";
import { getUserSettings, updateEmergency911, updateEmergency988, updateEmergency, updateActiveShooter, updateDistress, updatePolice, updateMedicalService, updateFireDepartment, updatePersonalSafetyUsername } from "../../api/CustomerPortal/SettingsApi";
import { getRecipients } from "../../api/CustomerPortal/RecipientsApi";
import { getSafetyNetworkMembers } from "../../api/CustomerPortal/SafetyNetworkApi";
import Toast from "../../utility/CustomerPortal/Toast";
import { PageTitle } from "../../styles/CustomerPortal/SafetyNetwork.styled";
import { useTranslation } from "react-i18next";

const PersonalSafetyService = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNameMessage, setShowNameMessage] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [isPersonalAlertsOpen, setIsPersonalAlertsOpen] = useState(false);
  const [isProfessionalAlertsOpen, setIsProfessionalAlertsOpen] =
    useState(false);
  const [alertSettings, setAlertSettings] = useState({
    autoDial911: false,
    autoDial988: false,
    emergency: false,
    activeShooter: false,
    feelingUnsafe: false,
  });
  const [professionalAlertSettings, setProfessionalAlertSettings] = useState({
    police: false,
    medicalService: false,
    fire: false,
    activeShooter: false,
    feelingUnsafe: false,
  });

  // Fetch user settings
  const { data: userSettingsData } = useQuery({
    queryKey: ["userSettings", user?.email],
    queryFn: () => getUserSettings(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Parse and update alert settings from API
  useEffect(() => {
    if (userSettingsData?.data) {
      const settings = userSettingsData.data;

      // Populate name from API
      if (settings.personalSafetyUserName) {
        setUserName(settings.personalSafetyUserName);
      }

      try {
        // Parse personal alert settings
        const emergency911 = settings.emergency911
          ? JSON.parse(settings.emergency911)
          : {};
        const emergency988 = settings.emergency988
          ? JSON.parse(settings.emergency988)
          : {};
        const emergency = settings.emergency
          ? JSON.parse(settings.emergency)
          : {};
        const activeShooter = settings.activeShooter
          ? JSON.parse(settings.activeShooter)
          : {};
        const distress = settings.distress ? JSON.parse(settings.distress) : {};

        // Rule: 911 must always be ON if no other toggle is ON
        const allOff =
          !emergency911.isEnabled &&
          !emergency988.isEnabled &&
          !emergency.isEnabled &&
          !activeShooter.isEnabled &&
          !distress.isEnabled;

        if (allOff) {
          // Optimistically patch cache so UI flips immediately
          const queryKey = ["userSettings", user?.email];
          queryClient.setQueryData(queryKey, (old) => {
            if (!old?.data) return old;
            const current911 = old.data.emergency911
              ? JSON.parse(old.data.emergency911)
              : {};
            return {
              ...old,
              data: {
                ...old.data,
                emergency911: JSON.stringify({ ...current911, isEnabled: true }),
              },
            };
          });
          // Persist to backend
          updateEmergency911(user?.email, {
            isEnabled: true,
            alertMessage: emergency911.alertMessage,
          }).catch((err) => console.error("Failed to auto-enable 911:", err));

          setAlertSettings({
            autoDial911: true,
            autoDial988: false,
            emergency: false,
            activeShooter: false,
            feelingUnsafe: false,
          });
        } else {
          setAlertSettings({
            autoDial911: emergency911.isEnabled || false,
            autoDial988: emergency988.isEnabled || false,
            emergency: emergency.isEnabled || false,
            activeShooter: activeShooter.isEnabled || false,
            feelingUnsafe: distress.isEnabled || false,
          });
        }

        // Parse professional alert settings
        const police = settings.police ? JSON.parse(settings.police) : {};
        const emergencyMedicalService = settings.emergencyMedicalService
          ? JSON.parse(settings.emergencyMedicalService)
          : {};
        const fireDepartment = settings.fireDepartment
          ? JSON.parse(settings.fireDepartment)
          : {};
        const proActiveShooter = settings.proActiveShooter
          ? JSON.parse(settings.proActiveShooter)
          : {};
        const proFeelingUnsafe = settings.proFeelingUnsafe
          ? JSON.parse(settings.proFeelingUnsafe)
          : {};

        setProfessionalAlertSettings({
          police: police.isEnabled || false,
          medicalService: emergencyMedicalService.isEnabled || false,
          fire: fireDepartment.isEnabled || false,
          activeShooter: proActiveShooter.isEnabled || false,
          feelingUnsafe: proFeelingUnsafe.isEnabled || false,
        });
      } catch (error) {
        console.error("Error parsing alert settings:", error);
      }
    }
  }, [userSettingsData]);

  // Keys that require at least one recipient or member before being enabled
  const RESTRICTED_KEYS = ["emergency", "activeShooter", "distress"];

  const handleAlertToggle = async (dataKey, button) => {
    // Guard: if turning ON a restricted alert, verify recipients/members exist first
    if (RESTRICTED_KEYS.includes(dataKey) && button.isEnabled === true) {
      try {
        const [recipientsRes, membersRes] = await Promise.all([
          getRecipients(user?.email),
          getSafetyNetworkMembers(user?.email),
        ]);
        const recipientCount = recipientsRes?.userNotify?.length ?? 0;
        const memberCount = membersRes?.safetyLinks?.length ?? 0;
        if (recipientCount === 0 && memberCount === 0) {
          setShowRecipientModal(true);
          return;
        }
      } catch (err) {
        console.error("Failed to check recipients/members:", err);
        // On error, allow the toggle to proceed rather than blocking the user
      }
    }

    const queryKey = ["userSettings", user?.email];

    // Rule: Cannot turn OFF 911 if no other alert is currently ON
    if (dataKey === "emergency911" && !button.isEnabled) {
      const currentData = queryClient.getQueryData(queryKey);
      const settings = currentData?.data || {};
      const otherKeys = ["emergency988", "emergency", "activeShooter", "distress"];
      const anyOtherOn = otherKeys.some((key) => {
        try { return settings[key] ? JSON.parse(settings[key]).isEnabled : false; }
        catch { return false; }
      });
      if (!anyOtherOn) {
        Toast.warn("Auto-Dial 911 cannot be turned off unless another alert is enabled.");
        return;
      }
    }

    // Cancel in-flight refetches so they don't clobber the optimistic value
    await queryClient.cancelQueries({ queryKey });

    // Snapshot for rollback
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update the query cache — UI responds instantly
    queryClient.setQueryData(queryKey, (old) => {
      if (!old?.data) return old;
      const currentParsed = old.data[dataKey]
        ? JSON.parse(old.data[dataKey])
        : {};
      const newValue = {
        ...currentParsed,
        isEnabled: button.isEnabled,
        alertMessage: button.alertMessage,
        ...(button.flashOn    !== undefined && { flashOn:    button.flashOn }),
        ...(button.alarmSound !== undefined && { alarmSound: button.alarmSound }),
      };
      return {
        ...old,
        data: { ...old.data, [dataKey]: JSON.stringify(newValue) },
      };
    });

    // Check if all toggles are now OFF → auto-enable 911
    const allKeys = ["emergency911", "emergency988", "emergency", "activeShooter", "distress"];
    const updatedCache = queryClient.getQueryData(queryKey);
    const allOff = allKeys.every((key) => {
      try { return updatedCache?.data?.[key] ? !JSON.parse(updatedCache.data[key]).isEnabled : true; }
      catch { return true; }
    });
    const shouldAutoEnable911 = allOff && dataKey !== "emergency911";
    if (shouldAutoEnable911) {
      queryClient.setQueryData(queryKey, (old) => {
        if (!old?.data) return old;
        const current911 = old.data.emergency911 ? JSON.parse(old.data.emergency911) : {};
        return {
          ...old,
          data: { ...old.data, emergency911: JSON.stringify({ ...current911, isEnabled: true }) },
        };
      });
    }

    try {
      switch (dataKey) {
        case "emergency911":
          await updateEmergency911(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
          });
          break;
        case "emergency988":
          await updateEmergency988(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
          });
          break;
        case "emergency":
          await updateEmergency(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
            flashOn: button.flashOn,
            alarmSound: button.alarmSound,
            screenFlashing: false,
          });
          break;
        case "activeShooter":
          await updateActiveShooter(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
            flashOn: button.flashOn,
            alarmSound: button.alarmSound,
            screenFlashing: false,
          });
          break;
        case "distress":
          await updateDistress(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
            flashOn: button.flashOn,
            alarmSound: button.alarmSound,
            screenFlashing: false,
          });
          break;
        case "police":
          await updatePolice(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
          });
          break;
        case "emergencyMedicalService":
          await updateMedicalService(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
          });
          break;
        case "fireDepartment":
          await updateFireDepartment(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
          });
          break;
        case "proActiveShooter":
          await updateActiveShooter(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
            flashOn: false,
            alarmSound: false,
            screenFlashing: false,
          });
          break;
        case "proFeelingUnsafe":
          await updateDistress(user?.email, {
            isEnabled: button.isEnabled,
            alertMessage: button.alertMessage,
            flashOn: false,
            alarmSound: false,
            screenFlashing: false,
          });
          break;
        default:
          break;
      }

      // Auto-enable 911 API call if all toggles ended up OFF
      if (shouldAutoEnable911) {
        const cache = queryClient.getQueryData(queryKey);
        const msg911 = cache?.data?.emergency911
          ? JSON.parse(cache.data.emergency911).alertMessage
          : undefined;
        await updateEmergency911(user?.email, {
          isEnabled: true,
          alertMessage: msg911,
        });
      }
    } catch (error) {
      // Roll back to the snapshot on failure
      queryClient.setQueryData(queryKey, previousData);
      console.error(`Failed to update ${dataKey}:`, error);
    }
  };

  const handleChangeName = () => {
    setIsEditingName(true);
    setShowNameMessage(false);
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleNameComplete = async () => {
    if (userName.trim()) {
      try {
        const result = await updatePersonalSafetyUsername(user?.email, userName.trim());
        if (result?.status === 200) {
          Toast.success(result?.message || "Name updated successfully.");
        } else {
          Toast.error(result?.message || "Failed to update name.");
        }
      } catch (error) {
        console.error("Error updating name:", error);
        Toast.error("Failed to update name. Please try again.");
      }
      setIsEditingName(false);
      setShowNameMessage(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNameComplete();
    }
  };

  const handleManageRecipients = () => {
    navigate(ROUTE.RECIPIENTS);
  };

  const handleManageSafetyNetwork = () => {
    navigate(ROUTE.SAFETY_NETWORK);
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <SafetyContainer>
          <PageTitle>{t("personalSafety_Service_Title")}</PageTitle>

          {/* Service Status Card */}
          <ServiceCard>
            <ServiceLeft>
              <ServiceText>{t("personalSafety_Service_Title")}</ServiceText>
            </ServiceLeft>
            <StatusBadge>{t("dashboard_Active")}</StatusBadge>
          </ServiceCard>

          {/* Change Name Option */}
          {!isEditingName ? (
            <>
              <OptionItem onClick={handleChangeName}>
                <OptionText>
                  {t("personalSafety_Change_Name")}
                  {showNameMessage && userName && (
                    <NameSubtext>
                      Your name will appear as "{userName}" on any safety alerts
                      sent to recipients.
                    </NameSubtext>
                  )}
                </OptionText>
                <MdChevronRight size={24} color="#6c757d" />
              </OptionItem>
            </>
          ) : (
            <NameEditCard>
              <NameEditRow>
                <NameEditLeft>
                  <NameEditTitle>Enter Your Name</NameEditTitle>
                  <NameEditDescription>
                    Your name is required so recipients can identify who is
                    requesting help during a safety alert.
                  </NameEditDescription>
                </NameEditLeft>
                <NameInputWrapper>
                  <NameInput
                    type="text"
                    placeholder="Enter Your Name"
                    value={userName}
                    onChange={handleNameChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <NameEditArrow onClick={handleNameComplete} style={{ cursor: "pointer" }}>
                    <MdChevronRight size={24} color="#6c757d" />
                  </NameEditArrow>
                </NameInputWrapper>
              </NameEditRow>
            </NameEditCard>
          )}

          {/* Personal Monitored Safety Alerts - People */}
          <AlertSection>
            <AlertHeader>
              <AlertTitle>
                <AlertTitleText>
                  {t("personalSafety_Monitored_Alerts")}
                </AlertTitleText>
              </AlertTitle>
              <AlertRight>
                <InfoIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPersonalModal(true);
                  }}
                >
                  <MdInfo />
                </InfoIcon>
                {/* <MdChevronRight
                  size={24}
                  color="#6c757d"
                  style={{
                    transform: isPersonalAlertsOpen
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                /> */}
              </AlertRight>
            </AlertHeader>
            {/* <AlertDescription>
              {t("personalSafety_Monitored_Description")}
            </AlertDescription> */}

            {/* {isPersonalAlertsOpen && ( */}
              <AlertButtonsSettings
                alertSettings={alertSettings}
                onToggle={handleAlertToggle}
                settingsData={userSettingsData?.data}
              />
            {/* )} */}
          </AlertSection>

          {/* Professional Monitored Safety Alerts - Dispatch */}
          {/* <AlertSection style={{ cursor: "pointer" }}>
            <AlertHeader
              onClick={() =>
                setIsProfessionalAlertsOpen(!isProfessionalAlertsOpen)
              }
            >
              <AlertTitle>
                <AlertTitleText>
                  Professional Monitored Safety Alerts
                </AlertTitleText>
              </AlertTitle>
              <AlertRight>
                <InfoIcon onClick={() => setShowProfessionalModal(true)}>
                  <MdInfo />
                </InfoIcon>
                <MdChevronRight
                  size={24}
                  color="#6c757d"
                  style={{
                    transform: isProfessionalAlertsOpen
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </AlertRight>
            </AlertHeader>
            <AlertDescription>
              Monitored by a dispatch center when you upgrade.
            </AlertDescription>
            {isProfessionalAlertsOpen && (
              <ProfessionalSafetyButton
                alertSettings={professionalAlertSettings}
                onToggle={handleAlertToggle}
                settingsData={userSettingsData?.data}
              />
            )}
          </AlertSection> */}

          {/* Info Text */}
          <InfoText>
            To enable professional monitored safety alerts, go to{" "}
            <a href="#subscriptions">Manage Your Subscriptions</a> and purchase
            Professional Monitoring Service under Service Upgrades.
          </InfoText>

          {/* Manage Monitoring Contacts Section */}
          <ManageContactsCard>
            <SectionTitle>{t("personalSafety_Manage_Monitoring")}</SectionTitle>
            <SectionDescription>
              {t("personalSafety_Manage_Monitoring_Description")}
            </SectionDescription>

            {/* Recipients */}
            <ContactSection>
              <ContactLeft>
                <ContactTitle>{t("personalSafety_Recipients")}</ContactTitle>
                <ContactDescription>
                  {t("personalSafety_Recipients_Description")}
                </ContactDescription>
              </ContactLeft>
              <ManageButton onClick={handleManageRecipients}>
                {t("personalSafety_Manage_Recipients")}
              </ManageButton>
            </ContactSection>

            {/* Members */}
            <ContactSection>
              <ContactLeft>
                <ContactTitle>{t("personalSafety_Members")}</ContactTitle>
                <ContactDescription>
                  {t("personalSafety_Members_Description")}
                </ContactDescription>
              </ContactLeft>
              <ManageButton onClick={handleManageSafetyNetwork}>
                {t("personalSafety_Manage_Safety_Network")}
              </ManageButton>
            </ContactSection>
          </ManageContactsCard>
        </SafetyContainer>
      </DashboardContent>

      {/* Modals */}
      <PersonalSafetyModal
        isOpen={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        isProfessional={false}
      />
      <PersonalSafetyModal
        isOpen={showProfessionalModal}
        onClose={() => setShowProfessionalModal(false)}
        isProfessional={true}
      />
      <RecipientRequiredModal
        isOpen={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
      />
    </DashboardLayout>
  );
};

export default PersonalSafetyService;
