import styled from "styled-components";
import blackBg from "../../assets/AdminPortal/images/black.jpg";
import backgroundImg from "../../assets/AdminPortal/images/background.png";

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: url(${blackBg});
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 3px solid #f7941d;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

export const HeaderLogo = styled.div`
  img {
    height: 40px;
    width: auto;
  }
`;

export const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const HeaderLink = styled.a`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: url(${backgroundImg});

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const LoginSection = styled.section`
  color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  width: 100%;
  max-width: 450px;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

export const BrandLogo = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  img {
    height: 60px;
    width: auto;
  }
`;

export const Description = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const LinksContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

export const Link = styled.a`
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

export const Footer = styled.footer`
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.5rem 3rem;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

export const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  margin: 0;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const LanguageSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LanguageLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
`;

export const LanguageSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
  border-radius: 6px;
`;
