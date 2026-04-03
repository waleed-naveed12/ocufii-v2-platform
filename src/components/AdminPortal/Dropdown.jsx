import React from "react";
import {
  DropdownWrapper,
  DropdownLabel,
  DropdownContainer,
  StyledSelect,
  DropdownErrorText,
} from "../../styles/AdminPortal/Dropdown.styled";

const Dropdown = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  variant = "light",
  required = false,
  disabled = false,
  placeholder = "Select an option",
  ...rest
}) => {
  return (
    <DropdownWrapper>
      {label && (
        <DropdownLabel htmlFor={name} variant={variant}>
          {label}
          {required && <span style={{ color: "#dc3545" }}> *</span>}
        </DropdownLabel>
      )}
      <DropdownContainer>
        <StyledSelect
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          variant={variant}
          disabled={disabled}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
      </DropdownContainer>
      {error && <DropdownErrorText>{error}</DropdownErrorText>}
    </DropdownWrapper>
  );
};

export default Dropdown;
