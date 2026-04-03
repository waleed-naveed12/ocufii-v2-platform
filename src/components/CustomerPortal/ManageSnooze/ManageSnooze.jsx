import React from "react";
import styled from "styled-components";
import snoozeBell from "../../../assets/CustomerPortal/images/alarm-bell-sleep-1.svg";
import warningIcon from "../../../assets/CustomerPortal/images/warning.svg";
import {
  Overlay,
  Modal as ConfirmModal,
  Icon as ConfirmIcon,
  Title as ConfirmTitle,
  Message as ConfirmMessage,
  Actions as ConfirmActions,
  Cancel as ConfirmCancel,
  Delete as ConfirmDelete,
} from "../../../styles/CustomerPortal/DeleteMemberModal.styled";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  min-height: 300px;
`;

const PageTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const SnoozeCard = styled.div`
  background: #fff8ee;
  border: 2px solid #ff9933;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  width: 100%;
  max-width: 340px;
  margin-bottom: 28px;
`;

const BellImg = styled.img`
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
`;

const TimeRemaining = styled.div`
  color: #ff9933;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const MemberSnoozedText = styled.div`
  color: #ff9933;
  font-size: 13px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ExtendButton = styled.button`
  background: #6c757d;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: #5a6268;
  }
`;

const CancelSnoozeButton = styled.button`
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: #c82333;
  }
`;

const ManageSnooze = ({
  member,
  snoozeView,
  setSnoozeView,
  getSnoozeTimeDisplay,
  getSnoozeMinutesRemaining,
  onExtendConfirm,
  onCancelConfirm,
  actionLoading,
}) => {
  return (
    <>
      {/* Extend Snooze confirmation modal */}
      {snoozeView === "extend-confirm" && (
        <Overlay>
          <ConfirmModal role="dialog" aria-modal="true">
            <ConfirmIcon>
              <img src={warningIcon} alt="Warning" />
            </ConfirmIcon>
            <ConfirmTitle>EXTEND SNOOZE</ConfirmTitle>
            <ConfirmMessage>
              This member&apos;s alerts are already snoozed &ndash;{" "}
              {getSnoozeMinutesRemaining()} minutes remaining.
            </ConfirmMessage>
            <ConfirmMessage>
              Would you like to extend snooze for an additional hour?
            </ConfirmMessage>
            <ConfirmActions>
              <ConfirmCancel onClick={() => setSnoozeView("manage")}>
                Cancel
              </ConfirmCancel>
              <button
                onClick={onExtendConfirm}
                disabled={actionLoading === "snooze"}
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
                {actionLoading === "snooze" ? "..." : "Yes"}
              </button>
            </ConfirmActions>
          </ConfirmModal>
        </Overlay>
      )}

      {/* Cancel Snooze confirmation modal */}
      {snoozeView === "cancel-confirm" && (
        <Overlay>
          <ConfirmModal role="dialog" aria-modal="true">
            <ConfirmIcon>
              <img src={warningIcon} alt="Warning" />
            </ConfirmIcon>
            <ConfirmTitle>CANCEL SNOOZE</ConfirmTitle>
            <ConfirmMessage>
              This member&apos;s alerts are already snoozed &ndash;{" "}
              {getSnoozeMinutesRemaining()} minutes remaining.
            </ConfirmMessage>
            <ConfirmMessage>Would you like to cancel the snooze?</ConfirmMessage>
            <ConfirmActions>
              <ConfirmCancel onClick={() => setSnoozeView("manage")}>
                Cancel
              </ConfirmCancel>
              <ConfirmDelete
                onClick={onCancelConfirm}
                disabled={actionLoading === "snooze"}
              >
                {actionLoading === "snooze" ? "..." : "Yes"}
              </ConfirmDelete>
            </ConfirmActions>
          </ConfirmModal>
        </Overlay>
      )}

      {/* Inline manage snooze page (replaces MemberDetails content) */}
      <PageWrapper>
        <PageTitle>Snooze Safety Card Notification Until:</PageTitle>

        <SnoozeCard>
          <BellImg src={snoozeBell} alt="Snooze" />
          <TimeRemaining>
            {getSnoozeTimeDisplay() || "Snooze Active"}
          </TimeRemaining>
          <MemberSnoozedText>&ldquo;{member?.name}&rdquo; is Snoozed</MemberSnoozedText>
        </SnoozeCard>

        <ButtonRow>
          <ExtendButton onClick={() => setSnoozeView("extend-confirm")}>
            Extend Snooze Mode
          </ExtendButton>
          <CancelSnoozeButton onClick={() => setSnoozeView("cancel-confirm")}>
            Cancel Snooze Mode
          </CancelSnoozeButton>
        </ButtonRow>
      </PageWrapper>
    </>
  );
};

export default ManageSnooze;
