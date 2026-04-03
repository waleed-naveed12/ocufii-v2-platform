import React from "react";
import warningIcon from "../../../assets/CustomerPortal/images/warning.svg";
import {
  ModalOverlay,
  ModalContainer,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalButton,
} from "../../../styles/CustomerPortal/PersonalSafety.styled";
import styled from "styled-components";

const WarningIconWrapper = styled.div`
  margin-bottom: 16px;
  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
`;

const RecipientRequiredModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer
        style={{ maxWidth: "360px", borderRadius: "12px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContent style={{ padding: "32px 28px" }}>
          <WarningIconWrapper>
            <img src={warningIcon} alt="Warning" />
          </WarningIconWrapper>

          <ModalTitle
            style={{
              fontSize: "16px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            RECIPIENT OR MEMBER REQUIRED
          </ModalTitle>

          <ModalDescription
            style={{
              textAlign: "center",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            To activate <strong>Emergency</strong>,{" "}
            <strong>Active Shooter</strong>, or <strong>Feeling Unsafe</strong>{" "}
            alerts, please add and enable safety alerts for at least one
            recipient or member.
          </ModalDescription>

          <ModalDescription
            style={{
              textAlign: "center",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            These alerts do not auto-dial 911, so having a recipient or member
            ensures someone receives your alert and can respond quickly when you
            need help.
          </ModalDescription>

          <ModalButton
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#1671D9",
              padding: "8px 32px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            OK
          </ModalButton>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default RecipientRequiredModal;
