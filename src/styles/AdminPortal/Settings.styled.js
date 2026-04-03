import styled from "styled-components";

export const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const SettingsHeader = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

export const SettingsList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

export const SettingsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

export const SettingsItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const SettingsIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: ${({ color }) => color || "#fee2e2"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${({ iconColor }) => iconColor || "#ed8b00"};
`;

export const SettingsItemContent = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

export const SettingsItemRight = styled.div`
  font-size: 20px;
  color: #9ca3af;
  transition: all 0.2s ease;

  ${SettingsItem}:hover & {
    color: #ed8b00;
    transform: translateX(4px);
  }
`;
