import React, { useState } from "react";
import { RightSection } from "../../../styles/CustomerPortal/Account.styled";
import {
  EmailContainer,
  EmailCard,
  EmailTitle,
  VerifiedIcon,
  VerifiedTitle,
  VerifiedText,
  ContinueButton,
} from "../../../styles/CustomerPortal/Email.styled";
import { changePasswordDirectAPI } from "../../../api/CustomerPortal/AuthApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import checkImg from "../../../assets/CustomerPortal/images/check-badge.svg";

const ChangePasswordVerifiedStep = ({
  email,
  currentPassword,
  newPassword,
  onComplete,
}) => {
  const [isContinuing, setIsContinuing] = useState(false);

  const handleContinue = async () => {
    setIsContinuing(true);
    try {
      const result = await changePasswordDirectAPI({
        email,
        oldPassword: currentPassword,
        newPassword,
      });
      sessionStorage.removeItem("pendingPasswordChange");
      if (result?.status === 200 || result?.status === 204) {
        Toast.success(result?.message || "Password changed successfully!");
        onComplete();
      } else {
        Toast.error(result?.message || "Failed to change password.");
      }
    } catch {
      Toast.error("Failed to change password. Please try again.");
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <RightSection>
      <EmailContainer>
        <EmailCard>
          <EmailTitle>Two-Step Email Verification</EmailTitle>

          <VerifiedIcon>
            <img src={checkImg} alt="Verified Icon" width={50} />
          </VerifiedIcon>

          <VerifiedTitle>Verified!</VerifiedTitle>

          <VerifiedText>
            Your email has been confirmed and your password has been changed.
          </VerifiedText>

          <VerifiedText>Click "Continue" to access your account.</VerifiedText>

          <ContinueButton onClick={handleContinue} disabled={isContinuing}>
            {isContinuing ? "Please wait..." : "Continue"}
          </ContinueButton>
        </EmailCard>
      </EmailContainer>
    </RightSection>
  );
};

export default ChangePasswordVerifiedStep;
