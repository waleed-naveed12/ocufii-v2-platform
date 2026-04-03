import React, { useState, useEffect } from "react";
import Switch from "react-ios-switch";
import { MdSecurity } from "react-icons/md";
import { GiBurningPassion } from "react-icons/gi";
import {
  Container,
  Section,
  SectionTitle,
  SectionSubtitle,
  Row,
  RowLabel,
  TestRow,
  TestInput,
  PrimaryButton,
  StatusPill,
  StatusRow,
  AlertIcon,
  ActionGroup,
  SecondaryButton,
  UnlinkButton,
  Note,
} from "../../styles/CustomerPortal/MemberDetails.styled";
import safetAlertImg from "../../assets/CustomerPortal/images/safety2.png";
import securityAlertImg from "../../assets/CustomerPortal/images/security2.png";
import { useTranslation } from "react-i18next";
import LocationSharingModal from "./LocationSharingModal";
import warningIcon from "../../assets/CustomerPortal/images/warning.svg";
import snoozeBell from "../../assets/CustomerPortal/images/alarm-bell-sleep-1.svg";
import moment from "moment";
import {
  Overlay,
  Modal as ConfirmModal,
  Icon as ConfirmIcon,
  Title as ConfirmTitle,
  Message as ConfirmMessage,
  Actions as ConfirmActions,
  Cancel as ConfirmCancel,
  Delete as ConfirmDelete,
} from "../../styles/CustomerPortal/DeleteMemberModal.styled";
import { useUser } from "../../context/CustomerPortal/UserContext";

