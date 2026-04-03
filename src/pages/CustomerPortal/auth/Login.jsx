import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "../../../components/CustomerPortal/Button";
import Input from "../../../components/CustomerPortal/Input";
import { loginSchema } from "../../../validations/CustomerPortal/LoginValidations";
import { loginAPI } from "../../../api/CustomerPortal/AuthApi";
import ocufiiLogo from "../../../assets/CustomerPortal/images/ocufii_logo.svg";
import {
  LoginContainer,
  Header,
  HeaderLogo,
  HeaderNav,
  HeaderLink,
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
  LanguageSection,
  LanguageLabel,
  LanguageSelect,
} from "../../../styles/CustomerPortal/Login.styled";
import {
  AppVersion,
  RightsReserved,
} from "../../../common/CustomerPortal/AppVersion";
import { ROUTE } from "../../../common/CustomerPortal/Routes";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useUser();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    logout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleBlur = (e) => {
    // Validation logic removed - using Yup validation pattern instead
    // You can add Yup validation here if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form with Yup schema
      await loginSchema.validate(credentials, { abortEarly: false });

      // Call login API with hardcoded roleId "3"
      const response = await loginAPI(
        credentials.email,
        credentials.password,
        "3",
      );

      // Check if response indicates email doesn't exist
      if (
        !response ||
        response === "Email does not exists" ||
        response.message === "Email does not exists" ||
        response.error === "Email does not exists" ||
        !response.access_Token
      ) {
        setErrors({
          general: t("login.errors.emailNotExists"),
        });
        return;
      }

      // Response structure:
      // {
      //   "roleId": "string",
      //   "firstName": "string",
      //   "lastName": "string",
      //   "secretKey": "string",
      //   "accessKey": "string",
      //   "access_Token": "string"
      // }

      // Store user data in context (tab-specific sessionStorage)
      const user = {
        email: credentials.email,
        ...response,
      };
      login(user);

      // Navigate to dashboard
      navigate(ROUTE.DASHBOARD);
    } catch (error) {
      if (error.name === "ValidationError") {
        // Handle Yup validation errors
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else if (error.response) {
        // Handle API errors
        console.error("Login API error:", error.response);
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          t("login.errors.loginFailed");
        setErrors({
          general: errorMessage,
        });
      } else if (error.request) {
        // Request made but no response received
        console.error("No response from server:", error.request);
        setErrors({
          general: t("login.errors.connectionError"),
        });
      } else {
        // Something else happened
        console.error("Login error:", error);
        setErrors({
          general: t("login.errors.unexpectedError"),
        });
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
            {/* <LanguageLabel>{t("txt_Language")}:</LanguageLabel> */}
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

          <Description>{t("login.description")}</Description>

          <LoginForm onSubmit={handleSubmit}>
            <Input
              label={t("login.email")}
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("login.emailPlaceholder")}
              error={errors.email}
              variant="dark"
              required
            />

            <Input
              label={t("login.password")}
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("login.passwordPlaceholder")}
              error={errors.password}
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
              {isLoading ? t("login.loggingIn") : t("login.loginButton")}
            </PrimaryButton>

            <LinksContainer>
              <Link
                as="button"
                type="button"
                onClick={() => navigate(ROUTE.FORGOT_PASSWORD)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {t("login.forgotPassword")}
              </Link>
              {/* <span style={{ color: "#666" }}>|</span> */}
              {/* <Link href="#request-access">Request Access</Link> */}
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

export default Login;
