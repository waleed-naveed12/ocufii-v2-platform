import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const StyledButton = styled.button`
  padding: ${({ size }) => {
    switch (size) {
      case "small":
        return "0.5rem 1rem";
      case "large":
        return "0.875rem 2rem";
      default:
        return "0.625rem 1.5rem";
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case "small":
        return "0.875rem";
      case "large":
        return "1.1rem";
      default:
        return "1rem";
    }
  }};
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  width: ${({ width }) => (width === "full" ? "100%" : "auto")};
  background-color: ${({ color }) => color || "#ed8b00"};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background-color: ${({ hovercolor, color }) =>
      hovercolor || (color ? color : "#d47a00")};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 139, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(237, 139, 0, 0.2);
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

export const PrimaryButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  color,
  hovercolor,
  size = "medium",
  width,
  ...rest
}) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      color={color}
      hovercolor={hovercolor}
      size={size}
      width={width}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </StyledButton>
  );
};

const SecondaryButtonStyled = styled(StyledButton)`
  background-color: transparent;
  color: ${({ color }) => color || "#ed8b00"};
  border: 2px solid ${({ color }) => color || "#ed8b00"};

  &:hover:not(:disabled) {
    background-color: ${({ color }) => color || "#ed8b00"};
    color: #ffffff;
  }
`;

export const SecondaryButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  color,
  size = "medium",
  width,
  ...rest
}) => {
  return (
    <SecondaryButtonStyled
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      color={color}
      size={size}
      width={width}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </SecondaryButtonStyled>
  );
};
