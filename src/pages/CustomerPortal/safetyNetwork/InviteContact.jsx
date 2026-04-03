import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../../styles/CustomerPortal/Dashboard.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import Toast from "../../../utility/CustomerPortal/Toast";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { getUserSettings } from "../../../api/CustomerPortal/SettingsApi";
import {
  InviteContainer,
  InviteCard,
  InviteTitle,
  InviteIcon,
  InviteDescription,
  InviteInputField,
  InviteButtonGroup,
  CancelButton,
  SendInviteButton,
} from "../../../styles/CustomerPortal/SafetyNetwork.styled";
import inviteIcon from "../../../assets/CustomerPortal/images/invite.png";

const InviteContact = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleCancel = () => {
    navigate(ROUTE.SAFETY_NETWORK);
  };

  const handleSendInvite = async () => {
    if (!contactEmail.trim() || !contactName.trim()) {
      Toast.error("Please enter both a name and an email address.");
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

    const inviteData = {
      linkedMember: contactEmail.trim(),
      recipientName: contactName.trim(),
    };
    sessionStorage.setItem("pendingInvite", JSON.stringify(inviteData));

    navigate(ROUTE.RESEND_EMAIL, {
      state: {
        linkedMember: inviteData.linkedMember,
        recipientName: inviteData.recipientName,
      },
    });
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <InviteContainer>
          <InviteCard>
            <InviteTitle>INVITE A CONTACT</InviteTitle>

            <InviteIcon>
              <img src={inviteIcon} alt="Invite Icon" />
            </InviteIcon>

            <InviteDescription>
              Enter the contact's details to send an invitation to join your
              Safety Network. Once they accept, both accounts will be linked,
              and you'll each have the option to send and receive safety alerts,
              security alerts, and share location.
            </InviteDescription>

            <InviteInputField
              type="text"
              placeholder="Contacts Name / Nickname"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />

            <InviteInputField
              type="email"
              placeholder="Contacts Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />

            <InviteButtonGroup>
              <CancelButton onClick={handleCancel}>Cancel</CancelButton>
              <SendInviteButton onClick={handleSendInvite}>
                Send Invite
              </SendInviteButton>
            </InviteButtonGroup>
          </InviteCard>
        </InviteContainer>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default InviteContact;
