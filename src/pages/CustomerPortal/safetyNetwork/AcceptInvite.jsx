import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../../styles/CustomerPortal/Dashboard.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { verifyOTP } from "../../../api/CustomerPortal/SafetyNetworkApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import {
  InviteContainer,
  InviteCard,
  InviteTitle,
  InviteIcon,
  InviteDescription,
  InviteInputField,
  InviteButtonGroup,
  CancelButton,
  VerifyButton,
} from "../../../styles/CustomerPortal/SafetyNetwork.styled";
import emailIcon from "../../../assets/CustomerPortal/images/inviteAccept.png";
import checkIcon from "../../../assets/CustomerPortal/images/check-badge.svg";

const AcceptInvite = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [contactName, setContactName] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCancel = () => {
    navigate(ROUTE.SAFETY_NETWORK);
  };

  const handleVerify = async () => {
    if (!code.trim() || !contactName.trim()) {
      Toast.error("Please enter both a contact name and the invitation code.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyOTP({
        code: code.trim(),
        contactName: contactName.trim(),
        acceptorEmail: user?.email,
      });

      if (result?.status === 200) {
        Toast.success(result?.message || "Invitation accepted successfully.");
        navigate(ROUTE.DASHBOARD);
      } else {
        Toast.error(
          result?.message ||
            "Verification failed. Please check the code and try again.",
        );
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardContent>
        <InviteContainer>
          <InviteCard>
            <InviteTitle>ENTER INVITATION CODE</InviteTitle>

            <InviteIcon>
              <img src={emailIcon} alt="Email Icon" style={{ width: "80px" }} />
            </InviteIcon>

            <InviteDescription>
              Enter the invitation code to link your account with this Safety
              Network. Once linked, you'll have the option to send and receive
              safety alerts, security alerts, and share location.
            </InviteDescription>

            <InviteInputField
              type="text"
              placeholder="Contacts Name / Nickname"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />

            <InviteInputField
              type="text"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <InviteButtonGroup>
              <CancelButton onClick={handleCancel}>Cancel</CancelButton>
              <VerifyButton onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify"}
              </VerifyButton>
            </InviteButtonGroup>
          </InviteCard>
        </InviteContainer>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default AcceptInvite;
