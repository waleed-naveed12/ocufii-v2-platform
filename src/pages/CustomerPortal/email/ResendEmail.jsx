import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../../Layout/CustomerPortal/DashboardLayout";
import { DashboardContent } from "../../../styles/CustomerPortal/Dashboard.styled";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { inviteSafetyMember } from "../../../api/CustomerPortal/SafetyNetworkApi";
import {
  sendAddRecipientEmail,
  pollEmailVerification,
} from "../../../api/CustomerPortal/RecipientsApi";
import {
  forgotPasswordAPI,
  changePasswordEmailAPI,
} from "../../../api/CustomerPortal/AuthApi";
import { deleteGatewayEmailAPI } from "../../../api/CustomerPortal/DevicesApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import {
  EmailContainer,
  EmailCard,
  EmailTitle,
  EmailIcon,
  EmailText,
  EmailInstructions,
  EmailNote,
  EmailHelpText,
  ResendButton,
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
import { MdEmail } from "react-icons/md";
import emailImg from "../../../assets/CustomerPortal/images/email.png";

const POLL_INTERVAL_MS = 3000;

const ResendEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [isSending, setIsSending] = useState(false);
  const hasSentRef = useRef(false);
  const pollIntervalRef = useRef(null);

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const flow = location.state?.flow; // "addRecipient" | "updateRecipient" | "forgotPassword" | "changePassword" | undefined
  const message = location.state?.message;
  const isForgotPasswordFlow = flow === "forgotPassword";
  const isChangePasswordFlow = flow === "changePassword";
  const isDeleteGatewayFlow = flow === "deleteGateway";
  const isAddRecipientFlow =
    flow === "addRecipient" || flow === "updateRecipient";

  // For forgotPassword flow, we use the email typed by the user (not the logged-in user)
  const forgotEmail =
    location.state?.forgotEmail ||
    sessionStorage.getItem("pendingForgotPasswordEmail") ||
    "";
  const pollingEmail = isForgotPasswordFlow ? forgotEmail : user?.email;
  // category: 3=forgotPassword, 4=changePassword, 6=deleteGateway, 8=addRecipient, 11=safetyNetwork
  const pollingCategory = isForgotPasswordFlow
    ? 3
    : isChangePasswordFlow
      ? 4
      : isDeleteGatewayFlow
        ? 6
        : isAddRecipientFlow
          ? 8
          : 11;

  // InviteContact flow data
  const pendingInvite = JSON.parse(
    sessionStorage.getItem("pendingInvite") || "null",
  );
  const linkedMember =
    location.state?.linkedMember || pendingInvite?.linkedMember;
  const recipientName =
    location.state?.recipientName || pendingInvite?.recipientName;

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startPolling = (email) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await pollEmailVerification(email, pollingCategory);
        if (result?.status === 200) {
          stopPolling();
          navigate(ROUTE.EMAIL_VERIFIED, {
            state: { flow, message, linkedMember, recipientName, forgotEmail },
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL_MS);
  };

  // Send initial verification email and start polling on mount
  useEffect(() => {
    if (!pollingEmail) return;

    // For forgotPassword: email was already sent from ForgotPassword screen; just poll.
    // For changePassword: email was already sent from ChangePassword screen; just poll.
    // For other flows: send the email once on mount.
    if (
      !isForgotPasswordFlow &&
      !isChangePasswordFlow &&
      !isDeleteGatewayFlow &&
      !hasSentRef.current
    ) {
      hasSentRef.current = true;
      const sendFn = isAddRecipientFlow
        ? sendAddRecipientEmail(user.email)
        : inviteSafetyMember(user.email);
      sendFn.catch((err) =>
        console.error("Error sending verification email on load:", err),
      );
    }

    startPolling(pollingEmail);

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingEmail]);

  const handleResendEmail = async () => {
    if (!pollingEmail) return;
    setIsSending(true);
    try {
      let result;
      if (isForgotPasswordFlow) {
        result = await forgotPasswordAPI(pollingEmail);
      } else if (isChangePasswordFlow) {
        result = await changePasswordEmailAPI(pollingEmail);
      } else if (isDeleteGatewayFlow) {
        result = await deleteGatewayEmailAPI(pollingEmail);
      } else if (isAddRecipientFlow) {
        result = await sendAddRecipientEmail(pollingEmail);
      } else {
        result = await inviteSafetyMember(pollingEmail);
      }

      if (result?.status === 200) {
        Toast.success(
          result?.message || "Verification email resent successfully.",
        );
      } else {
        Toast.error(result?.message || "Failed to resend email.");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      Toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const content = (
    <EmailContainer>
      <EmailCard>
        <EmailTitle>Two-Step Email Verification</EmailTitle>

        <img src={emailImg} alt="Email Icon" width={80} />

        <EmailText bold>This action requires your authorization.</EmailText>

        <EmailInstructions>
          Check your inbox and follow the instructions in the email. Once
          verified, you'll be able to continue.
        </EmailInstructions>

        <EmailNote>
          Note: The verification link expires in 10 minutes.
        </EmailNote>

        <EmailHelpText>
          Didn't receive an email?
          <br />
          Check your spam folder, or click
          <br />
          "Resend Verification Email" below to send it again.
        </EmailHelpText>

        <ResendButton onClick={handleResendEmail} disabled={isSending}>
          {isSending ? "Sending..." : "Resend Verification Email"}
        </ResendButton>
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

export default ResendEmail;
