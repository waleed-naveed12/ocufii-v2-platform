import React, { useEffect } from "react";
import {
  Overlay,
  ModalContainer,
  ModalHeader,
  IconContainer,
  ModalTitle,
  ModalBody,
  ModalFooter,
  DeleteButton,
  CancelButton,
} from "../../styles/AdminPortal/Modal.styled";
import { AiOutlineExclamationCircle } from "react-icons/ai";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <IconContainer variant={variant}>
            <AiOutlineExclamationCircle />
          </IconContainer>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <CancelButton onClick={onClose} disabled={isLoading}>
            {cancelText}
          </CancelButton>
          <DeleteButton onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : confirmText}
          </DeleteButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

export default ConfirmDialog;
