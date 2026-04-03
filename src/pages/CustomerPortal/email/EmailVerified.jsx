import React, { useState } from "react";
import DashboardLayout from "../../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../../styles/CustomerPortal/Dashboard.styled";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { linkFamilyNetwork } from "../../../api/CustomerPortal/SafetyNetworkApi";
import { addRecipient } from "../../../api/CustomerPortal/RecipientsApi";
import { changePasswordDirectAPI } from "../../../api/CustomerPortal/AuthApi";
import { deleteGatewayDirectAPI } from "../../../api/CustomerPortal/DevicesApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import {
  EmailContainer,
  EmailCard,
  EmailTitle,
  VerifiedIcon,
  VerifiedTitle,
  VerifiedText,
  ContinueButton,
} from "../../../styles/CustomerPortal/Email.styled";
import { useTranslation } from "react-i18next";
import ocufiiLogo from "../../../assets/CustomerPortal/images/ocufii_logo.svg";
import {
  AppVersion,
  RightsReserved,
} from "../../../common/CustomerPortal/AppVersion";
import {
  LoginContainer,
  Header,
  HeaderLogo,
  HeaderNav,
  LanguageSection,
  LanguageSelect,
  MainContent,
  Footer,
  FooterContent,
  FooterText,
  FooterLinks,
  FooterLink,
} from "../../../styles/CustomerPortal/Login.styled";
import checkImg from "../../../assets/CustomerPortal/images/check-badge.svg";

