import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/AdminPortal/UserContext";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../../components/AdminPortal/Button";
import Input from "../../../components/AdminPortal/Input";
import { loginSchema } from "../../../validations/AdminPortal/LoginValidations";
import { loginAPI } from "../../../api/AdminPortal/AuthApi";
import ocufiiLogo from "../../../assets/AdminPortal/images/ocufii_logo.svg";
import {
  LoginContainer,
  Header,
  HeaderLogo,
  HeaderNav,
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
  ErrorMessage,
} from "../../../styles/AdminPortal/Auth.styled";
import {
  AppVersion,
  RightsReserved,
} from "../../../common/AdminPortal/AppVersion";
import { ROUTE } from "../../../common/AdminPortal/Routes";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useUser();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form with Yup schema
      await loginSchema.validate(credentials, { abortEarly: false });

      // Call the login API
      const response = await loginAPI(credentials.email, credentials.password);

      // Check if login was successful
      if (response.success && response.data) {
        const {
          access_token,
          admin,
          role,
          user_type,
          permissions = [],
        } = response.data;

        // Handle both response formats:
        // 1. Response with admin object: { access_token, admin }
        // 2. Response without admin object: { access_token, role, user_type }
        const userData = admin || {
          email: credentials.email,
          role: role,
          userType: user_type,
        };

        const userDataWithPermissions = {
          ...userData,
          permissions,
          permissionKeys: permissions
            .filter((permission) => permission.isGranted !== false)
            .map((permission) => permission.key),
        };

        // Store user data and token in context (which saves to sessionStorage)
        login(userDataWithPermissions, access_token);

        // Navigate to dashboard
        navigate(ROUTE.DASHBOARD);
      } else {
        // Handle unsuccessful login
        setErrors({
          general: response.message || "Login failed. Please try again.",
        });
      }
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
          "Login failed. Please check your credentials.";
        setErrors({
          general: errorMessage,
        });
      } else if (error.request) {
        // Request made but no response received
        console.error("No response from server:", error.request);
        setErrors({
          general: "Unable to connect to server. Please try again later.",
        });
      } else {
        // Something else happened
        console.error("Login error:", error);
        setErrors({
          general: "An unexpected error occurred. Please try again.",
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
        <HeaderNav>{/* Language selector can be added here later */}</HeaderNav>
      </Header>

      <MainContent>
        <LoginSection>
          <BrandLogo>
            <img src={ocufiiLogo} alt="Ocufii" />
          </BrandLogo>

          <Description>
            Welcome back! Please login to your account to access the admin
            portal.
          </Description>

          <LoginForm onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={errors.email}
              variant="dark"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              variant="dark"
              required
            />

            {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

            <PrimaryButton
              type="submit"
              color="#F7941D"
              hovercolor="#E8850B"
              size="large"
              width="full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </PrimaryButton>

            <LinksContainer>
              <Link href="#forgot-password">Forgot Password?</Link>
            </LinksContainer>
          </LoginForm>
        </LoginSection>
      </MainContent>

      <Footer>
        <FooterContent>
          <FooterText>Ocufii {RightsReserved}, All Rights Reserved</FooterText>
          <FooterLinks>
            <FooterLink href="#">v {AppVersion}</FooterLink>
            <FooterLink
              href="https://www.ocufii.com/terms-of-service/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Use
            </FooterLink>
            <FooterLink
              href="https://www.ocufii.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </FooterLink>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </LoginContainer>
  );
};

export default Login;
