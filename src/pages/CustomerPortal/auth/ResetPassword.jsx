import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import * as yup from "yup";
import { PrimaryButton } from "../../../components/CustomerPortal/Button";
import ocufiiLogo from "../../../assets/CustomerPortal/images/ocufii_logo.svg";
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
  LoginForm,
  LinksContainer,
  Link,
  Footer,
  FooterContent,
  FooterText,
  FooterLinks,
  FooterLink,
} from "../../../styles/CustomerPortal/Login.styled";
import {
  AppVersion,
  RightsReserved,
} from "../../../common/CustomerPortal/AppVersion";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { resetPasswordAPI } from "../../../api/CustomerPortal/AuthApi";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

// ---- styled components for password fields with eye toggle ----
const FieldGroup = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
  text-align: left;
  font-family: ${({ theme }) => theme.fontFamily?.primary || "inherit"};
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 2px solid ${({ $hasError }) => ($hasError ? "#dc3545" : "#e1e5e9")};
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? "#dc3545" : "#007bff")};
    box-shadow: 0 0 0 3px
      ${({ $hasError }) =>
        $hasError ? "rgba(220,53,69,0.25)" : "rgba(0,123,255,0.25)"};
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: 12px;
  bottom: ${({ $hasError }) => ($hasError ? "calc(1.25rem + 8px)" : "8px")};
  height: 40px;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  line-height: 1;

  &:hover {
    color: #333;
  }
`;

const FieldError = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 0.4rem;
  text-align: left;
`;

const HintText = styled.div`
  margin-top: 16px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  text-align: center;
`;
// ---------------------------------------------------------------

const resetSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least 1 uppercase letter")
    .matches(/[a-z]/, "Must contain at least 1 lowercase letter")
    .matches(/[0-9]/, "Must contain at least 1 number")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Must contain at least 1 special character",
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
});

const ResetPassword = () => {
  const [fields, setFields] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");
  const navigate = useNavigate();

  const email = sessionStorage.getItem("pendingForgotPasswordEmail") || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      await resetSchema.validate(fields, { abortEarly: false });

      const result = await resetPasswordAPI({
        email,
        newPassword: fields.newPassword,
      });

      if (result?.status === 200) {
        setSuccessMessage(result?.message || "Password reset successfully!");
        sessionStorage.removeItem("pendingForgotPasswordEmail");
        setTimeout(() => navigate(ROUTE.LOGIN), 2000);
      } else {
        setErrors({
          general:
            result?.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
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

          <LoginForm onSubmit={handleSubmit}>
            {/* New Password */}
            <FieldGroup>
              <FieldLabel>Enter Your New Password</FieldLabel>
              <FieldInput
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={fields.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                $hasError={Boolean(errors.newPassword)}
                autoComplete="new-password"
              />
              <EyeButton
                type="button"
                $hasError={Boolean(errors.newPassword)}
                onClick={() => setShowNew((v) => !v)}
                tabIndex={-1}
              >
                {showNew ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </EyeButton>
              {errors.newPassword && (
                <FieldError>{errors.newPassword}</FieldError>
              )}
            </FieldGroup>

            {/* Confirm Password */}
            <FieldGroup>
              <FieldLabel>Confirm Your New Password</FieldLabel>
              <FieldInput
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={fields.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                $hasError={Boolean(errors.confirmPassword)}
                autoComplete="new-password"
              />
              <EyeButton
                type="button"
                $hasError={Boolean(errors.confirmPassword)}
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </EyeButton>
              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword}</FieldError>
              )}
            </FieldGroup>

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

            {successMessage && (
              <div
                style={{
                  color: "#28a745",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {successMessage}
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
              {isLoading ? "Resetting..." : "Reset Password"}
            </PrimaryButton>

            <HintText>
              Password must be at least 6 characters and contain 1 uppercase, 1
              lowercase, 1 number, and 1 special character.
            </HintText>

            <LinksContainer style={{ marginTop: "20px" }}>
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
    </LoginContainer>
  );
};

export default ResetPassword;