const EmailVerified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [isContinuing, setIsContinuing] = useState(false);

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const flow = location.state?.flow; // "addRecipient" | "updateRecipient" | "forgotPassword" | "changePassword" | undefined
  const isAddRecipientFlow = flow === "addRecipient";
  const isUpdateRecipientFlow = flow === "updateRecipient";
  const isForgotPasswordFlow = flow === "forgotPassword";
  const isChangePasswordFlow = flow === "changePassword";
  const isDeleteGatewayFlow = flow === "deleteGateway";

  // InviteContact flow data
  const pendingInvite = JSON.parse(
    sessionStorage.getItem("pendingInvite") || "null",
  );
  const linkedMember =
    location.state?.linkedMember || pendingInvite?.linkedMember;
  const recipientName =
    location.state?.recipientName || pendingInvite?.recipientName;

  const message =
    location.state?.message ||
    (isChangePasswordFlow
      ? {
          line1:
            "Your email has been confirmed and your password has been changed.",
          line2: 'Click "Continue" to access your account.',
        }
      : {
          line1:
            "Your email has been confirmed, and your contact has been successfully invited to your Safety Network list.",
          line2: 'Click "Continue" to finish setting up your alert members.',
        });

  const handleContinue = async () => {
    setIsContinuing(true);
    try {
      if (isForgotPasswordFlow) {
        navigate(ROUTE.RESET_PASSWORD);
        return;
      }

      if (isChangePasswordFlow) {
        const pending = JSON.parse(
          sessionStorage.getItem("pendingPasswordChange") || "null",
        );
        const result = await changePasswordDirectAPI({
          email: user?.email,
          oldPassword: pending?.currentPassword || "",
          newPassword: pending?.newPassword || "",
        });
        sessionStorage.removeItem("pendingPasswordChange");
        if (result?.status === 200) {
          Toast.success(result?.message || "Password changed successfully!");
        } else {
          Toast.error(result?.message || "Failed to change password.");
        }
        navigate(ROUTE.ACCOUNT);
        return;
      }

      if (isDeleteGatewayFlow) {
        const pendingDelete = JSON.parse(
          sessionStorage.getItem("pendingDeleteGateway") || "null",
        );
        const result = await deleteGatewayDirectAPI({
          email: user?.email,
          mac: pendingDelete?.mac || "",
        });
        sessionStorage.removeItem("pendingDeleteGateway");
        if (result?.status === 204 || result?.status === 200) {
          Toast.success(result?.message || "Device deleted successfully.");
        } else {
          Toast.error(result?.message || "Failed to delete device.");
        }
        navigate(ROUTE.DEVICES);
        return;
      }

      if (isUpdateRecipientFlow) {
        const pendingUpdate = JSON.parse(
          sessionStorage.getItem("pendingRecipientUpdate") || "null",
        );
        const result = await addRecipient({
          email: user?.email,
          recipient: pendingUpdate?.recipient || "",
          senderName: pendingUpdate?.senderName || "",
          recipientName: pendingUpdate?.recipientName || "",
          enableLocation: pendingUpdate?.enableLocation ?? false,
          enableSafety: true,
          enableSecurity: true,
        });
        if (result?.status === 201 || result?.status === 200) {
          sessionStorage.removeItem("pendingRecipientUpdate");
          Toast.success(result?.message || "Recipient updated successfully.");
        } else {
          Toast.error(result?.message || "Failed to update recipient.");
        }
        navigate(ROUTE.RECIPIENTS);
      } else if (isAddRecipientFlow) {
        const pendingRecipient = JSON.parse(
          sessionStorage.getItem("pendingRecipient") || "null",
        );
        const result = await addRecipient({
          email: user?.email,
          recipient: pendingRecipient?.recipient || "",
          senderName: pendingRecipient?.senderName || "",
          recipientName: pendingRecipient?.recipientName || "",
          enableLocation: pendingRecipient?.enableLocation ?? false,
          enableSafety: pendingRecipient?.enableSafety ?? true,
          enableSecurity: pendingRecipient?.enableSecurity ?? false,
        });
        if (result?.status === 201 || result?.status === 200) {
          sessionStorage.removeItem("pendingRecipient");
          Toast.success(result?.message || "Recipient added successfully.");
        } else {
          Toast.error(result?.message || "Failed to add recipient.");
        }
        navigate(ROUTE.RECIPIENTS);
      } else {
        const result = await linkFamilyNetwork({
          email: user?.email,
          linkedMember: linkedMember || "",
          recipientName: recipientName || "",
        });
        if (result?.status === 201 || result?.status === 200) {
          sessionStorage.removeItem("pendingInvite");
          Toast.success(
            result?.message || "Contact added to your Safety Network.",
          );
        } else {
          Toast.error(result?.message || "Failed to link contact.");
        }
        navigate(ROUTE.SAFETY_NETWORK);
      }
    } catch (error) {
      console.error("Error in continue handler:", error);
      Toast.error("Something went wrong. Please try again.");
      navigate(isAddRecipientFlow ? ROUTE.RECIPIENTS : ROUTE.SAFETY_NETWORK);
    } finally {
      setIsContinuing(false);
    }
  };

  const content = (
    <EmailContainer>
      <EmailCard>
        <EmailTitle>Two-Step Email Verification</EmailTitle>

        <VerifiedIcon>
          <img src={checkImg} alt="Verified Icon" width={50} />
        </VerifiedIcon>

        <VerifiedTitle>Verified!</VerifiedTitle>

        <VerifiedText>{message.line1}</VerifiedText>

        <VerifiedText>{message.line2}</VerifiedText>

        <ContinueButton onClick={handleContinue} disabled={isContinuing}>
          {isContinuing ? "Please wait..." : "Continue"}
        </ContinueButton>
      </EmailCard>
    </EmailContainer>
  );

  if (isForgotPasswordFlow) {
    return (
      <LoginContainer>
        <Header>
          <HeaderLogo>
            <img src={ocufiiLogo} alt="Ocufii" />
          </HeaderLogo>
          <HeaderNav>
            <LanguageSection>
              <LanguageSelect
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  i18n.changeLanguage(e.target.value);
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </LanguageSelect>
            </LanguageSection>
          </HeaderNav>
        </Header>
        <MainContent>{content}</MainContent>
        <Footer>
          <FooterContent>
            <FooterText>
              Ocufii {RightsReserved} , {t("text_rights")}
            </FooterText>
            <FooterLinks>
              <FooterLink href="#">v {AppVersion}</FooterLink>
              <FooterLink
                href="https://www.ocufii.com/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footer.termsOfUse")}
              </FooterLink>
              <FooterLink
                href="https://www.ocufii.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footer.privacyPolicy")}
              </FooterLink>
            </FooterLinks>
          </FooterContent>
        </Footer>
      </LoginContainer>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent>{content}</DashboardContent>
    </DashboardLayout>
  );
};

export default EmailVerified;
