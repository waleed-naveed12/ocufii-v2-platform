import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { AiOutlineDown, AiOutlineClose } from "react-icons/ai";

const MultiSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ variant }) => (variant === "dark" ? "#f5f5f5" : "#374151")};
  margin-bottom: 2px;
`;

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => `10px ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-family: ${({ theme }) => theme.fontFamily.primary};
  border: 1px solid ${({ error }) => (error ? "#dc3545" : "#d1d5db")};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ variant }) =>
    variant === "dark" ? "#2a2a2a" : "#ffffff"};
  color: ${({ variant, hasSelection }) =>
    variant === "dark" ? "#f5f5f5" : hasSelection ? "#1f2937" : "#9ca3af"};
  transition: ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 42px;

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
`;

const SelectedValues = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-height: 20px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;

  svg {
    cursor: pointer;
    &:hover {
      color: #78350f;
    }
  }
`;

const Placeholder = styled.span`
  color: #9ca3af;
`;

const DropdownIcon = styled(AiOutlineDown)`
  font-size: 16px;
  color: #6b7280;
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

const SearchInput = styled.input`
  width: calc(100% - 16px);
  margin: 8px;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: #ed8b00;
    box-shadow: 0 0 0 3px rgba(237, 139, 0, 0.1);
  }
`;

const Option = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #1f2937;

  &:hover {
    background-color: #f9fafb;
  }

  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: #dc3545;
  margin-top: 4px;
`;

const MultiSelectDropdown = ({
  label,
  name,
  value = [],
  onChange,
  options = [],
  error,
  variant = "light",
  required = false,
  disabled = false,
  placeholder = "Select options",
  searchable = false,
  searchPlaceholder = "Search options",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => {
        const next = !prev;

        if (!next) {
          setSearchTerm("");
        }

        return next;
      });
    }
  };

  const handleOptionClick = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    // Simulate event object for compatibility
    const event = {
      target: {
        name: name,
        value: newValue,
      },
    };

    onChange(event);
  };

  const handleRemoveTag = (e, optionValue) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);

    const event = {
      target: {
        name: name,
        value: newValue,
      },
    };

    onChange(event);
  };

  const getSelectedLabels = () => {
    return value.map((v) => {
      const option = options.find((opt) => opt.value === v);
      return option ? option.label : v;
    });
  };

  const filteredOptions = options.filter((option) => {
    if (!searchable || !searchTerm.trim()) {
      return true;
    }

    return option.label.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  return (
    <MultiSelectWrapper ref={containerRef}>
      {label && (
        <Label htmlFor={name} variant={variant}>
          {label}
          {required && <span style={{ color: "#dc3545" }}> *</span>}
        </Label>
      )}
      <SelectContainer>
        <SelectButton
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          error={error}
          variant={variant}
          hasSelection={value.length > 0}
        >
          <SelectedValues>
            {value.length > 0 ? (
              getSelectedLabels().map((label, index) => (
                <Tag key={index}>
                  {label}
                  <AiOutlineClose
                    size={14}
                    onClick={(e) => handleRemoveTag(e, value[index])}
                  />
                </Tag>
              ))
            ) : (
              <Placeholder>{placeholder}</Placeholder>
            )}
          </SelectedValues>
          <DropdownIcon isOpen={isOpen} />
        </SelectButton>

        <DropdownMenu isOpen={isOpen}>
          {searchable ? (
            <SearchInput
              type="text"
              value={searchTerm}
              placeholder={searchPlaceholder}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}

          {filteredOptions.map((option) => (
            <Option
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => {}}
                onClick={(e) => e.stopPropagation()}
              />
              {option.label}
            </Option>
          ))}

          {filteredOptions.length === 0 ? (
            <Option style={{ cursor: "default", color: "#6b7280" }}>
              No matching options
            </Option>
          ) : null}
        </DropdownMenu>
      </SelectContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </MultiSelectWrapper>
  );
};

export default MultiSelectDropdown;
