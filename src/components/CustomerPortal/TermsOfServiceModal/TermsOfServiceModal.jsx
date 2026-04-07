import React, { useState, useRef, useCallback } from "react";
import ocufiiLogo from "../../../assets/CustomerPortal/images/ocufii_logo_2.png";
import {
  Overlay,
  ModalContainer,
  ModalHeader,
  LogoImg,
  NewBadge,
  ModalTitle,
  ModalSubtitle,
  ContentArea,
  ModalFooter,
  AcceptButton,
} from "./TermsOfServiceModal.styled";

const TermsOfServiceModal = ({ tosContent, onAccept, isAccepting }) => {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef(null);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el || canAccept) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight * 0.8) {
      setCanAccept(true);
    }
  }, [canAccept]);

  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>
          <LogoImg src={ocufiiLogo} alt="Ocufii" />
          <NewBadge>NEW</NewBadge>
          <ModalTitle>
            Privacy Policy, Terms of Service Review &amp; Accept
          </ModalTitle>
          <ModalSubtitle>(Scroll Down to Accept &amp; Proceed)</ModalSubtitle>
        </ModalHeader>

        <ContentArea
          ref={contentRef}
          onScroll={handleScroll}
          dangerouslySetInnerHTML={{ __html: tosContent }}
        />

        <ModalFooter>
          <AcceptButton disabled={!canAccept || isAccepting} onClick={onAccept}>
            {isAccepting ? "Accepting..." : "Accept"}
          </AcceptButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default TermsOfServiceModal;
