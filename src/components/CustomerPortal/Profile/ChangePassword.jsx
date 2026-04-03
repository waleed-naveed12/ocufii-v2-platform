import React, { useState } from "react";
import {
  RightSection,
  ProfileSection,
  SectionTitle,
  ActionButtons,
  CancelButton,
  SaveButton,
} from "../../../styles/CustomerPortal/Account.styled";
import {
  ChangePasswordContainer,
  ChangePasswordTitle,
  ChangePasswordSubtitle,
  PasswordFormGroup,
  PasswordLabel,
  PasswordInput,
} from "../../../styles/CustomerPortal/ChangePassword.styled";
import { useUser } from "../../../context/CustomerPortal/UserContext";

const ChangePassword = ({ onCancel, onEmailSent }) => {
  const { user } = useUser();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!passwordData.currentPassword)
      newErrors.currentPassword = "Current password is required.";
    if (!passwordData.newPassword)
      newErrors.newPassword = "New password is required.";
    if (!passwordData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your new password.";
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validate()) return;
    onEmailSent({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <RightSection>
      <ProfileSection>
        <SectionTitle>CHANGE PASSWORD</SectionTitle>
        <ChangePasswordContainer>
          <ChangePasswordTitle>Change Your Password</ChangePasswordTitle>
          <ChangePasswordSubtitle>
            Enter your new password, then Click "Change Password" to proceed.
          </ChangePasswordSubtitle>

          <PasswordFormGroup>
            <PasswordLabel>Current Password:</PasswordLabel>
            <PasswordInput
              type="password"
              placeholder="Enter Your Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                handleInputChange("currentPassword", e.target.value)
              }
            />
            {errors.currentPassword && (
              <div
                style={{ color: "#dc3545", fontSize: "13px", marginTop: "4px" }}
              >
                {errors.currentPassword}
              </div>
            )}
          </PasswordFormGroup>

          <PasswordFormGroup>
            <PasswordLabel>New Password:</PasswordLabel>
            <PasswordInput
              type="password"
              placeholder="Enter Your New Password"
              value={passwordData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
            />
            {errors.newPassword && (
              <div
                style={{ color: "#dc3545", fontSize: "13px", marginTop: "4px" }}
              >
                {errors.newPassword}
              </div>
            )}
          </PasswordFormGroup>

          <PasswordFormGroup>
            <PasswordLabel>Confirm Password:</PasswordLabel>
            <PasswordInput
              type="password"
              placeholder="Confirm Your New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
            />
            {errors.confirmPassword && (
              <div
                style={{ color: "#dc3545", fontSize: "13px", marginTop: "4px" }}
              >
                {errors.confirmPassword}
              </div>
            )}
          </PasswordFormGroup>

          <div
            style={{
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "rgba(242, 136, 9, 1)",
              lineHeight: "1.5",
              marginTop: "8px",
            }}
          >
            Password must be at least 6 characters and contain 1 upper case, 1
            lower case, 1 number, and 1 special character.
          </div>
        </ChangePasswordContainer>
      </ProfileSection>

      <ActionButtons>
        <CancelButton onClick={onCancel}>Cancel</CancelButton>
        <SaveButton onClick={handleUpdate}>Update Password</SaveButton>
      </ActionButtons>
    </RightSection>
  );
};

export default ChangePassword;
