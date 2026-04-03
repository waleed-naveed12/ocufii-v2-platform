import styled from "styled-components";

export const TabsContainer = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const TabsList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const TabButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ active }) => (active ? "#ed8b00" : "#6b7280")};
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ active }) => (active ? "#ed8b00" : "transparent")};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  position: relative;
  bottom: -2px;

  &:hover {
    color: #ed8b00;
  }
`;

export const TabPanel = styled.div`
  display: ${({ active }) => (active ? "block" : "none")};
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const SwitchLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: #374151;
`;

export const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

export const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #ed8b00;
  }

  &:checked + span:before {
    transform: translateX(24px);
  }

  &:disabled + span {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: #374151;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #ed8b00;
  }
`;
