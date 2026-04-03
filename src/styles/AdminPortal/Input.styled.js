import styled from "styled-components";

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ variant }) => (variant === "dark" ? "#f5f5f5" : "#374151")};
  margin-bottom: 2px;
`;

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `10px ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-family: ${({ theme }) => theme.fontFamily.primary};
  border: 1px solid ${({ error }) => (error ? "#dc3545" : "#d1d5db")};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ variant }) =>
    variant === "dark" ? "#2a2a2a" : "#ffffff"};
  color: ${({ variant }) => (variant === "dark" ? "#f5f5f5" : "#1f2937")};
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ error }) => (error ? "#dc3545" : "#ed8b00")};
    box-shadow: 0 0 0 3px
      ${({ error }) =>
        error ? "rgba(220, 53, 69, 0.1)" : "rgba(237, 139, 0, 0.1)"};
  }

  &::placeholder {
    color: #9ca3af;
    font-size: ${({ theme }) => theme.fontSize.sm};
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: #dc2626;
  margin-top: 2px;
  display: block;
`;
