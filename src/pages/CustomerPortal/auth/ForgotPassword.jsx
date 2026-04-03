import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { PrimaryButton } from "../../../components/CustomerPortal/Button";
import Input from "../../../components/CustomerPortal/Input";
import { forgotPasswordAPI } from "../../../api/CustomerPortal/AuthApi";
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

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await emailSchema.validate({ email }, { abortEarly: false });

      const response = await forgotPasswordAPI(email);

      if (response?.status === 200) {
        sessionStorage.setItem("pendingForgotPasswordEmail", email);
        navigate(ROUTE.RESEND_EMAIL, {
          state: { flow: "forgotPassword", forgotEmail: email },
        });
      } else {
        setErrors({
          general: response?.message || "Failed to send verification email.",
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
            <Input
              label="Enter Your Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              error={errors.email}
              variant="dark"
              required
            />

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
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Continue"}
            </PrimaryButton>

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

export default ForgotPassword;
