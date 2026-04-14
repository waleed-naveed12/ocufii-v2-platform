import React, { useState } from "react";
import styled, { css } from "styled-components";

// Simple Input Container
const InputContainer = styled.div`
  margin-bottom: 1rem;

  ${({ $width }) =>
    $width &&
    css`
      width: ${$width === "full" ? "100%" : $width};
    `}
`;

// Simple Input Label
const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
  text-align: left;
  font-family: ${({ theme }) => theme.fontFamily.primary};
`;

// Simple Input Field
const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${({ $hasError }) => ($hasError ? "#dc3545" : "#e1e5e9")};
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fontFamily.primary};

  ${({ $height }) =>
    $height &&
    css`
      height: ${$height};
    `}

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? "#dc3545" : "#007bff")};
    box-shadow: 0 0 0 3px
      ${({ $hasError }) =>
        $hasError ? "rgba(220, 53, 69, 0.25)" : "rgba(0, 123, 255, 0.25)"};
  }

  &::placeholder {
    color: #6c757d;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Custom styles override */
  ${({ $styling }) => $styling}
`;

// Simple Error Message
const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 0.5rem;
  text-align: left;
  font-family: "Decimal", "Segoe UI", Roboto, sans-serif;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: #6c757d;

  &:hover {
    color: #333;
  }

  &:focus {
    outline: none;
  }
`;

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const Input = ({
  label,
  type = "text",
  width = "full",
  height,
  disabled = false,
  error,
  styling,
  variant,
  ...props
}) => {
  const hasError = Boolean(error);
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <InputContainer $width={width}>
      {label && <InputLabel $variant={variant}>{label}</InputLabel>}

      <InputWrapper>
        <StyledInput
          type={resolvedType}
          disabled={disabled}
          $hasError={hasError}
          $height={height}
          $styling={isPassword ? `padding-right: 44px; ${styling || ""}` : styling}
          {...props}
        />
        {isPassword && (
          <TogglePasswordButton
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon visible={showPassword} />
          </TogglePasswordButton>
        )}
      </InputWrapper>

      {hasError && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
