import React, { useEffect, useRef, useState } from "react";
import { RightSection } from "../../../styles/CustomerPortal/Account.styled";
import {
  EmailContainer,
  EmailCard,
  EmailTitle,
  EmailText,
  EmailInstructions,
  EmailNote,
  EmailHelpText,
  ResendButton,
} from "../../../styles/CustomerPortal/Email.styled";
import { pollEmailVerification } from "../../../api/CustomerPortal/RecipientsApi";
import { changePasswordEmailAPI } from "../../../api/CustomerPortal/AuthApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import emailImg from "../../../assets/CustomerPortal/images/email.png";

const POLL_INTERVAL_MS = 3000;

const ChangePasswordEmailStep = ({ email, onVerified }) => {
  const [isSending, setIsSending] = useState(false);
  const pollIntervalRef = useRef(null);
  const hasSentRef = useRef(false);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await pollEmailVerification(email, 4);
        if (result?.status === 200) {
          stopPolling();
          onVerified();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    if (!email) return;
    if (!hasSentRef.current) {
      hasSentRef.current = true;
      changePasswordEmailAPI(email).catch((err) =>
        console.error("Error sending change password email:", err),
      );
    }
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleResendEmail = async () => {
    if (!email) return;
    setIsSending(true);
    try {
      const result = await changePasswordEmailAPI(email);
      if (result?.status === 200) {
        Toast.success(
          result?.message || "Verification email resent successfully.",
        );
      } else {
        Toast.error(result?.message || "Failed to resend email.");
      }
    } catch {
      Toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <RightSection>
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
    </RightSection>
  );
};

export default ChangePasswordEmailStep;
