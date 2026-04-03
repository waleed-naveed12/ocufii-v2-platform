import styled from "styled-components";

export const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

export const DropdownLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ variant }) => (variant === "dark" ? "#f5f5f5" : "#374151")};
  margin-bottom: 2px;
`;

export const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledSelect = styled.select`
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
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${({ theme }) => theme.spacing.md} center;
  background-size: 20px;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: ${({ error }) => (error ? "#dc3545" : "#ed8b00")};
    box-shadow: 0 0 0 3px
      ${({ error }) =>
        error ? "rgba(220, 53, 69, 0.1)" : "rgba(237, 139, 0, 0.1)"};
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export const DropdownErrorText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: #dc3545;
  margin-top: 4px;
`;
