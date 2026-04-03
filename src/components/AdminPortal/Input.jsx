import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  InputWrapper,
  Label,
  InputContainer,
  StyledInput,
  PasswordToggle,
  ErrorText,
} from "../../styles/AdminPortal/Input.styled";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  variant = "light",
  required = false,
  disabled = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={name} variant={variant}>
          {label}
          {required && <span style={{ color: "#dc3545" }}> *</span>}
        </Label>
      )}
      <InputContainer>
        <StyledInput
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          error={error}
          variant={variant}
          disabled={disabled}
          {...rest}
        />
        {isPasswordField && (
          <PasswordToggle
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </PasswordToggle>
        )}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};

export default Input;
