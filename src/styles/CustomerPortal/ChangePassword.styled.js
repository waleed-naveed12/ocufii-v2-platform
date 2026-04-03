import styled from "styled-components";

export const ChangePasswordContainer = styled.div`
  padding: 16px 0;
`;

export const ChangePasswordTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
  font-family: "Decimal", sans-serif;
`;

export const ChangePasswordSubtitle = styled.p`
  font-size: 13px;
  color: #444444;
  margin: 0 0 32px 0;
  font-family: "Decimal", sans-serif;
`;

export const PasswordFormGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
`;

export const PasswordLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  font-family: "Decimal", sans-serif;
  min-width: 140px;
  text-align: right;
`;

export const PasswordInput = styled.input`
  flex: 1;
  max-width: 400px;
  padding: 10px 14px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  font-family: "Decimal", sans-serif;
  color: #000000;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;

  &:focus {
    border-color: #2196f3;
  }

  &::placeholder {
    color: #ccc;
  }
`;
