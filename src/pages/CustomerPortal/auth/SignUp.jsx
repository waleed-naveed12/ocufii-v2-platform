import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { PrimaryButton } from "../../../components/CustomerPortal/Button";
import Input from "../../../components/CustomerPortal/Input";
import {
  generateSignUpToken,
  verifyEmailForSignUp,
} from "../../../api/CustomerPortal/AuthApi";
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
  LoginSection,
  BrandLogo,
  Description,
  LoginForm,
  LinksContainer,
  Link,
  Footer,
  FooterContent,
  FooterText,
  FooterLinks,
  FooterLink,
} from "../../../styles/CustomerPortal/Login.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";

/* ─── "Email Already Exists" modal ─────────────────────────── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 2rem;
  max-width: 380px;
  width: 90%;
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.75rem;
`;

const ModalTitle = styled.h3`
  color: #f7941d;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const ModalMessage = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
`;

const ModalOkButton = styled.button`
  background: #f7941d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 2.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e8850b;
  }
`;
/* ─────────────────────────────────────────────────────────── */

const SignUp = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
    return "";
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
    if (generalError) setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      // Step 1: get a short-lived service token
      const tokenData = await generateSignUpToken();
      const serviceToken = tokenData?.access_token || tokenData?.access_Token;
      if (!serviceToken) {
        throw new Error("Failed to obtain service token.");
      }

      // Step 2: request email verification for the new account
      await verifyEmailForSignUp(email.trim(), serviceToken);

      // Success — navigate to waiting screen
      navigate(ROUTE.RESEND_EMAIL, {
        state: { flow: "signUp", forgotEmail: email.trim() },
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "";

      if (
        message.toLowerCase().includes("email already exists") ||
        message.toLowerCase().includes("already exists")
      ) {
        setShowEmailExistsModal(true);
      } else {
        setGeneralError(
          message || "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      <MainContent>
        <LoginSection>
          <BrandLogo>
            <img src={ocufiiLogo} alt="Ocufii" />
          </BrandLogo>

          <Description>Create your Ocufii account</Description>

          <LoginForm onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              error={emailError}
              variant="dark"
              required
            />

            {generalError && (
              <div
                style={{
                  color: "#dc3545",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {generalError}
              </div>
            )}

            <PrimaryButton
              type="submit"
              color="#F7941D"
              hoverColor="#E8850B"
              size="large"
              width="full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Continue"}
            </PrimaryButton>

            <LinksContainer>
              <Link
                as="button"
                type="button"
                onClick={() => navigate(ROUTE.LOGIN)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Already have an account? Log In
              </Link>
            </LinksContainer>
          </LoginForm>
        </LoginSection>
      </MainContent>

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

      {/* Email Already Exists modal */}
      {showEmailExistsModal && (
        <ModalOverlay>
          <ModalCard>
            <ModalIcon>⚠️</ModalIcon>
            <ModalTitle>Email Already Exists</ModalTitle>
            <ModalMessage>
              An account with this email address is already registered.
              Please log in or use the "Forgot Password" option if you
              need to recover your account.
            </ModalMessage>
            <ModalOkButton onClick={() => setShowEmailExistsModal(false)}>
              OK
            </ModalOkButton>
          </ModalCard>
        </ModalOverlay>
      )}
    </LoginContainer>
  );
};

export default SignUp;
