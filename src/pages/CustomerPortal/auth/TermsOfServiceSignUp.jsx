import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaTrophy } from "react-icons/fa";
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
  Footer,
  FooterContent,
  FooterText,
  FooterLinks,
  FooterLink,
} from "../../../styles/CustomerPortal/Login.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import {
  generateSignUpToken,
  getTOSItemPublic,
  webSignUpAPI,
} from "../../../api/CustomerPortal/AuthApi";

// ─── Page layout ─────────────────────────────────────────────────────────────
const PageContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 2rem;
  box-sizing: border-box;
  width: 100%;
`;

const TOSCard = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
`;

const TOSCardHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const TOSLogoText = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 0.1rem;
  .ocu {
    color: #f7941d;
  }
  .fii {
    color: #000;
  }
`;

const TOSTagline = styled.p`
  font-size: 0.7rem;
  color: #777;
  letter-spacing: 0.14em;
  margin: 0 0 0.9rem;
  text-transform: uppercase;
`;

const TOSTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.25rem;
  line-height: 1.4;
`;

const TOSSubtitle = styled.p`
  font-size: 0.82rem;
  color: #666;
  margin: 0;
`;

const TOSScrollArea = styled.div`
  height: 420px;
  overflow-y: auto;
  padding: 1rem;
  margin: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #333;
  line-height: 1.65;

  @media (max-width: 576px) {
    height: 320px;
  }
`;

const TOSFooter = styled.div`
  padding: 1rem 1.5rem 1.5rem;
`;

const TOSAcceptBtn = styled.button`
  width: 100%;
  background: ${({ disabled }) => (disabled ? "#ccc" : "#f7941d")};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #e8850b;
  }
`;

// ─── Modals ───────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const SuccessCard = styled.div`
  background: #fff;
  border-radius: 14px;
  width: 85%;
  max-width: 340px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
`;

const SuccessIconWrap = styled.div`
  font-size: 3rem;
  color: #4caf50;
  margin-bottom: 0.75rem;
`;

const SuccessTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
`;

const SuccessText = styled.p`
  font-size: 0.88rem;
  color: #555;
  line-height: 1.55;
  margin: 0 0 0.4rem;
`;

const OkButton = styled.button`
  margin-top: 1.25rem;
  color: #2196f3;
  background: none;
  border: none;
  border-top: 1px solid #eee;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 2.5rem;
  width: 100%;

  &:hover {
    opacity: 0.8;
  }
`;
// ─────────────────────────────────────────────────────────────────────────────

const TermsOfServiceSignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  // Data passed from AccountSetup
  const signUpEmail = location.state?.signUpEmail || "";
  const fullName = location.state?.fullName || "";
  const password = location.state?.password || "";

  const [tosContent, setTosContent] = useState("");
  const [tosScrolled, setTosScrolled] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [serviceToken, setServiceToken] = useState(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchTOS = async () => {
      setIsFetching(true);
      setFetchError("");
      try {
        const tokenData = await generateSignUpToken();
        const token = tokenData?.access_token || tokenData?.access_Token;
        if (!cancelled) setServiceToken(token);

        const tosData = await getTOSItemPublic(token);
        const content =
          tosData?.termOfService ||
          tosData?.content ||
          tosData?.tosContent ||
          tosData?.text ||
          tosData?.body ||
          (typeof tosData === "string" ? tosData : "");

        if (!cancelled) {
          setTosContent(content);
          setTosScrolled(false);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError("Failed to load Terms of Service. Please try again.");
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    fetchTOS();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight) {
      setTosScrolled(true);
      return;
    }
    if (el.scrollTop / (el.scrollHeight - el.clientHeight) >= 0.8) {
      setTosScrolled(true);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      let token = serviceToken;
      if (!token) {
        const tokenData = await generateSignUpToken();
        token = tokenData?.access_token || tokenData?.access_Token;
        setServiceToken(token);
      }

      await webSignUpAPI(
        {
          email: signUpEmail,
          fullName,
          password,
          isAdult: true,
          tosAccepted: true,
          gmtInfo: Intl.DateTimeFormat().resolvedOptions().timeZone
            ? (() => {
                const offset = -new Date().getTimezoneOffset();
                const sign = offset >= 0 ? "+" : "-";
                const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
                const m = String(Math.abs(offset) % 60).padStart(2, "0");
                return `${sign}${h}:${m}`;
              })()
            : "+00:00",
        },
        token,
      );

      setSuccessModalOpen(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Account creation failed. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessOk = () => {
    setSuccessModalOpen(false);
    navigate(ROUTE.LOGIN);
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

      <PageContent>
        <TOSCard>
          <TOSCardHeader>
            <TOSLogoText>
              <span className="ocu">ocu</span>
              <span className="fii">fii</span>
            </TOSLogoText>
            <TOSTagline>BE IN THE KNOW</TOSTagline>
            <TOSTitle>
              Review &amp; Accept
              <br />
              Privacy Policy, Terms of Service
            </TOSTitle>
            <TOSSubtitle>(Scroll Down to Accept &amp; Proceed)</TOSSubtitle>
          </TOSCardHeader>

          <TOSScrollArea onScroll={handleScroll}>
            {isFetching ? (
              <p style={{ color: "#777", textAlign: "center" }}>
                Loading Terms of Service...
              </p>
            ) : fetchError ? (
              <p style={{ color: "#dc3545", textAlign: "center" }}>
                {fetchError}
              </p>
            ) : tosContent ? (
              <div dangerouslySetInnerHTML={{ __html: tosContent }} />
            ) : (
              <p style={{ color: "#777", textAlign: "center" }}>
                No content available.
              </p>
            )}
          </TOSScrollArea>

          <TOSFooter>
            {submitError && (
              <p
                style={{
                  color: "#dc3545",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  marginBottom: "0.75rem",
                }}
              >
                {submitError}
              </p>
            )}
            <TOSAcceptBtn
              onClick={handleAccept}
              disabled={!tosScrolled || isFetching || !!fetchError || isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Accept & Complete Account Sign Up"}
            </TOSAcceptBtn>
          </TOSFooter>
        </TOSCard>
      </PageContent>

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

      {/* Congratulations Modal */}
      {successModalOpen && (
        <Overlay>
          <SuccessCard>
            <SuccessIconWrap>
              <FaTrophy />
            </SuccessIconWrap>
            <SuccessTitle>CONGRATULATIONS!</SuccessTitle>
            <SuccessText>
              Your Ocufii account has been successfully created.
            </SuccessText>
            <SuccessText>
              Click &ldquo;OK&rdquo; to return to the Sign In screen and access
              your account.
            </SuccessText>
            <OkButton onClick={handleSuccessOk}>OK</OkButton>
          </SuccessCard>
        </Overlay>
      )}
    </LoginContainer>
  );
};

export default TermsOfServiceSignUp;
