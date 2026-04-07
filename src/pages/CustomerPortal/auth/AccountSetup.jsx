import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaExclamationTriangle } from "react-icons/fa";
import { PrimaryButton } from "../../../components/CustomerPortal/Button";
import Input from "../../../components/CustomerPortal/Input";
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

// ─── Age Confirmation Modal styled components ─────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const DialogCard = styled.div`
  background: #fff;
  border-radius: 14px;
  width: 85%;
  max-width: 340px;
  padding: 1.5rem 1.25rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
`;

const DialogIconWrap = styled.div`
  font-size: 2.5rem;
  color: #f7941d;
  margin-bottom: 0.6rem;
`;

const DialogTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.5rem;
  letter-spacing: 0.03em;
`;

const DialogText = styled.p`
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
  margin: 0 0 1.25rem;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DialogBtn = styled.button`
  flex: 1;
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ $primary }) => ($primary ? "#2196f3" : "#bbb")};
  background: ${({ $primary }) => ($primary ? "#2196f3" : "#fff")};
  color: ${({ $primary }) => ($primary ? "#fff" : "#333")};
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;
// ─────────────────────────────────────────────────────────────────────────────

const AccountSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const signUpEmail =
    location.state?.signUpEmail ||
    sessionStorage.getItem("pendingSignUpEmail") ||
    "";

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ageModalOpen, setAgeModalOpen] = useState(false);

  // Enable "Next Step" only when passwords match
  const passwordsMatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/.test(form.password)) {
      newErrors.password =
        "Password must contain 1 upper case, 1 lower case, 1 number, and 1 special character.";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setAgeModalOpen(true);
  };

  const handleAgeYes = () => {
    setAgeModalOpen(false);
    navigate(ROUTE.TERMS_OF_SERVICE_SIGNUP, {
      state: {
        signUpEmail,
        fullName: form.name,
        password: form.password,
      },
    });
  };

  const handleAgeNo = () => {
    setAgeModalOpen(false);
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

          <Description>Finish setting up your account</Description>

          <LoginForm onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={signUpEmail}
              onChange={() => {}}
              variant="dark"
              readOnly
            />

            <Input
              label="Full Name (optional)"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              variant="dark"
            />

            <div style={{ position: "relative" }}>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                error={errors.password}
                variant="dark"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "43px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(0, 0, 0, 0.6)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                variant="dark"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "43px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(0, 0, 0, 0.6)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>

            {errors.general && (
              <div
                style={{
                  color: "#dc3545",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {errors.general}
              </div>
            )}

            <PrimaryButton
              type="submit"
              color="#F7941D"
              hoverColor="#E8850B"
              size="large"
              width="full"
              disabled={!passwordsMatch}
            >
              Next Step
            </PrimaryButton>

            <p
              style={{
                color: "rgba(242, 136, 9, 1)",
                fontSize: "0.8rem",
                textAlign: "center",
                lineHeight: 1.6,
                margin: "0.75rem 0 0",
              }}
            >
              Password must be at least 6 characters
              <br />
              and contain 1 upper case, 1 lower case,
              <br />
              1 number, and 1 special character
            </p>

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
                Back to Login
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

      {/* Age Confirmation Modal */}
      {ageModalOpen && (
        <Overlay>
          <DialogCard>
            <DialogIconWrap>
              <FaExclamationTriangle />
            </DialogIconWrap>
            <DialogTitle>AGE CONFIRMATION</DialogTitle>
            <DialogText>
              Are you 18 years of age or older?
              <br />
              <br />
              This helps us provide a safe and appropriate experience for all
              users while protecting your privacy.
            </DialogText>
            <DialogButtons>
              <DialogBtn onClick={handleAgeNo}>
                No, I am
                <br />
                under 18
              </DialogBtn>
              <DialogBtn $primary onClick={handleAgeYes}>
                Yes, I am 18
                <br />
                or older
              </DialogBtn>
            </DialogButtons>
          </DialogCard>
        </Overlay>
      )}
    </LoginContainer>
  );
};

export default AccountSetup;
