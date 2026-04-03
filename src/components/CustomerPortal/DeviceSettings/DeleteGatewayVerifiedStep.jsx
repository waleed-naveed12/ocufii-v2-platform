import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { RightSection } from "../../../styles/CustomerPortal/DeviceDetails.styled";
import {
  EmailContainer,
  EmailCard,
  EmailTitle,
  VerifiedIcon,
  VerifiedTitle,
  VerifiedText,
  ContinueButton,
} from "../../../styles/CustomerPortal/Email.styled";
import { deleteGatewayDirectAPI } from "../../../api/CustomerPortal/DevicesApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import checkImg from "../../../assets/CustomerPortal/images/check-badge.svg";

const DeleteGatewayVerifiedStep = ({ email, mac }) => {
  const navigate = useNavigate();
  const [isContinuing, setIsContinuing] = useState(false);

  const handleContinue = async () => {
    setIsContinuing(true);
    try {
      const result = await deleteGatewayDirectAPI({ email, mac });
      if (result?.status === 204 || result?.status === 200) {
        Toast.success(result?.message || "Gateway deleted successfully.");
      } else {
        Toast.error(result?.message || "Failed to delete hub.");
      }
    } catch {
      Toast.error("Failed to delete hub. Please try again.");
    } finally {
      setIsContinuing(false);
    }
    navigate(ROUTE.DEVICES);
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
            Your email has been confirmed. Click "Continue" to permanently
            delete this hub from your account.
          </VerifiedText>

          <ContinueButton onClick={handleContinue} disabled={isContinuing}>
            {isContinuing ? "Please wait..." : "Continue"}
          </ContinueButton>
        </EmailCard>
      </EmailContainer>
    </RightSection>
  );
};

export default DeleteGatewayVerifiedStep;
