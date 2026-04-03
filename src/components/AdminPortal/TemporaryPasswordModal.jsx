import React from "react";
import { Overlay, ModalContainer } from "../../styles/AdminPortal/Modal.styled";
import { PrimaryButton } from "./Button";
import styled from "styled-components";
import { AiOutlineCopy, AiOutlineCheckCircle } from "react-icons/ai";

const PasswordModalContent = styled.div`
  padding: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const ModalMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const PasswordBox = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const PasswordText = styled.div`
  font-family: "Courier New", monospace;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #ed8b00;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #fef3c7;
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 18px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const TemporaryPasswordModal = ({
  isOpen,
  onClose,
  password,
  email,
  title = "Admin User Created Successfully",
  description = "A new admin user has been created",
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <PasswordModalContent>
          <ModalTitle>{title}</ModalTitle>
          <ModalMessage>
            {description} for <strong>{email}</strong>. Please share the
            temporary password below with the user. They will be required to
            change it upon first login.
          </ModalMessage>

          <PasswordBox>
            <PasswordText>{password}</PasswordText>
            <CopyButton onClick={handleCopy}>
              {copied ? (
                <>
                  <AiOutlineCheckCircle />
                  Copied!
                </>
              ) : (
                <>
                  <AiOutlineCopy />
                  Copy
                </>
              )}
            </CopyButton>
          </PasswordBox>

          <ButtonContainer>
            <PrimaryButton onClick={onClose}>Close</PrimaryButton>
          </ButtonContainer>
        </PasswordModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default TemporaryPasswordModal;