const MemberDetails = ({ member, outbound, inbound, onUnlink = () => {}, onUpdateMember, onChangeStatus, onSendTestAlert, onManageSnooze }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const lastSnoozeEndTimeRef = React.useRef(null);
  const [safetyAlerts, setSafetyAlerts] = useState(
    outbound?.enableSafety || false,
  );
  const [locationShare, setLocationShare] = useState(
    outbound?.enableLocation || false,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    outbound?.enableSecurity || false,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'snooze' | 'block' | 'unlink'
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingLocationValue, setPendingLocationValue] = useState(null);
  // activeStatus tracks the current user's own userStatus — inbound is current user's record, outbound is other person's
  const [activeStatus, setActiveStatus] = useState(inbound?.userStatus ?? null);
  const [pendingAction, setPendingAction] = useState(null); // { action, userStatus }
  const [notAllowedModal, setNotAllowedModal] = useState(null); // { message }

  // Update state when outbound prop changes
  useEffect(() => {
    setSafetyAlerts(outbound?.enableSafety || false);
    setLocationShare(outbound?.enableLocation || false);
    setSecurityAlerts(outbound?.enableSecurity || false);
  }, [
    outbound?.enableSafety,
    outbound?.enableLocation,
    outbound?.enableSecurity,
  ]);

  // Sync activeStatus whenever the current user's own record refreshes
  useEffect(() => {
    setActiveStatus(inbound?.userStatus ?? null);
  }, [inbound?.userStatus]);

  const handleToggle = async (field, value) => {
    // Location sharing ON requires consent via modal before calling the API
    if (field === "enableLocation" && value === true) {
      setPendingLocationValue(value);
      setShowLocationModal(true);
      return;
    }

    // When Safety Alerts is turned OFF, also force Location Sharing OFF
    const forcedLocationOff = field === "enableSafety" && value === false && locationShare;

    const next = {
      enableSafety: field === "enableSafety" ? value : safetyAlerts,
      enableLocation: forcedLocationOff ? false : (field === "enableLocation" ? value : locationShare),
      enableSecurity: field === "enableSecurity" ? value : securityAlerts,
    };
    // Optimistic update
    if (field === "enableSafety") setSafetyAlerts(value);
    if (field === "enableLocation") setLocationShare(value);
    if (field === "enableSecurity") setSecurityAlerts(value);
    if (forcedLocationOff) setLocationShare(false);

    if (!onUpdateMember) return;
    setIsUpdating(true);
    try {
      await onUpdateMember(next);
    } catch {
      // Revert on failure
      if (field === "enableSafety") setSafetyAlerts(!value);
      if (field === "enableLocation") setLocationShare(!value);
      if (field === "enableSecurity") setSecurityAlerts(!value);      if (forcedLocationOff) setLocationShare(true);    } finally {
      setIsUpdating(false);
    }
  };

  const handleLocationConsent = async () => {
    setShowLocationModal(false);
    const value = pendingLocationValue;
    setPendingLocationValue(null);
    if (value === null) return;
    const next = {
      enableSafety: safetyAlerts,
      enableLocation: value,
      enableSecurity: securityAlerts,
    };
    setLocationShare(value);
    if (!onUpdateMember) return;
    setIsUpdating(true);
    try {
      await onUpdateMember(next);
    } catch {
      setLocationShare(!value);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLocationCancel = () => {
    setShowLocationModal(false);
    setPendingLocationValue(null);
    // Switch stays in its original position (no state change)
  };

  const handleUnlink = () => {
    onUnlink(member);
  };

  const handleSendTestAlert = async () => {
    if (!onSendTestAlert) return;
    setIsSendingAlert(true);
    try {
      await onSendTestAlert();
    } finally {
      setIsSendingAlert(false);
    }
  };

  // Conflict rules: [currentStatus, attemptedStatus] → message
  const CONFLICT_MESSAGES = {
    "5-3": "You cannot block this member's alerts while they're snoozed.\n\nTo block them, first unsnooze.",
    "5-4": "You cannot unlink this member while they're snoozed.\n\nTo unlink them, first unsnooze.",
    "3-5": "You cannot snooze this member's alerts while they're blocked.\n\nTo snooze them, first unblock.",
    "3-4": "You cannot unlink this member while they're blocked.\n\nTo unlink them, first unblock.",
    "4-5": "You cannot snooze this member's alerts while they're unlinked.\n\nTo snooze them, first relink.",
    "4-3": "You cannot block this member's alerts while they're unlinked.\n\nTo block them, first relink.",
  };

  const handleStatusAction = (action, userStatus) => {
    if (!onChangeStatus || !!actionLoading) return;
    // Toggle-off: already active → undo without confirmation
    if (activeStatus === userStatus) {
      performStatusChange(action, 1);
      return;
    }
    // Conflict check: current active status conflicts with attempted action
    const conflictKey = `${activeStatus}-${userStatus}`;
    if (CONFLICT_MESSAGES[conflictKey]) {
      setNotAllowedModal({ message: CONFLICT_MESSAGES[conflictKey] });
      return;
    }
    setPendingAction({ action, userStatus });
  };

  const performStatusChange = async (action, newStatus) => {
    setActionLoading(action);
    // Unlink uses outbound email/linkedMember; all other actions (block, snooze) use inbound
    const source = action === "unlink" ? outbound : inbound;
    try {
      const result = await onChangeStatus({ userStatus: newStatus, email: source?.email, linkedMember: source?.linkedMember });
      setActiveStatus(newStatus);
      if (action === "snooze" && newStatus === 5 && result?.snoozeEndTime) {
        lastSnoozeEndTimeRef.current = result.snoozeEndTime;
      }
    } catch {
      // keep current activeStatus on failure
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { action, userStatus } = pendingAction;
    setPendingAction(null);
    performStatusChange(action, userStatus);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
  };

  const getSnoozeTimeDisplay = () => {
    if (!member?.snoozeEndTime) return null;
    const endTime = moment.utc(member.snoozeEndTime).local();
    const diffMs = endTime.diff(moment());
    if (diffMs <= 0) return null;
    const duration = moment.duration(diffMs);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    if (hours > 0) return `${hours} Hrs ${minutes} Minutes Remaining`;
    return `${minutes} Minutes Remaining`;
  };

  const getSnoozeMinutesRemaining = () => {
    if (!member?.snoozeEndTime) return 0;
    const endTime = moment.utc(member.snoozeEndTime).local();
    const diffMs = endTime.diff(moment());
    if (diffMs <= 0) return 0;
    return Math.floor(moment.duration(diffMs).asMinutes());
  };

  const handleExtendSnoozeConfirm = async () => {
    await performStatusChange("snooze", 5);
  };

  const handleCancelSnoozeConfirm = async () => {
    await performStatusChange("snooze", 1);
  };

  // Determine if incoming alerts are active
  const isSafetyActive = inbound?.enableSafety;
  const isSecurityActive = inbound?.enableSecurity;

  // Show Unlink/Relink button only when:
  // - Status is not unlinked (show Unlink), OR
  // - Status is unlinked AND current user was the one who unlinked (unlinkedBy is empty or matches current user email)
  const unlinkedBy = member?.unlinkedBy;
  const canInteractUnlink =
    activeStatus !== 4 ||
    !unlinkedBy ||
    unlinkedBy === user?.email;

  const getModalContent = () => {
    if (!pendingAction) return null;
    switch (pendingAction.action) {
      case "snooze":
        return {
          title: "SNOOZE?",
          message: "Are you sure you want to snooze alerts from this member for 1 hour?",
          confirmLabel: "Yes",
          confirmRed: false,
        };
      case "block":
        return {
          title: "BLOCK?",
          message: "Are you sure you want to block alerts from this member?",
          confirmLabel: "Yes",
          confirmRed: false,
        };
      case "unlink":
        return {
          title: "UNLINK?",
          message: "Are you sure you want to unlink this Member? You will no longer be connected.",
          confirmLabel: "Unlink Member",
          confirmRed: true,
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  return (
    <Container>
      {pendingAction && modalContent && (
        <Overlay>
          <ConfirmModal role="dialog" aria-modal="true">
            <ConfirmIcon>
              <img src={warningIcon} alt="Warning" />
            </ConfirmIcon>
            <ConfirmTitle>{modalContent.title}</ConfirmTitle>
            <ConfirmMessage>{modalContent.message}</ConfirmMessage>
            <ConfirmActions>
              <ConfirmCancel onClick={handleCancelAction}>Cancel</ConfirmCancel>
              {modalContent.confirmRed ? (
                <ConfirmDelete onClick={handleConfirmAction}>
                  {modalContent.confirmLabel}
                </ConfirmDelete>
              ) : (
                <button
                  onClick={handleConfirmAction}
                  style={{
                    background: "#1671D9",
                    color: "#fff",
                    border: "none",
                    padding: "10px 26px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {modalContent.confirmLabel}
                </button>
              )}
            </ConfirmActions>
          </ConfirmModal>
        </Overlay>
      )}
      {notAllowedModal && (
        <Overlay>
          <ConfirmModal role="dialog" aria-modal="true">
            <ConfirmIcon>
              <img src={warningIcon} alt="Warning" />
            </ConfirmIcon>
            <ConfirmTitle>NOT ALLOWED</ConfirmTitle>
            {notAllowedModal.message.split("\n\n").map((line, i) => (
              <ConfirmMessage key={i} style={{ marginBottom: i === 0 ? "8px" : "24px" }}>
                {line}
              </ConfirmMessage>
            ))}
            <ConfirmActions>
              <button
                onClick={() => setNotAllowedModal(null)}
                style={{
                  background: "#1671D9",
                  color: "#fff",
                  border: "none",
                  padding: "10px 40px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                OK
              </button>
            </ConfirmActions>
          </ConfirmModal>
        </Overlay>
      )}
      {/* Manage Snooze, Extend, and Cancel Snooze are now handled by the ManageSnooze inline component */}

      <LocationSharingModal
        isOpen={showLocationModal}
        onConsent={handleLocationConsent}
        onCancel={handleLocationCancel}
      />

      <Section>
        <SectionTitle>
          {t("txt_alert_shared")}{" "}
          <span style={{ color: "#9aa3ad", fontWeight: "400" }}>
            ({t("txt_Outgoing")})
          </span>
        </SectionTitle>
        <SectionSubtitle>{t("txt_text1")}</SectionSubtitle>

        <Row>
          <RowLabel>{t("txt_safety_alerts")}</RowLabel>
          <Switch
            checked={safetyAlerts}
            onChange={(v) => handleToggle("enableSafety", v)}
            disabled={isUpdating}
          />
        </Row>

        <Row>
          <RowLabel>{t("recipients_Location_Sharing_Permission")}</RowLabel>
          <Switch
            checked={locationShare}
            onChange={(v) => handleToggle("enableLocation", v)}
            disabled={isUpdating || !safetyAlerts}
          />
        </Row>

        <SectionSubtitle>
          {t("recipients_Enable_Location_Sharing")}
        </SectionSubtitle>

        <Row>
          <RowLabel>{t("dashboard_Security_Alerts")}</RowLabel>
          <Switch
            checked={securityAlerts}
            onChange={(v) => handleToggle("enableSecurity", v)}
            disabled={isUpdating}
          />
        </Row>

        <SectionSubtitle>
          {t("recipients_Enable_Security_Alerts")}
        </SectionSubtitle>

        <TestRow>
          <TestInput
            readOnly
            value={t("txt_test_alert_message")}
          />
          <PrimaryButton onClick={handleSendTestAlert} disabled={isSendingAlert}>
            {isSendingAlert ? "..." : t("txt_send_test_alert")}
          </PrimaryButton>
        </TestRow>
      </Section>

      <Section>
        <SectionTitle>
          {t("txt_alerts_receive")}{" "}
          <span style={{ color: "#9aa3ad", fontWeight: "400" }}>
            ({t("txt_incoming")})
          </span>
        </SectionTitle>

        <StatusRow>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertIcon>
              <img
                src={safetAlertImg}
                alt="Safety Alert"
                style={{ width: "24px", height: "24px" }}
              />
            </AlertIcon>
            <RowLabel>{t("txt_safety_alerts")}</RowLabel>
          </div>
          <StatusPill $isActive={isSafetyActive}>
            {isSafetyActive ? t("dashboard_Active") : t("dashboard_Disabled")}
          </StatusPill>
        </StatusRow>

        <StatusRow>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertIcon>
              <img
                src={securityAlertImg}
                alt="Security Alert"
                style={{ width: "24px", height: "24px" }}
              />
            </AlertIcon>
            <RowLabel>{t("dashboard_Security_Alerts")}</RowLabel>
          </div>
          <StatusPill $isActive={isSecurityActive}>
            {isSecurityActive ? t("dashboard_Active") : t("dashboard_Disabled")}
          </StatusPill>
        </StatusRow>

        <ActionGroup>
          <SecondaryButton
            disabled={!!actionLoading}
            $isActive={false}
            onClick={() =>
              activeStatus === 5
                ? onManageSnooze?.(lastSnoozeEndTimeRef.current)
                : handleStatusAction("snooze", 5)
            }
            style={activeStatus === 5 ? { background: "#FF9933" } : {}}
          >
            {actionLoading === "snooze"
              ? "..."
              : activeStatus === 5
              ? "Manage Snooze"
              : t("dashboard_Snooze")}
          </SecondaryButton>
          <SecondaryButton
            disabled={!!actionLoading}
            $isActive={activeStatus === 3}
            onClick={() => handleStatusAction("block", 3)}
          >
            {actionLoading === "block"
              ? "..."
              : activeStatus === 3
              ? t("txt_unblock")
              : t("status_block")}
          </SecondaryButton>
        </ActionGroup>

        {canInteractUnlink && (
          <UnlinkButton
            disabled={!!actionLoading}
            $isActive={activeStatus === 4}
            onClick={() => handleStatusAction("unlink", 4)}
          >
            {actionLoading === "unlink"
              ? "..."
              : activeStatus === 4
              ? t("txt_relink")
              : t("txt_unlink")}
          </UnlinkButton>
        )}
        <Note>{t("txt_unlink_desc")}</Note>
      </Section>
    </Container>
  );
};
export default MemberDetails;
